@echo off
start "Retro Voice Engine Server" /min cmd.exe /d /s /c "cd /d ""%~dp0"" && npm.cmd run preview"
powershell.exe -NoProfile -Command "Start-Sleep -Milliseconds 800"
start "" "http://127.0.0.1:4874"
