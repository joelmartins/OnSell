# Integração de Infraestrutura para o OnSell

Este documento resume as integrações de infraestrutura implementadas no OnSell, incluindo testes locais com Ngrok, DNS com Cloudflare e Docker para desenvolvimento e produção.

## 1. Teste de Webhooks com Ngrok

### Configuração Implementada
- Ngrok integrado ao ambiente Docker de desenvolvimento
- Controlador `WebhookTestController` para receber e exibir webhooks de teste
- Página de visualização `webhook-test.blade.php` para monitorar webhooks recebidos
- Canal de log `webhook` para registrar todos os eventos de webhook
- Rotas `/webhook-test` para receber e visualizar webhooks

### Como Usar
Para iniciar o ambiente de desenvolvimento com Ngrok:
```bash
make dev
make ngrok-url  # Para obter a URL pública do Ngrok
```

Acesse `http://localhost:4040` para visualizar o painel do Ngrok e monitorar as requisições recebidas.

## 2. Webhooks para Resend e Cloudflare R2

### Configuração Implementada
- Métodos `resend` e `r2` no `WebhookController` para processar webhooks
- Rotas `/api/webhooks/resend` e `/api/webhooks/r2` configuradas
- Validação de autenticidade dos webhooks recebidos
- Logs detalhados para depurar os eventos

### Eventos Suportados pelo Resend
- `email.sent` - E-mail enviado com sucesso
- `email.delivered` - E-mail entregue ao destinatário
- `email.opened` - E-mail aberto pelo destinatário
- `email.clicked` - Link no e-mail clicado
- `email.complained` - E-mail marcado como spam
- `email.bounced` - E-mail retornado (hard bounce)

### Eventos Suportados pelo Cloudflare R2
- `ObjectCreated:Put` - Objeto criado/atualizado
- `ObjectRemoved:Delete` - Objeto excluído

## 3. Docker para Desenvolvimento e Produção

### Estrutura de Configuração
- `Dockerfile` único na raiz baseado no PHP 8.2-fpm com Nginx integrado
- `scripts/` - Scripts de inicialização organizados por função
- `conf/nginx/` - Arquivos de configuração do Nginx
- Arquivos docker-compose específicos para cada ambiente

### Ambientes Docker Disponíveis
1. **Local** (`docker-compose.local.yml`) - Para desenvolvimento local com hot-reload
2. **Dev** (`docker-compose.dev.yml`) - Para desenvolvimento com Ngrok para testes de webhook
3. **Prod** (`docker-compose.prod.yml`) - Para produção com configurações otimizadas

### Comandos Principais (via Makefile)
```bash
# Iniciar ambientes específicos
make local    # Ambiente local
make dev      # Ambiente de desenvolvimento com Ngrok
make prod     # Ambiente de produção

# Parar ambientes
make down-local
make down-dev
make down-prod
make down-all  # Parar todos os ambientes
```

Consulte a documentação completa em `docs/docker-setup.md`.

## 4. DNS com Cloudflare

### Configuração Documentada
- Configuração de registros DNS para seu provedor de hospedagem
- Configurações de SSL/TLS para comunicação segura
- Cache e minificação para melhor desempenho

## 5. Segurança e Performance

### Recursos Implementados
- HTTPS forçado em todas as conexões
- Headers de segurança para proteção contra ataques comuns
- Tempo de vida (TTL) configurável para URLs temporárias do R2
- Sistema de logs detalhados para auditoria e depuração

## 6. Scripts Utilitários

- Scripts organizados em `scripts/` para automatizar tarefas comuns:
  - `00-laravel-setup.sh` - Configuração inicial do Laravel
  - `01-migrate-db.sh` - Migração do banco de dados
  - `02-start-services.sh` - Inicialização de serviços
- Comandos utilitários via Makefile para operações comuns

## 7. Próximos Passos

1. Configurar monitoramento com Sentry ou New Relic
2. Implementar backups automáticos do banco de dados
3. Configurar CDN para arquivos estáticos
4. Implementar testes automatizados para CI/CD
5. Configurar certificados SSL automatizados 