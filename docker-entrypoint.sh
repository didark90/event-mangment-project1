#!/bin/sh
set -e

echo "🚀 Running database migrations..."
npx prisma db push --skip-generate 2>/dev/null || echo "⚠️  Prisma push skipped (may already be applied)"

echo "✅ Starting application..."
exec "$@"
