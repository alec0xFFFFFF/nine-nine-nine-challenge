# 🛠️ Railway Config-as-Code Setup

This project uses Railway's Config-as-Code to manage all deployment configuration through version-controlled files.

## 📁 Configuration Files

### 1. `railway.toml` (Primary Config)
- **Build settings**: Nixpacks builder, build commands
- **Deploy settings**: Start commands, health checks, restart policies
- **Environment variables**: All service configurations
- **Watch patterns**: Auto-deployment triggers

### 2. `railway.json` (Alternative JSON Format)
- Same functionality as `railway.toml` but in JSON format
- Better for IDE autocomplete with JSON schema
- Includes all environments and variables

### 3. `nixpacks.toml` (Build Configuration)
- Node.js version specification
- Prisma client generation
- Build phases and commands

## 🔧 Benefits of Config-as-Code

### ✅ **Version Control**
- All configuration is tracked in Git
- Easy to see changes and rollback
- Team collaboration on deployment settings

### ✅ **Environment Consistency**
- Same config across development/production
- No manual configuration drift
- Reproducible deployments

### ✅ **Automation**
- Automatic deploys when config changes
- CI/CD integration ready
- Infrastructure as Code principles

## 🚀 How It Works

### Environment Variables Reference
All sensitive values use Railway's variable interpolation:
```toml
DATABASE_URL = "${{Postgres.DATABASE_URL}}"
STYTCH_SECRET = "${{STYTCH_SECRET}}"
```

### Watch Patterns
Automatic deployments trigger when these files change:
- `src/**` - Source code changes
- `prisma/**` - Database schema changes  
- `package.json` - Dependency changes
- `package-lock.json` - Lock file changes

### Health Checks
- **Path**: `/` (Next.js default page)
- **Timeout**: 300 seconds
- **Restart Policy**: ON_FAILURE with 10 retries

## 📋 Environment Management

### Production Environment
- Full configuration with all services
- Optimized for performance and reliability
- All integrations enabled

### Development Environment  
- Minimal configuration for testing
- Same database connection as production
- Faster iteration cycles

## 🔄 Deployment Workflow

1. **Push to Git** → Railway detects changes
2. **Config Validation** → Railway validates TOML/JSON
3. **Build Phase** → Nixpacks builds with Prisma
4. **Deploy Phase** → Start with health checks
5. **Environment Sync** → Variables applied automatically

## 🛡️ Security Best Practices

### ✅ **Secrets Management**
- Never commit actual secrets to Git
- Use Railway variable interpolation
- Environment-specific configurations

### ✅ **Variable Organization**
- Group by service (Stytch, R2, Pusher)
- Clear naming conventions
- Documentation for each variable

## 📚 Railway Config Documentation

- [Config-as-Code Guide](https://docs.railway.com/guides/config-as-code)
- [railway.toml Reference](https://docs.railway.com/reference/config-file)
- [Environment Variables](https://docs.railway.com/guides/variables)
- [Nixpacks Configuration](https://nixpacks.com/docs/configuration/file)

## 🎯 Next Steps

1. **Set Variables**: Use the deployment scripts to set actual values
2. **Test Deploy**: Push changes to trigger automatic deployment  
3. **Monitor**: Use Railway dashboard to track deployments
4. **Scale**: Add more environments as needed (staging, etc.)

Your 9/9/9 Challenge app is now fully configured with Infrastructure as Code! 🎉