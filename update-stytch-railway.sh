#!/bin/bash

echo "🔐 Updating Railway with Stytch Live Credentials"
echo "=============================================="
echo ""

# Set Stytch live credentials
echo "Setting Stytch Project ID..."
railway variables set STYTCH_PROJECT_ID="project-live-7c65e19a-2a72-4557-8821-0c9a30e05f39"

echo "Setting Stytch Public Token..."
railway variables set NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN="public-token-live-3db4577c-26a4-4e70-ba79-dfee03bcbae0"

echo "Setting Stytch Environment to live..."
railway variables set STYTCH_PROJECT_ENV="live"

echo ""
echo "⚠️  IMPORTANT: You still need to:"
echo "1. Go to your Stytch dashboard"
echo "2. Create a new Secret (under 'Secrets' section)"
echo "3. Copy the secret value"
echo "4. Run: railway variables set STYTCH_SECRET=\"your-secret-here\""
echo ""
echo "📋 Current Stytch configuration:"
echo "Project ID: project-live-7c65e19a-2a72-4557-8821-0c9a30e05f39"
echo "Public Token: public-token-live-3db4577c-26a4-4e70-ba79-dfee03bcbae0"
echo "Environment: live"
echo ""
echo "✅ Public credentials updated!"
echo "⏳ Waiting for you to create and set the secret..."