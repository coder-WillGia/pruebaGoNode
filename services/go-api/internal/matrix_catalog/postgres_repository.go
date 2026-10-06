package matrix_catalog

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
)

type Repository interface {
	FindAll() ([]MatrixInput, error)
	FindByID(id string) (*MatrixInput, error)
	Create(m *MatrixInput) error
}

type postgresRepository struct {
	db *sql.DB
}

func NewPostgresRepository(db *sql.DB) Repository {
	return &postgresRepository{db: db}
}

func (r *postgresRepository) FindAll() ([]MatrixInput, error) {
	if r.db == nil {
		return nil, errors.New("base de datos no disponible")
	}

	query := `SELECT id, name, COALESCE(description, ''), matrix_data, rows, cols, created_at FROM matrix_inputs ORDER BY created_at ASC`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("error consultando catálogo de matrices: %w", err)
	}
	defer rows.Close()

	var list []MatrixInput
	for rows.Next() {
		var item MatrixInput
		var dataBytes []byte
		if err := rows.Scan(&item.ID, &item.Name, &item.Description, &dataBytes, &item.Rows, &item.Cols, &item.CreatedAt); err != nil {
			return nil, fmt.Errorf("error leyendo fila de matriz: %w", err)
		}
		if err := json.Unmarshal(dataBytes, &item.MatrixData); err != nil {
			return nil, fmt.Errorf("error decodificando jsonb de matriz: %w", err)
		}
		list = append(list, item)
	}

	return list, nil
}

func (r *postgresRepository) FindByID(id string) (*MatrixInput, error) {
	if r.db == nil {
		return nil, errors.New("base de datos no disponible")
	}

	query := `SELECT id, name, COALESCE(description, ''), matrix_data, rows, cols, created_at FROM matrix_inputs WHERE id = $1 LIMIT 1`
	var item MatrixInput
	var dataBytes []byte
	err := r.db.QueryRow(query, id).Scan(&item.ID, &item.Name, &item.Description, &dataBytes, &item.Rows, &item.Cols, &item.CreatedAt)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("error consultando matriz por id: %w", err)
	}

	if err := json.Unmarshal(dataBytes, &item.MatrixData); err != nil {
		return nil, fmt.Errorf("error decodificando jsonb: %w", err)
	}

	return &item, nil
}

func (r *postgresRepository) Create(m *MatrixInput) error {
	if r.db == nil {
		return errors.New("base de datos no disponible")
	}

	dataBytes, err := json.Marshal(m.MatrixData)
	if err != nil {
		return fmt.Errorf("error serializando matriz a JSON: %w", err)
	}

	query := `INSERT INTO matrix_inputs (name, description, matrix_data, rows, cols) VALUES ($1, $2, $3, $4, $5) RETURNING id, created_at`
	return r.db.QueryRow(query, m.Name, m.Description, dataBytes, m.Rows, m.Cols).Scan(&m.ID, &m.CreatedAt)
}
