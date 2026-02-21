$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
Set-Location $repoRoot

Write-Host "== Verifying local setup ==" -ForegroundColor Cyan

$envFile = Join-Path $repoRoot '.env.local'
if (-not (Test-Path $envFile)) {
  Write-Error ".env.local missing. Run: npm run win:setup"
}

$envRaw = Get-Content $envFile -Raw
if ($envRaw -notmatch 'NEXTAUTH_SECRET=') { Write-Error "NEXTAUTH_SECRET missing in .env.local" }
if ($envRaw -notmatch 'NEXTAUTH_URL=') { Write-Error "NEXTAUTH_URL missing in .env.local" }
Write-Host "[OK] Env looks good"

npx prisma db push | Out-Null
Write-Host "[OK] Prisma DB reachable"

$dbPath = Join-Path $repoRoot 'prisma\dev.db'
if (-not (Test-Path $dbPath)) {
  Write-Error "DB file not found at $dbPath"
}
Write-Host "[OK] DB file exists"

try {
  $resp = Invoke-WebRequest -Uri 'http://localhost:3000' -TimeoutSec 3
  $ok = ($resp.StatusCode -ge 200) -and ($resp.StatusCode -lt 400)
  if (-not $ok) {
    Write-Error "Unexpected response code: $($resp.StatusCode)"
  }
  Write-Host "[OK] App route responds (http://localhost:3000)"
}
catch {
  Write-Error "App not reachable at http://localhost:3000. Start it with: npm run win:run"
}

Write-Host "`n[OK] Verify complete" -ForegroundColor Green
