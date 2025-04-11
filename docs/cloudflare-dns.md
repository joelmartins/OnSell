# Configuração do Cloudflare DNS para o OnSell

Este documento explica como configurar o Cloudflare DNS para o projeto OnSell, integrando-o com o Render.com para hospedagem.

## 1. Cadastro e Configuração no Cloudflare

### Criando uma conta e adicionando o domínio

1. Acesse [cloudflare.com](https://cloudflare.com) e crie uma conta ou faça login
2. Clique em "Add a Site" ou "Adicionar um site"
3. Digite seu domínio (ex: onsell.com.br) e clique em "Adicionar site"
4. Selecione o plano Free (gratuito)
5. Siga as instruções para configurar os nameservers do seu registrador de domínio:
   - Anote os dois nameservers fornecidos (ex: `ana.ns.cloudflare.com` e `ben.ns.cloudflare.com`)
   - Acesse o painel de controle do seu registrador de domínio (onde você comprou o domínio)
   - Substitua os nameservers atuais pelos fornecidos pelo Cloudflare
   - Esta alteração pode levar até 24 horas para propagar

### Configurando DNS para o Render.com

1. No painel do Cloudflare, selecione seu domínio
2. Vá para a guia "DNS"
3. Clique em "Adicionar registro"

#### Para o domínio principal (apex domain)

```
Tipo: A
Nome: @ (ou deixe em branco)
Endereço de destino: 76.76.21.21 (IP do Render.com)
TTL: Auto
Proxy status: Ativado (recomendado)
```

#### Para o subdomínio www

```
Tipo: CNAME
Nome: www
Conteúdo: onsell.onrender.com (substitua pelo seu endereço no Render)
TTL: Auto
Proxy status: Ativado (recomendado)
```

#### Para o subdomínio API (opcional)

```
Tipo: CNAME
Nome: api
Conteúdo: onsell-api.onrender.com (substitua pelo seu endereço da API no Render)
TTL: Auto
Proxy status: Ativado (recomendado)
```

## 2. Configurações de Segurança e Performance

### SSL/TLS

1. No painel do Cloudflare, vá para a guia "SSL/TLS"
2. Em "Modo de criptografia", selecione "Full" ou "Full (strict)" para maior segurança
3. Ative o "Always Use HTTPS" para garantir que todas as conexões sejam seguras

### Page Rules (opcional)

Para forçar HTTPS em todo o site:

1. Vá para a guia "Page Rules"
2. Clique em "Create Page Rule"
3. Configure:
   - URL: `http://*onsell.com.br/*`
   - Configurações: "Always Use HTTPS"
   - Clique em "Save and Deploy"

### Firewall/WAF (opcional)

1. Vá para a guia "Security" > "WAF"
2. Ative o "Managed Rules" com as configurações recomendadas para proteção básica

## 3. Otimizações de Performance

### Ativar cache e minificação

1. Vá para a guia "Speed" > "Optimization"
2. Ative o cache de imagens, CSS e JavaScript
3. Ative a minificação automática para HTML, CSS e JavaScript

### Ativar Cloudflare CDN

1. Certifique-se de que o ícone "Proxy Status" esteja laranja/ativo para seus registros DNS
2. Vá para "Caching" > "Configuration"
3. Configure "Browser Cache TTL" para um valor adequado (ex: 4 horas)

## 4. Verificação da Configuração

1. Para verificar se o DNS está corretamente configurado:
   - Use o comando `dig onsell.com.br` para verificar o registro A
   - Use o comando `dig www.onsell.com.br` para verificar o CNAME

2. Para verificar se o SSL está funcionando:
   - Acesse `https://onsell.com.br` e `https://www.onsell.com.br`
   - Verifique se a conexão é segura (cadeado no navegador)

## 5. Solução de Problemas

### Problema: Certificado SSL não está ativo

1. Verifique se o DNS propagou completamente (pode levar até 24 horas)
2. Verifique se o modo SSL está configurado como "Full" ou "Full (strict)"
3. No Render.com, verifique se o domínio personalizado foi adicionado corretamente

### Problema: Site não carrega

1. Verifique os logs de DNS no Cloudflare
2. Verifique se o aplicativo está funcionando no Render.com
3. Desative temporariamente o proxy do Cloudflare (ícone cinza) para testar

## 6. Manutenção e Monitoramento

1. Configure o Cloudflare Analytics para monitorar o tráfego
2. Verifique regularmente as estatísticas de segurança e performance
3. Mantenha-se atualizado sobre novas configurações e recursos do Cloudflare 