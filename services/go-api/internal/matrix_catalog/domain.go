package matrix_catalog

import "time"

type MatrixInput struct {
	ID          string        `json:"id"`
	Name        string        `json:"name"`
	Description string        `json:"description,omitempty"`
	MatrixData  [][]float64   `json:"matrix_data"`
	Rows        int           `json:"rows"`
	Cols        int           `json:"cols"`
	CreatedAt   time.Time     `json:"created_at"`
}

type CreateMatrixInputRequest struct {
	Name        string      `json:"name"`
	Description string      `json:"description,omitempty"`
	MatrixData  [][]float64 `json:"matrix_data"`
}
