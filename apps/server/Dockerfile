FROM oven/bun:1 AS builder

WORKDIR /app

COPY pnpm-lock.yaml ./
COPY package.json ./
COPY apps/server/package.json ./apps/server/
COPY apps/server/tsconfig.json ./apps/server/
COPY apps/server/src ./apps/server/src
COPY apps/server/prisma ./apps/server/prisma
COPY apps/server/generated ./apps/server/generated

RUN cd apps/server && bun install --frozen-lockfile
RUN cd apps/server && bun build ./src/index.ts --compile --outfile server

FROM debian:bookworm-slim

WORKDIR /app

COPY --from=builder /app/apps/server/server ./server
COPY --from=builder /app/apps/server/generated ./generated
COPY --from=builder /app/apps/server/prisma ./prisma

CMD ["./server"]%  