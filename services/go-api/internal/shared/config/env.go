package config

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port        string
	DatabaseURL string
	NodeAPIURL  string
	JWTSecret   string
	EnableAuth  bool
}

// LoadConfig loads environment variables strictly from .env or environment
// without hardcoded credentials or database URLs.
func LoadConfig() (*Config, error) {
	// Intentar cargar .env si existe en el entorno local
	_ = godotenv.Load()

	port := os.Getenv("PORT")
	if port == "" {
		return nil, fmt.Errorf("variable de entorno requerida no encontrada: PORT")
	}

	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		return nil, fmt.Errorf("variable de entorno requerida no encontrada: DATABASE_URL")
	}

	nodeAPIURL := os.Getenv("NODE_API_URL")
	if nodeAPIURL == "" {
		return nil, fmt.Errorf("variable de entorno requerida no encontrada: NODE_API_URL")
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		return nil, fmt.Errorf("variable de entorno requerida no encontrada: JWT_SECRET")
	}

	enableAuth := os.Getenv("ENABLE_AUTH") == "true"

	return &Config{
		Port:        port,
		DatabaseURL: databaseURL,
		NodeAPIURL:  nodeAPIURL,
		JWTSecret:   jwtSecret,
		EnableAuth:  enableAuth,
	}, nil
}
