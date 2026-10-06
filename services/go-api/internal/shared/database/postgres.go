package database

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	_ "github.com/lib/pq"
)

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

	log.Println("[PostgreSQL] Conexión establecida exitosamente con matrix_challenge_db")
	return db, nil
}
