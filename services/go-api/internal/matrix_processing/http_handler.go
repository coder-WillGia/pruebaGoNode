package matrix_processing

import (
	"strconv"

	"interseguro/go-api/internal/shared/response"

	"github.com/gofiber/fiber/v2"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) RegisterRoutes(router fiber.Router) {
	group := router.Group("/matrix")
	group.Post("/process", h.ProcessMatrix)
	group.Post("/process/:id", h.ProcessMatrixByID)
	group.Get("/history", h.GetHistory)
}

func (h *Handler) extractUserInfo(c *fiber.Ctx) (string, string) {
	userID, _ := c.Locals("user_id").(string)
	username, _ := c.Locals("username").(string)
	return userID, username
}

func (h *Handler) ProcessMatrix(c *fiber.Ctx) error {
	var req ProcessMatrixRequest
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "El cuerpo de la petición debe ser un JSON válido con la propiedad 'matrix'", err.Error())
	}

	token := c.Get("Authorization")
	userID, username := h.extractUserInfo(c)

	result, err := h.service.ProcessMatrix(req.Matrix, token, userID, username)
	if err != nil {
		return response.BadRequest(c, err.Error())
	}

	return response.OK(c, result, "Factorización QR y análisis estadístico calculados exitosamente")
}

func (h *Handler) ProcessMatrixByID(c *fiber.Ctx) error {
	id := c.Params("id")
	token := c.Get("Authorization")
	userID, username := h.extractUserInfo(c)

	result, err := h.service.ProcessMatrixByID(id, token, userID, username)
	if err != nil {
		return response.BadRequest(c, err.Error())
	}

	return response.OK(c, result, "Matriz del catálogo procesada exitosamente")
}

func (h *Handler) GetHistory(c *fiber.Ctx) error {
	limitStr := c.Query("limit", "20")
	limit, _ := strconv.Atoi(limitStr)

	history, err := h.service.GetHistory(limit)
	if err != nil {
		return response.InternalError(c, "Error al consultar historial de operaciones", err.Error())
	}

	return response.OK(c, history, "Historial recuperado exitosamente")
}
