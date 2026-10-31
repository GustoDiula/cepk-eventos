# Para o PostgreSQL portatil local (termino limpo, modo fast).
# Os dados ficam FORA do repositorio:  %LOCALAPPDATA%\cepk-eventos-pg\data
# Uso:  npm run pg:stop
#
# IMPORTANTE: este script e 100% ASCII de proposito (mesmo motivo do
# pgsql-start.ps1 - o PowerShell 5.1 trata acentos sem BOM como ANSI).

$ErrorActionPreference = 'Stop'

$raiz = Join-Path $env:LOCALAPPDATA 'cepk-eventos-pg'
$bin  = Join-Path $raiz 'pgsql\bin'

if (-not (Test-Path (Join-Path $bin 'pg_ctl.exe'))) {
  Write-Error ("pg_ctl nao encontrado em " + $bin + " - a instalacao portatil ainda nao foi extraida.")
  exit 1
}

$portaEmUso = Get-NetTCPConnection -LocalPort 5432 -State Listen -ErrorAction SilentlyContinue
if (-not $portaEmUso) {
  Write-Output 'PostgreSQL ja esta parado. Nada a fazer.'
  exit 0
}

& "$bin\pg_ctl.exe" -D (Join-Path $raiz 'data') -m fast stop
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Output 'PostgreSQL parado.'
