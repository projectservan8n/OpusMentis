# ⚡ OpusMentis - Production Deployment Quick Start

**🎯 Goal:** Deploy OpusMentis to opusmentis.app in 30-60 minutes

---

## 📋 Before You Start

### ✅ You Have:
- [x] Domain: opusmentis.app
- [x] Railway deployment (working with test keys)
- [x] OpenAI API key
- [x] Access to domain registrar DNS settings

### 🔑 You Need to Get:
- [ ] Clerk production API keys
- [ ] Google OAuth credentials (optional but recommended)

---

## 🚀 8 Steps to Production

```
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 1: CREATE CLERK PRODUCTION INSTANCE                      5min │
├─────────────────────────────────────────────────────────────────────┤
│  📍 https://dashboard.clerk.com                                     │
│  1. Click "Development" dropdown at top                             │
│  2. Select "Create production instance"                             │
│  3. Choose "Clone development settings"                             │
│  ✅ Result: You now have pk_live_xxx / sk_live_xxx keys            │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  STEP 2: COPY PRODUCTION KEYS                                  2min │
├─────────────────────────────────────────────────────────────────────┤
│  1. Switch to "Production" instance in Clerk Dashboard              │
│  2. Go to "API Keys" in sidebar                                     │
│  3. Copy these 3 values:                                            │
│     • Publishable Key: pk_live_xxxxxxxxxxxxx                        │
│     • Secret Key: sk_live_xxxxxxxxxxxxx                             │
│  ✅ Keep these safe - you'll paste them in Railway next            │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  STEP 3: UPDATE RAILWAY ENVIRONMENT VARIABLES              5min     │
├─────────────────────────────────────────────────────────────────────┤
│  📍 Railway Dashboard → Your Service → Variables                    │
│                                                                      │
│  Replace these 3 keys:                                              │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ CLERK_PUBLISHABLE_KEY                                        │  │
│  │ pk_live_xxxxxxxxxxxxx                   [Paste from Clerk]  │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │ CLERK_SECRET_KEY                                             │  │
│  │ sk_live_xxxxxxxxxxxxx                   [Paste from Clerk]  │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY                            │  │
│  │ pk_live_xxxxxxxxxxxxx          [MUST MATCH THE FIRST ONE!]  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ⚠️ CRITICAL: The two publishable keys MUST be identical!           │
│  ✅ Railway will auto-restart when you save                         │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  STEP 4: CONFIGURE DNS RECORDS                                10min │
├─────────────────────────────────────────────────────────────────────┤
│  Go to your domain registrar DNS settings for opusmentis.app        │
│                                                                      │
│  Record 1: Clerk Accounts Subdomain                                 │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Type: CNAME                                                  │  │
│  │ Name: accounts                                               │  │
│  │ Value: clerk.opusmentis.app.domains.clerk.com                │  │
│  │ TTL: 3600                                                    │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  Record 2: Main App Domain                                          │
│  First, get your Railway domain:                                    │
│  Railway Dashboard → Your Service → Settings → Domains              │
│  Copy: [your-app].up.railway.app                                    │
│                                                                      │
│  Then add DNS record:                                               │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Type: CNAME                                                  │  │
│  │ Name: @ (or root/blank)                                      │  │
│  │ Value: [your-app].up.railway.app                             │  │
│  │ TTL: 3600                                                    │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ⏳ DNS takes 5-60 minutes to propagate                             │
│  ✅ Check with: dig opusmentis.app                                  │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  STEP 5: ADD DOMAIN IN CLERK                                   3min │
├─────────────────────────────────────────────────────────────────────┤
│  Clerk Dashboard (Production instance)                              │
│  1. Go to "Domains" page in sidebar                                 │
│  2. Click "Add domain"                                              │
│  3. Enter: opusmentis.app                                           │
│  4. Wait for verification ✅                                        │
│  ✅ Clerk sessions will work across all subdomains                  │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  STEP 6: ADD CUSTOM DOMAIN IN RAILWAY                          5min │
├─────────────────────────────────────────────────────────────────────┤
│  Railway Dashboard → Your Service → Settings → Networking           │
│  1. Click "Add Custom Domain"                                       │
│  2. Enter: opusmentis.app                                           │
│  3. Railway will verify DNS and generate SSL certificate            │
│  ⏳ Wait 5-15 minutes for SSL provisioning                          │
│  ✅ Check for 🔒 in Railway dashboard when ready                    │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  STEP 7: CONFIGURE GOOGLE OAUTH (Optional)                    15min │
├─────────────────────────────────────────────────────────────────────┤
│  ⚠️ Skip this step if you only want email/password login           │
│                                                                      │
│  A. Get Google OAuth Credentials:                                   │
│  📍 https://console.cloud.google.com                                │
│  1. Create/select project                                           │
│  2. Enable Google+ API                                              │
│  3. Create OAuth 2.0 Client ID                                      │
│  4. Add authorized origins:                                         │
│     • https://opusmentis.app                                        │
│     • https://accounts.opusmentis.app                               │
│  5. Add redirect URIs:                                              │
│     • https://accounts.clerk.opusmentis.app/v1/oauth_callback       │
│  6. Copy Client ID and Client Secret                                │
│                                                                      │
│  B. Add to Clerk:                                                   │
│  1. Clerk Dashboard → User & Authentication → Social Connections    │
│  2. Select Google                                                   │
│  3. Toggle "Use custom credentials"                                 │
│  4. Paste Client ID and Client Secret                               │
│  5. Save                                                            │
│  ✅ Users can now sign in with Google in production                 │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  STEP 8: DEPLOY CERTIFICATES                                   2min │
├─────────────────────────────────────────────────────────────────────┤
│  Clerk Dashboard homepage (Production instance)                     │
│  1. Verify all steps are ✅ green                                   │
│  2. Click "Deploy certificates" button at top                       │
│  3. Wait for deployment (1-5 minutes)                               │
│  ✅ Production deployment complete!                                 │
└─────────────────────────────────────────────────────────────────────┘
```

