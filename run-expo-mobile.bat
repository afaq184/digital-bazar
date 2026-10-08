@echo off
title Digital Bazar Peshawar - Expo Go
cd /d "%~dp0\expo-app"

echo ========================================================
echo   Digital Bazar Peshawar - Expo Mobile App (SDK 52)
echo ========================================================
echo.

if not exist "node_modules\expo" (
    echo Installing Expo packages... Please wait 1-2 minutes...
    call npm install
) else (
    echo Expo packages verified!
)

echo.
echo Starting Expo Server...
echo Scan the QR Code below with your mobile Expo Go app!
echo.

call npx expo start -c
pause
