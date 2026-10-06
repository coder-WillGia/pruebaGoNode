package auth

import (
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type Service struct {
	repo      Repository
	jwtSecret []byte
}

func NewService(repo Repository, jwtSecret string) *Service {
	return &Service{
		repo:      repo,
		jwtSecret: []byte(jwtSecret),
	}
}

func (s *Service) Register(req RegisterRequest) (*AuthResponse, error) {
	if req.Username == "" || req.Password == "" {
		return nil, errors.New("el usuario y la contraseña son requeridos")
	}

	existing, err := s.repo.FindByUsername(req.Username)
	if err != nil {
		return nil, err
	}
	if existing != nil {
		return nil, errors.New("el nombre de usuario ya existe")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("error al encriptar contraseña: %w", err)
	}

	newUser := &User{
		Username:     req.Username,
		PasswordHash: string(hashedPassword),
		Role:         req.Role,
	}

	if err := s.repo.Create(newUser); err != nil {
		return nil, err
	}

	token, err := s.generateToken(newUser)
	if err != nil {
		return nil, err
	}

	return &AuthResponse{
		Token: token,
		User:  *newUser,
	}, nil
}

func (s *Service) Login(req LoginRequest) (*AuthResponse, error) {
	if req.Username == "" || req.Password == "" {
		return nil, errors.New("debe ingresar usuario y contraseña")
	}

	user, err := s.repo.FindByUsername(req.Username)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, errors.New("credenciales inválidas")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, errors.New("credenciales inválidas")
	}

	token, err := s.generateToken(user)
	if err != nil {
		return nil, err
	}

	return &AuthResponse{
		Token: token,
		User:  *user,
	}, nil
}

func (s *Service) generateToken(user *User) (string, error) {
	claims := jwt.MapClaims{
		"user_id":  user.ID,
		"username": user.Username,
		"role":     user.Role,
		"exp":      time.Now().Add(24 * time.Hour).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString(s.jwtSecret)
	if err != nil {
		return "", fmt.Errorf("error al firmar token JWT: %w", err)
	}
	return signed, nil
}
