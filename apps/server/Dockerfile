# Etapa base
FROM oven/bun:1.1.4 as base

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar archivos del monorepo al contenedor
COPY ../../pnpm-workspace.yaml ./
COPY ../../package.json ./
COPY ../../pnpm-lock.yaml ./
COPY ../../apps/server ./apps/server
COPY ../../packages ./packages

# Instalar pnpm
RUN bun add -g pnpm

# Instalar dependencias del workspace
RUN pnpm install --frozen-lockfile

# Entrar al server
WORKDIR /app/apps/server

# (opcional) build si tu app lo necesita
# RUN bun run build

# Puerto expuesto (opcional si usás Docker standalone)
EXPOSE 3000

# Comando de inicio
CMD ["bun", "run", "src/index.ts"]
