# Imagen base con Bun
FROM oven/bun:1.1.4

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos todo el contenido local de apps/server al contenedor
COPY . .

# Instala pnpm de forma global
RUN bun add -g pnpm

# Instala las dependencias usando pnpm
RUN pnpm install --frozen-lockfile

# Expone el puerto (Railway va a mapear su propio $PORT a este)
EXPOSE 3000

# Comando para iniciar la app
CMD ["bun", "run", "src/index.ts"]
