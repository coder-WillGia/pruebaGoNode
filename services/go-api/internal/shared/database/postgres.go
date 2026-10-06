package database

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	_ "github.com/lib/pq"
)

const initSchemaSQL = `
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabla de Usuarios
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Matrices de Entrada / Catálogo de Matrices
CREATE TABLE IF NOT EXISTS matrix_inputs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    description TEXT,
    matrix_data JSONB NOT NULL,
    rows INT NOT NULL,
    cols INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla de Operaciones de Factorización QR (Go API)
CREATE TABLE IF NOT EXISTS matrix_operations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    input_id UUID REFERENCES matrix_inputs(id) ON DELETE SET NULL,
    original_matrix JSONB NOT NULL,
    matrix_q JSONB NOT NULL,
    matrix_r JSONB NOT NULL,
    rows INT NOT NULL,
    cols INT NOT NULL,
    execution_time_ms NUMERIC(10, 4),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla de Analítica y Estadísticas (Node.js API)
CREATE TABLE IF NOT EXISTS matrix_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operation_id UUID NOT NULL REFERENCES matrix_operations(id) ON DELETE CASCADE,
    max_value NUMERIC(15, 6) NOT NULL,
    min_value NUMERIC(15, 6) NOT NULL,
    average_value NUMERIC(15, 6) NOT NULL,
    sum_value NUMERIC(15, 6) NOT NULL,
    total_elements INT NOT NULL,
    is_q_diagonal BOOLEAN NOT NULL DEFAULT FALSE,
    is_r_diagonal BOOLEAN NOT NULL DEFAULT FALSE,
    is_any_diagonal BOOLEAN NOT NULL DEFAULT FALSE,
    analyzed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Índices Idempotentes
CREATE INDEX IF NOT EXISTS idx_matrix_operations_created_at ON matrix_operations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_matrix_analytics_operation_id ON matrix_analytics(operation_id);

-- Semilla inicial de matrices (solo si no existen)
INSERT INTO matrix_inputs (id, name, description, matrix_data, rows, cols) VALUES
(
    '6f48b96f-7e84-417a-83a6-c1ac2569335e',
    'Matriz Reto 3x3',
    'Matriz cuadrada estándar de evaluación del reto técnico',
    '[[12, -51, 4], [6, 167, -68], [-4, 24, -41]]'::jsonb,
    3,
    3
),
(
    '7ba7c3ea-43b4-47cc-9bbc-3c7d4cf38b6e',
    'Matriz Rectangular 4x2',
    'Matriz rectangular m > n para prueba de Gram-Schmidt modificado',
    '[[1, 2], [3, 4], [5, 6], [7, 8]]'::jsonb,
    4,
    2
),
(
    '0079a8d8-19ea-47db-8438-b891a96a0b21',
    'Matriz Diagonal 3x3',
    'Matriz de prueba para validación de flag diagonal',
    '[[5, 0, 0], [0, 8, 0], [0, 0, 12]]'::jsonb,
    3,
    3
)
ON CONFLICT (id) DO NOTHING;

-- Semilla inicial de Usuario Evaluador (password: interseguro2026)
INSERT INTO users (username, password_hash, role) VALUES
(
    'evaluador_interseguro',
    '$2a$10$QMOW7oN8fY79yMH6eOnCBecU5Ww/DxX84IX1KQwZ9CDB2FMORUr.i',
    'admin'
)
ON CONFLICT (username) DO NOTHING;
`

func NewPostgresDB(connStr string) (*sql.DB, error) {
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, fmt.Errorf("error al abrir conexión PostgreSQL: %w", err)
	}

	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)

	if err := db.Ping(); err != nil {
		log.Printf("[Advertencia BD] No se pudo conectar inmediatamente a PostgreSQL: %v (las APIs operarán en modo memoria)", err)
		return db, nil
	}

	log.Println("[PostgreSQL] Conexión establecida exitosamente con la base de datos")

	// Auto-Migración Idempotente en el arranque
	if err := AutoMigrate(db); err != nil {
		log.Printf("[Auto-Migración Error] Falló la creación/verificación de tablas: %v", err)
	} else {
		log.Println("[Auto-Migración] Tablas, índices y semillas verificados con éxito (Idempotencia activa)")
	}

	return db, nil
}

// AutoMigrate ejecuta el script DDL de forma 100% idempotente.
func AutoMigrate(db *sql.DB) error {
	if db == nil {
		return nil
	}
	_, err := db.Exec(initSchemaSQL)
	return err
}
