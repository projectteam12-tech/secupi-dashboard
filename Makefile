.PHONY: help build up down restart logs test lint format migrate seed clean

help:
	@echo "Available commands:"
	@echo "  make build      - Build Docker images"
	@echo "  make up         - Start all services"
	@echo "  make down       - Stop all services"
	@echo "  make restart    - Restart all services"
	@echo "  make logs       - View logs"
	@echo "  make test       - Run tests"
	@echo "  make lint       - Run linters"
	@echo "  make format     - Format code"
	@echo "  make migrate    - Run database migrations"
	@echo "  make seed       - Seed demo data"
	@echo "  make clean      - Clean up containers and volumes"

build:
	docker-compose build

up:
	docker-compose up -d

down:
	docker-compose down

restart:
	docker-compose restart

logs:
	docker-compose logs -f

test:
	docker-compose exec backend pytest
	docker-compose exec frontend npm test || true

lint:
	docker-compose exec backend flake8 .
	docker-compose exec frontend npm run lint

format:
	docker-compose exec backend black .
	docker-compose exec frontend npm run format

migrate:
	docker-compose exec backend python manage.py migrate

seed:
	docker-compose exec backend python scripts/seed_demo.py

clean:
	docker-compose down -v
	docker system prune -f



