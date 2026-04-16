# ============================================
# EventHub - Next.js Application Dockerfile
# ============================================
# Multi-stage build
# Supports: npm (package-lock.json) or bun (bun.lock)
# Standalone output mode for minimal image size
# PostgreSQL via Prisma ORM
# ============================================

# ---------- Stage 1: Dependencies ----------
FROM node:20-slim AS deps

WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json* bun.lock* ./

# Install dependencies (pick whichever lockfile exists)
RUN if [ -f bun.lock ]; then \
      npm install --legacy-peer-deps; \
    elif [ -f package-lock.json ]; then \
      npm ci --legacy-peer-deps; \
    else \
      npm install --legacy-peer-deps; \
    fi

# ---------- Stage 2: Build ----------
FROM node:20-slim AS builder

WORKDIR /app

# Install OpenSSL for PostgreSQL client (required by pg)
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

# Copy dependencies from stage 1
COPY --from=deps /app/node_modules ./node_modules

# Copy all source files
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js application (standalone output)
RUN npm run build

# ---------- Stage 3: Production ----------
FROM node:20-slim AS runner

WORKDIR /app

# Install runtime dependencies for PostgreSQL (libpq)
RUN apt-get update && \
    apt-get install -y --no-install-recommends openssl libssl3 ca-certificates wget && \
    rm -rf /var/lib/apt/lists/*

# Set production environment
ENV NODE_ENV=production

# Create non-root user for security
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs nextjs

# Copy standalone output from builder
COPY --from=builder /app/.next/standalone ./

# Copy static assets and public directory
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy Prisma schema for migrations
COPY --from=builder /app/prisma ./prisma

# Copy entrypoint script
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Change ownership to non-root user
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port 3000
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Use entrypoint to run migrations before starting
ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", ".next/standalone/server.js"]
