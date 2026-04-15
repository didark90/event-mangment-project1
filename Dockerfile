# Use Bun official image
FROM oven/bun:1.1.13

WORKDIR /app

# Copy only Bun files first (important for caching)
COPY bun.lockb package.json ./

# Install dependencies with Bun only
RUN bun install --frozen-lockfile

# Copy rest of the app
COPY . .

# Generate Prisma client
RUN bunx prisma generate

# Build Next.js app
RUN bun run build

# Expose port
EXPOSE 3000

# Start app (NO npm)
CMD ["bun", "run", "start"]
