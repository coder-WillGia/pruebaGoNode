package matrix_processing

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
)

type postgresRepository struct {
	db *sql.DB
}

func NewPostgresRepository(db *sql.DB) RepositoryPort {
	return &postgresRepository{db: db}
}

func (r *postgresRepository) SaveOperation(op *MatrixOperationHistory) (string, error) {
	if r.db == nil {
		return "", errors.New("base de datos no disponible")
	}

	origBytes, err := json.Marshal(op.OriginalMatrix)
	if err != nil {
		return "", err
	}
	qBytes, err := json.Marshal(op.MatrixQ)
	if err != nil {
		return "", err
	}
	rBytes, err := json.Marshal(op.MatrixR)
	if err != nil {
		return "", err
	}

	query := `
		INSERT INTO matrix_operations (original_matrix, matrix_q, matrix_r, rows, cols, execution_time_ms)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, created_at
	`

	var opID string
	err = r.db.QueryRow(query, origBytes, qBytes, rBytes, op.Rows, op.Cols, op.ExecutionTimeMs).Scan(&opID, &op.CreatedAt)
	if err != nil {
		return "", fmt.Errorf("error al guardar operación matricial en BD: %w", err)
	}

	op.ID = opID

	// Guardar analítica si está disponible
	if op.Analysis != nil {
		analyticsQuery := `
			INSERT INTO matrix_analytics (
				operation_id, max_value, min_value, average_value, sum_value,
				total_elements, is_q_diagonal, is_r_diagonal, is_any_diagonal
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		`
		_, _ = r.db.Exec(
			analyticsQuery,
			opID,
			op.Analysis.Stats.Max,
			op.Analysis.Stats.Min,
			op.Analysis.Stats.Average,
			op.Analysis.Stats.Sum,
			op.Analysis.Stats.TotalElements,
			op.Analysis.DiagonalCheck.IsQDiagonal,
			op.Analysis.DiagonalCheck.IsRDiagonal,
			op.Analysis.DiagonalCheck.IsAnyDiagonal,
		)
	}

	return opID, nil
}

func (r *postgresRepository) GetHistory(limit int) ([]MatrixOperationHistory, error) {
	if r.db == nil {
		return nil, errors.New("base de datos no disponible")
	}

	if limit <= 0 {
		limit = 20
	}

	query := `
		SELECT 
			o.id, o.original_matrix, o.matrix_q, o.matrix_r, o.rows, o.cols, o.execution_time_ms, o.created_at,
			a.max_value, a.min_value, a.average_value, a.sum_value, a.total_elements,
			a.is_q_diagonal, a.is_r_diagonal, a.is_any_diagonal
		FROM matrix_operations o
		LEFT JOIN matrix_analytics a ON o.id = a.operation_id
		ORDER BY o.created_at DESC
		LIMIT $1
	`

	rows, err := r.db.Query(query, limit)
	if err != nil {
		return nil, fmt.Errorf("error consultando historial: %w", err)
	}
	defer rows.Close()

	var history []MatrixOperationHistory
	for rows.Next() {
		var item MatrixOperationHistory
		var origBytes, qBytes, rBytes []byte
		var maxVal, minVal, avgVal, sumVal sql.NullFloat64
		var totalElems sql.NullInt32
		var isQDiag, isRDiag, isAnyDiag sql.NullBool

		err := rows.Scan(
			&item.ID, &origBytes, &qBytes, &rBytes, &item.Rows, &item.Cols, &item.ExecutionTimeMs, &item.CreatedAt,
			&maxVal, &minVal, &avgVal, &sumVal, &totalElems,
			&isQDiag, &isRDiag, &isAnyDiag,
		)
		if err != nil {
			return nil, fmt.Errorf("error leyendo fila de historial: %w", err)
		}

		_ = json.Unmarshal(origBytes, &item.OriginalMatrix)
		_ = json.Unmarshal(qBytes, &item.MatrixQ)
		_ = json.Unmarshal(rBytes, &item.MatrixR)

		if maxVal.Valid {
			item.Analysis = &NodeAnalysisData{
				Stats: NodeStats{
					Max:           maxVal.Float64,
					Min:           minVal.Float64,
					Average:       avgVal.Float64,
					Sum:           sumVal.Float64,
					TotalElements: int(totalElems.Int32),
				},
				DiagonalCheck: NodeDiagonalCheck{
					IsQDiagonal:   isQDiag.Bool,
					IsRDiagonal:   isRDiag.Bool,
					IsAnyDiagonal: isAnyDiag.Bool,
				},
			}
		}

		history = append(history, item)
	}

	return history, nil
}
