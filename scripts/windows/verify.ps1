$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
Set-Location $repoRoot

Write-Host "== Verifying local setup ==" -ForegroundColor Cyan

$envFile = Join-Path $repoRoot '.env.local'
if (-not (Test-Path $envFile)) {
  Write-Host "[ERROR] .env.local missing." -ForegroundColor Red
  Write-Host "Run: npm run win:setup"
  exit 1
}

$envRaw = Get-Content $envFile -Raw
$missingKeys = @()
if ($envRaw -notmatch '(?m)^NEXTAUTH_SECRET=.+$') { $missingKeys += 'NEXTAUTH_SECRET' }
if ($envRaw -notmatch '(?m)^NEXTAUTH_URL=.+$') { $missingKeys += 'NEXTAUTH_URL' }
if ($missingKeys.Count -gt 0) {
  Write-Host "[ERROR] Missing required env key(s): $($missingKeys -join ', ')" -ForegroundColor Red
  Write-Host "Run: npm run win:setup"
  exit 1
}
Write-Host "[OK] Env looks good"

$prismaClientDefault = Join-Path $repoRoot 'node_modules\.prisma\client\default.js'
if (-not (Test-Path $prismaClientDefault)) {
  Write-Host "Prisma client not found; running npx prisma generate..." -ForegroundColor Yellow
  npx prisma generate | Out-Null
  if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Prisma generate failed." -ForegroundColor Red
    Write-Host "Try: npm install ; npx prisma generate"
    exit 1
  }
}
Write-Host "[OK] Prisma client present"

npx prisma db push | Out-Null
if ($LASTEXITCODE -ne 0) {
  Write-Host "[ERROR] Prisma DB push failed." -ForegroundColor Red
  Write-Host "Run: npm run win:setup"
  exit 1
}
Write-Host "[OK] Prisma DB reachable"

$dbPath = Join-Path $repoRoot 'prisma\dev.db'
if (-not (Test-Path $dbPath)) {
  Write-Host "[ERROR] DB file not found at $dbPath" -ForegroundColor Red
  exit 1
}
Write-Host "[OK] DB file exists"

try {
  $resp = Invoke-WebRequest -Uri 'http://localhost:3000' -TimeoutSec 3
  $ok = ($resp.StatusCode -ge 200) -and ($resp.StatusCode -lt 400)
  if (-not $ok) {
    Write-Host "[ERROR] Unexpected response code: $($resp.StatusCode)" -ForegroundColor Red
    exit 1
  }
  Write-Host "[OK] App route responds (http://localhost:3000)"
}
catch {
  Write-Host "[ERROR] App not reachable at http://localhost:3000" -ForegroundColor Red
  Write-Host "Start it with: npm run win:run"
  exit 1
}

Write-Host "`n[OK] Verify complete" -ForegroundColor Green
