#!/usr/bin/env sh
set -eu

ENV_FILE=${1:-}
PROJECT=${2:-}
IN_FILE=${3:-}

if [ -z "$ENV_FILE" ] || [ -z "$PROJECT" ] || [ -z "$IN_FILE" ]; then
  echo "Uso: scripts/db-restore.sh <env-file> <compose-project> <in-file>"
  echo "Ex.: scripts/db-restore.sh .env.prod financeiro-prod backups/financeiro-prod.dump"
  exit 1
fi

if [ ! -f "$IN_FILE" ]; then
  echo "Arquivo não encontrado: $IN_FILE"
  exit 1
fi

cat "$IN_FILE" | docker compose --env-file "$ENV_FILE" -p "$PROJECT" exec -T db sh -lc \
  'PGPASSWORD="$POSTGRES_PASSWORD" pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists'

echo "Restore concluído a partir de: $IN_FILE"
