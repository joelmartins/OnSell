# Testando Webhooks com Ngrok

Este documento explica como usar o Ngrok para testar webhooks em ambiente de desenvolvimento local.

## Configuração inicial

1. Instale o Ngrok:
   ```bash
   # macOS
   brew install ngrok
   
   # Linux
   sudo apt install ngrok
   
   # Ou baixe do site oficial
   # https://ngrok.com/download
   ```

2. Crie uma conta em [ngrok.com](https://ngrok.com) e obtenha seu token de autenticação

3. Configure o Ngrok com seu token:
   ```bash
   ngrok config add-authtoken seu_token_aqui
   ```

## Uso com o projeto OnSell

### 1. Inicie seu servidor Laravel
```bash
php artisan serve
```

### 2. Em outro terminal, inicie o Ngrok apontando para a porta do Laravel
```bash
ngrok http 8000
```

### 3. Observe a URL gerada
O Ngrok fornecerá uma URL pública semelhante a:
```
https://a1b2c3d4e5f6.ngrok.io
```

### 4. Configure os webhooks com esta URL

#### Para o Resend:
1. Acesse [dashboard.resend.com](https://dashboard.resend.com)
2. Vá para a seção de webhooks
3. Adicione um novo webhook usando a URL do Ngrok:
   ```
   https://a1b2c3d4e5f6.ngrok.io/api/webhooks/resend
   ```

#### Para o Cloudflare R2:
Webhooks do R2 podem ser configurados usando eventos de notificação:
```
https://a1b2c3d4e5f6.ngrok.io/api/webhooks/r2
```

## Testando os Webhooks

### Visualizando requisições recebidas

O Ngrok fornece uma interface web para visualizar todas as requisições recebidas:
- Acesse http://localhost:4040 no navegador enquanto o Ngrok estiver em execução
- Esta interface mostrará detalhes de todas as requisições HTTP, incluindo headers, body e resposta

### Logs de webhook no Laravel

Os logs de webhook são salvos em:
```
storage/logs/webhook-YYYY-MM-DD.log
```

## Solução de problemas

- **Erro "Auth token invalid"**: Verifique se configurou corretamente o token de autenticação
- **Timeout nas requisições**: Verifique se seu servidor Laravel está rodando
- **Webhook não disparado**: Verifique os logs do Ngrok para confirmar se a requisição chegou

## Scripts úteis

### Iniciar ambiente de desenvolvimento com um comando
Crie um arquivo `start-dev.sh` na raiz do projeto:

```bash
#!/bin/bash
# Inicie o servidor Laravel em segundo plano
php artisan serve &
LARAVEL_PID=$!

# Inicie o Ngrok
ngrok http 8000

# Quando o Ngrok for encerrado, encerre também o servidor Laravel
kill $LARAVEL_PID
```

Dê permissão de execução:
```bash
chmod +x start-dev.sh
```

Execute com:
```bash
./start-dev.sh
``` 