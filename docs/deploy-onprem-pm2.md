# Deploy on-prem (Linux + Postgres + PM2)

> Este documento descreve uma alternativa de deploy.
> O caminho **padrão oficial** do projeto está no `README.md` via **Docker Compose** (dev/homolog/prod).

Objetivo: rodar o app na sua rede interna com Postgres local e Node gerenciado por PM2.

## 1) Pré-requisitos

- Linux server
- Node.js LTS
- Postgres instalado e rodando
- PM2 instalado globalmente: `npm i -g pm2`

## 2) Banco e usuário

Crie um banco e um usuário (exemplo):

- database: `financeiro`
- user: `financeiro`

Configure privilégios para o usuário no banco.

## 3) Variáveis de ambiente

No servidor, defina:

- `DATABASE_URL=postgres://financeiro:...@localhost:5432/financeiro`
- `SESSION_SECRET=...` (uma string grande e aleatória)

Sugestão: usar um arquivo `.env` no diretório do app.

## 4) Build

No servidor (ou via CI/rsync):

- `npm ci`
- `npm run build`

## 5) Migrações

- `npm run db:migrate`

## 6) Subir com PM2

O repo já contém `ecosystem.config.cjs`.

- `pm2 start ecosystem.config.cjs`
- `pm2 save`

## 7) Atualizar

- puxar/atualizar código
- `npm ci`
- `npm run build`
- `npm run db:migrate`
- `pm2 restart financeiro`

## 8) Observações

- O app está em HTTP (rede interna). Se você quiser HTTPS depois, coloque um reverse proxy (Caddy/Nginx) na frente.
- Sem backup automático por decisão do MVP.
