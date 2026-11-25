# Multi-stage Dockerfile for MediVault (Non-root user security - OWASP Container Best Practices)
FROM node:24-alpine AS base

# Install security updates
RUN apk update && apk upgrade && rm -rf /var/cache/apk/*

WORKDIR /app

# Step 1: Dependencies
FROM base AS dependencies
COPY backend/package*.json ./backend/
COPY package*.json ./
RUN cd backend && npm ci --only=production
RUN npm ci

# Step 2: Build Frontend
FROM dependencies AS builder
COPY . .
RUN npm run build

# Step 3: Production Runner with Non-Root User
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=5000

WORKDIR /app

# Copy production node_modules and built frontend
COPY --from=dependencies /app/backend/node_modules ./backend/node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/backend ./backend

# Create data directory with permissions for non-root 'node' user
RUN mkdir -p /app/backend/data && chown -R node:node /app

# Switch to unprivileged user (Defense in depth / Least privilege)
USER node

EXPOSE 5000

CMD ["node", "backend/src/server.js"]
