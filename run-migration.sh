#!/bin/bash

echo "🗄️  Running Prisma Migration on Railway"
echo "====================================="
echo ""

echo "Step 1: Switch to web service"
echo "railway service"
echo "  → Select 'nine-nine-nine' (your web service)"
echo ""

echo "Step 2: Run migration"
echo "railway run npx prisma migrate deploy"
echo ""

echo "Step 3: Verify migration"
echo "railway run npx prisma db seed (if you have seed data)"
echo ""

echo "Step 4: Check your app"
echo "Get your Railway URL from the dashboard or:"
echo "railway status"
echo ""

echo "📋 Your beautiful Masters-style 9/9/9 Challenge app"
echo "should now be running with:"
echo "✅ PostgreSQL database"
echo "✅ Prisma schema applied"
echo "✅ Masters Tournament design"
echo "✅ QR codes and join codes"
echo "✅ Real-time leaderboard"
echo ""

echo "🎉 Ready to start tracking golf, hot dogs, and beers!"