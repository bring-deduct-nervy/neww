# Quick Vercel Deployment Script for PowerShell
# Run this script to deploy your application to Vercel

Write-Host "🚀 Sri Lanka Flood Monitor - Vercel Deployment" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# Check if Vercel CLI is installed
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue

if (-not $vercelInstalled) {
    Write-Host "❌ Vercel CLI is not installed." -ForegroundColor Red
    Write-Host ""
    Write-Host "To install Vercel CLI, run:" -ForegroundColor Yellow
    Write-Host "  npm i -g vercel" -ForegroundColor White
    Write-Host ""
    Write-Host "Or deploy via Vercel Dashboard:" -ForegroundColor Yellow
    Write-Host "  https://vercel.com/new" -ForegroundColor White
    exit 1
}

Write-Host "✅ Vercel CLI found" -ForegroundColor Green
Write-Host ""

# Login check
Write-Host "🔐 Checking Vercel login status..." -ForegroundColor Cyan
$loginCheck = vercel whoami 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not logged in to Vercel" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please login first:" -ForegroundColor Yellow
    vercel login
    exit 1
}

Write-Host "✅ Logged in to Vercel" -ForegroundColor Green
Write-Host ""

# Check for uncommitted changes
Write-Host "📝 Checking for uncommitted changes..." -ForegroundColor Cyan
$gitStatus = git status --porcelain

if ($gitStatus) {
    Write-Host "⚠️  You have uncommitted changes." -ForegroundColor Yellow
    Write-Host ""
    $commitChoice = Read-Host "Commit changes before deploying? (y/n)"
    
    if ($commitChoice -eq "y") {
        git add .
        $commitMsg = Read-Host "Enter commit message"
        git commit -m $commitMsg
        Write-Host "✅ Changes committed" -ForegroundColor Green
    }
}

Write-Host ""

# Deploy
Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Cyan
Write-Host ""

$prodChoice = Read-Host "Deploy to production? (y/n)"

if ($prodChoice -eq "y") {
    Write-Host "🌟 Deploying to PRODUCTION..." -ForegroundColor Magenta
    vercel --prod
} else {
    Write-Host "🔍 Deploying to PREVIEW..." -ForegroundColor Yellow
    vercel
}

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Your application is now live!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Open the provided URL in your browser" -ForegroundColor White
Write-Host "  2. Test the dashboard at /" -ForegroundColor White
Write-Host "  3. Check API docs at /docs" -ForegroundColor White
Write-Host "  4. Monitor deployment at https://vercel.com/dashboard" -ForegroundColor White
Write-Host ""
