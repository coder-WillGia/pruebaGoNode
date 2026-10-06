package matrix_catalog

import (
	"errors"
	"fmt"

	"interseguro/go-api/internal/shared/response"

	"github.com/gofiber/fiber/v2"
)

type Service struct {
	repo Repository
}

func NewService(repo Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) GetAll() ([]MatrixInput, error) {
	return s.repo.FindAll()
}

func (s *Service) GetByID(id string) (*MatrixInput, error) {
	if id == "" {
		return nil, errors.New("id requerido")
	}
	item, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}
	if item == nil {
		return nil, fmt.Errorf("matriz no encontrada con id: %s", id)
	}
	return item, nil
}

func (s *Service) Create(req CreateMatrixInputRequest) (*MatrixInput, error) {
	if req.Name == "" {
		return nil, errors.New("el nombre de la matriz es requerido")
	}
	rows := len(req.MatrixData)
	if rows == 0 {
		return nil, errors.New("la matriz no puede estar vacía")
	}
	cols := len(req.MatrixData[0])
	if cols == 0 {
		return nil, errors.New("las columnas no pueden estar vacías")
	}
	for i := 1; i < rows; i++ {
		if len(req.MatrixData[i]) != cols {
			return nil, errors.New("todas las filas deben tener el mismo número de columnas")
		}
	}

	item := &MatrixInput{
		Name:        req.Name,
		Description: req.Description,
		MatrixData:  req.MatrixData,
		Rows:        rows,
		Cols:        cols,
	}

	if err := s.repo.Create(item); err != nil {
		return nil, err
	}

	return item, nil
}

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) RegisterRoutes(router fiber.Router) {
	group := router.Group("/matrices")
	group.Get("/", h.GetAll)
	group.Get("/:id", h.GetByID)
	group.Post("/", h.Create)
}

func (h *Handler) GetAll(c *fiber.Ctx) error {
	list, err := h.service.GetAll()
	if err != nil {
		return response.InternalError(c, "Error al listar matrices", err.Error())
	}
	return response.OK(c, list, "Catálogo de matrices obtenido exitosamente")
}

func (h *Handler) GetByID(c *fiber.Ctx) error {
	id := c.Params("id")
	item, err := h.service.GetByID(id)
	if err != nil {
		return response.NotFound(c, err.Error())
	}
	return response.OK(c, item)
}

func (h *Handler) Create(c *fiber.Ctx) error {
	var req CreateMatrixInputRequest
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Payload JSON inválido", err.Error())
	}

	item, err := h.service.Create(req)
	if err != nil {
		return response.BadRequest(c, err.Error())
	}

	return response.Created(c, item, "Matriz guardada en el catálogo exitosamente")
}
