$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
Set-Location $repoRoot

function Ensure-EnvReady {
  $envFile = Join-Path $repoRoot '.env.local'
  if (-not (Test-Path $envFile)) {
    Write-Host "[ERROR] .env.local is missing." -ForegroundColor Red
    Write-Host "Run this first: npm run win:setup" -ForegroundColor Yellow
    exit 1
  }

  $envRaw = Get-Content $envFile -Raw
  $missing = @()
  if ($envRaw -notmatch '(?m)^NEXTAUTH_SECRET=.+$') { $missing += 'NEXTAUTH_SECRET' }
  if ($envRaw -notmatch '(?m)^NEXTAUTH_URL=.+$') { $missing += 'NEXTAUTH_URL' }

  if ($missing.Count -gt 0) {
    Write-Host "[ERROR] .env.local is missing required key(s): $($missing -join ', ')" -ForegroundColor Red
    Write-Host "Auto-fix with: npm run win:setup" -ForegroundColor Yellow
    exit 1
  }
}

function Ensure-PrismaClient {
  $prismaClientDefault = Join-Path $repoRoot 'node_modules\.prisma\client\default.js'
  if (Test-Path $prismaClientDefault) {
    return
  }

  Write-Host "Prisma client not found. Auto-healing with: npx prisma generate" -ForegroundColor Yellow
  npx prisma generate
  if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to generate Prisma client." -ForegroundColor Red
    Write-Host "Try: npm install ; npx prisma generate" -ForegroundColor Yellow
    exit 1
  }

  if (-not (Test-Path $prismaClientDefault)) {
    Write-Host "[ERROR] Prisma client still missing after generate." -ForegroundColor Red
    Write-Host "Try from a clean install:" -ForegroundColor Yellow
    Write-Host "  Remove-Item -Recurse -Force node_modules"
    Write-Host "  npm install"
    Write-Host "  npx prisma generate"
    exit 1
  }
}

$port = 3000
# Only treat LISTENING sockets as "in use". Ignore TIME_WAIT/CLOSE_WAIT noise.
$conns = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue |
  Where-Object { $_.OwningProcess -gt 0 }
if ($conns) {
  $ownerPid = ($conns | Select-Object -First 1).OwningProcess
  Write-Host "[ERROR] Port $port is already in use by PID $ownerPid" -ForegroundColor Red
  Write-Host "Troubleshooting:" -ForegroundColor Yellow
  Write-Host "  Inspect process: Get-Process -Id $ownerPid"
  Write-Host "  Stop process:    Stop-Process -Id $ownerPid -Force"
  Write-Host "Then run again: npm run win:run"
  exit 1
}

Ensure-EnvReady
Ensure-PrismaClient

Write-Host "Starting dev server..." -ForegroundColor Cyan
Write-Host "App URL: http://localhost:$port" -ForegroundColor Green
npm run dev
