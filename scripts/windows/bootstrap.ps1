$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
Set-Location $repoRoot

function Step($msg) { Write-Host "`n--> $msg" -ForegroundColor Yellow }

function Fail-StaleCheckout($reason) {
  Write-Host "`n[ERROR] $reason" -ForegroundColor Red
  Write-Host "This looks like a stale or partial checkout." -ForegroundColor Red
  Write-Host "Run these commands, then retry:" -ForegroundColor Yellow
  Write-Host "  git fetch --all --prune"
  Write-Host "  git checkout master"
  Write-Host "  git pull --ff-only"
  Write-Host "  npm install"
  exit 1
}

function Assert-WindowsScriptsPresent {
  $packageJson = Join-Path $repoRoot 'package.json'
  if (-not (Test-Path $packageJson)) { Fail-StaleCheckout "package.json not found at repo root." }

  $pkgRaw = Get-Content $packageJson -Raw
  foreach ($scriptName in @('win:setup','win:run','win:verify','win:qa')) {
    if ($pkgRaw -notmatch [regex]::Escape("`"$scriptName`"")) {
      Fail-StaleCheckout "Missing npm script '$scriptName' in package.json."
    }
  }

  foreach ($requiredFile in @(
    'scripts\windows\bootstrap.ps1',
    'scripts\windows\run-local.ps1',
    'scripts\windows\verify.ps1',
    'scripts\windows\qa-bootstrap.ps1'
  )) {
    if (-not (Test-Path (Join-Path $repoRoot $requiredFile))) {
      Fail-StaleCheckout "Missing file '$requiredFile'."
    }
  }
}

function New-HexSecret {
  $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
  try {
    $bytes = New-Object byte[] 32
    $rng.GetBytes($bytes)
    return ($bytes | ForEach-Object { $_.ToString('x2') }) -join ''
  }
  finally {
    if ($null -ne $rng) { $rng.Dispose() }
  }
}

function Ensure-EnvLocal {
  $envFile = Join-Path $repoRoot '.env.local'

  if (-not (Test-Path $envFile)) {
    Step "Creating .env.local with local defaults"
    @"
NEXTAUTH_SECRET=$(New-HexSecret)
NEXTAUTH_URL=http://localhost:3000
"@ | Set-Content -Path $envFile -Encoding UTF8
    return
  }

  Step "Validating .env.local"
  $envRaw = Get-Content $envFile -Raw

  if ($envRaw -notmatch '(?m)^NEXTAUTH_SECRET=.+$') {
    Add-Content -Path $envFile -Value "`r`nNEXTAUTH_SECRET=$(New-HexSecret)"
    Write-Host "Added NEXTAUTH_SECRET to .env.local"
  }

  if ($envRaw -notmatch '(?m)^NEXTAUTH_URL=.+$') {
    Add-Content -Path $envFile -Value "`r`nNEXTAUTH_URL=http://localhost:3000"
    Write-Host "Added NEXTAUTH_URL to .env.local"
  }
}

Write-Host "== Tax Software Windows Bootstrap ==" -ForegroundColor Cyan
Write-Host "Repo: $repoRoot"

Assert-WindowsScriptsPresent

Step "Checking Node/npm"
$nodeVersion = node --version
if ($LASTEXITCODE -ne 0) { throw "Node.js is not available in PATH." }
$npmVersion = npm --version
if ($LASTEXITCODE -ne 0) { throw "npm is not available in PATH." }
Write-Host "Node: $nodeVersion"
Write-Host "npm:  $npmVersion"

Step "Installing dependencies"
npm install
if ($LASTEXITCODE -ne 0) { throw "npm install failed." }

Step "Generating Prisma client"
npx prisma generate
if ($LASTEXITCODE -ne 0) { throw "Prisma generate failed." }

Ensure-EnvLocal

Step "Applying Prisma schema to local DB"
npx prisma db push
if ($LASTEXITCODE -ne 0) { throw "Prisma db push failed." }

Write-Host "`n[OK] Bootstrap complete" -ForegroundColor Green
Write-Host "Next steps:"
Write-Host "  1) Run app:       npm run win:run"
Write-Host "  2) Open app:      http://localhost:3000"
Write-Host "  3) Create account from /auth/register"
Write-Host "  4) Verify health: npm run win:verify"
Write-Host "  5) QA gate:       npm run win:qa"
