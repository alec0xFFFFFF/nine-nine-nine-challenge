# 🔧 Service Setup Instructions

## After Initial Deployment

Your app will be running with temporary credentials. To enable full functionality, set up these services:

## 1. Stytch (SMS Authentication) - REQUIRED
1. Go to [stytch.com](https://stytch.com) → Sign up (free)
2. Create a new project → Choose "Consumer Authentication"
3. In Dashboard → API Keys:
   - Copy `Project ID`
   - Copy `Secret`
   - Copy `Public Token`
4. Update Railway:
```bash
railway variables set STYTCH_PROJECT_ID="project-test-xxx"
railway variables set STYTCH_SECRET="secret-test-xxx"
railway variables set NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN="public-token-test-xxx"
```

## 2. Cloudflare R2 (Media Storage) - REQUIRED
1. Go to [cloudflare.com](https://cloudflare.com) → Sign up (free)
2. Go to R2 Object Storage → Create bucket
   - Name: `nine-nine-nine`
   - Location: Automatic
3. Go to R2 → Manage API Keys → Create API Token
   - Permission: Object Read & Write
   - Copy credentials
4. Update Railway:
```bash
railway variables set R2_ACCOUNT_ID="your-account-id"
railway variables set R2_ACCESS_KEY_ID="your-access-key"
railway variables set R2_SECRET_ACCESS_KEY="your-secret-key"
railway variables set NEXT_PUBLIC_R2_PUBLIC_URL="https://pub-xxx.r2.dev"
```

## 3. Pusher (Real-time) - OPTIONAL
1. Go to [pusher.com](https://pusher.com) → Sign up (free)
2. Create new Channels app
3. Go to App Keys → Copy credentials
4. Update Railway:
```bash
railway variables set PUSHER_APP_ID="your-app-id"
railway variables set PUSHER_SECRET="your-secret"
railway variables set NEXT_PUBLIC_PUSHER_KEY="your-key"
```

## 4. Redeploy After Setup
```bash
railway up
```

## 5. Custom Domain Setup (for 999.themarinatech.company)

### In Railway:
```bash
railway domains add 999.themarinatech.company
```

### In Cloudflare DNS:
1. Go to DNS management for themarinatech.company
2. Add record:
   - Type: CNAME
   - Name: 999
   - Target: [your-railway-url]
   - Proxy: ✅ Enabled (orange cloud)
   - TTL: Auto

## Testing Checklist
- [ ] Home page loads
- [ ] Can create event → Get share code
- [ ] SMS sends when entering phone
- [ ] Can verify SMS code
- [ ] Can join event with code
- [ ] Can update scores
- [ ] Can upload photo/video
- [ ] Can give kudos as spectator
- [ ] Leaderboard updates live

## Troubleshooting

### SMS not sending?
- Check Stytch dashboard for logs
- Verify phone number format (+1XXXXXXXXXX)
- Check Railway logs: `railway logs`

### Media upload failing?
- Verify R2 bucket exists
- Check CORS settings in R2
- Ensure API keys have write permission

### App not loading?
- Check build logs: `railway logs`
- Verify all env variables: `railway variables`
- Ensure JWT_SECRET is set

### Custom domain not working?
- Wait 5-10 minutes for DNS propagation
- Check: `dig 999.themarinatech.company`
- Verify CNAME in Cloudflare