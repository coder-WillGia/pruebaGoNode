package matrix_processing

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"time"
)

type nodeHTTPClient struct {
	baseURL    string
	httpClient *http.Client
}

func NewNodeHTTPClient(baseURL string) NodeClientPort {
	return &nodeHTTPClient{
		baseURL: baseURL,
		httpClient: &http.Client{
			Timeout: 15 * time.Second,
		},
	}
}

type nodeAPIResponseEnvelope struct {
	Status  string           `json:"status"`
	Data    NodeAnalysisData `json:"data"`
	Message string           `json:"message,omitempty"`
}

func (c *nodeHTTPClient) AnalyzeMatrices(qr *QRResult, authToken string) (*NodeAnalysisData, error) {
	payloadBytes, err := json.Marshal(qr)
	if err != nil {
		return nil, fmt.Errorf("error serializando matrices a JSON: %w", err)
	}

	url := fmt.Sprintf("%s/api/v1/matrix/analyze", c.baseURL)

	// Estrategia de sondeo para Render Free Tier (Cold Starts):
	// Render responde 502 de inmediato mientras levanta el contenedor (~30-45s).
	// Sondeamos hasta 15 intentos cada 4 segundos (total ~60s de espera tolerante),
	// permitiendo que Node.js termine de iniciar y devuelva 200 OK dentro del límite del gateway.
	const maxAttempts = 15
	var lastErr error
	var lastStatusCode int
	var lastBodyBytes []byte

	delay := 4 * time.Second

	for attempt := 1; attempt <= maxAttempts; attempt++ {
		req, err := http.NewRequest("POST", url, bytes.NewBuffer(payloadBytes))
		if err != nil {
			return nil, fmt.Errorf("error creando petición HTTP hacia Node API: %w", err)
		}

		req.Header.Set("Content-Type", "application/json")
		if authToken != "" {
			req.Header.Set("Authorization", authToken)
		}

		resp, err := c.httpClient.Do(req)
		if err != nil {
			lastErr = err
			log.Printf("[NodeClient] Intento %d/%d falló al conectar con Node.js API (%s): %v. Reintentando en %v...", attempt, maxAttempts, url, err, delay)
			if attempt < maxAttempts {
				time.Sleep(delay)
				continue
			}
			return nil, fmt.Errorf("no se pudo conectar con la API de Node.js en %s (posible inicio en frío de Render en progreso): %w", url, lastErr)
		}

		bodyBytes, err := io.ReadAll(resp.Body)
		resp.Body.Close()
		if err != nil {
			lastErr = err
			log.Printf("[NodeClient] Intento %d/%d: error leyendo cuerpo de respuesta: %v. Reintentando en %v...", attempt, maxAttempts, err, delay)
			if attempt < maxAttempts {
				time.Sleep(delay)
				continue
			}
			return nil, fmt.Errorf("error leyendo respuesta de Node.js: %w", err)
		}

		lastStatusCode = resp.StatusCode
		lastBodyBytes = bodyBytes

		// Detectar inicio en frío / suspensión de Render (502 Bad Gateway, 503 Service Unavailable, 504 Gateway Timeout)
		if resp.StatusCode == http.StatusBadGateway || resp.StatusCode == http.StatusServiceUnavailable || resp.StatusCode == http.StatusGatewayTimeout {
			log.Printf("[NodeClient] Intento %d/%d: Node.js API devolvió código %d (Render arrancando en frío). Esperando %v...", attempt, maxAttempts, resp.StatusCode, delay)
			if attempt < maxAttempts {
				time.Sleep(delay)
				continue
			}
			break
		}

		// Errores de cliente (4xx) o del servidor no recuperables inmediatamente
		if resp.StatusCode < 200 || resp.StatusCode >= 300 {
			bodyStr := strings.TrimSpace(string(bodyBytes))
			if strings.Contains(bodyStr, "<html") || strings.Contains(bodyStr, "<!DOCTYPE") {
				bodyStr = fmt.Sprintf("Error HTTP %d recibido de la infraestructura", resp.StatusCode)
			}
			return nil, fmt.Errorf("Node.js API devolvió código %d: %s", resp.StatusCode, bodyStr)
		}

		// Éxito (2xx)
		if attempt > 1 {
			log.Printf("[NodeClient] Conexión establecida con éxito con Node.js API tras reintento %d (%v transcurridos aprox)", attempt, time.Duration(attempt-1)*delay)
		}

		var envelope nodeAPIResponseEnvelope
		if err := json.Unmarshal(bodyBytes, &envelope); err != nil {
			return nil, fmt.Errorf("error decodificando respuesta JSON de Node.js: %w", err)
		}

		if envelope.Status != "success" && envelope.Status != "" {
			return nil, errors.New(envelope.Message)
		}

		return &envelope.Data, nil
	}

	// Si se agotaron los intentos con código 502/503/504
	bodyStr := strings.TrimSpace(string(lastBodyBytes))
	if strings.Contains(bodyStr, "<html") || strings.Contains(bodyStr, "<!DOCTYPE") {
		return nil, fmt.Errorf("Node.js API aún está iniciando (código %d tras varios intentos de espera). Por favor, reintenta en unos segundos mientras termina de inicializar.", lastStatusCode)
	}

	return nil, fmt.Errorf("Node.js API devolvió código %d: %s", lastStatusCode, bodyStr)
}
