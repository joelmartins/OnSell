# Ambiente de Desenvolvimento Local - OnSell

Este guia contém instruções para configurar e executar o ambiente de desenvolvimento local do OnSell.

## Requisitos

- PHP 8.3+
- Composer 2.x
- Node.js 18+
- npm 9+
- Docker e Docker Compose
- Git

## Configuração Inicial

1. Clone o repositório:

```bash
git clone https://github.com/seuusuario/onsell.git
cd onsell
```

2. Instale as dependências do PHP:

```bash
composer install
```

3. Instale as dependências do JavaScript:

```bash
npm install
```

4. Copie o arquivo de ambiente e configure-o:

```bash
cp .env.example .env
```

5. Gere a chave da aplicação:

```bash
php artisan key:generate
```

## Configuração do Docker

O projeto inclui um arquivo `docker-compose.yml` para facilitar a execução dos serviços necessários:

- PostgreSQL (banco de dados principal)
- Redis (cache e filas)
- Evolution API (integração com WhatsApp)

Para iniciar os containers:

```bash
docker-compose up -d
```

## Configuração do Banco de Dados

1. O banco de dados PostgreSQL já estará disponível na porta 5432 após iniciar os containers.

2. Execute as migrações e seeders:

```bash
php artisan migrate --seed
```

## Configuração da Evolution API

A Evolution API (para integração com WhatsApp) estará disponível em `http://localhost:8080`.

1. Atualize o arquivo `.env` com as configurações da Evolution API:

```
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=your-api-key-here
EVOLUTION_API_DEFAULT_INSTANCE=default
EVOLUTION_API_WEBHOOK_URL=http://localhost:8000/api/webhooks/whatsapp
```

**Importante**: Certifique-se de que a chave API definida em `EVOLUTION_API_KEY` corresponde à chave configurada no Docker Compose (`AUTHENTICATION_API_KEY`).

2. Para conectar um número de WhatsApp, acesse a página de configurações do cliente no OnSell e siga as instruções para escanear o QR Code.

## Executando o Projeto

1. Inicie o servidor PHP:

```bash
php artisan serve
```

2. Inicie o servidor de desenvolvimento do Vite (em outro terminal):

```bash
npm run dev
```

3. Inicie o worker de filas (em outro terminal):

```bash
php artisan queue:work
```

4. Acesse o projeto em `http://localhost:8000`

## Configuração da VAPI (Telefonia)

Para utilizar a integração com a VAPI (telefonia):

1. Crie uma conta na [VAPI](https://vapi.com) e obtenha uma chave de API.

2. Atualize o arquivo `.env`:

```
VAPI_API_URL=https://api.vapi.com/v1
VAPI_API_KEY=sua-chave-api-aqui
VAPI_WEBHOOK_URL=http://seu-dominio-publico.com/api/webhooks/vapi
```

**Observação**: A VAPI requer URLs públicas para webhooks. Em ambiente de desenvolvimento, você pode usar uma ferramenta como [ngrok](https://ngrok.com/) para expor seu servidor local à internet.

## Testando as Integrações

### Evolution API (WhatsApp)

1. Para testar a conexão com a Evolution API, execute:

```bash
php artisan whatsapp:test-connection
```

2. Para testar o envio de uma mensagem:

```bash
php artisan whatsapp:send-test-message --to=551199999999 --message="Teste do OnSell"
```

### VAPI (Telefonia)

1. Para testar a conexão com a VAPI:

```bash
php artisan vapi:test-connection
```

2. Para testar a criação de um assistente:

```bash
php artisan vapi:create-assistant --name="Assistente OnSell" --message="Olá, sou o assistente do OnSell. Como posso ajudar?"
```

## Troubleshooting

### Problemas com a Evolution API

1. Se encontrar problemas de conexão com a Evolution API, verifique se o container está rodando:

```bash
docker logs onsell_evolution_api
```

2. Para reiniciar a Evolution API:

```bash
docker-compose restart evolution-api
```

### Problemas com o PostgreSQL

1. Para verificar se o PostgreSQL está funcionando corretamente:

```bash
docker logs onsell_postgres
```

2. Para se conectar diretamente ao banco de dados:

```bash
docker exec -it onsell_postgres psql -U postgres -d onsell
```

### Problemas com as Filas de Trabalho

1. Se as filas não estiverem processando:

```bash
php artisan queue:restart
php artisan queue:work
```

2. Para visualizar as filas pendentes:

```bash
php artisan queue:monitor
``` 