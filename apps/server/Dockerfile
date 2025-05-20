# Build stage
FROM oven/bun:1 AS builder

WORKDIR /app

# Copy package files first for better caching
COPY ../../pnpm-lock.yaml ./pnpm-lock.yaml
COPY package.json ./
RUN pnpm install --frozen-lockfile

# Copy rest of the files
COPY . ./

# Build the binary
RUN pnpm build

# Final stage
FROM debian:bookworm-slim

WORKDIR /app

# Copy only the compiled binary
COPY --from=builder /app/server ./server

# Run the binary
CMD ["./server"]%