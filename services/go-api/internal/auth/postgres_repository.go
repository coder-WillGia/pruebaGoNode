package auth

import (
	"database/sql"
	"errors"
	"fmt"
)

type Repository interface {
	FindByUsername(username string) (*User, error)
	Create(user *User) error
}

type postgresRepository struct {
	db *sql.DB
}

func NewPostgresRepository(db *sql.DB) Repository {
	return &postgresRepository{db: db}
}

func (r *postgresRepository) FindByUsername(username string) (*User, error) {
	if r.db == nil {
		return nil, errors.New("base de datos no disponible")
	}

	query := `SELECT id, username, password_hash, role, created_at FROM users WHERE username = $1 LIMIT 1`
	var u User
	err := r.db.QueryRow(query, username).Scan(&u.ID, &u.Username, &u.PasswordHash, &u.Role, &u.CreatedAt)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("error al buscar usuario: %w", err)
	}

	return &u, nil
}

func (r *postgresRepository) Create(user *User) error {
	if r.db == nil {
		return errors.New("base de datos no disponible")
	}

	query := `INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING id, created_at`
	role := user.Role
	if role == "" {
		role = "user"
	}
	err := r.db.QueryRow(query, user.Username, user.PasswordHash, role).Scan(&user.ID, &user.CreatedAt)
	if err != nil {
		return fmt.Errorf("error al registrar usuario: %w", err)
	}
	user.Role = role
	return nil
}
