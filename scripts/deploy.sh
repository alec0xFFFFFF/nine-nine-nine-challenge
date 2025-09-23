#!/bin/bash

echo "🚀 Deploying 9/9/9 Challenge to Railway..."
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
    echo "✅ Railway CLI installed"
fi

# Check if logged in
if ! railway status &> /dev/null; then
    echo "🔐 Please login to Railway first:"
    echo "   railway login"
    echo ""
    echo "Then run this script again."
    exit 1
fi

# Check if project is initialized
if ! railway status &> /dev/null; then
    echo "📁 Initializing Railway project..."
    railway init
fi

echo "🏗️  Building project locally to check for errors..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix errors before deploying."
    exit 1
fi

echo "✅ Build successful!"
echo ""

echo "🚀 Deploying to Railway..."
railway up

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "📊 Project status:"
    railway status
    echo ""
    echo "🌐 Your app should be available at the URL above"
    echo "📋 Check logs with: npm run logs"
    echo "⚙️  Manage environment variables with: npm run env"
    echo ""
    echo "🔧 Next steps:"
    echo "1. Update NEXT_PUBLIC_BASE_URL environment variable with your Railway URL"
    echo "2. Configure your custom domain if desired"
    echo "3. Test SMS authentication and file uploads"
else
    echo "❌ Deployment failed. Check logs:"
    railway logs
fi