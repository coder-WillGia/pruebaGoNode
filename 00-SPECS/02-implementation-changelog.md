# SDD Implementation Changelog: Reto Interseguro

## Resumen de Cambios y Decisiones Técnicas Implementadas

### 1. Arquitectura Hexagonal y Vertical Slices (Screaming Architecture)
- **Go API (`services/go-api`)**:
  - `matrix_processing/`: Algoritmo de Factorización QR con Gram-Schmidt Modificado (MGS) con tolerancia $\epsilon = 10^{-9}$ para matrices cuadradas y rectangulares ($m \ge n$).
  - `matrix_catalog/`: Consulta y almacenamiento de matrices en PostgreSQL (`matrix_inputs`).
  - `auth/`: Seguridad con Bearer JWT, encriptación bcrypt en tabla `users` y middleware de autenticación.
  - `shared/database/`: Auto-migración 100% idempotente (`CREATE TABLE IF NOT EXISTS`, `ON CONFLICT DO NOTHING`).
- **Node.js API (`services/node-api`)**:
  - 100% Stateless: No posee credenciales ni acceso a base de datos.
  - `matrix-analytics/`: Cómputo puro en memoria de Máximo, Mínimo, Promedio, Suma total y Verificación de Matriz Diagonal ($\epsilon = 10^{-6}$).

### 2. Frontend en React 18 + Vite + Tailwind CSS + Lucide
- **Gestor de Paquetes**: Migrado a `pnpm`.
- **4 Bloques de Interfaz**:
  1. *Barra Superior & Auth Wall*: Pantalla de Login obligatoria antes de ingresar.
  2. *Matrix Input Panel*: Cuadrícula interactiva $m \times n$, plantillas de evaluación y dropdown con catálogo de la BD.
  3. *Visualizador de Matrices*: Renderizado de Matrices $A, Q, R$ con tiempo de cómputo (`execution_time_ms`).
  4. *Tarjetas de Analítica & Auditoría*: Métricas calculadas por Node.js y tabla de historial con `user_id` de PostgreSQL.

### 3. Base de Datos & Persistencia (Neon PostgreSQL)
- Base de datos única: `matrix_challenge_db`.
- Tablas: `users`, `matrix_inputs`, `matrix_operations`, `matrix_analytics`.
- Auditoría: Toda operación registra el `user_id` y `username` del evaluador que la ejecutó.

### 4. Scripts y DevOps
- `services/go-api/dev.ps1`: Script corto de inicio rápido en PowerShell.
- **Dockerfiles Multi-Stage Optimizados**:
  - `services/go-api/Dockerfile`: Etapa 1 compilador Go con `-ldflags="-w -s"` + Etapa 2 runtime ultra ligero Alpine con usuario no-root `appuser`.
  - `services/node-api/Dockerfile`: Etapa 1 `pnpm install --prod` + Etapa 2 runtime Node.js Alpine 100% libre de herramientas de compilación con usuario `node`.
  - `services/frontend/Dockerfile`: Etapa 1 `pnpm build` + Etapa 2 Nginx Alpine sirviendo los estáticos optimizados.
- `.env` encapsulados dentro de cada microservicio sin variables quemadas en el código:
  - Validación 100% estricta en los tres microservicios (Go, Node.js y Frontend). Se lanzan errores tempranos si falta alguna variable.
  - Eliminado el paquete residual obsoleto `internal/middleware/auth.go` en Go para asegurar que toda la autenticación use exclusivamente el secreto del `.env` inyectado a través de `internal/auth/http_handler.go`.


