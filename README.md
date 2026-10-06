# Reto Técnico Interseguro - Factorización QR & Analítica Distribuida

Solución de arquitectura orientada a microservicios distribuidos para el procesamiento y análisis estadístico de matrices rectangulares utilizando **Go (Fiber)**, **Node.js (Express)**, **React (Vite + Tailwind CSS)**, **PostgreSQL (Neon Cloud)** y **Docker**.

---

## 🏛️ Arquitectura del Sistema (Hexagonal + Vertical Slices)

El proyecto implementa el patrón **Hexagonal Architecture + Vertical Slices (Screaming Architecture)** con separación estricta de responsabilidades:

```mermaid
flowchart TD
    Cliente["👤 Usuario (Frontend React / Postman)"] -->|"1. POST /api/v1/matrix/process"| GoAPI["🚀 API 1: Go (Fiber) :3000\n(API Gateway, Cómputo QR, Auth y Persistencia)"]
    
    subgraph S1 ["Microservicio 1: Go (Fiber)"]
        GoAPI <-->|"Auto-Migración Idempotente y Auditoría"| DB[("🗄️ PostgreSQL (Neon)\nmatrix_challenge_db")]
    end
    
    subgraph S2 ["Microservicio 2: Node.js (Express)"]
        NodeAPI["⚡ API 2: Node.js (Express) :4000\n(Stateless Analytics Engine - Sin BD)"]
    end
    
    GoAPI -->|"2. POST /api/v1/matrix/analyze (Payload: Q y R)"| NodeAPI
    NodeAPI -->|"3. Retorna JSON de Estadísticas"| GoAPI
    GoAPI -->|"4. Respuesta Consolidada Final y Auditoría"| Cliente
```

### 🎯 Responsabilidades por Microservicio:

1. **Frontend (React 18 + Vite + Tailwind CSS + Lucide) [Puerto 5173 / 8080]**:
   * **Bloque 1 (Auth Wall):** Pantalla obligatoria de inicio de sesión con JWT (`evaluador_interseguro` / `interseguro2026`).
   * **Bloque 2 (Matrix Input Panel):** Cuadrícula dinámica interactiva ($m \times n$), editor JSON y dropdown con matrices del catálogo de la BD.
   * **Bloque 3 (Visualizador de Matrices):** Renderizado de Matriz Original $A$, Matriz Ortogonal $Q$ y Matriz Triangular Superior $R$.
   * **Bloque 4 (Tarjetas de Analítica):** Máximo, Mínimo, Promedio, Suma, Badge de Matriz Diagonal y Pestaña de Auditoría en tiempo real.

2. **API 1: Go (Fiber) [Puerto 3000]**:
   * **Cómputo en Memoria:** Factorización QR ($M = Q \times R$) mediante Gram-Schmidt Modificado (MGS) con tolerancia $\epsilon = 10^{-9}$ para matrices $m \ge n$.
   * **API Gateway & Orquestación:** Llama a Node.js por HTTP y consolida la respuesta final.
   * **Persistencia & Auditoría:** Único servicio conectado a PostgreSQL. Guarda en `matrix_operations` y `matrix_analytics` quién ejecutó la operación (`user_id`, `username`, fecha y tiempo de ejecución).
   * **Auto-Migración Idempotente:** En el arranque verifica y crea tablas e índices solo si no existen (`IF NOT EXISTS` / `ON CONFLICT DO NOTHING`).

3. **API 2: Node.js (Express con `pnpm`) [Puerto 4000]**:
   * **100% Stateless:** No requiere base de datos ni credenciales.
   * Calcula en memoria: Valor Máximo, Valor Mínimo, Promedio, Suma Total y Verificación de Matriz Diagonal ($\epsilon = 10^{-6}$).

---

## 🚀 Cómo Ejecutar el Proyecto Localmente

### 1. Iniciar Microservicio Go (Puerto 3000)
```powershell
cd services/go-api
.\dev.ps1
```
*(O con `go run cmd/api/main.go`)*.

### 2. Iniciar Microservicio Node.js (Puerto 4000)
```powershell
cd services/node-api
pnpm run dev
```

### 3. Iniciar Frontend React (Puerto 5173)
```powershell
cd services/frontend
pnpm run dev
```

---

