FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript from a clean output directory. The clean build is important
# because dist is intentionally excluded from the Docker build context.
RUN rm -rf dist \
    && npm run build \
    && test -f dist/controllers/threeWayMatch.controller.js \
    && test -f dist/services/threeWayMatch.service.js



FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --omit=dev

# Copy compiled application
COPY --from=builder /app/dist ./dist

# Copy Prisma schema
COPY --from=builder /app/prisma ./prisma

# Copy generated Prisma client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy Prisma client package
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Application port. PORT is set above so the process listens on this port too.
EXPOSE 5000

# Start server
CMD ["node", "dist/server.js"]
