# Build Stage con pnpm y Node
FROM node:22-alpine AS build

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

# Argumento para la URL del backend en tiempo de build
ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL

RUN pnpm build

# Production Stage con Nginx
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
