package matrix_processing

import (
	"math"
)

const Epsilon = 1e-9

type QRCalculator interface {
	Factorize(A [][]float64) (*QRResult, error)
	Validate(A [][]float64) (rows int, cols int, err error)
}

type mgsQRCalculator struct{}

func NewQRCalculator() QRCalculator {
	return &mgsQRCalculator{}
}

func (c *mgsQRCalculator) Validate(m [][]float64) (rows int, cols int, err error) {
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

// Factorize implements Modified Gram-Schmidt (MGS) QR Factorization on an m x n matrix (m >= n).
func (c *mgsQRCalculator) Factorize(A [][]float64) (*QRResult, error) {
	m, n, err := c.Validate(A)
	if err != nil {
		return nil, err
	}

	// Copia de trabajo V (m x n)
	V := make([][]float64, m)
	for i := 0; i < m; i++ {
		V[i] = make([]float64, n)
		copy(V[i], A[i])
	}

	// Q (m x n) y R (n x n)
	Q := make([][]float64, m)
	for i := 0; i < m; i++ {
		Q[i] = make([]float64, n)
	}

	R := make([][]float64, n)
	for i := 0; i < n; i++ {
		R[i] = make([]float64, n)
	}

	// Gram-Schmidt Modificado
	for j := 0; j < n; j++ {
		var normSq float64
		for i := 0; i < m; i++ {
			normSq += V[i][j] * V[i][j]
		}
		norm := math.Sqrt(normSq)

		if norm < Epsilon {
			return nil, ErrLinearlyDependent
		}

		R[j][j] = norm

		for i := 0; i < m; i++ {
			Q[i][j] = V[i][j] / norm
		}

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
