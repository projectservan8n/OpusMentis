# 🚀 OpusMentis Production Deployment Quick Start

**Status:** Ready to deploy with opusmentis.app domain
**Quiz System:** ✅ Fully Implemented & Tested
**Production Instance:** ✅ Created in Clerk

---

## ⚡ Quick Checklist (30 minutes)

Follow these steps in order to deploy OpusMentis with the complete Quiz System to production:

### 1️⃣ Clerk Production Instance (DONE ✅)

**Status:** You've already created the production instance for opusmentis.app!

**Next:** Get your production API keys from Clerk Dashboard

---

### 2️⃣ Get Production API Keys (2 min)

1. In Clerk Dashboard, switch to **Production** instance (top dropdown)
2. Go to **API Keys** in sidebar
3. Copy these 3 keys:
   - Publishable Key: `pk_live_xxxxxxxxxxxxx`
   - Secret Key: `sk_live_xxxxxxxxxxxxx`

---

### 3️⃣ Update Railway Environment Variables (5 min)

In Railway Dashboard → Your Service → Variables, update:

```bash
# ⚠️ CRITICAL: Replace development keys with production keys
CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_live_xxxxxxxxxxxxx
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx

# These stay the same:
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Keep other env vars unchanged:
DATABASE_URL=postgresql://... (auto-provided)
OPENAI_API_KEY=sk-proj-xxx
NODE_ENV=production
```

**Railway will auto-restart after saving.**

---

### 4️⃣ Configure DNS Records (10 min)

Go to your domain registrar (GoDaddy/Namecheap/etc) DNS settings for `opusmentis.app`:

#### Record 1: Clerk Accounts Subdomain
```
Type: CNAME
Name: accounts
Value: clerk.opusmentis.app.domains.clerk.com
TTL: 3600
```

#### Record 2: Main App Domain
Get your Railway domain first:
- Railway Dashboard → Your Service → Settings → Domains
- Copy the Railway domain (e.g., `opusmentis-production.up.railway.app`)

Then add:
```
Type: CNAME
Name: @ (or root/blank)
Value: [your-railway-domain].up.railway.app
TTL: 3600
```

**DNS takes 5-60 minutes to propagate. Check with:**
```bash
dig opusmentis.app
dig accounts.opusmentis.app
```

---

### 5️⃣ Add Domain in Clerk (3 min)

1. Clerk Dashboard (Production instance)
2. Go to **Domains** page in sidebar
3. Click **"Add domain"**
4. Enter: `opusmentis.app`
5. Wait for verification ✅ (may take a few minutes)

---

### 6️⃣ Add Custom Domain in Railway (5 min)

1. Railway Dashboard → Your Service → Settings
2. Scroll to **Networking** section
3. Click **"Add Custom Domain"**
4. Enter: `opusmentis.app`
5. Railway will verify DNS and generate SSL certificate (5-15 min)

**Wait for SSL:** Check status in Railway dashboard. Should show ✅ when ready.

---

### 7️⃣ Configure Google OAuth (Optional but Recommended)

If you want users to sign in with Google in production:

#### Get Google OAuth Credentials:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create/select project
3. Enable **Google+ API**
4. Create **OAuth 2.0 Client ID**
5. Add authorized origins and redirects:

**Authorized JavaScript origins:**
```
https://opusmentis.app
https://accounts.opusmentis.app
```

**Authorized redirect URIs:**
```
https://accounts.clerk.opusmentis.app/v1/oauth_callback
```

#### Add to Clerk:
1. Clerk Dashboard → **User & Authentication** → **Social Connections**
2. Select **Google**
3. Toggle **"Use custom credentials"**
4. Paste Client ID and Client Secret
5. Save

**Without this, users can only sign in with email/password in production.**

---

### 8️⃣ Deploy Certificates in Clerk (2 min)

1. Go to Clerk Dashboard homepage (Production instance)
2. Verify all steps are ✅ green
3. Click **"Deploy certificates"** button at top
4. Wait for deployment (1-5 minutes)

---

