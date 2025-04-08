# OnSell - Plataforma de Automação de Vendas

OnSell é uma plataforma SaaS completa para automação do processo de geração, qualificação e conversão de leads por meio de inteligência artificial. A plataforma elimina ou reduz drasticamente a necessidade de grandes equipes comerciais, substituindo operações manuais por automações inteligentes.

## Visão Geral

O diferencial estratégico da OnSell está em sua capacidade de oferecer uma solução completa, automatizada e acessível, com alta personalização através de um sistema robusto de white label para agências parceiras.

### Características Principais

- **Pipeline de Vendas**: Interface visual Kanban, totalmente personalizável
- **Inbox Inteligente**: Centraliza mensagens recebidas via WhatsApp, e-mail e redes sociais
- **Automação Avançada**: Fluxos dinâmicos utilizando IA para qualificação detalhada dos leads
- **Relatórios**: Dashboard intuitivo com métricas claras de desempenho
- **Multi-tenancy**: White label completo com domínios personalizados
- **Perfis Múltiplos**: Admin, Agência e Cliente Final

## Tecnologias Utilizadas

- **Backend**: Laravel 12 (PHP 8.3)
- **Frontend**: React 18 + Inertia.js
- **UI**: Tailwind CSS + shadcn/ui
- **Banco de Dados**: PostgreSQL + Redis (queues + cache)
- **Multi-tenancy**: stancl/tenancy
- **Autenticação**: Laravel Breeze (React)
- **Autorização**: spatie/permission
- **Auditoria**: owen-it/laravel-auditing

## Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/seuusuario/onsell_laravel.git
   cd onsell_laravel
   ```

2. Instale as dependências do PHP:
   ```bash
   composer install
   ```

3. Instale as dependências do JavaScript:
   ```bash
   npm install
   ```

4. Copie o arquivo de ambiente:
   ```bash
   cp .env.example .env
   ```

5. Configure seu banco de dados no arquivo `.env`

6. Gere a chave da aplicação:
   ```bash
   php artisan key:generate
   ```

7. Execute as migrações e seeders:
   ```bash
   php artisan migrate --seed
   ```

8. Inicie o servidor de desenvolvimento:
   ```bash
   php artisan serve
   ```

9. Compile os assets:
   ```bash
   npm run dev
   ```

10. Acesse a aplicação em http://localhost:8000

## Estrutura do Projeto

```
onsell/
├── app/
│   ├── Http/
│   │   ├── Controllers/      // Lógica API
│   │   ├── Middleware/       // Impersonation, Tenancy, etc.
│   │   ├── Requests/         // Validações
│   ├── Models/               // User, Client, Agency, etc.
│   ├── Services/             // WhatsApp, Automations, etc.
│   ├── Actions/              // Ações organizadas
│   ├── Policies/             // Autorização por role
│   └── ...
├── resources/
│   ├── js/                   // React Frontend
│   │   ├── Pages/
│   │   │   ├── Admin/
│   │   │   ├── Agency/
│   │   │   ├── Client/
│   │   ├── Components/
│   │   └── Layouts/
```

## Níveis de Acesso

### Admin
- Controle absoluto do sistema
- Gerenciamento de agências e clientes
- Configurações globais
- Pode impersonar qualquer usuário

### Agência
- Gerenciamento de clientes próprios
- White Label (cores, domínio, logo)
- Planos personalizados
- Pode impersonar apenas seus clientes

### Cliente
- Pipeline de vendas
- Inbox unificado
- Automações e contatos
- Relatórios e integrações

## Credenciais de Teste

- **Admin**: admin@onsell.com.br / onsell@123

## Licença

Este projeto é propriedade exclusiva de OnSell e não pode ser redistribuído ou usado sem autorização expressa.



