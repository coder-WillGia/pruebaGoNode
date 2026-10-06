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
// delegates statistical analysis to Node.js via HTTP, and registers the operation.
func (s *Service) ProcessMatrix(matrix [][]float64, authToken string) (*ProcessMatrixResponse, error) {
	start := time.Now()

	// 1. Cómputo matemático en memoria (Go)
	qrResult, err := s.calculator.Factorize(matrix)
	if err != nil {
		return nil, err
	}

	elapsed := float64(time.Since(start).Microseconds()) / 1000.0 // ms

	// 2. Llamada HTTP a Node.js para analítica (con fallback seguro en memoria si Node no estuviese disponible)
	var analysisData *NodeAnalysisData
	if s.nodeClient != nil {
		analysis, err := s.nodeClient.AnalyzeMatrices(qrResult, authToken)
		if err != nil {
			// En caso de fallo de red, se reporta el detalle
			return nil, fmt.Errorf("error al obtener analítica de Node.js API: %w", err)
		}
		analysisData = analysis
	}

	rows := len(matrix)
	cols := len(matrix[0])

	// 3. Persistencia desacoplada en base de datos PostgreSQL (si está conectada)
	if s.repo != nil {
		go func() {
			op := &MatrixOperationHistory{
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
	}

	if analysisData != nil {
		resp.Analysis = *analysisData
	}

	return resp, nil
}

// ProcessMatrixByID fetches a pre-stored matrix from database catalog and processes it.
func (s *Service) ProcessMatrixByID(catalogID string, authToken string) (*ProcessMatrixResponse, error) {
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

	return s.ProcessMatrix(item.MatrixData, authToken)
}

// GetHistory retrieves the calculation log from the database.
func (s *Service) GetHistory(limit int) ([]MatrixOperationHistory, error) {
	if s.repo == nil {
		return nil, fmt.Errorf("repositorio de historial no disponible")
	}
	return s.repo.GetHistory(limit)
}
