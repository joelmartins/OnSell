# OnSell

## Visão Estratégica e Modelo de Negócio

### Contexto do Negócio

O **OnSell** é uma plataforma **SaaS** desenhada para **pequenas e médias empresas** que desejam automatizar seus processos de **geração, qualificação e conversão de leads**, utilizando **inteligência artificial**. A proposta central é **eliminar a dependência de grandes equipes comerciais e departamentos de marketing**, substituindo tarefas manuais por **automações integradas** com os canais mais utilizados, como **WhatsApp, e-mail, redes sociais e telefonia**.

O **diferencial estratégico** da OnSell está na combinação de uma **solução completa, acessível e 100% automatizada**, com **altíssimo grau de personalização**, especialmente através de sua estrutura **white label** voltada para agências parceiras.

---

## Público-Alvo

- **Cliente Final:** Empresas que buscam escalar suas vendas com **baixo investimento** inicial, sem necessidade de equipe comercial interna.
- **Agências:** Parceiros estratégicos que revendem a plataforma sob **sua própria marca**, com controle total sobre planos, branding e clientes.
- **Admin (Plataforma):** Gestão completa da plataforma, incluindo agências, clientes diretos, recursos, auditoria e faturamento.

---

## Estrutura de Contas

- **Admin:**
  - Controle absoluto da plataforma.
  - Gerenciamento de agências, clientes diretos, planos e integrações globais.
  - Auditoria e segurança.
- **Agência (White Label):**
  - Personalização visual e de domínio.
  - Criação e gestão de clientes finais.
  - Criação de planos personalizados.
- **Cliente Final:**
  - Acesso direto ao sistema com recursos operacionais (pipeline, inbox, automações, relatórios, integrações).

---

## Funcionalidades Detalhadas

### Admin e Agências

- **Gerenciamento Centralizado:** Criação, monitoramento e administração de todos os clientes e subcontas.
- **White Label Total:** Customização visual completa, com domínio próprio, landing pages exclusivas e certificados SSL automatizados.
- **Criação de Planos Personalizados:** Definição de limites de recursos por cliente (leads mensais, contatos totais, pipelines, landing pages).
- **Impersonação Segura:** Acesso temporário a contas para fins de suporte e auditoria.
- **Relatórios de Performance:** Métricas de uso, conversão e desempenho global ou individual dos clientes.

---

### Cliente Final

#### Pipeline de Vendas

- Interface Kanban customizável.
- Organização visual das oportunidades por etapas.
- Integração direta com automações e mensagens.

#### Inbox Inteligente

- Centralização de comunicações (WhatsApp, e-mail, redes sociais).
- IA para respostas automáticas com base em contexto e histórico.
- Intervenção manual habilitada.

#### Automação Avançada

- Qualificação de leads baseada em fluxos dinâmicos com IA.
- Campanhas de mídia automatizadas.
- Criação de landing pages com IA.

#### Landing Pages

- Criação e edição de páginas de captura.
- Templates otimizados com IA.
- Integração direta com pipelines e fluxos.

#### Relatórios e Métricas

- Dashboard com KPIs estratégicos (CPL, taxa de conversão, origem de leads).
- Relatórios por canal, campanha e período.

#### Integrações e Configurações

- Conexão com WhatsApp API, SMTP, Meta (Facebook/Instagram), Google Ads.
- Cadastro e gestão dos produtos e serviços vendidos.

---

## Modelo Comercial e Estrutura de Planos

### Planos para Clientes Finais

| Plano         | Leads Mensais | Landing Pages | Pipelines | Contatos Totais |
|---------------|---------------|----------------|-----------|------------------|
| **Starter**   | até 500       | 1              | 1         | até 2.000        |
| **Pro**       | até 2.000     | até 3          | até 3     | até 10.000       |
| **Enterprise**| ilimitado*    | ilimitado*     | ilimitado*| acima de 10.000* |

> *Os limites do plano **Enterprise** podem ser personalizados pelas Agências ou pelo Admin, de acordo com a operação do cliente.

---

### Planos para Agências (White Label)

| Plano da Agência | Limite de Clientes Gerenciáveis |
|------------------|----------------------------------|
| **Starter**      | até 5 clientes                   |
| **Pro**          | até 20 clientes                  |
| **Enterprise**   | ilimitado                        |

- As agências podem:
  - Criar seus próprios planos personalizados para os clientes.
  - Definir os limites de leads mensais, pipelines, contatos e landing pages.
  - Gerenciar branding completo (logotipo, domínio, cores).
  - Personalizar valores de venda ao cliente.

