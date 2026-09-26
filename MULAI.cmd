@echo off
chcp 65001 >nul
title Surat Untuk Kamu - Server Lokal
cd /d "%~dp0"

echo.
echo   ============================================
echo    Surat Untuk Kamu - Server Lokal
echo   ============================================
echo.
echo   Buka http://localhost:8000 di browser.
echo   Tekan Ctrl+C untuk berhenti.
echo.

where py >nul 2>nul
if %errorlevel%==0 (
  start "" "http://localhost:8000"
  py -m http.server 8000
  goto :eof
)

where python >nul 2>nul
if %errorlevel%==0 (
  start "" "http://localhost:8000"
  python -m http.server 8000
  goto :eof
)

where npx >nul 2>nul
if %errorlevel%==0 (
  start "" "http://localhost:3000"
  npx --yes serve -l 3000 .
  goto :eof
)

echo   [X] Python / Node.js tidak ditemukan.
echo.
echo   Cara manual: buka index.html langsung (klik ganda).
echo   Catatan: cara manual memakai pengaturan cadangan,
echo   jadi edit config.json tidak akan terbaca.
echo.
pause
