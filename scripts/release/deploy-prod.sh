#!/bin/sh

set -eu

: "${APP_VERSION:?APP_VERSION is required}"

SOURCE_DIR="${DEPLOY_SOURCE_DIR:-${GITHUB_WORKSPACE:-$(pwd)}}"
TARGET_DIR="$SOURCE_DIR"
USING_PERSISTENT_CHECKOUT="false"

if [ -n "${PROD_APP_DIR:-}" ] && [ -d "$PROD_APP_DIR" ]; then
  TARGET_DIR="$PROD_APP_DIR"
  USING_PERSISTENT_CHECKOUT="true"
elif [ -n "${PROD_APP_DIR:-}" ]; then
  echo "Production directory '$PROD_APP_DIR' is not available in this runner. Falling back to '$SOURCE_DIR'." >&2
fi

if [ ! -d "$TARGET_DIR" ]; then
  echo "Deployment directory '$TARGET_DIR' does not exist." >&2
  exit 1
fi

cd "$TARGET_DIR"

if [ ! -f docker-compose.yml ]; then
  echo "Deployment directory '$TARGET_DIR' does not contain docker-compose.yml." >&2
  exit 1
fi

if [ ! -f .env.prod ]; then
  echo "Missing .env.prod in '$TARGET_DIR'." >&2
  exit 1
fi

if [ "$USING_PERSISTENT_CHECKOUT" = "true" ]; then
  : "${DEPLOY_COMMIT:?DEPLOY_COMMIT is required when PROD_APP_DIR is used}"

  if [ ! -d .git ]; then
    echo "PROD_APP_DIR must point to an existing git checkout of the application." >&2
    exit 1
  fi

  git fetch --force origin main
  git checkout --force "$DEPLOY_COMMIT"
fi

if [ -n "${GHCR_PAT:-}" ]; then
  echo "$GHCR_PAT" | docker login ghcr.io -u "${GHCR_USERNAME:?GHCR_USERNAME is required}" --password-stdin
fi

REGISTRY_IMAGE="${REGISTRY_IMAGE:?REGISTRY_IMAGE is required}"
COMPOSE_PROJECT="financeiro-prod"

echo "Pulling image ${REGISTRY_IMAGE}:${APP_VERSION}..."
docker pull "${REGISTRY_IMAGE}:${APP_VERSION}"

echo "Tagging image for local compose..."
docker tag "${REGISTRY_IMAGE}:${APP_VERSION}" "${COMPOSE_PROJECT}_web"

APP_VERSION="$APP_VERSION" docker compose \
  --env-file .env.prod \
  -p "$COMPOSE_PROJECT" \
  up -d --remove-orphans
