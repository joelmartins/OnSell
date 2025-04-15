📄 onsell-billing-stripe.md
md
Copiar
Editar
# 💳 Integração Stripe – Cobrança de Clientes Diretos e Agências (OnSell MVP)

## 🎯 Objetivo
Permitir a cobrança automatizada de:
- Clientes diretos
- Agências (white label)

Utilizando Stripe com:
- Checkout simples
- Ativação automática via webhook
- Controle manual como fallback
- Planos gerenciáveis via painel
- Integração via OAuth com a conta do Stripe

---

## 🧩 Regras de Relacionamento

| Papel           | Paga para        | Gateway |
|-----------------|------------------|---------|
| Cliente direto  | Sistema (admin)  | Stripe  |
| Agência         | Sistema (admin)  | Stripe  |
| Cliente via agência | Agência       | Manual (fora do Stripe) |

---

## ⏳ Gestão de Trial

- Toda nova conta inicia com um período de avaliação (trial)
- A data de expiração do trial é registrada no momento do cadastro
- A conta permanece ativa até o fim do trial ou confirmação de pagamento

---

## 🔐 Controle de Acesso

- Middleware global verifica:
  - Se o trial ainda é válido **OU**
  - Se há pagamento confirmado
- Se não estiver ativo:
  - Redirecionar para tela de bloqueio
  - Exibir mensagem com instruções para ativar o plano

---

## 🧾 Gestão de Planos

### Rota: `/admin/plans`

- Permitir ao admin:
  - Criar, editar e excluir planos
  - Definir valores, nomes e descrição
  - Associar ID do plano no Stripe (product/price ID)
  - Categorizar planos por tipo (cliente, agência)

### Estrutura mínima do plano:
- Nome
- Descrição
- Preço
- Duração (mensal/anual)
- Tipo: `client` ou `agency`
- ID do Stripe (price_id)

---

## 🧰 Integração Stripe via OAuth

### Rota: `/admin/integrations`

- Adicionar módulo para autenticação da conta Stripe via OAuth
- Armazenar:
  - Account ID
  - Chave pública (se necessário)
  - Status da conexão
- Permitir:
  - Desconectar conta
  - Ver informações da conta conectada

---

## 📦 Stripe – Configuração Inicial

### Variáveis no `.env`

```env
STRIPE_KEY=
STRIPE_SECRET=
STRIPE_WEBHOOK_SECRET=
STRIPE_OAUTH_CLIENT_ID=
STRIPE_OAUTH_SECRET=
STRIPE_ACCOUNT_ID=
🧾 Checkout com Stripe
Fluxo
Usuário acessa a página de cobrança

Sistema identifica o plano adequado (cliente ou agência)

Cria uma sessão de checkout via Stripe

Redireciona o usuário para pagamento

Após sucesso, ativa a conta automaticamente

Rotas
Cliente direto:

POST /client/settings/billing/checkout

Agência:

POST /agency/settings/billing/checkout

📬 Webhook Stripe
Rota protegida:
POST /webhooks/stripe

Eventos monitorados:
checkout.session.completed → Ativa a conta

invoice.payment_failed → (futuro)

customer.subscription.deleted → (futuro)

Segurança:
Validar assinatura com STRIPE_WEBHOOK_SECRET

📁 Estrutura de Telas
Cliente Direto
Rota: /client/settings/billing

Mostra:

Status do plano e trial

Dias restantes do trial

Botão “Ativar com Stripe”

Histórico de cobrança (manual)

Agência
Rota: /agency/settings/billing

Mostra:

Status da agência

Botão para pagar com Stripe

Dados do plano da agência

Histórico de pagamento (manual)

Admin
Rota: /admin/billing

Mostra:

Lista de agências e clientes diretos

Status: trial / ativo / inativo

Botões para ativar/desativar manualmente

Acesso ao /admin/plans para gestão de planos

