# 9/9/9 Challenge Tracker

A live scorecard website for the 9/9/9 challenge - tracking 9 holes of golf, 9 hot dogs, and 9 beers with event creation, photo/video sharing, and spectator kudos!

## 🎯 New Features

### Event Creation & Sharing
- **Create Custom Events**: Host your own 9/9/9 challenge with custom names, dates, and locations
- **Shareable Event Links**: Get a unique event code to share with participants
- **Join by Code**: Spectators and players can join events using simple codes

### SMS Authentication with Stytch
- **Phone-Based Login**: No passwords needed - just your phone number
- **Secure OTP**: Verification codes sent via SMS
- **Guest Spectating**: View events without creating an account
- **Persistent Sessions**: Stay logged in for easy score updates

### Photo & Video Sharing
- **Live Media Upload**: Share photos and videos during the round
- **Cloudflare R2 Storage**: Fast, global content delivery
- **Per-Hole Documentation**: Tag uploads to specific holes
- **Captions**: Add context to your epic moments

### Spectator Kudos System
- **Fun Recognition**: Give funny kudos to players (no account needed)
- **10 Unique Kudos Types**: From "Glizzy Gladiator" to "Grip It & Sip It"
- **Anonymous Voting**: Spectators can appreciate great (or terrible) performances
- **Kudos Leaderboard**: See who's earning the most recognition

## 🏆 Kudos Types

- 🌭 **Glizzy Gladiator** - Dominating the hot dog game
- 🍺 **Brew Master** - Keeping the beer pace like a champ
- ⛳ **Sand Trap Warrior** - Making bunkers look easy
- 🍻 **Double Fisting Legend** - Two beers, no problem
- 🎯 **Frankly Amazing** - Hot dog consumption on point
- 🛒 **Cart Girl's Favorite** - Single-handedly funding the beverage cart
- 👑 **Mulligan King** - Rules are more like guidelines
- 🦅 **Birdie Juice** - Playing better with each beer
- 🏆 **Wiener Winner** - Undefeated hot dog champion
- 🏌️ **Grip It & Sip It** - Never missing a sip or a swing

## 🚀 Setup Instructions

1. **Install dependencies**:
```bash
npm install
```

2. **Set up services** (update `.env.local`):

**Stytch SMS Authentication:**
- Create account at [stytch.com](https://stytch.com)
- Create a new project
- Get your Project ID, Secret, and Public Token

**Cloudflare R2 Storage:**
- Create account at [cloudflare.com](https://cloudflare.com)
- Create R2 bucket
- Get API keys and account ID

**Pusher (optional for real-time):**
- Create account at [pusher.com](https://pusher.com)
- Create new app
- Get your app credentials

```env
# Required
JWT_SECRET=your-secret-jwt-key-change-this-in-production
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Stytch (SMS Authentication)
STYTCH_PROJECT_ID=your-stytch-project-id
STYTCH_SECRET=your-stytch-secret
NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN=your-stytch-public-token
STYTCH_PROJECT_ENV=test

# Cloudflare R2 (Media Storage)
R2_ACCOUNT_ID=your-r2-account-id
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_BUCKET_NAME=nine-nine-nine
NEXT_PUBLIC_R2_PUBLIC_URL=https://your-bucket.your-account-id.r2.cloudflarestorage.com

# Pusher (Optional - for real-time updates)
PUSHER_APP_ID=your-pusher-app-id
PUSHER_SECRET=your-pusher-secret
NEXT_PUBLIC_PUSHER_KEY=your-pusher-key
NEXT_PUBLIC_PUSHER_CLUSTER=us2
```

3. **Run the development server**:
```bash
npm run dev
```

4. **Start playing**:
   - Visit http://localhost:3000
   - Create a new event or join existing one
   - Authenticate with your phone number
   - Track your 9/9/9 challenge!

## 🎮 How to Play

### Event Creators:
1. Visit the homepage and click "Create New Event"
2. Enter event details (name, date, location)
3. Share the generated event code with participants
4. Monitor the leaderboard and enjoy the chaos

### Participants:
1. Enter the event code or follow the shared link
2. Authenticate with your phone number (one-time setup)
3. Track your performance:
   - Golf strokes per hole
   - Hot dogs consumed (0-3 per hole)
   - Beers consumed (0-3 per hole) 
   - Beer types for each beer
4. Upload photos/videos of your epic moments
5. View real-time leaderboard

### Spectators:
1. Visit the event page (no account needed)
2. Watch the live leaderboard
3. Give kudos to your favorite (or most ridiculous) performances
4. See who's earning the most recognition

## 📊 Scoring System

**Lower scores win:**
- Base score = total golf strokes
- +5 points for each hot dog away from 9
- +5 points for each beer away from 9
- Example: 45 strokes + 7 hot dogs + 8 beers = 45 + 10 + 5 = 60 points

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, SQLite
- **Authentication**: Stytch SMS + JWT
- **Storage**: Cloudflare R2
- **Real-time**: Pusher WebSockets (optional)
- **Mobile-First**: Responsive design for on-course use

## 🎯 Perfect For

- Golf tournaments with a twist
- Bachelor/bachelorette parties
- Corporate team building
- Charity events
- Any time you want to combine golf with questionable life choices

The app handles everything from event creation to media sharing to hilarious spectator engagement. Built for mobile use on the golf course with real-time updates for maximum entertainment!
