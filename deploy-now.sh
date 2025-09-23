#!/bin/bash

echo "🚀 Starting 9/9/9 Challenge Railway Deployment"
echo "=============================================="
echo ""

# Step 1: Initialize project
echo "📁 Step 1: Initializing Railway project..."
echo "Choose 'Create a new project' and name it 'nine-nine-nine-challenge'"
echo ""
railway init

echo ""
echo "✅ Project initialized!"
echo ""

# Step 1.5: Add PostgreSQL database
echo "🗄️  Step 1.5: Adding PostgreSQL database..."
echo ""
railway add postgresql

echo ""
echo "✅ PostgreSQL database added!"
echo ""

# Step 2: Set up critical environment variables
echo "⚙️  Step 2: Setting up environment variables..."
echo ""

# Generate a secure JWT secret
JWT_SECRET=$(openssl rand -hex 32)
echo "Setting JWT_SECRET..."
railway variables set JWT_SECRET="$JWT_SECRET"

# Set temporary base URL (will update after deployment)
echo "Setting temporary NEXT_PUBLIC_BASE_URL..."
railway variables set NEXT_PUBLIC_BASE_URL="https://nine-nine-nine-challenge-production.up.railway.app"

# Set Stytch live credentials
echo "Setting Stytch live credentials..."
railway variables set STYTCH_PROJECT_ID="project-live-7c65e19a-2a72-4557-8821-0c9a30e05f39"
railway variables set STYTCH_SECRET="REPLACE_WITH_YOUR_SECRET_FROM_DASHBOARD"
railway variables set NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN="public-token-live-3db4577c-26a4-4e70-ba79-dfee03bcbae0"
railway variables set STYTCH_PROJECT_ENV="live"

railway variables set R2_ACCOUNT_ID="REPLACE_WITH_YOUR_CLOUDFLARE_ACCOUNT_ID"
railway variables set R2_ACCESS_KEY_ID="REPLACE_WITH_YOUR_R2_ACCESS_KEY"
railway variables set R2_SECRET_ACCESS_KEY="REPLACE_WITH_YOUR_R2_SECRET_KEY"
railway variables set R2_BUCKET_NAME="the-marina-tech-company"
railway variables set R2_BUCKET_PATH="nine-nine-nine"
railway variables set NEXT_PUBLIC_R2_PUBLIC_URL="https://images.themarinatechcompany.com"

railway variables set PUSHER_APP_ID="temp-app-id"
railway variables set PUSHER_SECRET="temp-secret"
railway variables set NEXT_PUBLIC_PUSHER_KEY="temp-key"
railway variables set NEXT_PUBLIC_PUSHER_CLUSTER="us2"

echo ""
echo "✅ Environment variables set (with temporary values for services)"
echo ""

# Step 3: Deploy
echo "🚀 Step 3: Deploying to Railway..."
echo ""
railway up

echo ""
echo "=============================================="
echo "🎉 Deployment initiated!"
echo ""
echo "📊 Checking deployment status..."
railway status

echo ""
echo "=============================================="
echo "📝 NEXT STEPS:"
echo ""
echo "1. Copy your Railway URL from above"
echo "2. Update the base URL:"
echo "   railway variables set NEXT_PUBLIC_BASE_URL=\"https://YOUR-ACTUAL-URL\""
echo ""
echo "3. Update service credentials when ready:"
echo "   - Stytch: Create account at stytch.com"
echo "   - Cloudflare R2: Create bucket at cloudflare.com"
echo "   - Pusher: Create app at pusher.com (optional)"
echo ""
echo "4. Redeploy after updating variables:"
echo "   railway up"
echo ""
echo "5. Add custom domain (optional):"
echo "   railway domains add 999.themarinatech.company"
echo ""
echo "📋 View logs: railway logs"
echo "🌐 Open dashboard: railway open"
echo "=============================================="