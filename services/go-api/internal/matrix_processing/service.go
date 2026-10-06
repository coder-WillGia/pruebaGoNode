package matrix_processing

import (
	"fmt"
	"time"

	"interseguro/go-api/internal/matrix_catalog"
)

type Service struct {
	calculator  QRCalculator
	nodeClient  NodeClientPort
	repo        RepositoryPort
	catalogRepo matrix_catalog.Repository
}

func NewService(
	calculator QRCalculator,
	nodeClient NodeClientPort,
	repo RepositoryPort,
	catalogRepo matrix_catalog.Repository,
) *Service {
	return &Service{
		calculator:  calculator,
		nodeClient:  nodeClient,
		repo:        repo,
		catalogRepo: catalogRepo,
	}
}

// ProcessMatrix executes QR Factorization on any rectangular matrix,
// delegates statistical analysis to Node.js via HTTP, and registers the operation linked to the user.
func (s *Service) ProcessMatrix(matrix [][]float64, authToken string, userID string, username string) (*ProcessMatrixResponse, error) {
	start := time.Now()

	// 1. Cómputo matemático en memoria (Go)
	qrResult, err := s.calculator.Factorize(matrix)
	if err != nil {
		return nil, err
	}

	elapsed := float64(time.Since(start).Microseconds()) / 1000.0 // ms

	// 2. Llamada HTTP a Node.js para analítica
	var analysisData *NodeAnalysisData
	if s.nodeClient != nil {
		analysis, err := s.nodeClient.AnalyzeMatrices(qrResult, authToken)
		if err != nil {
			return nil, fmt.Errorf("error al obtener analítica de Node.js API: %w", err)
		}
		analysisData = analysis
	}

	rows := len(matrix)
	cols := len(matrix[0])

	// 3. Persistencia desacoplada en base de datos PostgreSQL asociada al usuario
	if s.repo != nil {
		go func() {
			op := &MatrixOperationHistory{
				UserID:          userID,
				Username:        username,
				OriginalMatrix:  matrix,
				MatrixQ:         qrResult.Q,
				MatrixR:         qrResult.R,
				Rows:            rows,
				Cols:            cols,
				ExecutionTimeMs: elapsed,
				Analysis:        analysisData,
			}
			_, _ = s.repo.SaveOperation(op)
		}()
	}

	resp := &ProcessMatrixResponse{
		OriginalMatrix: matrix,
		Dimensions: Dimensions{
			Rows: rows,
			Cols: cols,
		},
		Q:               qrResult.Q,
		R:               qrResult.R,
		ExecutionTimeMs: elapsed,
		UserID:          userID,
		Username:        username,
	}

	if analysisData != nil {
		resp.Analysis = *analysisData
	}

	return resp, nil
}

// ProcessMatrixByID fetches a pre-stored matrix from database catalog and processes it.
func (s *Service) ProcessMatrixByID(catalogID string, authToken string, userID string, username string) (*ProcessMatrixResponse, error) {
	if s.catalogRepo == nil {
		return nil, fmt.Errorf("catálogo de base de datos no disponible")
	}

	item, err := s.catalogRepo.FindByID(catalogID)
	if err != nil {
		return nil, err
	}
	if item == nil {
		return nil, fmt.Errorf("matriz no encontrada con ID: %s", catalogID)
	}

	return s.ProcessMatrix(item.MatrixData, authToken, userID, username)
}

// GetHistory retrieves the calculation log from the database scoped to the user.
func (s *Service) GetHistory(userID string, limit int) ([]MatrixOperationHistory, error) {
	if s.repo == nil {
		return nil, fmt.Errorf("repositorio de historial no disponible")
	}
	return s.repo.GetHistory(userID, limit)
}
