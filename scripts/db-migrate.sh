#!/usr/bin/env bash
set -e

# Load DB environment variables safely from backend/.env if present
if [ -f backend/.env ]; then
  eval $(grep -E '^(DB_URL|DB_USERNAME|DB_PASSWORD)=' backend/.env)
fi

DB_URL="${DB_URL:-jdbc:postgresql://localhost:5433/vimeanbaby_db}"
DB_USERNAME="${DB_USERNAME:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-postgres123}"

echo "🚀 Running Flyway database migrations..."
echo "📍 Target: ${DB_URL} (User: ${DB_USERNAME})"

cd backend && ./mvnw flyway:migrate \
  -DDB_URL="${DB_URL}" \
  -DDB_USERNAME="${DB_USERNAME}" \
  -DDB_PASSWORD="${DB_PASSWORD}"

echo "✅ Migrations completed successfully!"
