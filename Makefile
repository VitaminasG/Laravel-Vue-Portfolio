.PHONY: help setup generate-certs update-ssl hosts up down restart rebuild logs \
        composer-install key-generate migrate migrate-fresh seed \
        php-shell node-shell db-shell node-install node-dev node-build node-e2e node-clean-hot permissions \
        lint lint-fix lint-js lint-js-fix lint-php lint-php-fix lint-install

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
	@echo "  make node-dev             Vite dev server with HMR (frontend work)"
	@echo "  make node-build           Production build into public/build/"
	@echo "  make node-e2e             Playwright specs against the running site"
	@echo "  make node-clean-hot       Drop a stale public/hot after an interrupted dev server"
	@echo ""
	@echo "Code style:"
	@echo "  make lint                 Check JS/Vue (ESLint) and PHP (PSR-12)"
	@echo "  make lint-fix             Auto-fix what the linters can fix"
	@echo "  make lint-install         Fetch the PHP_CodeSniffer PHARs (once per clone)"
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

node-dev:
	docker exec -it $(DOCKER_CONTAINER_PREFIX)-node npm run dev

node-build: node-clean-hot
	docker exec -i $(DOCKER_CONTAINER_PREFIX)-node npm run build

node-e2e: node-clean-hot
	docker exec -i $(DOCKER_CONTAINER_PREFIX)-node npm run test:e2e

# `npm run dev` writes public/hot, and Laravel serves dev-server URLs while it
# exists. A graceful shutdown removes it; anything abrupt does not, and the
# site then points every asset at a server that is no longer listening.
node-clean-hot:
	@rm -f public/hot

# --- Code style ---
# JS/Vue via ESLint (2-space, Vue style guide); PHP via PHP_CodeSniffer (PSR-12,
# 4-space). The PHP tools are PHARs under .docker/bin because Packagist dropped
# Composer 1 support, so `composer require` is no longer an option here.
lint: lint-js lint-php

lint-fix: lint-js-fix lint-php-fix

lint-js:
	docker exec -i $(DOCKER_CONTAINER_PREFIX)-node npm run lint

lint-js-fix:
	docker exec -i $(DOCKER_CONTAINER_PREFIX)-node npm run lint:fix

lint-php:
	docker exec -i $(DOCKER_CONTAINER_PREFIX)-php php .docker/bin/phpcs.phar

lint-php-fix:
	docker exec -i $(DOCKER_CONTAINER_PREFIX)-php php .docker/bin/phpcbf.phar

# Fetches the PHP_CodeSniffer PHARs; they are gitignored, so a fresh clone runs
# this once before `make lint`.
lint-install:
	@mkdir -p .docker/bin
	docker exec -i $(DOCKER_CONTAINER_PREFIX)-php sh -c 'curl -sSL -o .docker/bin/phpcs.phar https://github.com/squizlabs/PHP_CodeSniffer/releases/download/3.7.2/phpcs.phar'
	docker exec -i $(DOCKER_CONTAINER_PREFIX)-php sh -c 'curl -sSL -o .docker/bin/phpcbf.phar https://github.com/squizlabs/PHP_CodeSniffer/releases/download/3.7.2/phpcbf.phar'
	@echo "PHP_CodeSniffer 3.7.2 installed into .docker/bin"

# --- Shells ---
php-shell:
	docker exec -it $(DOCKER_CONTAINER_PREFIX)-php bash

node-shell:
	docker exec -it $(DOCKER_CONTAINER_PREFIX)-node bash

db-shell:
	docker exec -it $(DOCKER_CONTAINER_PREFIX)-mariadb mysql -uroot -p$(DB_PASSWORD) portfolio