#!/bin/bash

echo "🚀 Deploying 9/9/9 Challenge to Railway with PostgreSQL"
echo "========================================================"
echo ""

# Step 1: Check if PostgreSQL service exists
echo "📊 Checking for existing PostgreSQL service..."
if railway service ls | grep -q "postgres"; then
    echo "✅ PostgreSQL service already exists"
else
    echo "📦 Adding PostgreSQL service..."
    railway add postgresql
    echo "✅ PostgreSQL service added"
fi

echo ""

# Step 2: Set DATABASE_URL environment variable
echo "⚙️  Setting DATABASE_URL environment variable..."
railway variables set DATABASE_URL="\${{Postgres.DATABASE_URL}}"

echo ""

# Step 3: Generate Prisma client and push schema
echo "🏗️  Generating Prisma client..."
npx prisma generate

echo ""
echo "📊 Pushing database schema to PostgreSQL..."
echo "⚠️  This will create the database tables in your Railway PostgreSQL instance"
read -p "Continue? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Set a temporary DATABASE_URL for local schema push
    if [ -n "$DATABASE_URL" ]; then
        echo "📤 Pushing schema to Railway PostgreSQL..."
        npx prisma db push --accept-data-loss
    else
        echo "⚠️  DATABASE_URL not set locally. Schema will be applied on first deployment."
    fi
else
    echo "⏭️  Skipping schema push. You can run 'npx prisma db push' later."
fi

echo ""

# Step 4: Build and deploy
echo "🏗️  Building project locally to check for errors..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix errors before deploying."
    exit 1
fi

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
    echo "🔗 Next steps:"
    echo "1. Copy your Railway URL from above"
    echo "2. Update NEXT_PUBLIC_BASE_URL:"
    echo "   railway variables set NEXT_PUBLIC_BASE_URL=\"https://your-actual-url\""
    echo ""
    echo "3. Your PostgreSQL database is ready!"
    echo "4. Set up your service credentials (Stytch, R2, etc.)"
    echo "5. Test the full application"
    echo ""
    echo "📋 Useful commands:"
    echo "   railway logs           - View deployment logs"
    echo "   railway variables      - View environment variables"
    echo "   npx prisma studio      - Open database admin UI"
else
    echo "❌ Deployment failed. Check logs:"
    railway logs
fi