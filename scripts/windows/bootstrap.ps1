$ErrorActionPreference = 'Stop'

Write-Host "== Tax Software Windows Bootstrap ==" -ForegroundColor Cyan
Write-Host "Repo: $PSScriptRoot\..\.."

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
Set-Location $repoRoot

function Step($msg) { Write-Host "`n--> $msg" -ForegroundColor Yellow }

Step "Checking Node/npm"
$nodeVersion = node --version
$npmVersion = npm --version
Write-Host "Node: $nodeVersion"
Write-Host "npm:  $npmVersion"

Step "Installing dependencies"
npm install

Step "Generating Prisma client"
npx prisma generate

$envFile = Join-Path $repoRoot '.env.local'
if (-not (Test-Path $envFile)) {
  Step "Creating .env.local with local defaults"
  $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
  $bytes = New-Object byte[] 32
  $rng.GetBytes($bytes)
  $generatedSecret = ($bytes | ForEach-Object { $_.ToString('x2') }) -join ''
  @"
NEXTAUTH_SECRET=$generatedSecret
NEXTAUTH_URL=http://localhost:3000
"@ | Set-Content -Path $envFile -Encoding UTF8
} else {
  Step "Validating .env.local"
  $envRaw = Get-Content $envFile -Raw
  if ($envRaw -notmatch 'NEXTAUTH_SECRET=') {
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $bytes = New-Object byte[] 32
    $rng.GetBytes($bytes)
    $generatedSecret = ($bytes | ForEach-Object { $_.ToString('x2') }) -join ''
    Add-Content -Path $envFile -Value "`nNEXTAUTH_SECRET=$generatedSecret"
    Write-Host "Added NEXTAUTH_SECRET to .env.local"
  }
  if ($envRaw -notmatch 'NEXTAUTH_URL=') {
    Add-Content -Path $envFile -Value "`nNEXTAUTH_URL=http://localhost:3000"
    Write-Host "Added NEXTAUTH_URL to .env.local"
  }
}

Step "Applying Prisma schema to local DB"
npx prisma db push

Write-Host "`n[OK] Bootstrap complete" -ForegroundColor Green
Write-Host "Next steps:"
Write-Host "  1) Run app:      npm run win:run"
Write-Host "  2) Open app:     http://localhost:3000"
Write-Host "  3) Create account from /auth/register"
Write-Host "  4) Verify health: npm run win:verify"
Write-Host "  5) QA gate:      npm run win:qa"
