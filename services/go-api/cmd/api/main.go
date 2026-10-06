package main

import (
	"log"

	"interseguro/go-api/internal/auth"
	"interseguro/go-api/internal/matrix_catalog"
	"interseguro/go-api/internal/matrix_processing"
	"interseguro/go-api/internal/shared/config"
	"interseguro/go-api/internal/shared/database"
	"interseguro/go-api/internal/shared/response"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

func main() {
	// 1. Cargar configuración desde .env
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("[Error Configuración] %v", err)
	}

	// 2. Conectar a PostgreSQL (matrix_challenge_db)
	db, err := database.NewPostgresDB(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("[Error Base de Datos] %v", err)
	}
	defer db.Close()

	// 3. Inicializar Repositorios (Adaptadores Secundarios)
	authRepo := auth.NewPostgresRepository(db)
	catalogRepo := matrix_catalog.NewPostgresRepository(db)
	processingRepo := matrix_processing.NewPostgresRepository(db)

	// 4. Inicializar Clientes HTTP (Adaptadores Secundarios)
	nodeClient := matrix_processing.NewNodeHTTPClient(cfg.NodeAPIURL)

	// 5. Inicializar Servicios / Casos de Uso (Core Dominio)
	authService := auth.NewService(authRepo, cfg.JWTSecret)
	catalogService := matrix_catalog.NewService(catalogRepo)
	qrCalculator := matrix_processing.NewQRCalculator()
	processingService := matrix_processing.NewService(qrCalculator, nodeClient, processingRepo, catalogRepo)

	// 6. Inicializar Handlers HTTP (Adaptadores Primarios)
	authHandler := auth.NewHandler(authService)
	catalogHandler := matrix_catalog.NewHandler(catalogService)
	processingHandler := matrix_processing.NewHandler(processingService)

	// 7. Configuración de Fiber App
	app := fiber.New(fiber.Config{
		AppName: "Interseguro Go Matrix Processing API (Fiber)",
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			return response.InternalError(c, "Error interno del servidor", err.Error())
		},
	})

	app.Use(logger.New())
	app.Use(recover.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET, POST, PUT, DELETE, OPTIONS",
	}))

	// Health check
	app.Get("/health", func(c *fiber.Ctx) error {
		return response.OK(c, fiber.Map{
			"status":  "healthy",
			"service": "go-api (Fiber)",
			"version": "1.0.0",
		})
	})

	// API v1 Routing
	apiV1 := app.Group("/api/v1")
	authHandler.RegisterRoutes(apiV1)

	// Middleware de autenticación (aplica si ENABLE_AUTH=true en .env o si se envía token)
	protected := apiV1.Group("", auth.JWTMiddleware(cfg.JWTSecret, cfg.EnableAuth))
	catalogHandler.RegisterRoutes(protected)
	processingHandler.RegisterRoutes(protected)

	// Iniciar Servidor
	addr := ":" + cfg.Port
	log.Printf("[Go API] Servidor escuchando en http://localhost%s", addr)
	if err := app.Listen(addr); err != nil {
		log.Fatalf("[Go API] Error al iniciar servidor: %v", err)
	}
}
