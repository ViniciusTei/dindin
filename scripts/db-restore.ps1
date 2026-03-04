param(
  [Parameter(Mandatory=$true)][string]$EnvFile,
  [Parameter(Mandatory=$true)][string]$Project,
  [Parameter(Mandatory=$true)][string]$InFile
)

if (-not (Test-Path $InFile)) { throw "Arquivo não encontrado: $InFile" }

# Lê o dump e faz restore dentro do container.
Get-Content -Encoding Byte -Path $InFile | docker compose --env-file $EnvFile -p $Project exec -T db sh -lc 'PGPASSWORD="$POSTGRES_PASSWORD" pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists'

Write-Host "Restore concluído a partir de: $InFile"
