# Financeiro (MVP)

Web app de controle financeiro pessoal (Remix/React Router full stack) com Postgres + Drizzle.

## Stack

- Node.js 20+
- Postgres 16
- Drizzle ORM / Drizzle Kit (migrações)
- Deploy padrão: Docker Compose (dev/homolog/prod)
- Reverse proxy: Nginx (TLS no host)

## Docs

- Dev: `docs/dev-setup.md`
- Exemplo Nginx: `docs/nginx-financeiro.example.conf`

## Variáveis de ambiente

Obrigatórias:

- `DATABASE_URL`
- `SESSION_SECRET`

Opcionais:

- `COOKIE_SECURE` (`true`/`false`) — default: `true` em produção (`NODE_ENV=production`)
- `APP_PORT` (Compose)
- `DB_PORT` (apenas dev, via `docker-compose.dev.yml`)

Exemplos prontos:

- `.env.example` (dev)
- `.env.staging.example`
- `.env.prod.example`

## Desenvolvimento (local)

1) Instalar dependências:

```bash
npm install
```

2) Criar o `.env` (baseie-se em `.env.example`):

- `DATABASE_URL` deve usar `localhost` (para `drizzle-kit` e `npm run dev` no host)
- `COOKIE_SECURE=false`

3) Subir Postgres + (opcional) app produção-like via Docker:

```bash
npm run stack:up:dev
```

4) Aplicar migrações (se você estiver rodando o app no host com HMR):

```bash
npm run db:migrate
```

5) Rodar com HMR (recomendado):

```bash
npm run dev
```

## Primeiro acesso

- Se não existir usuário, acesse `/setup` e crie o primeiro admin.
- Depois, use `/admin/users` para criar novos usuários.
- Gere convite em `/invite` e aceite em `/join/<token>`.

## Deploy (homologação e produção)

O padrão é rodar o app em containers, com Nginx no host fazendo TLS e reverse proxy.

### Homologação

1) No servidor, crie `.env.staging` baseado em `.env.staging.example`.

2) Suba a stack:

```bash
npm run stack:up:staging
```

3) Aponte seu Nginx para `127.0.0.1:${APP_PORT}` (por padrão o exemplo usa `3001`).

### Produção

1) No servidor, crie `.env.prod` baseado em `.env.prod.example`.

2) Suba a stack:

```bash
npm run stack:up:prod
```

3) Configure Nginx (ver `docs/nginx-financeiro.example.conf`).

### Migrações automáticas

O Compose sobe um serviço `migrate` que roda `npm run db:migrate` antes do `web` iniciar.

## Healthcheck

Existe um endpoint público:

- `GET /health` → responde `ok`

## Backup e restore do Postgres

Os scripts rodam `pg_dump/pg_restore` dentro do container do Postgres.

Linux/VPS:

```bash
./scripts/db-backup.sh .env.prod financeiro-prod backups/financeiro-prod.dump
./scripts/db-restore.sh .env.prod financeiro-prod backups/financeiro-prod.dump
```

Windows (PowerShell):

```powershell
./scripts/db-backup.ps1 -EnvFile .env.prod -Project financeiro-prod -OutFile backups/financeiro-prod.dump
./scripts/db-restore.ps1 -EnvFile .env.prod -Project financeiro-prod -InFile backups/financeiro-prod.dump
```

## Operação

- Logs: `docker compose -p <project> logs -f web`
- Reiniciar: `docker compose -p <project> restart web`
- Derrubar stack: `npm run stack:down:staging` / `npm run stack:down:prod`

## Notas de segurança (deploy)

- Em homolog/prod com HTTPS, mantenha `COOKIE_SECURE=true`.
- Configure Nginx para enviar `X-Forwarded-Proto`/`X-Forwarded-Host` (o app usa isso para gerar links corretos, ex.: convites).
