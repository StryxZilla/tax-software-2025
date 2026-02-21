param(
  [switch]$CreateTestUser
)

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

$envFile = Join-Path $repoRoot '.env.local'
if (-not (Test-Path $envFile)) {
  Step "Creating .env.local with safe local defaults"
  @"
NEXTAUTH_SECRET=taxflow-local-dev-secret-change-me
NEXTAUTH_URL=http://localhost:3000
"@ | Set-Content -Path $envFile -Encoding UTF8
} else {
  Step "Validating .env.local"
  $envRaw = Get-Content $envFile -Raw
  if ($envRaw -notmatch 'NEXTAUTH_SECRET=') {
    Add-Content -Path $envFile -Value "`nNEXTAUTH_SECRET=taxflow-local-dev-secret-change-me"
    Write-Host "Added NEXTAUTH_SECRET to .env.local"
  }
  if ($envRaw -notmatch 'NEXTAUTH_URL=') {
    Add-Content -Path $envFile -Value "`nNEXTAUTH_URL=http://localhost:3000"
    Write-Host "Added NEXTAUTH_URL to .env.local"
  }
}

Step "Applying Prisma schema to local DB"
npx prisma db push

if ($CreateTestUser) {
  Step "Creating optional test user"
  node create-test-user.js
} else {
  Write-Host "`n(Optional) To create test user now: npm run win:setup:test-user" -ForegroundColor DarkCyan
}

Write-Host "`n[OK] Bootstrap complete" -ForegroundColor Green
Write-Host "Next steps:"
Write-Host "  1) Run app:      npm run win:run"
Write-Host "  2) Verify health: npm run win:verify"
Write-Host "  3) QA gate:      npm run win:qa"
