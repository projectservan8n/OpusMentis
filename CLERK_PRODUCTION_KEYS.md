# 🔑 Clerk Production Keys - Quick Reference

## Your Clerk Production Instance

**Domain:** opusmentis.app
**Status:** ✅ Created and ready

---

## How to Get Your Production Keys

### Step-by-Step:

1. **Go to Clerk Dashboard**
   - Visit: https://dashboard.clerk.com

2. **Switch to Production Instance**
   - Look at the top-left dropdown
   - It probably says "Development" right now
   - Click it and select **"Production (opusmentis.app)"**

3. **Navigate to API Keys**
   - In the left sidebar, click **"API Keys"**

4. **Copy Your Keys**
   You'll see two keys displayed:

   ```
   Publishable Key: pk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   Secret Key: sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx (click "Show" to reveal)
   ```

---

## Update These 3 Variables in Railway

Go to: Railway Dashboard → Your Service → Variables

**Replace these 3 environment variables:**

```bash
# Old (Development)
CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxx
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxx

# New (Production) - Copy from Clerk Dashboard
CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**⚠️ IMPORTANT:**
- `CLERK_PUBLISHABLE_KEY` and `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` must be IDENTICAL
- Both should be the **same** `pk_live_xxx` key
- The secret key is separate: `sk_live_xxx`

---

## After Updating Railway

Railway will automatically redeploy (takes 2-3 minutes).

**What to check:**
1. Wait for Railway deployment to complete (green checkmark)
2. Visit your Railway URL
3. Click "Sign In"
4. Should redirect to Clerk auth page
5. Sign in should work
6. Should redirect to /dashboard

---

## Verification Checklist

After updating the keys, verify:

- [ ] Can sign in with email/password
- [ ] Can sign up for new account
- [ ] Redirects to /dashboard after sign in
- [ ] Can sign out
- [ ] No infinite redirect loops
- [ ] No console errors about Clerk

---

## If Something Goes Wrong

### Error: "Invalid publishable key"
**Fix:** Double-check you copied the LIVE keys, not test keys
- Production keys start with `pk_live_` and `sk_live_`
- Development keys start with `pk_test_` and `sk_test_`

### Error: Infinite redirect loop
**Fix:** Make sure both publishable keys match:
```bash
CLERK_PUBLISHABLE_KEY=pk_live_abc123...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_abc123...  ← Must be identical!
```

### Error: "Clerk: Missing publishable key"
**Fix:** Railway might not have redeployed. Try:
1. Go to Railway → Deployments
2. Click "Redeploy" on latest deployment

---

## Next: Custom Domain (Optional but Recommended)

After keys are working, configure custom domain:

1. **Add domain in Clerk:**
   - Clerk Dashboard → Configure → Domains
   - Add: `opusmentis.app`

2. **Add domain in Railway:**
   - Railway → Settings → Networking
   - Add custom domain: `opusmentis.app`

3. **Update DNS:**
   - Add CNAME record pointing to Railway domain

---

## Testing the Quiz System

Once authentication works, test the complete quiz flow:

1. **Upload a PDF** → /upload
2. **Open study pack** → Should see "Generate Quiz" button
3. **Generate quiz** → Select highlights, choose question types
4. **Take quiz** → Answer questions, auto-save works
5. **Submit** → AI grading happens (20-60 seconds)
6. **View results** → See AI feedback and score

**Expected:** All steps complete successfully with AI grading working!

---

## Support

If you run into issues:
- Check Railway logs: `railway logs`
- Check Clerk dashboard for errors
- Verify all 3 environment variables are correct
- Make sure keys are production (`pk_live_`, `sk_live_`)

---

**Ready to update the keys?**

Just copy the 2 keys from Clerk and paste into Railway! 🚀