---

## Níveis de Acesso e Permissões

1. **Admin**
   - Cria e gerencia agências e clientes (diretos ou indiretos).
   - Pode impersonar qualquer conta.

2. **Agência (White Label)**
   - Cria e gerencia seus próprios clientes.
   - Pode impersonar apenas suas contas.

3. **Cliente Final**
   - Acesso apenas às funcionalidades operacionais.
   - Vinculado a uma agência ou diretamente à plataforma.

---

## Menus e Funcionalidades por Perfil

### Menu do Cliente

- Painel (Dashboard de Vendas)
- Pipeline (Kanban de oportunidades)
- Mensagens (Inbox unificado: WhatsApp, e-mail, redes sociais)
- Automação (Fluxos automatizados de qualificação e follow-up)
- Landing Pages (Criação e edição de páginas de captura e conversão)
- Contatos (Base de leads e clientes)
- Relatórios (Performance, conversão, canais, etc.)
- Integrações (WhatsApp, Meta, Google, SMTP, etc.)
- Configurações (Usuários, permissões internas, domínios, branding básico)

### Menu da Agência (White Label)

- Clientes (Gestão de todos os clientes da agência)
- Agências (caso a agência seja uma master e tenha subagências - opcional)
- White Label (Configurações visuais, domínio, certificado SSL, marca)
- Planos (Criação e atribuição de planos personalizados por cliente)
- Configurações (Preferências da agência, faturamento próprio, notificações)

### Menu do Admin

- Clientes (Todos os clientes da plataforma)
- Agências (Todas as agências registradas)
- Planos (Planos globais, templates para agências e clientes diretos)
- Integrações (Gerenciamento central de integrações nativas - ex: Evolution API)
- Configurações
  - Branding da plataforma principal
  - Certificados SSL automáticos
  - Parâmetros de cobrança (Stripe, Iugu, etc.)
  - Segurança (política de senha, SSO, etc.)
  - Logs e Auditorias

---

## Impersonação e Segurança

- Impersonação segura via middleware:

```php
if (auth()->user()->hasRole('admin.super')) {
    // pode impersonar qualquer conta
} elseif (auth()->user()->hasRole('agency.owner')) {
    // só pode impersonar clientes que pertencem à agência
} else {
    abort(403);
}
```

- Auditoria de acessos com `laravel-auditing`
- Logs detalhados de ações durante impersonação

---

## Stack Técnica (Laravel 12 + React + shadcn)

| Camada        | Tecnologia                             |
|---------------|-----------------------------------------|
| Backend       | Laravel 12 (PHP 8.3)                    |
| Frontend      | React 18 + Vite                         |
| UI            | shadcn/ui + TailwindCSS                 |
| Multi-tenancy | stancl/tenancy                          |
| Autenticação  | Laravel Breeze (React) ou Fortify       |
| Autorização   | spatie/laravel-permission               |
| Impersonação  | Middleware custom + laravel-impersonate |
| Banco de Dados| PostgreSQL + Redis                      |
| Hospedagem    | DigitalOcean + Laravel Forge            |

---

## Organização do Projeto

```
onsell/
├── app/
│   ├── Http/Controllers, Middleware, Requests
│   ├── Models, Services, Actions, Policies
├── routes/api.php
├── resources/js/ (React)
│   ├── pages/Admin, Agency, Client
│   ├── components, layouts
├── database/
│   ├── migrations, seeders
│   ├── tenant/, landlord/
```

---

## Gestão de Perfis + Impersonação

- Papéis:
  - `admin.super`
  - `agency.owner`
  - `client.user`

- Impersonação:
  - Admin → Agências e Clientes
  - Agência → Apenas seus próprios Clientes

---

## Segurança

- Middleware por papel, tenant e impersonação
- Rate limiting + throttle nas APIs
- SSL automático via Let's Encrypt
- Auditoria com Laravel Auditing

---

## Vantagens da Arquitetura

| Aspecto                 | Benefício                                         |
|-------------------------|---------------------------------------------------|
| Laravel Monolítico      | Estrutura robusta, simples de manter              |
| React + shadcn          | UI moderna e responsiva                           |
| Multi-tenancy Isolado   | Domínio próprio por tenant, dados separados       |
| Impersonação Segura     | Suporte e auditoria sem comprometer a segurança   |
| Modularidade            | Fácil migração futura para microserviços          |
```

---