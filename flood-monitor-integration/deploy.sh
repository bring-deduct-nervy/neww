#!/bin/bash

# Quick Vercel Deployment Script
# Run this script to deploy your application to Vercel

echo "🚀 Sri Lanka Flood Monitor - Vercel Deployment"
echo "=============================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null
then
    echo "❌ Vercel CLI is not installed."
    echo ""
    echo "To install Vercel CLI, run:"
    echo "  npm i -g vercel"
    echo ""
    echo "Or deploy via Vercel Dashboard:"
    echo "  https://vercel.com/new"
    exit 1
fi

echo "✅ Vercel CLI found"
echo ""

# Login check
echo "🔐 Checking Vercel login status..."
vercel whoami &> /dev/null

if [ $? -ne 0 ]; then
    echo "❌ Not logged in to Vercel"
    echo ""
    echo "Please login first:"
    vercel login
    exit 1
fi

echo "✅ Logged in to Vercel"
echo ""

# Commit changes
echo "📝 Checking for uncommitted changes..."
if [[ -n $(git status -s) ]]; then
    echo "⚠️  You have uncommitted changes."
    echo ""
    read -p "Commit changes before deploying? (y/n): " commit_choice
    
    if [ "$commit_choice" = "y" ]; then
        git add .
        read -p "Enter commit message: " commit_msg
        git commit -m "$commit_msg"
        echo "✅ Changes committed"
    fi
fi

echo ""

# Deploy
echo "🚀 Deploying to Vercel..."
echo ""

read -p "Deploy to production? (y/n): " prod_choice

if [ "$prod_choice" = "y" ]; then
    echo "🌟 Deploying to PRODUCTION..."
    vercel --prod
else
    echo "🔍 Deploying to PREVIEW..."
    vercel
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Your application is now live!"
echo ""
echo "Next steps:"
echo "  1. Open the provided URL in your browser"
echo "  2. Test the dashboard at /"
echo "  3. Check API docs at /docs"
echo "  4. Monitor deployment at https://vercel.com/dashboard"
echo ""
