#!/bin/bash

echo "⚙️  Setting up Railway environment variables..."
echo ""

# Function to set a variable if it doesn't exist
set_var() {
    local var_name=$1
    local var_description=$2
    local default_value=$3
    
    echo "Setting $var_name ($var_description)..."
    
    if [ -n "$default_value" ]; then
        railway variables set $var_name="$default_value"
    else
        echo "⚠️  Please set $var_name manually:"
        echo "   railway variables set $var_name=\"your-value\""
    fi
}

echo "Setting required environment variables..."
echo ""

# Required variables
set_var "JWT_SECRET" "JWT secret key" "your-super-secure-jwt-secret-$(openssl rand -hex 16)"
set_var "NEXT_PUBLIC_BASE_URL" "Base URL for the app" "https://your-app.up.railway.app"

echo ""
echo "🔐 Stytch SMS Authentication variables (get from stytch.com):"
set_var "STYTCH_PROJECT_ID" "Stytch project ID"
set_var "STYTCH_SECRET" "Stytch secret"
set_var "NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN" "Stytch public token"
set_var "STYTCH_PROJECT_ENV" "Stytch environment" "test"

echo ""
echo "☁️  Cloudflare R2 Storage variables (get from cloudflare.com):"
set_var "R2_ACCOUNT_ID" "R2 account ID"
set_var "R2_ACCESS_KEY_ID" "R2 access key ID"
set_var "R2_SECRET_ACCESS_KEY" "R2 secret access key"
set_var "R2_BUCKET_NAME" "R2 bucket name" "nine-nine-nine"
set_var "NEXT_PUBLIC_R2_PUBLIC_URL" "R2 public URL"

echo ""
echo "📡 Pusher (optional - for real-time updates):"
set_var "PUSHER_APP_ID" "Pusher app ID"
set_var "PUSHER_SECRET" "Pusher secret"
set_var "NEXT_PUBLIC_PUSHER_KEY" "Pusher public key"
set_var "NEXT_PUBLIC_PUSHER_CLUSTER" "Pusher cluster" "us2"

echo ""
echo "✅ Environment setup complete!"
echo ""
echo "📋 View all variables: railway variables"
echo "🚀 Deploy your app: npm run deploy"
echo ""
echo "⚠️  Remember to:"
echo "1. Set up your Stytch account for SMS authentication"
echo "2. Create a Cloudflare R2 bucket for media storage"
echo "3. Update NEXT_PUBLIC_BASE_URL with your actual Railway URL after first deployment"