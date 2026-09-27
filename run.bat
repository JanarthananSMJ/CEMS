@echo off
REM Double-click friendly launcher for run.ps1 (bypasses execution policy for this run only)
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0run.ps1"
pause
