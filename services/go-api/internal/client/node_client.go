package client

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
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
			Timeout: 10 * time.Second,
		},
	}
}

// SendForAnalysis sends Q and R matrices to Node.js Express API.
func (c *NodeClient) SendForAnalysis(qrResult *matrix.QRResult, token string) (*NodeAnalysisResponse, error) {
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
		return nil, fmt.Errorf("Node.js API devolvió código %d: %s", resp.StatusCode, string(body))
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
