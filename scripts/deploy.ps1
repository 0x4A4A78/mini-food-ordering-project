$ErrorActionPreference = 'Stop'
$source = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$target = Join-Path $env:USERPROFILE 'food-ordering-deploy'
New-Item -ItemType Directory -Force -Path $target | Out-Null
$pidFile = Join-Path $target 'server.pid'
if (Test-Path $pidFile) {
    $oldPid = [int](Get-Content $pidFile -Raw)
    $oldProcess = Get-Process -Id $oldPid -ErrorAction SilentlyContinue
    if ($oldProcess -and $oldProcess.ProcessName -eq 'node') { Stop-Process -Id $oldPid -Force; Start-Sleep -Seconds 1 }
}
Copy-Item (Join-Path $source 'server.js') $target -Force
Copy-Item (Join-Path $source 'package.json') $target -Force
foreach ($folder in @('src', 'dist')) {
    $destination = Join-Path $target $folder
    if (Test-Path $destination) { Remove-Item $destination -Recurse -Force }
    Copy-Item (Join-Path $source $folder) $destination -Recurse -Force
}
$port = if ($env:DEPLOY_PORT) { [int]$env:DEPLOY_PORT } else { 3001 }
$env:PORT = "$port"
$env:DATA_FILE = Join-Path $target 'data\orders.json'
$existing = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if ($existing) { throw "Port $port is in use by PID $($existing.OwningProcess)" }
$process = Start-Process -FilePath (Get-Command node).Source -ArgumentList 'server.js' -WorkingDirectory $target -WindowStyle Hidden -PassThru
Set-Content -Path $pidFile -Value $process.Id
Start-Sleep -Seconds 2
$health = Invoke-RestMethod -Uri "http://localhost:$port/api/health" -TimeoutSec 5
if (-not $health.ok) { throw 'Deployment health check failed' }
Write-Host "Deployed and health checked: http://localhost:$port"
