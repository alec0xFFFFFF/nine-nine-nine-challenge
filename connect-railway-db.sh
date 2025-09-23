#!/bin/bash

echo "🚄 Railway Database Connection Setup"
echo "===================================="
echo ""

echo "1. Link to your Railway project and service:"
echo "   railway link"
echo "   (Select: nine-nine-nine project → web service)"
echo ""

echo "2. Connect to PostgreSQL database:"
echo "   railway connect postgresql"
echo "   (This opens a psql connection to your database)"
echo ""

echo "3. Run Prisma migrations on Railway database:"
echo "   railway run npx prisma migrate deploy"
echo "   (This applies your schema to the Railway PostgreSQL)"
echo ""

echo "4. Generate Prisma client for Railway environment:"
echo "   railway run npx prisma generate"
echo ""

echo "5. Check database connection:"
echo "   railway run npx prisma db seed"
echo "   (Optional: if you have seed data)"
echo ""

echo "6. View your Railway database URL:"
echo "   railway variables"
echo "   (Look for DATABASE_URL)"
echo ""

echo "📋 Alternative: One-line migration"
echo "railway run 'npx prisma migrate deploy && npx prisma generate'"
echo ""

echo "🔍 Debug database issues:"
echo "railway logs --service postgresql"
echo ""

echo "📊 Check service status:"
echo "railway status"
echo ""

echo "⚡ Quick database reset (if needed):"
echo "railway run npx prisma migrate reset --force"
echo ""

echo "🎯 After connecting, you can run your app with Railway's database:"
echo "railway run npm run dev"
echo ""

echo "📝 Note: Make sure you've added PostgreSQL service to your project:"
echo "railway add postgresql"