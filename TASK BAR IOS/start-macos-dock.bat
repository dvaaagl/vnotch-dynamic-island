@echo off
cd /d "%~dp0"
if exist "release\MacOSDock-win32-x64\MacOSDock.exe" (
    start "" "release\MacOSDock-win32-x64\MacOSDock.exe"
) else (
    call npm start
)
