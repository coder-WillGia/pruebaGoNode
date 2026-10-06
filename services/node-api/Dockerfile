FROM node:22-alpine

WORKDIR /app

# Instalar y habilitar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile --prod

COPY . .

EXPOSE 4000

USER node

CMD ["node", "src/server.js"]
