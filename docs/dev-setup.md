# Setup de desenvolvimento

## Pré-requisitos

- Node.js (recomendado LTS)
- Docker (recomendado Docker Desktop)

## Variáveis de ambiente

Crie um arquivo `.env` na raiz (há um exemplo em `.env.example` / `.env.dev.example`):

- `DATABASE_URL`
- `SESSION_SECRET`
- `COOKIE_SECURE` (em dev, use `false`)

## Banco (dev)

O jeito mais simples é rodar o Postgres via Docker:

- `npm run stack:up:dev`

Isso sobe:

- `db` (Postgres) acessível apenas para os serviços da rede Docker Compose
- `web` (build de produção) em `http://localhost:${APP_PORT:-3000}`

Se você preferir rodar o app no host com HMR, use um Postgres acessível pelo host no `DATABASE_URL` ou crie um override local só para publicar a porta do banco.

### Migrações

Já existe uma migração inicial. Para aplicar no banco de dev:

- `npm run db:migrate`

Se você estiver usando o `web` via Compose, ele já roda migrações automaticamente via serviço `migrate`.

### Gerar novas migrações

- `npm run db:generate`

## Rodar

Opção A (recomendado para desenvolvimento):

- Rode a stack completa via Docker Compose: `npm run stack:up:dev`

Opção B (produção-like):

- Igual à opção A neste momento: `npm run stack:up:dev`

## Testes

Este projeto usa:

- Unitários do domínio com Vitest (sem banco)
- E2E com Playwright (rodando contra o mesmo Postgres de dev)

### Unit (Vitest)

- `npm run test:unit`

Cobertura (gera `coverage/index.html` e `coverage/coverage-final.json`):

- `npm run test:unit:coverage`

### E2E (Playwright)

1. Instale os browsers do Playwright (1x por máquina):

- `npm run e2e:install`

2. Rode os E2E:

- `npm run test:e2e`

Notas:

- Os E2E criam dados com prefixo `e2e_*` e limpam no final (via delete do household/usuários criados).
- Requer `DATABASE_URL` apontando para o banco de dev e migrações aplicadas (`npm run db:migrate`).

Global shared seed (recomendado para runs estáveis):

- O `e2e/global-setup.js` aplica migrações e garante um usuário admin, um membro e uma household compartilhados para os testes. Ele escreve `e2e/.setup-credentials.json`.
- Para fazer os fixtures usarem essas credenciais compartilhadas, exporte a variável `E2E_USE_SETUP_CREDENTIALS=1` antes de rodar os testes. Exemplo:

  ```bash
  E2E_USE_SETUP_CREDENTIALS=1 npm run test:e2e
  ```

- Se não usar o setup compartilhado, os workers criam dados isolados por run e os limpam ao final.

Dicas de troubleshooting:

- Se os testes falharem com "relation does not exist", verifique se as migrações foram aplicadas (`npm run db:migrate`) ou execute o global setup (Playwright config default já inclui `globalSetup`).
- Se `e2e/.setup-credentials.json` não existir e você estiver usando `E2E_USE_SETUP_CREDENTIALS=1`, execute o global setup manualmente ou garanta que Playwright rode com `globalSetup`.

## Primeiro acesso

- Se não existir usuário, acesse `/setup` para criar o primeiro admin.
- Depois, use `/admin/users` para criar o segundo usuário.
- Gere o link em `/invite` e entre com o segundo usuário no link `/join/<token>`.
