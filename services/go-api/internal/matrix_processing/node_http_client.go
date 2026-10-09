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

func (c *nodeHTTPClient) ensureServiceAwake() error {
	healthURL := fmt.Sprintf("%s/health", c.baseURL)
	const maxAttempts = 15
	delay := 4 * time.Second

	for attempt := 1; attempt <= maxAttempts; attempt++ {
		req, err := http.NewRequest("GET", healthURL, nil)
		if err != nil {
			return fmt.Errorf("error creando petición wake-up GET a Node API: %w", err)
		}

		// User-Agent y Headers estándar que el proxy de Render reconoce para despertar el contenedor
		req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) InterseguroMatrix/1.0")
		req.Header.Set("Accept", "application/json, text/plain, */*")

		resp, err := c.httpClient.Do(req)
		if err != nil {
			log.Printf("[NodeClient] Wake-up Intento %d/%d: Node.js API (%s) no respondió aún (%v). Reintentando en %v...", attempt, maxAttempts, healthURL, err, delay)
			if attempt < maxAttempts {
				time.Sleep(delay)
				continue
			}
			return fmt.Errorf("no se pudo despertar la API de Node.js en %s: %w", healthURL, err)
		}

		io.Copy(io.Discard, resp.Body)
		resp.Body.Close()

		if resp.StatusCode == http.StatusOK {
			if attempt > 1 {
				log.Printf("[NodeClient] Node.js API despertó exitosamente tras %d intentos (%v)", attempt, time.Duration(attempt-1)*delay)
			}
			return nil
		}

		// Si Render devuelve 502/503 mientras levanta el contenedor
		log.Printf("[NodeClient] Wake-up Intento %d/%d: Node.js API devolvió status %d (iniciando en frío). Esperando %v...", attempt, maxAttempts, resp.StatusCode, delay)
		if attempt < maxAttempts {
			time.Sleep(delay)
			continue
		}
	}

	return fmt.Errorf("Node.js API no respondió a tiempo tras los intentos de inicio en frío")
}

func (c *nodeHTTPClient) AnalyzeMatrices(qr *QRResult, authToken string) (*NodeAnalysisData, error) {
	// 1. Asegurar que Node.js API esté despierto mediante GET /health
	if err := c.ensureServiceAwake(); err != nil {
		return nil, fmt.Errorf("error al iniciar conexión con Node.js API: %w", err)
	}

	// 2. Serializar payload de matrices y enviar POST
	payloadBytes, err := json.Marshal(qr)
	if err != nil {
		return nil, fmt.Errorf("error serializando matrices a JSON: %w", err)
	}

	url := fmt.Sprintf("%s/api/v1/matrix/analyze", c.baseURL)

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(payloadBytes))
	if err != nil {
		return nil, fmt.Errorf("error creando petición HTTP hacia Node API: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) InterseguroMatrix/1.0")
	if authToken != "" {
		req.Header.Set("Authorization", authToken)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("error conectando con Node.js API en %s: %w", url, err)
	}
	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("error leyendo respuesta de Node.js: %w", err)
	}

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		bodyStr := strings.TrimSpace(string(bodyBytes))
		if strings.Contains(bodyStr, "<html") || strings.Contains(bodyStr, "<!DOCTYPE") {
			bodyStr = fmt.Sprintf("Error HTTP %d recibido de la infraestructura", resp.StatusCode)
		}
		return nil, fmt.Errorf("Node.js API devolvió código %d: %s", resp.StatusCode, bodyStr)
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
