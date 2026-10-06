package matrix_processing

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
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
			Timeout: 10 * time.Second,
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
		return nil, fmt.Errorf("no se pudo conectar con la API de Node.js en %s: %w", url, err)
	}
	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("error leyendo respuesta de Node.js: %w", err)
	}

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("Node.js API devolvió código %d: %s", resp.StatusCode, string(bodyBytes))
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
