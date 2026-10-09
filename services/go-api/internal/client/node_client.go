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
			Timeout: 15 * time.Second,
		},
	}
}

func (c *NodeClient) ensureServiceAwake() error {
	healthURL := fmt.Sprintf("%s/health", c.baseURL)
	const maxAttempts = 15
	delay := 4 * time.Second

	for attempt := 1; attempt <= maxAttempts; attempt++ {
		req, err := http.NewRequest("GET", healthURL, nil)
		if err != nil {
			return fmt.Errorf("error creando petición wake-up GET a Node API: %w", err)
		}

		req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) InterseguroMatrix/1.0")
		req.Header.Set("Accept", "application/json, text/plain, */*")

		resp, err := c.httpClient.Do(req)
		if err != nil {
			log.Printf("[NodeClientLegacy] Wake-up Intento %d/%d: Node.js API (%s) no respondió aún (%v). Reintentando en %v...", attempt, maxAttempts, healthURL, err, delay)
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
				log.Printf("[NodeClientLegacy] Node.js API despertó exitosamente tras %d intentos (%v)", attempt, time.Duration(attempt-1)*delay)
			}
			return nil
		}

		log.Printf("[NodeClientLegacy] Wake-up Intento %d/%d: Node.js API devolvió status %d (iniciando en frío). Esperando %v...", attempt, maxAttempts, resp.StatusCode, delay)
		if attempt < maxAttempts {
			time.Sleep(delay)
			continue
		}
	}

	return fmt.Errorf("Node.js API no respondió a tiempo tras los intentos de inicio en frío")
}

// SendForAnalysis sends Q and R matrices to Node.js Express API with retry support for cold starts.
func (c *NodeClient) SendForAnalysis(qrResult *matrix.QRResult, token string) (*NodeAnalysisResponse, error) {
	if err := c.ensureServiceAwake(); err != nil {
		return nil, fmt.Errorf("error al iniciar conexión con Node.js API: %w", err)
	}

	payloadBytes, err := json.Marshal(qrResult)
	if err != nil {
		return nil, fmt.Errorf("error serializando matrices Q y R: %w", err)
	}

	url := fmt.Sprintf("%s/api/v1/matrix/analyze", c.baseURL)

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(payloadBytes))
	if err != nil {
		return nil, fmt.Errorf("error creando petición HTTP a Node API: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) InterseguroMatrix/1.0")
	if token != "" {
		req.Header.Set("Authorization", token)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("error conectando con Node.js API en %s: %w", url, err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("error leyendo respuesta de Node.js API: %w", err)
	}

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		bodyStr := strings.TrimSpace(string(body))
		if strings.Contains(bodyStr, "<html") || strings.Contains(bodyStr, "<!DOCTYPE") {
			bodyStr = fmt.Sprintf("Error HTTP %d recibido de la infraestructura", resp.StatusCode)
		}
		return nil, fmt.Errorf("Node.js API devolvió código %d: %s", resp.StatusCode, bodyStr)
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
