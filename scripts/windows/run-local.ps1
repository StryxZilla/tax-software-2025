$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
Set-Location $repoRoot

$port = 3000
$conns = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
if ($conns) {
  $pid = $conns[0].OwningProcess
  Write-Host "⚠ Port $port is already in use by PID $pid" -ForegroundColor Yellow
  Write-Host "Troubleshooting:" -ForegroundColor Yellow
  Write-Host "  Stop process: Stop-Process -Id $pid -Force"
  Write-Host "  Or inspect:    Get-Process -Id $pid"
  exit 1
}

Write-Host "Starting dev server..." -ForegroundColor Cyan
Write-Host "App URL: http://localhost:$port" -ForegroundColor Green
npm run dev
