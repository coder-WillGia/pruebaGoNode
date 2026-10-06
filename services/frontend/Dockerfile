# --- ETAPA 1: Construccion de la SPA (React + Vite con pnpm) ---
FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

# Variables de entorno inyectadas estrictamente sin valores por defecto quemados
ARG VITE_API_URL
ARG PORT
ENV VITE_API_URL=$VITE_API_URL
ENV PORT=$PORT

RUN pnpm build

# --- ETAPA 2: Servidor Web Nginx de Produccion Ultra Ligero ---
FROM nginx:alpine

WORKDIR /usr/share/nginx/html

# Limpiar archivos por defecto de nginx
RUN rm -rf ./*

# Copiar unicamete el bundle compilado
COPY --from=builder /app/dist ./

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
