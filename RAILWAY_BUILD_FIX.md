# 🔧 Railway Build Error: npm-10_x Troubleshooting Guide

## 🚨 Current Error
```
error: undefined variable 'npm-10_x'
at /app/.nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix:19:19:
```

## 🔍 Root Cause Analysis

The error indicates that Nixpacks is trying to reference `npm-10_x` which doesn't exist in the Nix package repository. This suggests one of several issues:

### 1. **Configuration Files Check**

**Current nixpacks.toml:**
```toml
[phases.setup]
nixPkgs = ['nodejs_20', 'openssl']
```
✅ This looks correct - we removed `npm-10_x`

**Check railway.toml for any npm references:**
- Look for any `npm-10_x` references in build variables
- Check if there are any package specifications

### 2. **Possible Issues**

#### Issue A: Wrong Package Name
- `npm-10_x` doesn't exist in nixpkgs
- Node.js 20 should include npm automatically
- We shouldn't need to specify npm separately

#### Issue B: Railway Cache
- Railway might be using cached nixpacks configuration
- Need to force a complete rebuild

#### Issue C: Hidden Configuration
- There might be auto-generated nixpacks config overriding our toml
- Railway might be detecting and adding npm automatically

## 🛠️ Solutions to Try

### Solution 1: Complete Nixpacks Reset
```toml
# nixpacks.toml - Minimal configuration
[phases.setup]
nixPkgs = ['nodejs_20']

[phases.install]
cmds = ['npm ci', 'npx prisma generate']

[phases.build]
cmds = ['npm run build']

[start]
cmd = 'npm start'
```

### Solution 2: Use Different Node/NPM Versions
```toml
# Try with explicit versions that exist
[phases.setup]
nixPkgs = ['nodejs-18_x', 'openssl']
```

### Solution 3: Let Nixpacks Auto-Detect
```toml
# Minimal - let nixpacks detect everything
[phases.install]
cmds = ['npm ci', 'npx prisma generate']

[phases.build]  
cmds = ['npm run build']
```

### Solution 4: Remove nixpacks.toml Entirely
- Delete the file and let Railway auto-detect
- Sometimes manual config conflicts with auto-detection

## 🧪 Debugging Steps

### Step 1: Check All Config Files
```bash
# Check current nixpacks.toml
cat nixpacks.toml

# Check railway.toml for npm references  
grep -i npm railway.toml

# Check package.json engines
grep -A5 -B5 engines package.json
```

### Step 2: Try Minimal Config
1. Backup current nixpacks.toml
2. Replace with minimal version
3. Commit and push
4. Test deploy

### Step 3: Check Nixpacks Documentation
- Available packages: https://search.nixos.org/packages
- Valid nodejs packages: nodejs_18, nodejs_20, nodejs-18_x, nodejs-20_x
- NPM is included with nodejs, don't specify separately

## 🎯 Recommended Fix

**Replace nixpacks.toml with this minimal version:**

```toml
[phases.setup]
nixPkgs = ['nodejs_20']

[phases.install]  
cmds = [
  'npm ci',
  'npx prisma generate'
]

[phases.build]
cmds = ['npm run build']

[start]
cmd = 'npm start'
```

**Or try this even more minimal approach:**

```toml  
[phases.install]
cmds = ['npm ci', 'npx prisma generate']

[phases.build]
cmds = ['npm run build']
```

## 🚨 If Still Failing

1. **Delete nixpacks.toml entirely** - let Railway auto-detect
2. **Use only railway.toml** for configuration
3. **Check Railway dashboard** - might have UI settings overriding files
4. **Contact Railway support** - this might be a platform bug

## 📋 Action Items

- [ ] Try minimal nixpacks.toml (Solution 1)
- [ ] If that fails, delete nixpacks.toml entirely  
- [ ] Check railway.toml for conflicts
- [ ] Test with nodejs-18_x if nodejs_20 doesn't work
- [ ] Verify in Railway dashboard settings

The core issue is that `npm-10_x` is not a valid Nix package name, and npm should be included automatically with nodejs_20.