## ✅ Verify Deployment

### Test 1: Visit Your Site
```
1. Go to https://opusmentis.app
2. Should load without errors
3. Check for 🔒 padlock (valid SSL)
```

### Test 2: Test Authentication
```
1. Click "Sign In" button
2. Should redirect to Clerk auth page
3. Sign in with email or Google
4. Should redirect to /dashboard
5. Check browser console - no errors
```

### Test 3: Check Railway Logs
```
Railway Dashboard → Your Service → Deployments → View Logs

Should see:
✅ No "ENOTFOUND opusmentis.app" errors
✅ No "infinite redirect loop" errors
✅ Normal request logs
```

### Test 4: Test File Upload
```
1. Go to /upload
2. Upload a PDF
3. Should process successfully
4. View study pack - all tabs work
```

### Test 5: Test Quiz System (NEW!)
```
1. Upload a test PDF (any educational content)
2. Wait for processing to complete
3. Open the study pack
4. Click "Generate Quiz" button
5. Select quiz source (try "highlights" first)
6. Choose question types (MC, T/F, Short Answer, Essay)
7. Set difficulty: Medium
8. Click "Generate Quiz"
9. Wait for AI generation (~10-30 seconds)
10. Take the quiz - answer questions
11. Submit quiz
12. Wait for AI grading (~20-60 seconds for essays)
13. View results with AI feedback
14. Check performance breakdown
```

**Expected Results:**
- ✅ Quiz generates successfully
- ✅ Questions display correctly
- ✅ Auto-save works (check after 30 seconds)
- ✅ AI grading completes
- ✅ Empathetic feedback shows for essays
- ✅ Score calculated correctly
- ✅ Results page displays

### Test 6: Test API Playground
```
1. Go to /api-playground
2. Select "Quizzes" tab (🎯)
3. Click "Generate Quiz"
4. Fill in studyPackId with a real ID
5. Click "Test Endpoint"
6. Should return generated quiz JSON
7. Try other quiz endpoints
```

---

## 🐛 Common Issues

### Issue: DNS Not Resolving
**Check:**
```bash
dig opusmentis.app
# Should return CNAME to Railway domain
```

**Fix:** Wait longer (DNS propagation takes time) or check DNS records are correct.

---

### Issue: Infinite Redirect Loop
**Cause:** Clerk keys mismatch

**Fix:** Verify in Railway env vars:
```
CLERK_PUBLISHABLE_KEY=pk_live_xxx
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx  ← MUST MATCH!
```
Both publishable keys must be identical!

---

### Issue: SSL Certificate Not Provisioning
**Check:** Railway Dashboard → Your Service → Settings → Domains

**Fix:**
- Ensure DNS is propagated (use `dig` command)
- Check for CAA records that might block Let's Encrypt
- Wait 15 minutes, Railway auto-retries

---

### Issue: Google Sign-In Not Working
**Cause:** Still using Clerk's shared dev credentials

**Fix:** Complete Step 7 (Configure Google OAuth) above.

---

### Issue: Quiz Generation Fails
**Error:** "Failed to generate quiz"

**Cause 1:** OpenAI API key not set
**Fix:** Verify `OPENAI_API_KEY` is set in Railway env vars

**Cause 2:** OpenAI rate limits
**Fix:** Check OpenAI dashboard for rate limit status

**Cause 3:** Invalid study pack ID
**Fix:** Use a valid study pack ID from your database

---

### Issue: AI Grading Not Working
**Error:** Quiz submits but no AI feedback

**Cause:** OpenAI API key missing or invalid
**Fix:**
1. Check Railway logs for OpenAI errors
2. Verify `OPENAI_API_KEY` starts with `sk-`
3. Test OpenAI key at https://platform.openai.com/playground

---

### Issue: Highlights Not Saving
**Error:** Highlights disappear after refresh

**Cause:** Database connection issue
**Fix:**
1. Check Railway logs for database errors
2. Verify `DATABASE_URL` is set correctly
3. Run `npx prisma migrate deploy` in Railway console

