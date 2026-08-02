@echo off
rem Запуск sort_music.ps1 двойным кликом (без возни с ExecutionPolicy).
chcp 65001 >nul
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0sort_music.ps1" %*
echo.
pause
