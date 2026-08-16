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

# Build TypeScript
RUN npm run build



FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

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

# Application port
EXPOSE 5000

# Start server
CMD ["node", "dist/server.js"]