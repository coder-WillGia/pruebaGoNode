package client

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

	"interseguro/go-api/internal/matrix"
)

type NodeClient struct {
	baseURL    string
	httpClient *http.Client
}

type NodeAnalysisResponse struct {
	Status string `json:"status"`
	Data   struct {
		Stats struct {
			Max           float64 `json:"max"`
			Min           float64 `json:"min"`
			Average       float64 `json:"average"`
			Sum           float64 `json:"sum"`
			TotalElements int     `json:"total_elements"`
		} `json:"stats"`
		DiagonalCheck struct {
			IsQDiagonal   bool `json:"is_q_diagonal"`
			IsRDiagonal   bool `json:"is_r_diagonal"`
			IsAnyDiagonal bool `json:"is_any_diagonal"`
		} `json:"diagonal_check"`
	} `json:"data"`
	Message string `json:"message,omitempty"`
}

func NewNodeClient(baseURL string) *NodeClient {
	return &NodeClient{
		baseURL: baseURL,
		httpClient: &http.Client{
			Timeout: 75 * time.Second,
		},
	}
}

// SendForAnalysis sends Q and R matrices to Node.js Express API with retry support for cold starts.
func (c *NodeClient) SendForAnalysis(qrResult *matrix.QRResult, token string) (*NodeAnalysisResponse, error) {
	payloadBytes, err := json.Marshal(qrResult)
	if err != nil {
		return nil, fmt.Errorf("error serializando matrices Q y R: %w", err)
	}

	url := fmt.Sprintf("%s/api/v1/matrix/analyze", c.baseURL)

	// Ventana optimizada para Render Free Tier
	const maxAttempts = 2
	var lastErr error
	var lastStatusCode int
	var lastBodyBytes []byte

	delay := 3 * time.Second

	for attempt := 1; attempt <= maxAttempts; attempt++ {
		req, err := http.NewRequest("POST", url, bytes.NewBuffer(payloadBytes))
		if err != nil {
			return nil, fmt.Errorf("error creando petición HTTP a Node API: %w", err)
		}

		req.Header.Set("Content-Type", "application/json")
		if token != "" {
			req.Header.Set("Authorization", token)
		}

		resp, err := c.httpClient.Do(req)
		if err != nil {
			lastErr = err
			log.Printf("[NodeClientLegacy] Intento %d/%d falló al conectar con Node.js API (%s): %v.", attempt, maxAttempts, url, err)
			if attempt < maxAttempts {
				time.Sleep(delay)
				continue
			}
			return nil, fmt.Errorf("error conectando con Node.js API en %s (posible inicio en frío): %w", url, lastErr)
		}

		body, err := io.ReadAll(resp.Body)
		resp.Body.Close()
		if err != nil {
			lastErr = err
			log.Printf("[NodeClientLegacy] Intento %d/%d: error leyendo respuesta: %v.", attempt, maxAttempts, err)
			if attempt < maxAttempts {
				time.Sleep(delay)
				continue
			}
			return nil, fmt.Errorf("error leyendo respuesta de Node.js API: %w", err)
		}

		lastStatusCode = resp.StatusCode
		lastBodyBytes = body

		// Detectar inicio en frío / suspensión de Render (502 Bad Gateway, 503 Service Unavailable, 504 Gateway Timeout)
		if resp.StatusCode == http.StatusBadGateway || resp.StatusCode == http.StatusServiceUnavailable || resp.StatusCode == http.StatusGatewayTimeout {
			log.Printf("[NodeClientLegacy] Intento %d/%d: Node.js API devolvió código %d (Render arrancando en frío). Esperando %v...", attempt, maxAttempts, resp.StatusCode, delay)
			if attempt < maxAttempts {
				time.Sleep(delay)
				continue
			}
			break
		}

		// Errores de cliente (4xx) o del servidor no recuperables inmediatamente
		if resp.StatusCode < 200 || resp.StatusCode >= 300 {
			bodyStr := strings.TrimSpace(string(body))
			if strings.Contains(bodyStr, "<html") || strings.Contains(bodyStr, "<!DOCTYPE") {
				bodyStr = fmt.Sprintf("Error HTTP %d recibido de la infraestructura", resp.StatusCode)
			}
			return nil, fmt.Errorf("Node.js API devolvió código %d: %s", resp.StatusCode, bodyStr)
		}

		// Éxito (2xx)
		if attempt > 1 {
			log.Printf("[NodeClientLegacy] Conexión establecida con éxito con Node.js API tras reintento %d", attempt)
		}

		var analysisResp NodeAnalysisResponse
		if err := json.Unmarshal(body, &analysisResp); err != nil {
			return nil, fmt.Errorf("error decodificando respuesta de Node.js API: %w", err)
		}

		if analysisResp.Status != "success" && analysisResp.Status != "" {
			return nil, errors.New(analysisResp.Message)
		}

		return &analysisResp, nil
	}

	bodyStr := strings.TrimSpace(string(lastBodyBytes))
	if strings.Contains(bodyStr, "<html") || strings.Contains(bodyStr, "<!DOCTYPE") {
		return nil, fmt.Errorf("Node.js API aún está iniciando (código %d). Por favor, intenta de nuevo en unos segundos mientras el servicio termina de arrancar.", lastStatusCode)
	}

	return nil, fmt.Errorf("Node.js API devolvió código %d: %s", lastStatusCode, bodyStr)
}
