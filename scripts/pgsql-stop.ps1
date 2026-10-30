# Para o PostgreSQL portátil local (término limpo, modo fast).
# Os dados ficam FORA do repositório:  %LOCALAPPDATA%\cepk-eventos-pg\data
# Uso:  npm run pg:stop
$raiz  = Join-Path $env:LOCALAPPDATA 'cepk-eventos-pg'
$dados = Join-Path $raiz 'data'
$pgCtl = Join-Path $raiz 'pgsql\bin\pg_ctl.exe'

if (-not (Test-Path $pgCtl)) {
  Write-Error "pg_ctl não encontrado em $pgCtl — a instalação portátil ainda não foi extraída."
  exit 1
}

& $pgCtl -D $dados -m fast stop
