.PHONY: help setup generate-certs update-ssl hosts up down restart rebuild logs \
        composer-install key-generate migrate migrate-fresh seed \
        php-shell node-shell db-shell node-install node-watch node-prod permissions

include .env

# Main menu
help:
	@echo "Laravel-Vue-Portfolio — local Docker environment"
	@echo "================================================"
	@echo "First run (everything at once):"
	@echo "  make setup                Generate certs, bring up containers, install and migrate"
	@echo ""
	@echo "Certificates (SSL):"
	@echo "  make generate-certs       Generate an mkcert certificate for $(DOMAIN)"
	@echo "  make update-ssl           Write the certificate into .env (SSL_CERT/SSL_KEY)"
	@echo "  make hosts                Show the /etc/hosts entry to add"
	@echo ""
	@echo "Docker:"
	@echo "  make up                   Start containers (detached)"
	@echo "  make down                 Stop containers"
	@echo "  make restart              Restart containers"
	@echo "  make rebuild              Rebuild images and start (needed after changing the cert)"
	@echo "  make logs                 Tail nginx/php logs"
	@echo ""
	@echo "Laravel:"
	@echo "  make composer-install     composer install inside the PHP container"
	@echo "  make key-generate         Generate APP_KEY"
	@echo "  make migrate              Run migrations (seeds the admin user)"
	@echo "  make migrate-fresh        Drop the DB and migrate from scratch"
	@echo "  make permissions          Grant write access to storage/ and bootstrap/cache"
	@echo ""
	@echo "Node (asset compilation):"
	@echo "  make node-install         npm install"
	@echo "  make node-watch           npm run watch (recompile on change)"
	@echo "  make node-prod            npm run prod (production build)"
	@echo ""
	@echo "Shells:"
	@echo "  make php-shell / node-shell / db-shell"

# --- Full first-time setup ---
setup: generate-certs update-ssl rebuild composer-install key-generate permissions migrate
	@echo ""
	@echo "Ready! Add the /etc/hosts entry (make hosts) and open:"
	@echo "  https://$(DOMAIN):$(SSL_PORT)"

# --- Certificates ---
generate-certs:
	@chmod +x ./.docker/scripts/generate_certs.sh
	@./.docker/scripts/generate_certs.sh

update-ssl:
	@chmod +x ./.docker/scripts/update_ssl_env.sh
	@./.docker/scripts/update_ssl_env.sh

hosts:
	@echo "Add this line to /etc/hosts:"
	@echo "  127.0.0.1   $(DOMAIN)"
	@echo ""
	@echo "Command: echo '127.0.0.1   $(DOMAIN)' | sudo tee -a /etc/hosts"

# --- Docker ---
up:
	docker compose up -d

down:
	docker compose down

restart:
	docker compose restart

rebuild:
	docker compose up --build -d

logs:
	docker compose logs -f nginx php

# --- Laravel ---
composer-install:
	docker exec -i $(DOCKER_CONTAINER_PREFIX)-php composer install

key-generate:
	docker exec -i $(DOCKER_CONTAINER_PREFIX)-php php artisan key:generate

migrate:
	docker exec -i $(DOCKER_CONTAINER_PREFIX)-php php artisan migrate

migrate-fresh:
	docker exec -i $(DOCKER_CONTAINER_PREFIX)-php php artisan migrate:fresh

seed:
	docker exec -i $(DOCKER_CONTAINER_PREFIX)-php php artisan db:seed

permissions:
	docker exec -i $(DOCKER_CONTAINER_PREFIX)-php chmod -R 777 storage bootstrap/cache

# --- Node ---
node-install:
	docker exec -i $(DOCKER_CONTAINER_PREFIX)-node npm install

node-watch:
	docker exec -it $(DOCKER_CONTAINER_PREFIX)-node npm run watch

node-prod:
	docker exec -i $(DOCKER_CONTAINER_PREFIX)-node npm run prod

# --- Shells ---
php-shell:
	docker exec -it $(DOCKER_CONTAINER_PREFIX)-php bash

node-shell:
	docker exec -it $(DOCKER_CONTAINER_PREFIX)-node bash

db-shell:
	docker exec -it $(DOCKER_CONTAINER_PREFIX)-mariadb mysql -uroot -p$(DB_PASSWORD) portfolio