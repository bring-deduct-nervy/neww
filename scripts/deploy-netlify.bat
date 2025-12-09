@echo off
REM Netlify Deployment Script for ResQ Unified (Windows)

echo.
echo 🚀 ResQ Unified - Netlify Deployment Script (Windows)
echo ====================================================
echo.

REM Check Node version
echo 📋 Checking environment...
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo Node version: %NODE_VERSION%

REM Check npm version
for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo npm version: %NPM_VERSION%
echo.

REM Clean install
echo 🔄 Installing dependencies...
call npm ci
if errorlevel 1 (
    echo ✗ Dependencies installation failed
    exit /b 1
)
echo ✓ Dependencies installed
echo.

REM Build
echo 🔨 Building for production...
call npm run build
if errorlevel 1 (
    echo ✗ Build failed
    exit /b 1
)
echo ✓ Build successful
echo.

REM Check dist folder
echo 📦 Checking build artifacts...
if exist "dist" (
    echo ✓ Build artifacts verified
) else (
    echo ✗ dist folder not found
    exit /b 1
)
echo.

REM Summary
echo.
echo ====================================================
echo ✅ Ready for Netlify deployment!
echo ====================================================
echo.
echo Next steps:
echo 1. Commit and push to GitHub
echo 2. Netlify will automatically build and deploy
echo 3. Check https://app.netlify.com for deployment status
echo.
echo Or manually deploy with:
echo   netlify deploy --prod --dir=dist
echo.
pause
