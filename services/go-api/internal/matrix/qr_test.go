package matrix

import (
	"math"
	"testing"
)

func TestComputeQR_SquareMatrix(t *testing.T) {
	// 3x3 matrix
	A := [][]float64{
		{12, -51, 4},
		{6, 167, -68},
		{-4, 24, -41},
	}

	qr, err := ComputeQR(A)
	if err != nil {
		t.Fatalf("ComputeQR falló inesperadamente: %v", err)
	}

	// Verify Q dimensions (3x3) and R dimensions (3x3)
	if len(qr.Q) != 3 || len(qr.Q[0]) != 3 {
		t.Errorf("Dimensiones inesperadas para Q: %dx%d", len(qr.Q), len(qr.Q[0]))
	}
	if len(qr.R) != 3 || len(qr.R[0]) != 3 {
		t.Errorf("Dimensiones inesperadas para R: %dx%d", len(qr.R), len(qr.R[0]))
	}

	// Verify Q is orthonormal: Q^T * Q = I
	m := len(qr.Q)
	n := len(qr.Q[0])
	for i := 0; i < n; i++ {
		for j := 0; j < n; j++ {
			var dot float64
			for k := 0; k < m; k++ {
				dot += qr.Q[k][i] * qr.Q[k][j]
			}
			expected := 0.0
			if i == j {
				expected = 1.0
			}
			if math.Abs(dot-expected) > 1e-6 {
				t.Errorf("Q no es ortonormal en (%d, %d): obtenido %f, esperado %f", i, j, dot, expected)
			}
		}
	}

	// Verify Q * R = A
	for i := 0; i < m; i++ {
		for j := 0; j < n; j++ {
			var val float64
			for k := 0; k < n; k++ {
				val += qr.Q[i][k] * qr.R[k][j]
			}
			if math.Abs(val-A[i][j]) > 1e-6 {
				t.Errorf("Q*R != A en (%d, %d): obtenido %f, esperado %f", i, j, val, A[i][j])
			}
		}
	}
}

func TestComputeQR_RectangularMatrix(t *testing.T) {
	// 4x2 rectangular matrix
	A := [][]float64{
		{1, 2},
		{3, 4},
		{5, 6},
		{7, 8},
	}

	qr, err := ComputeQR(A)
	if err != nil {
		t.Fatalf("ComputeQR falló en matriz rectangular: %v", err)
	}

	if len(qr.Q) != 4 || len(qr.Q[0]) != 2 {
		t.Errorf("Dimensiones Q incorrectas: %dx%d", len(qr.Q), len(qr.Q[0]))
	}
	if len(qr.R) != 2 || len(qr.R[0]) != 2 {
		t.Errorf("Dimensiones R incorrectas: %dx%d", len(qr.R), len(qr.R[0]))
	}

	// Check Q * R = A
	m := 4
	n := 2
	for i := 0; i < m; i++ {
		for j := 0; j < n; j++ {
			var val float64
			for k := 0; k < n; k++ {
				val += qr.Q[i][k] * qr.R[k][j]
			}
			if math.Abs(val-A[i][j]) > 1e-6 {
				t.Errorf("Q*R != A en (%d, %d): obtenido %f, esperado %f", i, j, val, A[i][j])
			}
		}
	}
}

func TestComputeQR_Errors(t *testing.T) {
	// Empty matrix
	_, err := ComputeQR([][]float64{})
	if err == nil {
		t.Error("Se esperaba error con matriz vacía")
	}

	// Non-rectangular matrix
	_, err = ComputeQR([][]float64{{1, 2}, {3}})
	if err == nil {
		t.Error("Se esperaba error con filas de distinto tamaño")
	}

	// More cols than rows
	_, err = ComputeQR([][]float64{{1, 2, 3}, {4, 5, 6}})
	if err == nil {
		t.Error("Se esperaba error para matriz con m < n")
	}
}
