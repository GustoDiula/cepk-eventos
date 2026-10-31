# Inicia o PostgreSQL PORTATIL desta instalacao local (D-011: sem servico do
# Windows, sem Docker - nada sai da maquina).
# Os dados ficam FORA do repositorio:  %LOCALAPPDATA%\cepk-eventos-pg\data
# Uso:  npm run pg:start
#
# IMPORTANTE: este script e 100% ASCII de proposito. O PowerShell 5.1 do
# Windows le arquivos sem BOM como ANSI; acentos/hifens tipograficos viram
# bytes que quebram o parser (bug reproduzido em 2026-10-30). Nao adicionar
# acentos ou em dash aqui.

$ErrorActionPreference = 'Stop'

$raiz  = Join-Path $env:LOCALAPPDATA 'cepk-eventos-pg'
$dados = Join-Path $raiz 'data'
$bin   = Join-Path $raiz 'pgsql\bin'

if (-not (Test-Path (Join-Path $bin 'pg_ctl.exe'))) {
  Write-Error ("pg_ctl nao encontrado em " + $bin + " - a instalacao portatil ainda nao foi extraida.")
  exit 1
}

$portaEmUso = Get-NetTCPConnection -LocalPort 5432 -State Listen -ErrorAction SilentlyContinue
if ($portaEmUso) {
  Write-Output "PostgreSQL ja esta em execucao na porta 5432. Nada a fazer."
  exit 0
}

& "$bin\pg_ctl.exe" -D $dados -o '-p 5432' -l (Join-Path $raiz 'pg.log') start
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

& "$bin\pg_isready.exe" -h 127.0.0.1 -p 5432
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Output 'PostgreSQL ativo na porta 5432.'
