# Build stage
FROM oven/bun:1 AS builder

WORKDIR /app

COPY package.json ./
RUN bun install 

COPY . ./
RUN bun build src/index.ts --compile --outfile server

# Final stage
FROM debian:bookworm-slim

WORKDIR /app

COPY --from=builder /app/server ./server

CMD ["./server"]