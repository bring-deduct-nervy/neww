#!/bin/bash
# Netlify Deployment Script for ResQ Unified

set -e

echo "🚀 ResQ Unified - Netlify Deployment Script"
echo "=================================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Node version
echo -e "${BLUE}📋 Checking environment...${NC}"
NODE_VERSION=$(node -v | cut -d'v' -f2)
echo "Node version: $NODE_VERSION"

if [[ ! "$NODE_VERSION" =~ ^20\. ]]; then
  echo -e "${YELLOW}⚠️  Warning: Expected Node 20.x but found $NODE_VERSION${NC}"
  echo "Consider installing Node 20.19.0 or higher"
fi

# Check npm version
NPM_VERSION=$(npm -v)
echo "npm version: $NPM_VERSION"
echo ""

# Clean install
echo -e "${BLUE}🔄 Installing dependencies...${NC}"
npm ci
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Build
echo -e "${BLUE}🔨 Building for production...${NC}"
npm run build
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Build successful${NC}"
else
  echo -e "${RED}✗ Build failed${NC}"
  exit 1
fi
echo ""

# Check dist folder
echo -e "${BLUE}📦 Checking build artifacts...${NC}"
if [ -d "dist" ]; then
  SIZE=$(du -sh dist | cut -f1)
  FILES=$(find dist -type f | wc -l)
  echo "Build size: $SIZE"
  echo "Files: $FILES"
  echo -e "${GREEN}✓ Build artifacts verified${NC}"
else
  echo -e "${RED}✗ dist folder not found${NC}"
  exit 1
fi
echo ""

# Summary
echo -e "${GREEN}=================================================="
echo "✅ Ready for Netlify deployment!"
echo "=================================================="
echo ""
echo "Next steps:"
echo "1. Commit and push to GitHub"
echo "2. Netlify will automatically build and deploy"
echo "3. Check https://app.netlify.com for deployment status"
echo ""
echo "Or manually deploy with:"
echo "  netlify deploy --prod --dir=dist"
echo ""
