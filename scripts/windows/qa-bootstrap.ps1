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
if ($envRaw -notmatch 'NEXTAUTH_SECRET=') {
  Add-Content -Path $envFile -Value "`nNEXTAUTH_SECRET=taxflow-local-dev-secret-change-me"
  Write-Host "Added NEXTAUTH_SECRET"
}
if ($envRaw -notmatch 'NEXTAUTH_URL=') {
  Add-Content -Path $envFile -Value "`nNEXTAUTH_URL=http://localhost:3000"
  Write-Host "Added NEXTAUTH_URL"
}

Write-Host "Running quick QA + release gate..." -ForegroundColor Yellow
npm run qa:quick
npm run qa:release-gate

Write-Host "`n[OK] QA bootstrap complete" -ForegroundColor Green
