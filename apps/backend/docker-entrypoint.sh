#!/bin/sh
set -e

echo "⏳ Waiting for PostgreSQL..."
RETRIES=30
until nc -z -w 2 postgres 5432 2>/dev/null; do
  RETRIES=$((RETRIES - 1))
  if [ $RETRIES -le 0 ]; then
    echo "❌ Could not connect to PostgreSQL after 30 attempts"
    exit 1
  fi
  echo "  Retrying... ($RETRIES attempts left)"
  sleep 2
done
echo "✅ PostgreSQL is ready"

echo "🔄 Running migrations..."
npx prisma migrate deploy

echo "🚀 Starting backend..."
node dist/main.js
