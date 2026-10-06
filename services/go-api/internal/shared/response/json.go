package response

import "github.com/gofiber/fiber/v2"

type SuccessResponse struct {
	Status  string      `json:"status"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
}

type ErrorResponse struct {
	Status  string `json:"status"`
	Message string `json:"message"`
	Error   string `json:"error,omitempty"`
}

func OK(c *fiber.Ctx, data interface{}, message ...string) error {
	msg := ""
	if len(message) > 0 {
		msg = message[0]
	}
	return c.Status(fiber.StatusOK).JSON(SuccessResponse{
		Status:  "success",
		Message: msg,
		Data:    data,
	})
}

func Created(c *fiber.Ctx, data interface{}, message ...string) error {
	msg := ""
	if len(message) > 0 {
		msg = message[0]
	}
	return c.Status(fiber.StatusCreated).JSON(SuccessResponse{
		Status:  "success",
		Message: msg,
		Data:    data,
	})
}

func BadRequest(c *fiber.Ctx, message string, detail ...string) error {
	errDetail := ""
	if len(detail) > 0 {
		errDetail = detail[0]
	}
	return c.Status(fiber.StatusBadRequest).JSON(ErrorResponse{
		Status:  "error",
		Message: message,
		Error:   errDetail,
	})
}

func NotFound(c *fiber.Ctx, message string) error {
	return c.Status(fiber.StatusNotFound).JSON(ErrorResponse{
		Status:  "error",
		Message: message,
	})
}

func InternalError(c *fiber.Ctx, message string, detail ...string) error {
	errDetail := ""
	if len(detail) > 0 {
		errDetail = detail[0]
	}
	return c.Status(fiber.StatusInternalServerError).JSON(ErrorResponse{
		Status:  "error",
		Message: message,
		Error:   errDetail,
	})
}
