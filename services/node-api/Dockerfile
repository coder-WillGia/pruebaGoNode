# --- ETAPA 1: Descarga e Instalacion de Dependencias con pnpm ---
FROM node:22-alpine AS dependencies

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./

# Instalacion estricta solo de dependencias de produccion
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

# --- ETAPA 2: Runtime de Produccion (Sin pnpm ni herramientas de build) ---
FROM node:22-alpine

WORKDIR /app

# Copiar unicamete las dependencias de produccion desde la etapa 1
COPY --from=dependencies /app/node_modules ./node_modules
COPY package.json ./
COPY src/ ./src/

# Ejecutar con el usuario seguro 'node' de Alpine
USER node

EXPOSE 4000

CMD ["node", "src/server.js"]
