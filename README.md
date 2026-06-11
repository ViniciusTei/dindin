<div align="center">

# Financeiro (MVP)

![deploy](http://git.viniserver.com.br/viniciustei/financeiro-remix/actions/workflows/deploy-prod.yaml/badge.svg?branch=main&style=flat)

</div>

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
- `APP_VERSION` (metadado opcional do release/deploy; default: `dev`)

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

## Deploy contínuo com GitHub Container Registry (ghcr.io)

O workflow de deploy fica em `.github/workflows/deploy-prod.yaml`.
O gatilho é qualquer `push` para `main`, incluindo merges.

### Fluxo do pipeline

1) **Checkout** do código atualizado em `main`.

2) **Resolve a versão** do deploy com `npm run deploy:version`.

```bash
npm run deploy:version
node ./scripts/release/resolve-deploy-version.mjs --sha
```

3) **Validação**: executa `lint`, `test:domain`, `test:ui`, `typecheck` e `build`.

4) **Build da imagem Docker** com target `runner` e push para o ghcr.io:
   - Tagueada com a versão exata (`ghcr.io/<user>/financeiro-remix:<version>`)
   - Tagueada como `latest`

5) **Deploy no servidor**: o script `deploy-prod.sh`:
   - Faz login no ghcr.io (se `GHCR_PAT` estiver disponível)
   - Faz pull da imagem exata do registry
   - Tagueia a imagem para o nome esperado pelo Docker Compose local
   - Sobe a stack com `docker compose up -d` (sem `--build`)
   - O serviço `migrate` ainda é construído localmente (rápido, apenas instala deps)

### Segredos necessários no repositório

Obrigatórios:

- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`
- `SESSION_SECRET`
- `GHCR_USERNAME` — seu usuário do GitHub
- `GHCR_PAT` — Personal Access Token do GitHub com permissão `write:packages`

Opcionais:

- `APP_PORT`
- `COOKIE_SECURE`
- `CARD_ENCRYPTION_KEY`
- `PROD_APP_DIR`

### Pré-requisitos no servidor de produção

- O runner que executa `deploy-prod.yaml` deve estar instalado no mesmo servidor da produção.
- Docker e Docker Compose devem estar instalados e disponíveis no PATH do usuário usado pelo runner.
- O runner precisa ter acesso à internet para fazer pull das imagens do ghcr.io.

#### Sobre `PROD_APP_DIR`

- Se o runner executa direto no host e você quer manter um checkout persistente para deploy, defina `PROD_APP_DIR` apontando para um clone Git existente do repositório.
- Se o runner executa em container (caso comum com `act_runner`), o caminho do host normalmente **não** fica visível dentro do job. Nesse caso, deixe `PROD_APP_DIR` vazio e o pipeline fará o deploy usando o checkout temporário do próprio job.
- Quando `PROD_APP_DIR` é usado, o remoto `origin` desse clone precisa ter acesso para `git fetch origin main`.
- O deploy sempre usa a imagem do registry, independentemente de `PROD_APP_DIR`.

#### Variáveis do deploy

- O pipeline gera um `.env.prod` temporário dentro do workspace do job usando os segredos.
- O serviço `pgadmin` não sobe por padrão em produção; para usá-lo manualmente, rode o Compose com o profile `admin`.

### Migrações automáticas

O Compose sobe um serviço `migrate` que roda `npm run db:migrate` antes do `web` iniciar.
O `migrate` ainda é construído localmente (target `dev-deps`) — é rápido e não justifica o push para o registry.

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
