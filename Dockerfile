# ============================================================
# Build stage
# ============================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Copy packages/schemas
COPY packages/schemas/ ./packages/schemas/

# Copy backend
COPY backend/ ./backend/

# Install root dependencies (creates symlink for @spec-app/schemas)
RUN npm install

# Build schemas first
RUN cd packages/schemas && npm install && npm run build

# Build backend
RUN cd backend && npm install && npm run build

# ============================================================
# Production stage
# ============================================================
FROM node:22-alpine AS production

WORKDIR /app

# Copy root package files for workspace resolution
COPY package*.json ./

# Copy built schemas
COPY --from=builder /app/packages/schemas/dist ./packages/schemas/dist
COPY packages/schemas/package.json ./packages/schemas/package.json

# Copy backend production deps + built files
COPY --from=builder /app/backend/node_modules ./backend/node_modules
COPY --from=builder /app/backend/dist ./backend/dist
COPY backend/package.json ./backend/package.json

# Install root deps for symlink resolution only
RUN npm install --ignore-scripts

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001
USER nestjs

WORKDIR /app/backend

EXPOSE 8000

CMD ["node", "dist/main.js"]