package middleware

import (
	"os"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

func GetJWTSecret() []byte {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "interseguro-super-secret-jwt-key-2026"
	}
	return []byte(secret)
}

// JWTMiddleware validates Bearer JWT token if ENABLE_AUTH is true or if token is provided.
func JWTMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		enableAuth := os.Getenv("ENABLE_AUTH") == "true"

		if !enableAuth && authHeader == "" {
			// Auth is optional if ENABLE_AUTH is not explicitly forced
			return c.Next()
		}

		if authHeader == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"status":  "error",
				"message": "Cabecera de autorización Bearer token requerida",
			})
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader && strings.HasPrefix(authHeader, "Bearer") {
			tokenString = strings.TrimSpace(tokenString)
		}

		token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fiber.NewError(fiber.StatusUnauthorized, "Método de firma no válido")
			}
			return GetJWTSecret(), nil
		})

		if err != nil || !token.Valid {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"status":  "error",
				"message": "Token JWT inválido o expirado",
			})
		}

		c.Locals("user", token.Claims)
		return c.Next()
	}
}
