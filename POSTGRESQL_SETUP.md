# 🐘 PostgreSQL Setup for Railway

Your 9/9/9 Challenge app has been upgraded to use PostgreSQL instead of SQLite for better production performance and scalability.

## 🚀 Quick Deployment

Run this single command to deploy with PostgreSQL:

```bash
npm run deploy:postgres
```

This script will:
1. ✅ Add PostgreSQL service to your Railway project
2. ✅ Set up the DATABASE_URL environment variable
3. ✅ Generate Prisma client
4. ✅ Push database schema to PostgreSQL
5. ✅ Deploy your application

## 🔧 Manual Setup (if needed)

### 1. Add PostgreSQL to Railway
```bash
railway add postgresql
```

### 2. Set Environment Variable
```bash
railway variables set DATABASE_URL="\${{Postgres.DATABASE_URL}}"
```

### 3. Push Database Schema
```bash
npx prisma db push
```

### 4. Deploy
```bash
railway up
```

## 📊 Database Management

### View Database in Browser
```bash
npx prisma studio
```

### Generate Prisma Client (after schema changes)
```bash
npx prisma generate
```

### Create Migrations (for version control)
```bash
npx prisma migrate dev --name init
```

### Reset Database (⚠️ Destructive)
```bash
npx prisma db push --reset
```

## 🔄 Migration from SQLite

The new PostgreSQL setup includes:

### ✅ **Enhanced Features**
- **Better Performance**: Optimized for concurrent users
- **ACID Compliance**: Better data integrity
- **Scalability**: Handles more traffic
- **JSON Support**: Better for complex data
- **Full-Text Search**: Advanced search capabilities

### ✅ **Schema Changes**
- **Prisma ORM**: Type-safe database access
- **Optimized Relations**: Better foreign key handling
- **Auto-generated IDs**: UUIDs for events, auto-increment for others
- **Proper Indexing**: Automatic performance optimization

### ✅ **API Compatibility**
- All existing API endpoints work the same
- Same response formats
- No frontend changes needed

## 🎯 Database Schema

```prisma
model User {
  id           Int    @id @default(autoincrement())
  phoneNumber  String @unique
  displayName  String?
  stytchUserId String? @unique
  createdAt    DateTime @default(now())
  
  // Relations
  createdEvents    Event[]
  participations   EventParticipant[]
  mediaUploads     MediaUpload[]
}

model Event {
  id          String   @id @default(cuid())
  name        String
  eventCode   String   @unique
  creatorId   Int
  eventDate   DateTime @db.Date
  location    String?
  
  // Relations
  creator      User @relation(fields: [creatorId], references: [id])
  participants EventParticipant[]
  mediaUploads MediaUpload[]
  kudos        Kudos[]
}

// ... and more models for scores, media, kudos
```

## 🔍 Monitoring & Debugging

### Check Database Connection
```bash
railway logs | grep -i postgres
```

### View Database URL
```bash
railway variables | grep DATABASE_URL
```

### Connect to Database Directly
```bash
railway connect postgres
```

## 🚨 Troubleshooting

### Build Fails with Prisma Error
```bash
npx prisma generate
npm run build
```

### Database Connection Issues
1. Check DATABASE_URL is set: `railway variables`
2. Verify PostgreSQL service is running: `railway service ls`
3. Check logs: `railway logs`

### Schema Out of Sync
```bash
npx prisma db push --force-reset
# ⚠️ This will delete all data
```

### Missing Tables
```bash
npx prisma db push
```

## 🎉 Benefits of PostgreSQL

### **For Development**
- **Prisma Studio**: Visual database browser
- **Type Safety**: Auto-generated TypeScript types
- **IntelliSense**: IDE autocomplete for queries
- **Migrations**: Version control for schema changes

### **For Production**
- **Concurrent Users**: Handle multiple golfers at once
- **Data Integrity**: ACID compliance prevents corruption
- **Performance**: Optimized for complex queries
- **Backup & Recovery**: Railway handles automatic backups
- **Scaling**: Add read replicas as you grow

### **For Features**
- **Full-Text Search**: Search events, users, comments
- **JSON Columns**: Store complex scorecards
- **Aggregations**: Fast leaderboard calculations
- **Triggers**: Auto-update total scores
- **Views**: Pre-computed statistics

Your 9/9/9 Challenge is now enterprise-ready! 🏆