@echo off
title Digital Bazar Peshawar - Expo Go
cd /d "%~dp0"

echo ========================================================
echo   Digital Bazar Peshawar - Expo Mobile App (SDK 52)
echo ========================================================
echo.

if not exist "node_modules\expo" (
    echo [Step 1/2] Installing Expo packages... Please wait 1-2 minutes...
    call npm install
) else (
    echo [Step 1/2] Expo packages verified!
)

echo.
echo [Step 2/2] Starting Expo Server (Clearing cache for clean start)...
echo ========================================================
echo   Scan the QR Code with Expo Go on your mobile phone!
echo ========================================================
echo.

call npx expo start -c
pause
