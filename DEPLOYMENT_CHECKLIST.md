# 🚀 Railway Deployment Checklist

## Before You Start
- [ ] Railway CLI installed: `railway --version`
- [ ] Railway account created at [railway.app](https://railway.app)

## Step-by-Step Deployment

### 1. Initial Setup
```bash
# Login to Railway (opens browser)
railway login

# Initialize project
railway init
# Choose: "Create a new project"
# Name: "nine-nine-nine-challenge"
```

### 2. Environment Variables
```bash
# Run the helper script
npm run setup:env

# Or set manually:
railway variables set JWT_SECRET="your-secure-secret-$(openssl rand -hex 16)"
railway variables set NEXT_PUBLIC_BASE_URL="https://your-app.up.railway.app"

# Add your service credentials:
railway variables set STYTCH_PROJECT_ID="your-stytch-project-id"
railway variables set STYTCH_SECRET="your-stytch-secret"
# ... etc
```

### 3. First Deployment
```bash
# Deploy using helper script
npm run deploy

# Or manually:
npm run build  # Test build locally first
railway up     # Deploy to Railway
```

### 4. Get Your URL
```bash
railway status
# Copy the URL (something like: https://nine-nine-nine-challenge-production.up.railway.app)
```

### 5. Update Base URL
```bash
railway variables set NEXT_PUBLIC_BASE_URL="https://your-actual-railway-url"

# Redeploy with updated URL
railway up
```

### 6. Custom Domain (Optional)
If using `999.themarinatech.company`:

```bash
# Add domain in Railway
railway domains add 999.themarinatech.company

# Add DNS record in Cloudflare:
# Type: CNAME
# Name: 999
# Target: your-railway-url (from step 4)
# Proxy: ✅ Enabled
```

## Service Setup Required

### Stytch (SMS Authentication)
1. Go to [stytch.com](https://stytch.com) → Create account
2. Create new project → Get credentials
3. Set environment variables:
   - `STYTCH_PROJECT_ID`
   - `STYTCH_SECRET` 
   - `NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN`

### Cloudflare R2 (Media Storage)
1. Go to [cloudflare.com](https://cloudflare.com) → Create account
2. Go to R2 Object Storage → Create bucket: "nine-nine-nine"
3. Get API keys → Set environment variables:
   - `R2_ACCOUNT_ID`
   - `R2_ACCESS_KEY_ID`
   - `R2_SECRET_ACCESS_KEY`
   - `NEXT_PUBLIC_R2_PUBLIC_URL`

### Pusher (Optional - Real-time Updates)
1. Go to [pusher.com](https://pusher.com) → Create account
2. Create new app → Get credentials
3. Set environment variables:
   - `PUSHER_APP_ID`
   - `PUSHER_SECRET`
   - `NEXT_PUBLIC_PUSHER_KEY`

## Testing Checklist
- [ ] App loads at Railway URL
- [ ] Can create new event
- [ ] SMS authentication works
- [ ] Can join event with code
- [ ] Can update scores
- [ ] Media upload works
- [ ] Kudos system works
- [ ] Leaderboard updates

## Useful Commands
```bash
# View deployment status
npm run railway:status

# View logs
npm run railway:logs

# View environment variables
npm run railway:env

# Quick redeploy
npm run railway:up

# Open Railway dashboard
railway open
```

## Troubleshooting

### Build Fails
```bash
# Test build locally
npm run build

# Check logs
npm run railway:logs
```

### Environment Variables
```bash
# List all variables
railway variables

# Set specific variable
railway variables set VAR_NAME="value"

# Delete variable
railway variables delete VAR_NAME
```

### Database Issues
```bash
# Check if database file is being created
npm run railway:logs | grep "database"

# In production, you might want to use Railway's PostgreSQL
railway add postgresql
```

### Custom Domain Not Working
1. Check DNS propagation: `dig 999.themarinatech.company`
2. Verify CNAME points to Railway URL
3. Check Railway domain settings: `railway domains`
4. Ensure Cloudflare proxy is enabled

## Production Optimizations

### After Successful Deployment
1. **Monitor Performance**: Set up Railway monitoring
2. **Database**: Consider PostgreSQL for production scale
3. **Caching**: Configure Cloudflare caching rules
4. **Security**: Review environment variables
5. **Backups**: Set up database backups (if using PostgreSQL)

### Scaling Considerations
- Railway auto-scales based on traffic
- SQLite file-based DB is fine for moderate usage
- Consider Redis for session management at scale
- R2 storage scales automatically

## Quick Start Commands
```bash
# Complete setup from scratch
railway login
railway init
npm run setup:env
npm run deploy

# Just redeploy after changes
npm run railway:up

# Monitor after deployment
npm run railway:logs -f
```