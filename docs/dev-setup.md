# Setup de desenvolvimento

## Pré-requisitos

- Node.js (recomendado LTS)
- Postgres local rodando

## Variáveis de ambiente

Crie um arquivo `.env` na raiz (há um exemplo em `.env.example`):

- `DATABASE_URL`
- `SESSION_SECRET`

## Banco (dev)

1. Crie o banco (exemplo):
   - database: `financeiro`
   - user: `postgres`

2. Gere migrações (já existe uma inicial):

- `npm run db:generate`

3. Aplique migrações:

- `npm run db:migrate`

## Rodar

- `npm run dev`

## Testes

Este projeto usa:

- Unitários do domínio com Vitest (sem banco)
- E2E com Playwright (rodando contra o mesmo Postgres de dev)

### Unit (Vitest)

- `npm run test:unit`

### E2E (Playwright)

1. Instale os browsers do Playwright (1x por máquina):

- `npm run e2e:install`

2. Rode os E2E:

- `npm run test:e2e`

Notas:

- Os E2E criam dados com prefixo `e2e_*` e limpam no final (via delete do household/usuários criados).
- Requer `DATABASE_URL` apontando para o banco de dev e migrações aplicadas (`npm run db:migrate`).

## Primeiro acesso

- Se não existir usuário, acesse `/setup` para criar o primeiro admin.
- Depois, use `/admin/users` para criar o segundo usuário.
- Gere o link em `/invite` e entre com o segundo usuário no link `/join/<token>`.
