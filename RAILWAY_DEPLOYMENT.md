# 🚀 Railway Deployment Guide for 9/9/9 Challenge

## Step 1: Login to Railway
Run this in your terminal (it will open a browser):
```bash
railway login
```

## Step 2: Initialize Railway Project
```bash
railway init
```
- Choose "Create a new project"
- Name it "nine-nine-nine-challenge" or similar
- Select your team/account

## Step 2.5: Add PostgreSQL Database
```bash
railway add postgresql
```
This will provision a PostgreSQL database and automatically set DATABASE_URL environment variable.

## Step 3: Set Environment Variables
Run these commands to set up your environment variables:

```bash
# Required JWT Secret
railway variables set JWT_SECRET="your-super-secure-jwt-secret-key-change-this-in-production"

# Base URL (we'll update this after getting the Railway URL)
railway variables set NEXT_PUBLIC_BASE_URL="https://nine-nine-nine-challenge-production.up.railway.app"

# Stytch SMS Authentication (Live credentials)
railway variables set STYTCH_PROJECT_ID="project-live-7c65e19a-2a72-4557-8821-0c9a30e05f39"
railway variables set STYTCH_SECRET="your-stytch-secret-from-dashboard"
railway variables set NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN="public-token-live-3db4577c-26a4-4e70-ba79-dfee03bcbae0"
railway variables set STYTCH_PROJECT_ENV="live"

# Cloudflare R2 Storage
railway variables set R2_ACCOUNT_ID="your-cloudflare-account-id"
railway variables set R2_ACCESS_KEY_ID="your-r2-access-key-id"
railway variables set R2_SECRET_ACCESS_KEY="your-r2-secret-access-key"
railway variables set R2_BUCKET_NAME="the-marina-tech-company"
railway variables set R2_BUCKET_PATH="nine-nine-nine"
railway variables set NEXT_PUBLIC_R2_PUBLIC_URL="https://images.themarinatechcompany.com"

# Optional: Pusher (for real-time updates)
railway variables set PUSHER_APP_ID="your-pusher-app-id"
railway variables set PUSHER_SECRET="your-pusher-secret"
railway variables set NEXT_PUBLIC_PUSHER_KEY="your-pusher-key"
railway variables set NEXT_PUBLIC_PUSHER_CLUSTER="us2"
```

## Step 4: Deploy
```bash
railway up
```

## Step 5: Get Your Railway URL
```bash
railway status
```
This will show your deployment URL (something like `nine-nine-nine-challenge-production.up.railway.app`)

## Step 6: Update Base URL
Once you have your Railway URL, update the base URL:
```bash
railway variables set NEXT_PUBLIC_BASE_URL="https://your-actual-railway-url"
```

## Step 7: Add Custom Domain (Optional)
If you want to use `999.themarinatech.company`:

```bash
railway domains add 999.themarinatech.company
```

Then in Cloudflare DNS, add:
- Type: CNAME
- Name: 999
- Target: your-railway-url
- Proxy: ✅ Enabled

## Step 8: View Logs
```bash
railway logs
```

## Step 9: Redeploy After Changes
```bash
railway up
```

## Common Commands
```bash
# View project info
railway status

# View environment variables
railway variables

# Open Railway dashboard
railway open

# View logs
railway logs -f

# Connect to PostgreSQL database
railway connect postgresql
```

## Troubleshooting

### If deployment fails:
1. Check logs: `railway logs`
2. Verify all environment variables: `railway variables`
3. Ensure your build works locally: `npm run build`

### If you need to delete and recreate:
```bash
railway project delete
railway init
```

### If you need to rollback:
```bash
railway rollback
```

## Production Checklist
- [ ] All environment variables set
- [ ] Stytch configured for production
- [ ] R2 bucket created and configured
- [ ] Custom domain added (if desired)
- [ ] SSL certificate working
- [ ] Database working (PostgreSQL)
- [ ] Test SMS authentication
- [ ] Test file uploads
- [ ] Test event creation and joining

## Next Steps After Deployment
1. Test the full flow: create event → join → score → upload media
2. Configure Cloudflare caching rules for performance
3. Set up monitoring/alerts in Railway dashboard
4. Consider adding a production database if you scale up