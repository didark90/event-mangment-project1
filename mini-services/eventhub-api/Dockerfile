# ============================================
# EventHub API - Mini Service Dockerfile
# ============================================
# Express + PostgreSQL (pg) API service
# Supports: npm (package-lock.json) or bun (bun.lock)
# ============================================

# ---------- Stage 1: Dependencies ----------
FROM node:20-slim AS deps

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* bun.lock* ./

# Install dependencies (pick whichever lockfile exists)
RUN if [ -f bun.lock ]; then \
      npm install --legacy-peer-deps; \
    elif [ -f package-lock.json ]; then \
      npm ci --legacy-peer-deps; \
    else \
      npm install --legacy-peer-deps; \
    fi

# ---------- Stage 2: Production ----------
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
    useradd --system --uid 1001 --gid nodejs apiuser

# Copy dependencies from stage 1
COPY --from=deps /app/node_modules ./node_modules

# Copy source files
COPY . .

# Change ownership to non-root user
RUN chown -R apiuser:nodejs /app

# Switch to non-root user
USER apiuser

# Expose port 3005
EXPOSE 3005

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3005/ || exit 1

# Start the API server
CMD ["node", "index.ts"]
