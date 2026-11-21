#!/usr/bin/env bash
set -e

echo "🚀 Setting up Vimean Baby development environment..."

# 1. Backend environment
if [ ! -f backend/.env ]; then
  if [ -f backend/.env.example ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env from .env.example"
  fi
fi

# 2. Admin Frontend environment
if [ ! -f admin-frontend/.env ]; then
  echo "VITE_API_BASE=http://localhost:8080/api" > admin-frontend/.env
  echo "VITE_STORE_URL=http://localhost:3000" >> admin-frontend/.env
  echo "✅ Created admin-frontend/.env"
fi

# 3. User Frontend environment
if [ ! -f user-frontend/.env ]; then
  echo "VITE_API_BASE=http://localhost:8080/api" > user-frontend/.env
  echo "VITE_ADMIN_URL=http://localhost:3001" >> user-frontend/.env
  echo "✅ Created user-frontend/.env"
fi

# 4. Make maven wrapper executable
if [ -f backend/mvnw ]; then
  chmod +x backend/mvnw
  echo "✅ Made backend/mvnw executable"
fi

# 5. Install frontend dependencies
echo "📦 Installing admin-frontend dependencies..."
(cd admin-frontend && npm install)

echo "📦 Installing user-frontend dependencies..."
(cd user-frontend && npm install)

echo "🎉 Setup complete! You can now run:"
echo "   make docker-up   # Start Postgres"
echo "   make dev         # Run API and Admin"
echo "   make dev-all     # Run API, Admin, and Storefront"
