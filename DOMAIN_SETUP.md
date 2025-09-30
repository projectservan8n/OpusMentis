# OpusMentis Domain Setup Guide

**Issue:** Clerk trying to reach `opusmentis.app` but domain not configured
**Error:** `getaddrinfo ENOTFOUND opusmentis.app`

---

## 🌐 **Current Status**

- ❌ `opusmentis.app` - Domain exists but not pointed to Railway
- ✅ Railway app deployed and running
- ⚠️ Clerk configured for wrong domain

---

## 🔧 **Fix Steps**

### **Option 1: Use Railway Domain (Quick Fix)**

#### **1. Get Railway Domain**
```
Go to Railway dashboard → Your service → Settings
Copy the domain: something.up.railway.app
```

#### **2. Update Clerk Configuration**
```
1. Go to https://dashboard.clerk.com
2. Select your OpusMentis application
3. Click "Domains" in sidebar
4. Remove "opusmentis.app" if present
5. Add Railway domain: "your-app.up.railway.app"
6. Save changes
```

#### **3. Update Environment Variables in Railway**
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx (your key)
CLERK_SECRET_KEY=sk_test_xxx (your key)

# Update these to use Railway domain or remove them:
# NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
# NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
# NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
# NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

#### **4. Restart Railway Service**
Railway will auto-restart after env var changes.

---

### **Option 2: Configure Custom Domain (Production)**

#### **1. Point Domain to Railway**

**In Your Domain Registrar (GoDaddy/Namecheap/etc):**
```
Add CNAME record:
Name: @ (or opusmentis.app)
Value: your-app.up.railway.app
TTL: 3600
```

**Or use A record:**
```
Get Railway IP from Railway dashboard → Settings → Custom Domain
Add A record pointing to that IP
```

#### **2. Add Custom Domain in Railway**
```
1. Railway dashboard → Your service → Settings
2. Click "Add Custom Domain"
3. Enter: opusmentis.app
4. Wait for DNS propagation (5-60 minutes)
5. Railway will auto-generate SSL certificate
```

#### **3. Update Clerk Configuration**
```
1. Go to Clerk dashboard
2. Domains → Add "opusmentis.app"
3. Save changes
```

#### **4. Update Environment Variables**
```
# No changes needed if using relative URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

---

## ⚡ **Quick Test After Fix**

### **1. Access Your App**
```
Go to: https://your-railway-domain.up.railway.app
or: https://opusmentis.app (if custom domain configured)
```

### **2. Test Sign In**
```
1. Click "Sign In"
2. Should redirect to Clerk auth page
3. Sign in should work without errors
4. Redirect back to dashboard
```

### **3. Check Railway Logs**
```
Should see NO more:
❌ Failed to proxy https://opusmentis.app/clerk_xxx
❌ getaddrinfo ENOTFOUND opusmentis.app
```

---

## 🐛 **Current Errors Explained**

### **Error 1: ENOTFOUND opusmentis.app**
```
Failed to proxy https://opusmentis.app/clerk_xxx
getaddrinfo ENOTFOUND opusmentis.app
```

**Cause:** Clerk is configured to use `opusmentis.app` but:
- Domain not pointed to Railway yet
- Or DNS not propagated
- Or Clerk domain settings incorrect

**Fix:** Use Option 1 (Railway domain) immediately, then switch to Option 2 later.

---

### **Error 2: Infinite Redirect Loop**
```
Clerk: Refreshing the session token resulted in an infinite redirect loop.
This usually means that your Clerk instance keys do not match.
```

**Cause:**
- Clerk keys mismatch (dev keys in prod, or wrong keys)
- Domain configuration mismatch

**Fix:**
1. Verify `CLERK_PUBLISHABLE_KEY` matches `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
2. Ensure keys are from same Clerk instance (dev or prod)
3. Update Clerk domain to match Railway domain

---

## ✅ **Recommended Immediate Action**

### **Use Railway Domain for Now**

```bash
# 1. Get Railway domain
Railway dashboard → Copy: your-app-name-production.up.railway.app

# 2. Update Clerk
Clerk dashboard → Domains → Add Railway domain

# 3. Test immediately
Visit: https://your-app-name-production.up.railway.app
```

This will work immediately while you set up `opusmentis.app` properly.

---

### **Set Up Custom Domain Later**

```bash
# 1. Configure DNS (takes 5-60 minutes to propagate)
Add CNAME: opusmentis.app → your-app.up.railway.app

# 2. Add in Railway
Railway → Settings → Custom Domain → opusmentis.app

# 3. Update Clerk
Clerk → Domains → Add opusmentis.app

# 4. Wait for SSL (Railway auto-generates)
Usually takes 1-5 minutes after DNS propagates
```

---

## 📋 **Checklist**

### **Immediate (Option 1):**
- [ ] Copy Railway domain from Railway dashboard
- [ ] Add Railway domain to Clerk
- [ ] Test sign in - should work
- [ ] Verify no ENOTFOUND errors in logs

### **Production (Option 2):**
- [ ] Point DNS to Railway (CNAME or A record)
- [ ] Add custom domain in Railway
- [ ] Wait for DNS propagation (check with `dig opusmentis.app`)
- [ ] Add custom domain to Clerk
- [ ] Verify SSL certificate generated
- [ ] Test app on opusmentis.app
- [ ] Update all documentation/links

---

## 🔍 **Check DNS Propagation**

```bash
# Check if domain points to Railway
dig opusmentis.app

# Or use online tool:
# https://www.whatsmydns.net/#A/opusmentis.app
```

Should return Railway IP address.

---

## 🚨 **If Still Having Issues**

### **Check Clerk Keys**
```
Railway Environment Variables:
CLERK_PUBLISHABLE_KEY=pk_test_xxx
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx (should match!)
CLERK_SECRET_KEY=sk_test_xxx

Both publishable keys MUST be identical!
```

### **Check Clerk Instance**
```
Clerk Dashboard → Top left dropdown
Make sure you're using the correct instance:
- Development (pk_test_xxx / sk_test_xxx)
- Production (pk_live_xxx / sk_live_xxx)

Railway env vars must match the instance you're using!
```

---

## 💡 **Pro Tip**

For testing, use Railway domain first:
- ✅ Works immediately
- ✅ No DNS config needed
- ✅ Auto SSL
- ✅ Can switch to custom domain later

Custom domain is for branding, not required for functionality.

---

**Next Step:** Copy your Railway domain and update Clerk! 🚀