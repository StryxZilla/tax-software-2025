$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
Set-Location $repoRoot

Write-Host "== Local QA bootstrap ==" -ForegroundColor Cyan

$envFile = Join-Path $repoRoot '.env.local'
if (-not (Test-Path $envFile)) {
  @"
NEXTAUTH_SECRET=taxflow-local-dev-secret-change-me
NEXTAUTH_URL=http://localhost:3000
"@ | Set-Content -Path $envFile -Encoding UTF8
  Write-Host "Created .env.local"
}

$envRaw = Get-Content $envFile -Raw
if ($envRaw -notmatch '(?m)^NEXTAUTH_SECRET=.+$') {
  Add-Content -Path $envFile -Value "`r`nNEXTAUTH_SECRET=taxflow-local-dev-secret-change-me"
  Write-Host "Added NEXTAUTH_SECRET"
}
if ($envRaw -notmatch '(?m)^NEXTAUTH_URL=.+$') {
  Add-Content -Path $envFile -Value "`r`nNEXTAUTH_URL=http://localhost:3000"
  Write-Host "Added NEXTAUTH_URL"
}

$prismaClientDefault = Join-Path $repoRoot 'node_modules\.prisma\client\default.js'
if (-not (Test-Path $prismaClientDefault)) {
  Write-Host "Prisma client missing; running npx prisma generate..." -ForegroundColor Yellow
  npx prisma generate | Out-Null
  if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Prisma generate failed." -ForegroundColor Red
    exit 1
  }
}

Write-Host "Running quick QA + release gate..." -ForegroundColor Yellow
npm run qa:quick
if ($LASTEXITCODE -ne 0) { exit 1 }
npm run qa:release-gate
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "`n[OK] QA bootstrap complete" -ForegroundColor Green
