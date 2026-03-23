#!/bin/sh

set -eu

: "${PROD_APP_DIR:?PROD_APP_DIR is required}"
: "${DEPLOY_COMMIT:?DEPLOY_COMMIT is required}"
: "${APP_VERSION:?APP_VERSION is required}"

if [ ! -d "$PROD_APP_DIR" ]; then
  echo "Production directory '$PROD_APP_DIR' does not exist." >&2
  exit 1
fi

cd "$PROD_APP_DIR"

if [ ! -d .git ]; then
  echo "PROD_APP_DIR must point to an existing git checkout of the application." >&2
  exit 1
fi

if [ ! -f .env.prod ]; then
  echo "Missing .env.prod in '$PROD_APP_DIR'." >&2
  exit 1
fi

git fetch --force origin main
git checkout --force "$DEPLOY_COMMIT"

APP_VERSION="$APP_VERSION" docker compose \
  --env-file .env.prod \
  -p financeiro-prod \
  up -d --build --remove-orphans
