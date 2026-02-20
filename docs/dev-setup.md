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

## Primeiro acesso

- Se não existir usuário, acesse `/setup` para criar o primeiro admin.
- Depois, use `/admin/users` para criar o segundo usuário.
- Gere o link em `/invite` e entre com o segundo usuário no link `/join/<token>`.
