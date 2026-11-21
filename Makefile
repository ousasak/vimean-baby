.PHONY: help dev dev-all dev-api dev-admin dev-storefront dev-mobile api admin storefront mobile setup install db-migrate db-seed docker-up docker-down docker-logs

help:
	@echo "Available shortcut commands:"
	@echo "  make dev             - Run API & Admin concurrently"
	@echo "  make dev-all         - Run API, Admin, & Storefront"
	@echo "  make dev-api         - Run Spring Boot API (port 8080)"
	@echo "  make dev-admin       - Run Admin Web / POS (port 3001)"
	@echo "  make dev-storefront  - Run Customer Storefront Web (port 3000)"
	@echo "  make dev-mobile      - Run Flutter Mobile POS"
	@echo "  make setup           - Setup dependencies & API environment"
	@echo "  make install         - Install frontend dependencies"
	@echo "  make db-migrate      - Run Database Migrations"
	@echo "  make db-seed         - Seed Database"
	@echo "  make docker-up       - Start Docker Containers"
	@echo "  make docker-down     - Stop Docker Containers"
	@echo "  make docker-logs     - Tail Docker Container Logs"

dev:
	npm run dev

dev-all:
	npm run dev:all

dev-api:
	npm run dev:api

api:
	npm run dev:api

dev-admin:
	npm run dev:admin

admin:
	npm run dev:admin

dev-storefront:
	npm run dev:storefront

storefront:
	npm run dev:storefront

dev-mobile:
	npm run dev:mobile

mobile:
	npm run dev:mobile

setup:
	npm run setup

install:
	npm run install

db-migrate:
	npm run db:migrate

db-seed:
	npm run db:seed

docker-up:
	docker compose up -d

docker-down:
	docker compose down

docker-logs:
	docker compose logs -f
