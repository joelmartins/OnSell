.PHONY: setup local dev prod down restart logs shell composer artisan migrate fresh seed test chmod local-rebuild

# Permissões para scripts
chmod:
	chmod +x scripts/*.sh

# Configuração inicial
setup: chmod
	cp .env.example .env
	docker-compose -f docker-compose.local.yml up -d
	composer install
	php artisan key:generate
	php artisan migrate
	php artisan storage:link

# Iniciar ambiente local
local:
	docker-compose -f docker-compose.local.yml up -d

# Reconstruir e reiniciar o ambiente local (limpa caches)
local-rebuild:
	docker-compose -f docker-compose.local.yml down
	rm -rf bootstrap/cache/*
	rm -rf public/build
	rm -rf public/hot
	docker-compose -f docker-compose.local.yml up -d --build
	composer install
	npm install
	npm run build
	php artisan optimize:clear
	php artisan migrate:fresh --seed

# Iniciar ambiente de produção
prod:
	docker-compose -f docker-compose.prod.yml up -d

# Parar os containers (especificar qual ambiente)
down-local:
	docker-compose -f docker-compose.local.yml down

# Parar todos os ambientes
down-all:
	docker-compose -f docker-compose.local.yml down
	docker-compose -f docker-compose.prod.yml down

# Reiniciar os containers (especificar qual ambiente)
restart-local:
	docker-compose -f docker-compose.local.yml restart

# Ver logs
logs-local:
	docker-compose -f docker-compose.local.yml logs -f

logs-prod:
	docker-compose -f docker-compose.prod.yml logs -f

# Acessar o shell do container app (usar o ambiente local como padrão)
shell:
	bash

# Executar comandos composer
composer:
	composer $(filter-out $@,$(MAKECMDGOALS))

# Executar comandos artisan
artisan:
	php artisan $(filter-out $@,$(MAKECMDGOALS))

# Migrar o banco de dados
migrate:
	php artisan migrate

# Resetar o banco de dados
fresh:
	php artisan migrate:fresh

# Popular o banco de dados
seed:
	php artisan db:seed

# Executar testes
test:
	php artisan test

# Ver URL do Ngrok
ngrok-url:
	curl -s http://localhost:4040/api/tunnels | jq -r '.tunnels[0].public_url'

# Passar argumentos para comandos
%:
	@: 