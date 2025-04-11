# Configuração Docker para o OnSell

Este documento explica como configurar e utilizar o ambiente Docker para desenvolvimento e produção do OnSell.

## Requisitos

- Docker e Docker Compose instalados
- Git
- Make (opcional, para facilitar o uso dos comandos)

## Estrutura de Arquivos

A configuração Docker do projeto segue uma estrutura organizada:

- `Dockerfile` - Instruções para construir a imagem principal na raiz
- `docker-compose.local.yml` - Configuração para ambiente local
- `docker-compose.dev.yml` - Configuração para ambiente de desenvolvimento com Ngrok
- `docker-compose.prod.yml` - Configuração para ambiente de produção
- `conf/nginx/site.conf` - Configuração do Nginx
- `scripts/` - Scripts de inicialização e configuração
- `.dockerignore` - Lista de arquivos e diretórios a serem ignorados ao construir a imagem

## Ambientes Disponíveis

### 1. Ambiente Local

Ambiente básico para desenvolvimento local com volumes montados para alterações em tempo real.

```bash
make local
```

### 2. Ambiente de Desenvolvimento com Ngrok

Ambiente com Ngrok para testes de webhook e exposição da aplicação.

```bash
make dev
make ngrok-url  # Para obter a URL pública
```

### 3. Ambiente de Produção

Ambiente otimizado para produção.

```bash
make prod
```

## Configuração Inicial

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/onsell.git
   cd onsell
   ```

2. Configure o ambiente:
   ```bash
   make setup
   ```

## Comandos Comuns

### Gerenciar Ambientes

```bash
# Iniciar ambientes
make local
make dev
make prod

# Parar ambientes
make down-local
make down-dev
make down-prod
make down-all  # Parar todos os ambientes

# Reiniciar ambientes
make restart-local
make restart-dev
make restart-prod
```

### Visualizar Logs

```bash
make logs-local
make logs-dev
make logs-prod
```

### Acessar o Shell

```bash
make shell  # Acessa o shell do container do ambiente local
```

### Comandos do Laravel

```bash
# Executar comandos Artisan
make artisan migrate
make artisan config:cache
make artisan route:list

# Gerenciar banco de dados
make migrate
make fresh
make seed

# Executar testes
make test
```

### Comandos do Composer

```bash
make composer install
make composer update
make composer require pacote/nome
```

## Testes de Webhook com Ngrok

1. Inicie o ambiente de desenvolvimento:
   ```bash
   make dev
   ```

2. Obtenha a URL pública do Ngrok:
   ```bash
   make ngrok-url
   ```

3. Configure os serviços externos para enviar webhooks para:
   - Resend: `https://sua-url-ngrok.io/api/webhooks/resend`
   - Cloudflare R2: `https://sua-url-ngrok.io/api/webhooks/r2`

4. Visualize os webhooks recebidos em `https://sua-url-ngrok.io/webhook-test`

## Solução de Problemas

### Permissões de Arquivo

Se encontrar problemas de permissão:

```bash
docker-compose -f docker-compose.local.yml exec app chmod -R 775 storage bootstrap/cache
docker-compose -f docker-compose.local.yml exec app chown -R www-data:www-data storage bootstrap/cache
```

### Reconstrução de Containers

Após alterações significativas nos Dockerfiles:

```bash
docker-compose -f docker-compose.local.yml down
docker-compose -f docker-compose.local.yml build --no-cache
docker-compose -f docker-compose.local.yml up -d
```

### Limpeza de Cache e Configurações

```bash
make artisan optimize:clear
``` 