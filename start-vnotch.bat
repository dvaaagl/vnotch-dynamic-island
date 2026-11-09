@echo off
cd /d "%~dp0"
if exist "release\VNotch-win32-x64\VNotch.exe" (
    start "" "release\VNotch-win32-x64\VNotch.exe"
) else (
    call npm start
)
