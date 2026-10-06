# Reto Técnico Interseguro - Factorización QR & Analítica Distribuida (Go + Node.js)

Solución de arquitectura orientada a microservicios distribuidos para el procesamiento y análisis estadístico de matrices rectangulares utilizando **Go (Fiber)**, **Node.js (Express)**, **PostgreSQL (Neon Cloud)** y **Docker**.

---

## 🏛️ Arquitectura del Sistema

El sistema implementa el patrón **Hexagonal Architecture + Vertical Slices (Screaming Architecture)** con separación estricta de responsabilidades:

```mermaid
flowchart TD
    Cliente["👤 Cliente (Postman / Frontend)"] -->|1. POST /api/v1/matrix/process| GoAPI["🚀 API 1: Go (Fiber) :3000\n(API Gateway, Cómputo QR y Persistencia)"]
    
    subgraph "Microservicio 1: Go (Fiber)"
        GoAPI <-->|Lee Catálogo / Guarda Auditoría| DB[("🗄️ PostgreSQL (Neon)\nmatrix_challenge_db")]
    end
    
    subgraph "Microservicio 2: Node.js (Express)"
        NodeAPI["⚡ API 2: Node.js (Express) :4000\n(Stateless Analytics Engine)"]
    end
    
    GoAPI -->|2. POST /api/v1/matrix/analyze\nPayload: { q: [...], r: [...] }| NodeAPI
    NodeAPI -->|3. Retorna JSON de Estadísticas| GoAPI
    GoAPI -->|4. Respuesta Consolidada Final| Cliente
```

### 🎯 Responsabilidades por Servicio:
1. **API 1: Go (Fiber) [Puerto 3000]**:
   * Valida cualquier matriz rectangular $M \in \mathbb{R}^{m \times n}$ con $m \ge n$.
   * Computa en memoria la **Factorización QR** ($M = Q \times R$) mediante el algoritmo de **Gram-Schmidt Modificado (MGS)**.
   * Envía las matrices $Q$ y $R$ mediante HTTP `POST` a la API de Node.js.
   * Administra la persistencia desacoplada en PostgreSQL (`matrix_challenge_db`).
   * Consolida la respuesta final para el cliente.

2. **API 2: Node.js (Express) [Puerto 4000]**:
   * **100% Stateless**: No se conecta a la base de datos ni requiere credenciales.
   * Calcula en memoria:
     * **Valor máximo**
     * **Valor mínimo**
     * **Promedio (media)**
     * **Suma total**
     * **Verificación de matriz diagonal** (comprobación con tolerancia épsilon $\epsilon = 10^{-6}$).

---

## 🚀 Cómo Ejecutar el Proyecto

### Opción 1: Con Docker Compose (Recomendado)

```bash
# 1. Clonar el repositorio
git clone <URL_DE_TU_REPOSITORIO>
cd pruebaGoNode

# 2. Levantar ambos microservicios con Docker Compose
docker compose up --build
```
* Go API estará disponible en: `http://localhost:3000`
* Node API estará disponible en: `http://localhost:4000`

---

### Opción 2: Ejecución Local en Desarrollo

#### Terminal 1: Iniciar API de Node.js (Puerto 4000)
```bash
cd services/node-api
npm install
npm start
```

#### Terminal 2: Iniciar API de Go (Puerto 3000)
```bash
cd services/go-api
go run cmd/api/main.go
```

---

## 📬 Colección de Postman

Dentro de la carpeta [`postman/`](./postman/) encontrarás el archivo listo para importar en Postman:
* **Archivo:** `postman/Interseguro_Challenge.postman_collection.json`

### Endpoints Principales:

| Método | Endpoint | Servicio | Descripción |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/matrix/process` | Go (:3000) | **Endpoint principal:** Recibe cualquier matriz, calcula QR, llama a Node y devuelve estadísticas |
| `POST` | `/api/v1/matrix/process/:id` | Go (:3000) | Procesa una matriz guardada en BD por su UUID |
| `GET` | `/api/v1/matrix/history` | Go (:3000) | Consulta el historial de matrices procesadas desde PostgreSQL |
| `GET` | `/api/v1/matrices` | Go (:3000) | Lista el catálogo de matrices guardadas |
| `POST` | `/api/v1/matrix/analyze` | Node (:4000) | Endpoint directo de Node.js para cómputo de estadísticas |
| `POST` | `/api/v1/auth/login` | Go (:3000) | Generación de Bearer Token JWT |
| `GET` | `/health` | Ambos | Verificación de estado de salud |

---

## 🧪 Ejemplo de Payload y Respuesta

### Petición a Go (`POST http://localhost:3000/api/v1/matrix/process`):
```json
{
  "matrix": [
    [12, -51, 4],
    [6, 167, -68],
    [-4, 24, -41]
  ]
}
```

### Respuesta Consolidada:
```json
{
  "status": "success",
  "message": "Factorización QR y análisis estadístico calculados exitosamente",
  "data": {
    "original_matrix": [
      [12, -51, 4],
      [6, 167, -68],
      [-4, 24, -41]
    ],
    "dimensions": {
      "rows": 3,
      "cols": 3
    },
    "q": [
      [0.857143, -0.394286, 0.331429],
      [0.428571, 0.902857, -0.034286],
      [-0.285714, 0.171429, 0.942857]
    ],
    "r": [
      [14, 21, -14],
      [0, 175, -70],
      [0, 0, -35]
    ],
    "analysis": {
      "stats": {
        "max": 175,
        "min": -70,
        "average": 5.908333,
        "sum": 106.35,
        "total_elements": 18
      },
      "diagonal_check": {
        "is_q_diagonal": false,
        "is_r_diagonal": false,
        "is_any_diagonal": false
      }
    },
    "execution_time_ms": 0.45
  }
}
```

---

## 📂 Estructura del Repositorio

```text
pruebaGoNode/
├── services/
│   ├── go-api/                     # Microservicio Go (Fiber)
│   │   ├── cmd/api/main.go         # Bootstrap & Wireup
│   │   ├── internal/
│   │   │   ├── matrix_processing/  # Feature: Factorización QR & Orquestación
│   │   │   ├── matrix_catalog/     # Feature: Catálogo de matrices en BD
│   │   │   ├── auth/               # Feature: JWT & Usuarios
│   │   │   └── shared/             # Config, DB pool, respuestas JSON
│   │   ├── db/migrations/          # Scripts SQL de esquema
│   │   └── Dockerfile              # Multi-stage build
│   │
│   └── node-api/                   # Microservicio Node.js (Express)
│       ├── src/
│       │   ├── modules/
│       │   │   ├── matrix-analytics/ # Feature: Max, Min, Avg, Sum, Diag
│       │   │   └── health/           # Feature: Health check
│       │   └── shared/               # Config env, middleware de errores
│       └── Dockerfile
│
├── postman/
│   └── Interseguro_Challenge.postman_collection.json
├── docker-compose.yml
├── .gitignore
└── README.md
```
