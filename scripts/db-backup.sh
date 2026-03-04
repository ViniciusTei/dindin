#!/usr/bin/env sh
set -eu

ENV_FILE=${1:-}
PROJECT=${2:-}
OUT_FILE=${3:-}

if [ -z "$ENV_FILE" ] || [ -z "$PROJECT" ] || [ -z "$OUT_FILE" ]; then
  echo "Uso: scripts/db-backup.sh <env-file> <compose-project> <out-file>"
  echo "Ex.: scripts/db-backup.sh .env.prod financeiro-prod backups/financeiro-prod.dump"
  exit 1
fi

mkdir -p "$(dirname "$OUT_FILE")"

docker compose --env-file "$ENV_FILE" -p "$PROJECT" exec -T db sh -lc \
  'PGPASSWORD="$POSTGRES_PASSWORD" pg_dump -Fc -U "$POSTGRES_USER" "$POSTGRES_DB"' > "$OUT_FILE"

echo "Backup salvo em: $OUT_FILE"
