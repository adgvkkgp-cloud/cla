@echo off
rem  Double-click: starts the server for opening the taxonomies on a phone.
rem  All messages are printed by serve.py; this file stays ASCII-only
rem  because cmd reads .bat files in the OEM code page.

cd /d "%~dp0"

set "PY="
py -3 --version >nul 2>nul && set "PY=py -3"
if not defined PY (python --version >nul 2>nul && set "PY=python")
if not defined PY (python3 --version >nul 2>nul && set "PY=python3")
if not defined PY goto nopython

%PY% serve.py %*
if errorlevel 1 pause
goto :eof

:nopython
echo.
echo   Python 3 not found.
echo   Install it from https://www.python.org/downloads/
echo   and tick "Add python.exe to PATH" in the installer,
echo   then double-click this file again.
echo.
pause
