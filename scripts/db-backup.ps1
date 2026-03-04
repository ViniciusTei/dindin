param(
  [Parameter(Mandatory=$true)][string]$EnvFile,
  [Parameter(Mandatory=$true)][string]$Project,
  [Parameter(Mandatory=$true)][string]$OutFile
)

$dir = Split-Path -Parent $OutFile
if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }

# pg_dump roda dentro do container do Postgres; o output é redirecionado para um arquivo no host.
docker compose --env-file $EnvFile -p $Project exec -T db sh -lc 'PGPASSWORD="$POSTGRES_PASSWORD" pg_dump -Fc -U "$POSTGRES_USER" "$POSTGRES_DB"' | Set-Content -Encoding Byte -Path $OutFile

Write-Host "Backup salvo em: $OutFile"
