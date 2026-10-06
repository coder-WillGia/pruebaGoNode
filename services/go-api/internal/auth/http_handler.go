package auth

import (
	"strings"

	"interseguro/go-api/internal/shared/response"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

func JWTMiddleware(jwtSecret string, forceAuth bool) fiber.Handler {
	secretBytes := []byte(jwtSecret)

	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")

		if !forceAuth && authHeader == "" {
			return c.Next()
		}

		if authHeader == "" {
			return response.BadRequest(c, "Cabecera de autorización Bearer token requerida")
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		tokenString = strings.TrimSpace(tokenString)

		token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fiber.NewError(fiber.StatusUnauthorized, "Algoritmo de firma inválido")
			}
			return secretBytes, nil
		})

		if err != nil || !token.Valid {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"status":  "error",
				"message": "Token JWT inválido o expirado",
			})
		}

		if claims, ok := token.Claims.(jwt.MapClaims); ok {
			c.Locals("user_id", claims["user_id"])
			c.Locals("username", claims["username"])
		}

		return c.Next()
	}
}

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) RegisterRoutes(router fiber.Router) {
	authGroup := router.Group("/auth")
	authGroup.Post("/register", h.Register)
	authGroup.Post("/login", h.Login)
}

func (h *Handler) Register(c *fiber.Ctx) error {
	var req RegisterRequest
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Payload JSON inválido", err.Error())
	}

	res, err := h.service.Register(req)
	if err != nil {
		return response.BadRequest(c, err.Error())
	}

	return response.Created(c, res, "Usuario registrado exitosamente")
}

func (h *Handler) Login(c *fiber.Ctx) error {
	var req LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Payload JSON inválido", err.Error())
	}

	res, err := h.service.Login(req)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"status":  "error",
			"message": err.Error(),
		})
	}

	return response.OK(c, res, "Autenticación exitosa")
}
