# Gera os ícones do CEPK Eventos localmente (etapa 8) usando System.Drawing/.NET.
# Roda UMA vez:  powershell -ExecutionPolicy Bypass -File scripts/gerar-icones.ps1
# Saída: src/frontend/pwa/icons/ (192, 512 e 512 "maskable" com zona segura)
# Sem segredos; sem dados pessoais; arte visual placeholder (design final depois).

Add-Type -AssemblyName System.Drawing

$destino = Join-Path $PSScriptRoot "..\src\frontend\pwa\icons"
New-Item -ItemType Directory -Force -Path $destino | Out-Null

$navyFundo = [System.Drawing.Color]::FromArgb(255, 10, 31, 68)   # #0a1f44

function Novo-Icone {
  param([int]$Lado, [string]$Nome, [double]$ProporcaoTexto, [bool]$Maskable)

  $bmp = New-Object System.Drawing.Bitmap($Lado, $Lado)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'
  $g.TextRenderingHint = 'AntiAlias'
  $g.Clear($navyFundo)

  # disco claro central (conteúdo shrink para zona segura quando maskable)
  $escala = if ($Maskable) { 0.60 } else { 0.80 }
  $raio = [double]$Lado * 0.34 * $escala
  $x = ($Lado / 2) - $raio
  $y = ($Lado / 2) - $raio
  $pincelDisco = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 27, 108, 168))
  $g.FillEllipse($pincelDisco, [single]$x, [single]$y, [single]($raio * 2), [single]($raio * 2))

  # texto CEPK centralizado
  $tamanhoFonte = [single]([double]$Lado * $ProporcaoTexto)
  $fonte = New-Object System.Drawing.Font("Segoe UI", $tamanhoFonte, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $pincelTexto = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
  $fmt = New-Object System.Drawing.StringFormat
  $fmt.Alignment = [System.Drawing.StringAlignment]::Center
  $fmt.LineAlignment = [System.Drawing.StringAlignment]::Center
  $g.DrawString("CEPK", $fonte, $pincelTexto, [single]($Lado / 2), [single]($Lado / 2), $fmt)

  $salvar = Join-Path $destino $Nome
  $bmp.Save($salvar, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose()
  Write-Output "gerado: $salvar"
}

Novo-Icone -Lado 192 -Nome "icon-192.png" -ProporcaoTexto 0.30 -Maskable $false
Novo-Icone -Lado 512 -Nome "icon-512.png" -ProporcaoTexto 0.30 -Maskable $false
Novo-Icone -Lado 512 -Nome "icon-maskable-512.png" -ProporcaoTexto 0.22 -Maskable $true
