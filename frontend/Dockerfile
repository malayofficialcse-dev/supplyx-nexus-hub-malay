FROM node:22-alpine AS builder

WORKDIR /app

# Build the TanStack Start server for a self-hosted Node container.
ENV NITRO_PRESET=node-server

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build \
    && test -f .output/server/index.mjs \
    && test -d .output/public


FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production
ENV NITRO_PRESET=node-server
ENV HOST=0.0.0.0
ENV PORT=3000

# Nitro's server bundle contains the required runtime dependencies.
COPY --from=builder /app/.output ./.output

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