---

## ✅ Verification Tests

### Test 1: Visit Your Site
```bash
# Open in browser:
https://opusmentis.app

# Should show:
✅ Page loads without errors
✅ 🔒 Valid SSL certificate
✅ No console errors
```

### Test 2: Test Authentication
```bash
1. Click "Sign In"
2. Should redirect to Clerk auth page
3. Sign in with email or Google
4. Should redirect to /dashboard
5. Check browser console - no errors
```

### Test 3: Check Railway Logs
```bash
Railway Dashboard → Deployments → View Logs

Should see:
✅ No "ENOTFOUND opusmentis.app" errors
✅ No "infinite redirect loop" errors
✅ Normal request logs
```

### Test 4: Upload and Process File
```bash
1. Go to /upload
2. Upload a PDF (≤10 pages for Free plan)
3. Wait for processing
4. View study pack
5. Test all tabs: Summary, Kanban, Flashcards, Notes
✅ Everything should work
```

---

## 🐛 Quick Troubleshooting

### ❌ DNS Not Resolving
```bash
# Check DNS propagation:
dig opusmentis.app

# If no results:
→ Wait longer (DNS takes time)
→ Check DNS records are correct
→ Try different DNS server: dig @8.8.8.8 opusmentis.app
```

### ❌ Infinite Redirect Loop
```bash
# Cause: Clerk keys mismatch

# Fix:
1. Go to Railway → Variables
2. Verify these TWO keys are IDENTICAL:
   • CLERK_PUBLISHABLE_KEY
   • NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
3. Both must be: pk_live_xxx (same value!)
```

### ❌ SSL Certificate Not Working
```bash
# Check Railway SSL status:
Railway → Settings → Domains

# If stuck:
→ Verify DNS is propagated (use dig command)
→ Wait 15 minutes (Railway auto-retries)
→ Check for CAA records blocking Let's Encrypt
```

### ❌ Google Sign-In Not Working
```bash
# Cause: Still using Clerk's dev credentials

# Fix: Complete Step 7 above
→ Get Google OAuth credentials
→ Add them to Clerk production instance
```

---

## 📊 Timeline

```
┌────────────────────────────────────────────────────────────┐
│                    PRODUCTION DEPLOYMENT                   │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Active Work:              ~45 minutes                     │
│  ├─ Steps 1-3:             ~12 min  │                     │
│  ├─ Steps 4-6:             ~18 min  │                     │
│  ├─ Step 7 (optional):     ~15 min  │                     │
│  └─ Step 8:                ~2 min   │                     │
│                                                            │
│  Waiting Time:             ~30-60 minutes                  │
│  ├─ DNS propagation:       ~15-30 min                     │
│  └─ SSL provisioning:      ~5-15 min                      │
│                                                            │
│  Total Time:               ~2-3 hours                      │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 🔗 Full Documentation

For detailed information, troubleshooting, and advanced configuration:

- **[PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md)** - Complete deployment guide
- **[CLERK_PRODUCTION_SETUP.md](./CLERK_PRODUCTION_SETUP.md)** - Detailed Clerk setup
- **[DOMAIN_SETUP.md](./DOMAIN_SETUP.md)** - DNS configuration help
- **[DEPLOYMENT_STATUS.md](./DEPLOYMENT_STATUS.md)** - Current status and checklist

---

## 📞 Need Help?

- **Email:** team@opusautomations.com
- **Admin:** tony@opusautomations.com
- **Documentation:** Check the guides above
- **Clerk Support:** https://clerk.com/support
- **Railway Support:** https://railway.app/help

---

## ✨ You're Ready!

Follow the 8 steps above in order, and your production deployment will be complete in 2-3 hours. The majority of that time is waiting for DNS propagation and SSL provisioning—the actual work takes less than 1 hour.

**Start here:** [Step 1 - Create Clerk Production Instance →](https://dashboard.clerk.com)

---

**Good luck with your production deployment! 🚀**