## 🐳 Despliegue con Docker (Contenedores Individuales)

Cada microservicio cuenta con su propio `Dockerfile` independiente y optimizado:

```bash
# 1. Crear red interna de Docker
docker network create interseguro-network

# 2. Node.js API (:4000)
cd services/node-api
docker build -t interseguro-node-api .
docker run -d --name node-api --network interseguro-network -p 4000:4000 interseguro-node-api

# 3. Go API (:3000)
cd ../go-api
docker build -t interseguro-go-api .
docker run -d --name go-api --network interseguro-network -p 3000:3000 \
  -e PORT=3000 \
  -e DATABASE_URL="postgresql://neondb_owner:npg_IACVv2Be4zSg@ep-cool-band-b506sy3m-pooler.c-7.us-east-2.aws.neon.tech/matrix_challenge_db?sslmode=require" \
  -e NODE_API_URL="http://node-api:4000" \
  -e JWT_SECRET="interseguro_challenge_secure_jwt_secret_key_2026" \
  interseguro-go-api

# 4. Frontend React (:8080)
cd ../frontend
docker build -t interseguro-frontend .
docker run -d --name frontend --network interseguro-network -p 8080:80 interseguro-frontend
```

---

## 📬 Colección de Postman

Importa el archivo [`postman/Interseguro_Challenge.postman_collection.json`](./postman/Interseguro_Challenge.postman_collection.json) directamente en Postman:

| Método | Endpoint | Servicio | Descripción |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/matrix/process` | Go (:3000) | **Principal:** Recibe la matriz en JSON, calcula QR, llama a Node y devuelve estadísticas |
| `POST` | `/api/v1/matrix/process/:id`| Go (:3000) | Procesa una matriz guardada en BD por su UUID |
| `GET`  | `/api/v1/matrix/history` | Go (:3000) | Consulta el historial de auditoría desde PostgreSQL |
| `GET`  | `/api/v1/matrices`       | Go (:3000) | Lista las matrices del catálogo en BD |
| `POST` | `/api/v1/matrix/analyze` | Node (:4000) | Endpoint directo de Node.js para cálculo estadístico |
| `POST` | `/api/v1/auth/login`     | Go (:3000) | Autenticación y generación de Bearer Token JWT |
| `POST` | `/api/v1/auth/register`  | Go (:3000) | Registro dinámico de usuarios en la tabla `users` |

---

## 📂 Estructura del Repositorio

```text
pruebaGoNode/
├── 00-SPECS/                       # Especificaciones técnicas SDD y contratos
│   ├── 01-matrix-challenge-spec.md
│   └── 02-implementation-changelog.md
├── 01-TOOLS/                       # Herramientas y scripts de prueba
│   └── test-matrix-pipeline/
├── 02-DOCS/                        # Documentación wiki y decisiones (ADRs)
│   └── wiki/
│       ├── architecture.md
│       └── sdd/constitution.md
├── postman/                        # Colección de Postman lista para importar
│   └── Interseguro_Challenge.postman_collection.json
├── services/
│   ├── go-api/                     # Microservicio Go (Fiber)
│   │   ├── cmd/api/main.go         # Bootstrap
│   │   ├── internal/
│   │   │   ├── matrix_processing/  # Factorización QR & Orquestación
│   │   │   ├── matrix_catalog/     # Catálogo de matrices en BD
│   │   │   ├── auth/               # JWT & Usuarios
│   │   │   └── shared/             # Config, DB pool con AutoMigrate
│   │   ├── db/migrations/          # Script DDL SQL idempotente
│   │   ├── Dockerfile              # Multi-stage Alpine
│   │   └── dev.ps1                 # Script de inicio rápido
│   │
│   ├── node-api/                   # Microservicio Node.js (Express con pnpm)
│   │   ├── src/
│   │   │   ├── modules/matrix-analytics/ # Max, Min, Promedio, Suma, Diagonal
│   │   │   └── shared/             # Config env y middleware de errores
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── frontend/                   # Frontend React + Vite + Tailwind (pnpm)
│       ├── src/
│       │   ├── components/         # Navbar, LoginScreen, MatrixInput, Visualizer, Analytics
│       │   └── App.jsx
│       └── Dockerfile              # Nginx alpine
└── README.md
```