---

### Issue: PDF Viewer Not Loading
**Error:** "Failed to load PDF"

**Cause:** File path not accessible
**Fix:**
1. Verify Railway volume is mounted at `/app/uploads`
2. Check file permissions
3. Check Railway logs for file read errors

---

## 📊 Environment Comparison

| Variable | Development | Production |
|----------|------------|------------|
| CLERK_PUBLISHABLE_KEY | `pk_test_xxx` | `pk_live_xxx` ✅ |
| CLERK_SECRET_KEY | `sk_test_xxx` | `sk_live_xxx` ✅ |
| Domain | Railway .up.railway.app | opusmentis.app ✅ |
| OAuth | Clerk shared | Your Google credentials ✅ |

---

## 🔒 Security Notes

✅ **DONE:** `authorizedParties` configured in `src/middleware.ts`
- Prevents CSRF attacks
- Prevents subdomain cookie leaking
- Only allows requests from `https://opusmentis.app` in production

✅ **DONE:** Middleware protects all routes except public pages
- `/`, `/sign-in`, `/sign-up`, `/api/webhooks` are public
- All other routes require authentication

---

## 📚 Need More Details?

For comprehensive documentation, troubleshooting, and advanced configuration:

- **[CLERK_PRODUCTION_SETUP.md](./CLERK_PRODUCTION_SETUP.md)** - Complete 10-step guide with troubleshooting
- **[DOMAIN_SETUP.md](./DOMAIN_SETUP.md)** - DNS configuration details
- **[API_TESTING_GUIDE.md](./API_TESTING_GUIDE.md)** - API endpoint testing
- **[QUICK_TEST.md](./QUICK_TEST.md)** - 30-minute testing checklist

---

## 🎯 Deployment Timeline

| Step | Time | Can Do in Parallel? |
|------|------|---------------------|
| 1. Create Clerk production instance | 5 min | No |
| 2. Get production API keys | 2 min | No |
| 3. Update Railway env vars | 5 min | No |
| 4. Configure DNS records | 10 min | Yes (while waiting for Railway restart) |
| 5. Add domain in Clerk | 3 min | Yes (after DNS propagation starts) |
| 6. Add custom domain in Railway | 5 min | No |
| 7. Configure Google OAuth (optional) | 15 min | Yes (while waiting for SSL) |
| 8. Deploy certificates in Clerk | 2 min | No |
| **Total time** | **30-60 min** | (depending on DNS propagation) |

---

## 🚦 Current Status

**Quiz System:** ✅ Fully Implemented (100%)
**Clerk Production Instance:** ✅ Created for opusmentis.app

Ready to deploy:
- ✅ Quiz System complete (all 9 phases)
- ✅ API Playground with quiz endpoints
- ✅ PDF highlighting system
- ✅ Document intelligence
- ✅ AI grading with empathetic feedback
- ✅ Clerk production instance created
- ⏳ Need to update Railway env vars
- ⏳ Need to configure custom domain

**Next Steps:**
1. Get production keys from Clerk dashboard
2. Update Railway environment variables
3. Configure DNS for opusmentis.app
4. Test quiz system end-to-end

---

## 📋 Quick Production Setup (Since You Have Clerk Instance)

### Step 1: Get Your Production Keys from Clerk
1. Go to https://dashboard.clerk.com
2. Switch to **Production** instance (opusmentis.app)
3. Navigate to **API Keys**
4. Copy both keys

### Step 2: Update Railway
1. Railway Dashboard → Variables
2. Replace these 2 keys:
   - `CLERK_PUBLISHABLE_KEY` → `pk_live_xxxxx`
   - `CLERK_SECRET_KEY` → `sk_live_xxxxx`
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` → `pk_live_xxxxx`
3. Railway will auto-redeploy

### Step 3: Test
1. Visit your Railway URL
2. Test sign-in
3. Upload PDF → Generate Quiz → Take Quiz
4. Verify AI grading works

---

**You're almost there!** 🚀

Just need to swap the Clerk keys in Railway and you're live!