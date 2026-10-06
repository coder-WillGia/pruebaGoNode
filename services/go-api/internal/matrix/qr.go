package matrix

import (
	"errors"
	"math"
)

// QRResult holds the Q and R matrices resulting from QR Factorization.
type QRResult struct {
	Q [][]float64 `json:"q"`
	R [][]float64 `json:"r"`
}

var (
	ErrEmptyMatrix        = errors.New("la matriz no puede estar vacía")
	ErrNonRectangular     = errors.New("todas las filas deben tener la misma cantidad de columnas")
	ErrMoreColsThanRows   = errors.New("la matriz debe tener al menos tantas filas como columnas (m >= n)")
	ErrLinearlyDependent  = errors.New("las columnas de la matriz son linealmente dependientes (rango deficiente)")
)

const Epsilon = 1e-9

// ValidateMatrix checks if a given 2D array is a valid rectangular matrix with m >= n.
func ValidateMatrix(m [][]float64) (rows int, cols int, err error) {
	rows = len(m)
	if rows == 0 {
		return 0, 0, ErrEmptyMatrix
	}

	cols = len(m[0])
	if cols == 0 {
		return 0, 0, ErrEmptyMatrix
	}

	for i := 1; i < rows; i++ {
		if len(m[i]) != cols {
			return 0, 0, ErrNonRectangular
		}
	}

	if rows < cols {
		return 0, 0, ErrMoreColsThanRows
	}

	return rows, cols, nil
}

// ComputeQR performs Modified Gram-Schmidt (MGS) QR Factorization on an m x n matrix (m >= n).
// It returns Q (m x n) with orthonormal columns and R (n x n) upper triangular.
func ComputeQR(A [][]float64) (*QRResult, error) {
	m, n, err := ValidateMatrix(A)
	if err != nil {
		return nil, err
	}

	// Initialize V as a copy of A (m x n)
	V := make([][]float64, m)
	for i := 0; i < m; i++ {
		V[i] = make([]float64, n)
		copy(V[i], A[i])
	}

	// Initialize Q (m x n) and R (n x n)
	Q := make([][]float64, m)
	for i := 0; i < m; i++ {
		Q[i] = make([]float64, n)
	}

	R := make([][]float64, n)
	for i := 0; i < n; i++ {
		R[i] = make([]float64, n)
	}

	// Modified Gram-Schmidt algorithm
	for j := 0; j < n; j++ {
		// Compute norm of column j in V
		var normSq float64
		for i := 0; i < m; i++ {
			normSq += V[i][j] * V[i][j]
		}
		norm := math.Sqrt(normSq)

		if norm < Epsilon {
			// Column is approximately zero (linearly dependent)
			return nil, ErrLinearlyDependent
		}

		R[j][j] = norm

		// Normalize column j to obtain Q[:, j]
		for i := 0; i < m; i++ {
			Q[i][j] = V[i][j] / norm
		}

		// Project remaining columns
		for k := j + 1; k < n; k++ {
			var dotProduct float64
			for i := 0; i < m; i++ {
				dotProduct += Q[i][j] * V[i][k]
			}
			R[j][k] = dotProduct

			for i := 0; i < m; i++ {
				V[i][k] -= dotProduct * Q[i][j]
			}
		}
	}

	return &QRResult{
		Q: Q,
		R: R,
	}, nil
}
