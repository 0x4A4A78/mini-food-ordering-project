$ErrorActionPreference = 'Stop'
$source = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$target = Join-Path $env:USERPROFILE 'food-ordering-deploy'
New-Item -ItemType Directory -Force -Path $target | Out-Null
$taskName = 'MiniProjectFoodOrdering'
$task = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if ($task) { Stop-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue; Start-Sleep -Seconds 1 }
Copy-Item (Join-Path $source 'server.js') $target -Force
Copy-Item (Join-Path $source 'package.json') $target -Force
foreach ($folder in @('src', 'dist')) {
    $destination = Join-Path $target $folder
    if (Test-Path $destination) { Remove-Item $destination -Recurse -Force }
    Copy-Item (Join-Path $source $folder) $destination -Recurse -Force
}
$port = if ($env:DEPLOY_PORT) { [int]$env:DEPLOY_PORT } else { 3001 }
$node = (Get-Command node).Source
$runner = Join-Path $target 'run-server.ps1'
@"
`$env:PORT = '$port'
`$env:DATA_FILE = '$(Join-Path $target 'data\orders.json')'
Set-Location '$target'
& '$node' server.js
"@ | Set-Content $runner
$existing = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if ($existing) { throw "Port $port is in use by PID $($existing.OwningProcess)" }
$action = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument ('-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "' + $runner + '"')
$principal = New-ScheduledTaskPrincipal -UserId 'SYSTEM' -LogonType ServiceAccount
Register-ScheduledTask -TaskName $taskName -Action $action -Principal $principal -Force | Out-Null
Start-ScheduledTask -TaskName $taskName
Start-Sleep -Seconds 2
$health = Invoke-RestMethod -Uri "http://localhost:$port/api/health" -TimeoutSec 5
if (-not $health.ok) { throw 'Deployment health check failed' }
Write-Host "Deployed and health checked: http://localhost:$port"
