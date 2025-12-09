#!/bin/bash

# ResQ-Unified Development Setup Script
# This script sets up the development environment for ResQ-Unified

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════╗"
echo "║     ResQ-Unified Development Environment Setup        ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Check Node.js version
echo "Checking Node.js version..."
NODE_VERSION=$(node -v)
if [[ ! $NODE_VERSION =~ v1[89]|v2 ]]; then
    echo "❌ Node.js 18+ is required. Current version: $NODE_VERSION"
    exit 1
fi
echo "✓ Node.js $NODE_VERSION"

# Check npm
echo "Checking npm..."
NPM_VERSION=$(npm -v)
echo "✓ npm $NPM_VERSION"

# Create .env.local if it doesn't exist
echo ""
echo "Setting up environment variables..."
if [ ! -f .env.local ]; then
    cat > .env.local << EOF
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: API Keys
VITE_WEATHER_API_KEY=
VITE_OPENAI_API_KEY=
VITE_GOOGLE_MAPS_KEY=

# Development flags
VITE_DEBUG_MODE=true
EOF
    echo "✓ Created .env.local (update with your Supabase credentials)"
else
    echo "✓ .env.local already exists"
fi

# Install dependencies
echo ""
echo "Installing dependencies..."
npm install
echo "✓ Dependencies installed"

# Create git hooks
echo ""
echo "Setting up git hooks..."
mkdir -p .git/hooks

cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
npm run lint
EOF

chmod +x .git/hooks/pre-commit
echo "✓ Git hooks configured"

# Database setup (if Supabase CLI is installed)
echo ""
if command -v supabase &> /dev/null; then
    echo "Supabase CLI found. Setting up database..."
    echo "To link your project, run:"
    echo "  supabase link --project-id your-project-id"
    echo "  supabase db push"
else
    echo "ℹ  Supabase CLI not found. Install with:"
    echo "  npm install -g supabase"
fi

# Display next steps
echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║              Setup Complete!                          ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "1. Update VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local"
echo "2. Run 'npm run dev' to start development server"
echo "3. Open http://localhost:5173 in your browser"
echo ""
echo "For more information:"
echo "  - Documentation: https://github.com/your-org/resq-unified/wiki"
echo "  - Issues: https://github.com/your-org/resq-unified/issues"
echo ""
