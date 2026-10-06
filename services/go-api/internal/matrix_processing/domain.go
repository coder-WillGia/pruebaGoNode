package matrix_processing

import (
	"errors"
	"time"
)

var (
	ErrEmptyMatrix       = errors.New("la matriz no puede estar vacía")
	ErrNonRectangular    = errors.New("todas las filas deben tener la misma cantidad de columnas")
	ErrMoreColsThanRows  = errors.New("la matriz debe tener al menos tantas filas como columnas (m >= n)")
	ErrLinearlyDependent = errors.New("las columnas de la matriz son linealmente dependientes")
)

type ProcessMatrixRequest struct {
	Matrix [][]float64 `json:"matrix"`
}

type QRResult struct {
	Q [][]float64 `json:"q"`
	R [][]float64 `json:"r"`
}

type NodeStats struct {
	Max           float64 `json:"max"`
	Min           float64 `json:"min"`
	Average       float64 `json:"average"`
	Sum           float64 `json:"sum"`
	TotalElements int     `json:"total_elements"`
}

type NodeDiagonalCheck struct {
	IsQDiagonal   bool `json:"is_q_diagonal"`
	IsRDiagonal   bool `json:"is_r_diagonal"`
	IsAnyDiagonal bool `json:"is_any_diagonal"`
}

type NodeAnalysisData struct {
	Stats         NodeStats         `json:"stats"`
	DiagonalCheck NodeDiagonalCheck `json:"diagonal_check"`
}

type ProcessMatrixResponse struct {
	OriginalMatrix [][]float64      `json:"original_matrix"`
	Dimensions     Dimensions       `json:"dimensions"`
	Q              [][]float64      `json:"q"`
	R              [][]float64      `json:"r"`
	Analysis       NodeAnalysisData `json:"analysis"`
	ExecutionTimeMs float64         `json:"execution_time_ms"`
}

type Dimensions struct {
	Rows int `json:"rows"`
	Cols int `json:"cols"`
}

type MatrixOperationHistory struct {
	ID              string           `json:"id"`
	OriginalMatrix  [][]float64      `json:"original_matrix"`
	MatrixQ         [][]float64      `json:"matrix_q"`
	MatrixR         [][]float64      `json:"matrix_r"`
	Rows            int              `json:"rows"`
	Cols            int              `json:"cols"`
	ExecutionTimeMs float64          `json:"execution_time_ms"`
	Analysis        *NodeAnalysisData `json:"analysis,omitempty"`
	CreatedAt       time.Time        `json:"created_at"`
}
