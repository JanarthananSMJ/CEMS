#Requires -Version 5.1
<#
  Windows equivalent of run.sh — installs deps if needed, then runs
  all backend services and the frontend concurrently.

  Usage: powershell -ExecutionPolicy Bypass -File .\run.ps1
     or: right-click -> Run with PowerShell
#>

$ErrorActionPreference = "Stop"

$RootDir     = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendDir  = Join-Path $RootDir "backend"
$FrontendDir = Join-Path $RootDir "frontend"
$LogDir      = Join-Path $RootDir ".run-logs"

$BackendServices = @(
  "auth-service",
  "event-service",
  "gateway",
  "leaderboard-service",
  "notification-service",
  "settings-service"
)

if (-not (Test-Path $LogDir)) {
  New-Item -ItemType Directory -Path $LogDir | Out-Null
}

function Install-IfNeeded {
  param([string]$Dir, [string]$Name)

  if (-not (Test-Path (Join-Path $Dir "node_modules"))) {
    Write-Host "Installing dependencies for $Name..."
    Push-Location $Dir
    try {
      npm install
      if ($LASTEXITCODE -ne 0) { throw "npm install failed for $Name" }
    } finally {
      Pop-Location
    }
  } else {
    Write-Host "$Name dependencies already installed, skipping."
  }
}

Write-Host "Checking dependencies..."
Install-IfNeeded -Dir $FrontendDir -Name "frontend"
foreach ($svc in $BackendServices) {
  Install-IfNeeded -Dir (Join-Path $BackendDir $svc) -Name "backend/$svc"
}

# Each running service: { Label, Process, LogFile, Reader }
$services = @()

function Start-Labeled {
  param([string]$Dir, [string]$Label)

  $logFile = Join-Path $LogDir "$Label.log"
  if (Test-Path $logFile) { Remove-Item $logFile -Force }
  New-Item -ItemType File -Path $logFile | Out-Null

  # cmd.exe wraps npm so we get a single PID whose process tree
  # (cmd -> npm -> node/nodemon) can be killed together with taskkill /T.
  $psi = @{
    FilePath               = "cmd.exe"
    ArgumentList           = @("/c", "npm run dev >> `"$logFile`" 2>&1")
    WorkingDirectory       = $Dir
    WindowStyle            = "Hidden"
    PassThru               = $true
  }
  $proc = Start-Process @psi

  $script:services += [PSCustomObject]@{
    Label   = $Label
    Process = $proc
    LogFile = $logFile
    Offset  = 0
  }
  Write-Host "  - $Label started (pid $($proc.Id))"
}

Write-Host ""
Write-Host "Starting backend services..."
foreach ($svc in $BackendServices) {
  Start-Labeled -Dir (Join-Path $BackendDir $svc) -Label $svc
}

Write-Host ""
Write-Host "Starting frontend..."
Start-Labeled -Dir $FrontendDir -Label "frontend"

Write-Host ""
Write-Host "All services running. Press Ctrl+C to stop."

function Stop-AllServices {
  Write-Host ""
  Write-Host "Stopping all services..."
  foreach ($svc in $services) {
    if (-not $svc.Process.HasExited) {
      # /T kills the whole process tree (cmd.exe -> npm -> node/nodemon)
      & taskkill /PID $svc.Process.Id /T /F 2>$null | Out-Null
    }
  }
}

function Show-NewLogLines {
  foreach ($svc in $services) {
    if (-not (Test-Path $svc.LogFile)) { continue }
    $stream = [System.IO.File]::Open($svc.LogFile, 'Open', 'Read', 'ReadWrite')
    try {
      $stream.Seek($svc.Offset, 'Begin') | Out-Null
      $reader = New-Object System.IO.StreamReader($stream)
      while ($null -ne ($line = $reader.ReadLine())) {
        Write-Host "[$($svc.Label)] $line"
      }
      $svc.Offset = $stream.Position
    } finally {
      $stream.Close()
    }
  }
}

try {
  while ($true) {
    Show-NewLogLines

    if ([Console]::KeyAvailable) {
      # allow Ctrl+C to be caught below; nothing else to read here
    }

    if ($services | Where-Object { -not $_.Process.HasExited } | Measure-Object | Select-Object -ExpandProperty Count) {
      Start-Sleep -Milliseconds 300
    } else {
      Write-Host "All services exited."
      break
    }
  }
} finally {
  Stop-AllServices
}
