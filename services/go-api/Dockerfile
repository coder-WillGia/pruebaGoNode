FROM golang:alpine AS builder

WORKDIR /app

RUN apk add --no-cache git

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Compilacion estatica optimizada sin simbolos de depuracion (-ldflags="-w -s")
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /app/go-api ./cmd/api

# --- ETAPA 2: Runtime de Produccion Ultra Ligero (Alpine) ---
FROM alpine:3.20

WORKDIR /app

# Certificados para conexiones SSL/TLS seguras (ej. Neon PostgreSQL) y zona horaria
RUN apk add --no-cache ca-certificates tzdata \
    && adduser -D -u 1000 appuser

# Copiar unicamete el binario y plantilla de configuracion
COPY --from=builder /app/go-api /app/go-api
COPY .env.example /app/.env.example

# Ejecucion con usuario no-root por seguridad
USER appuser

EXPOSE 3000

CMD ["/app/go-api"]
