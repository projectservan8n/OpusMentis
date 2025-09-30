# Clerk Production Setup for OpusMentis

**Following Official Clerk Deployment Guide**

---

## 📋 **Pre-Deployment Checklist**

Before deploying to production:

- [x] ✅ Own domain: `opusmentis.app`
- [ ] ⏳ DNS records configured
- [ ] ⏳ Create Clerk production instance
- [ ] ⏳ Get production API keys
- [ ] ⏳ Configure OAuth credentials (Google)
- [ ] ⏳ Update environment variables

---

## 🚀 **Step-by-Step Production Deployment**

### **Step 1: Create Production Instance in Clerk**

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. At the top, click **"Development"** dropdown
3. Select **"Create production instance"**
4. Choose: **"Clone development settings"** (recommended)
   - This copies your auth methods, appearance, etc.
   - ⚠️ Note: SSO, Integrations, and Paths don't copy (need to reconfigure)

**Result:** You now have two instances:
- 🧪 Development: `pk_test_xxx` / `sk_test_xxx`
- 🚀 Production: `pk_live_xxx` / `sk_live_xxx`

---

### **Step 2: Get Production API Keys**

1. In Clerk Dashboard, switch to **Production** instance (top dropdown)
2. Go to **"API Keys"** in sidebar
3. Copy these values:
   ```
   Publishable Key: pk_live_xxxxxxxxxxxxx
   Secret Key: sk_live_xxxxxxxxxxxxx
   ```

---

### **Step 3: Update Railway Environment Variables**

⚠️ **CRITICAL:** Update ALL Clerk keys to production

```bash
# In Railway Dashboard → Your Service → Variables

# Replace development keys with production keys:
CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_live_xxxxxxxxxxxxx
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx

# These can stay the same:
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Keep other env vars unchanged:
DATABASE_URL=postgresql://... (auto-provided)
OPENAI_API_KEY=sk-proj-xxx
NODE_ENV=production
```

**After updating:** Railway will auto-restart your service.

---

### **Step 4: Configure Production OAuth (Google)**

Development uses Clerk's shared OAuth credentials. Production requires your own.

#### **Get Google OAuth Credentials:**

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create/select project
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Name: `OpusMentis Production`

**Authorized JavaScript origins:**
```
https://opusmentis.app
https://accounts.opusmentis.app
```

**Authorized redirect URIs:**
```
https://accounts.clerk.opusmentis.app/v1/oauth_callback
```

7. Copy **Client ID** and **Client Secret**

#### **Add to Clerk:**

1. Clerk Dashboard (Production instance)
2. **User & Authentication** → **Social Connections**
3. Select **Google**
4. Toggle to **Use custom credentials**
5. Paste Client ID and Client Secret
6. Save

---

### **Step 5: Configure DNS Records**

#### **In Your Domain Registrar (GoDaddy/Namecheap/etc):**

1. Go to DNS management for `opusmentis.app`

2. **Add CNAME for Clerk accounts:**
   ```
   Type: CNAME
   Name: accounts
   Value: clerk.opusmentis.app.domains.clerk.com
   TTL: 3600
   ```

3. **Add CNAME for main app (Railway):**
   ```
   Type: CNAME
   Name: @
   Value: your-app.up.railway.app
   TTL: 3600
   ```

   **OR use A record:**
   ```
   Type: A
   Name: @
   Value: [Railway IP from Railway dashboard]
   TTL: 3600
   ```

4. **DKIM Record for Email Verification (if using Clerk emails):**
   - Clerk Dashboard → **Domains** page will show you the exact records needed
   - Usually looks like:
   ```
   Type: TXT
   Name: clerk._domainkey
   Value: v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3...
   ```

**DNS Propagation:** Takes 5 minutes to 48 hours. Check with:
```bash
dig opusmentis.app
dig accounts.opusmentis.app
```

---

### **Step 6: Add Domain in Clerk**

1. Clerk Dashboard (Production instance)
2. Go to **Domains** page
3. Click **Add domain**
4. Enter: `opusmentis.app`
5. Clerk will show you DNS records to add (if any missing)
6. Wait for verification ✅

**Result:** Clerk sessions will work across:
- `opusmentis.app`
- `accounts.opusmentis.app`
- Any subdomain of `opusmentis.app`

---

### **Step 7: Add Custom Domain in Railway**

1. Railway Dashboard → Your Service → Settings
2. Click **"Add Custom Domain"**
3. Enter: `opusmentis.app`
4. Railway will:
   - Verify DNS pointing to Railway
   - Auto-generate SSL certificate (Let's Encrypt)
   - Enable HTTPS

**Wait:** 5-15 minutes for SSL provisioning.

---

### **Step 8: Update Webhooks (If Using)**

If you have Clerk webhooks configured:

1. Clerk Dashboard (Production) → **Webhooks**
2. Update endpoint URL:
   ```
   OLD: https://your-dev-domain.com/api/webhooks/clerk
   NEW: https://opusmentis.app/api/webhooks/clerk
   ```
3. Copy new **Signing Secret**
4. Update Railway env var:
   ```
   CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

---

### **Step 9: Configure Content Security Policy (Optional)**

If using CSP headers, add Clerk domains:

```typescript
// In your CSP configuration
Content-Security-Policy:
  script-src 'self' https://clerk.opusmentis.app https://*.clerk.accounts.dev;
  connect-src 'self' https://clerk.opusmentis.app https://*.clerk.accounts.dev;
  frame-src https://clerk.opusmentis.app https://*.clerk.accounts.dev;
```

---

### **Step 10: Deploy Certificates**

1. Clerk Dashboard homepage (Production instance)
2. Complete all required steps (should all be ✅ green)
3. Click **"Deploy certificates"** button
4. Wait for deployment (usually 1-5 minutes)

**Status:** Check deployment status on Clerk Dashboard homepage.

---

## 🔒 **Security: Configure `authorizedParties`**

**IMPORTANT for Production Security!**

Update your Clerk middleware to protect against subdomain attacks:

```typescript
// src/middleware.ts
import { clerkMiddleware } from '@clerk/nextjs/server'

export default clerkMiddleware({
  authorizedParties: ['https://opusmentis.app']
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
```

This prevents CSRF attacks and subdomain cookie leaking.

---

## ✅ **Post-Deployment Verification**

### **1. Test Authentication**
```
1. Go to https://opusmentis.app
2. Click "Sign In"
3. Should redirect to Clerk auth page
4. Sign in with Google (using production OAuth)
5. Should redirect to /dashboard
6. No errors in browser console
```

### **2. Check Railway Logs**
```
Should see:
✅ No "ENOTFOUND opusmentis.app" errors
✅ No "infinite redirect loop" errors
✅ Clerk authentication working
```

### **3. Verify SSL**
```
1. Visit https://opusmentis.app
2. Check for 🔒 padlock in browser
3. Click padlock → Certificate should be valid
4. Issued by: Let's Encrypt or Google Trust Services
```

### **4. Test API Endpoints**
```
1. Go to /api-playground
2. Test endpoints with production auth
3. All requests should work
```

---

## 🐛 **Troubleshooting**

### **Issue 1: DNS Not Propagating**

**Check DNS:**
```bash
dig opusmentis.app
dig accounts.opusmentis.app

# Should return Railway IP or CNAME
```

**If using Cloudflare:**
- Set DNS record to **"DNS Only"** (not proxied)
- Disable Cloudflare proxy for Clerk subdomain

---

### **Issue 2: Stuck in Certificate Issuance**

**Check CAA records:**
```bash
dig opusmentis.app +short CAA

# Should return empty or allow LetsEncrypt/Google Trust
```

**Fix:** Remove restrictive CAA records or add:
```
0 issue "letsencrypt.org"
0 issue "pki.goog"
```

---

### **Issue 3: Infinite Redirect Loop**

**Causes:**
1. Development keys in production
2. Domain mismatch
3. CLERK_PUBLISHABLE_KEY ≠ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

**Fix:**
```bash
# Verify Railway env vars:
CLERK_PUBLISHABLE_KEY=pk_live_xxx
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx (MUST MATCH!)
CLERK_SECRET_KEY=sk_live_xxx
```

Both publishable keys must be identical!

---

### **Issue 4: Wrong Domain Set**

If you accidentally set wrong domain:

1. Clerk Dashboard → **Domains**
2. Remove incorrect domain
3. Add correct domain: `opusmentis.app`
4. Update DNS records
5. Redeploy

---

## 📊 **Environment Variables Comparison**

| Variable | Development | Production |
|----------|------------|------------|
| CLERK_PUBLISHABLE_KEY | `pk_test_xxx` | `pk_live_xxx` ✅ |
| CLERK_SECRET_KEY | `sk_test_xxx` | `sk_live_xxx` ✅ |
| NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY | `pk_test_xxx` | `pk_live_xxx` ✅ |
| Domain | Railway domain | opusmentis.app ✅ |
| OAuth | Clerk shared | Your credentials ✅ |

---

## 🎯 **Deployment Order**

**Correct sequence to avoid downtime:**

1. ✅ Create production Clerk instance
2. ✅ Get production API keys
3. ✅ Configure Google OAuth credentials
4. ⏳ Add DNS records (can propagate while you work)
5. ✅ Update Railway environment variables
6. ✅ Add domain in Clerk
7. ✅ Add custom domain in Railway
8. ✅ Deploy certificates in Clerk
9. ✅ Test authentication
10. ✅ Verify in production

---

## 📝 **Post-Launch Checklist**

- [ ] All DNS records added and verified
- [ ] Clerk production instance deployed
- [ ] Railway using production Clerk keys
- [ ] Google OAuth credentials configured
- [ ] Custom domain working with SSL
- [ ] Authentication tested end-to-end
- [ ] No errors in Railway logs
- [ ] Webhooks updated (if applicable)
- [ ] CSP headers configured (if applicable)
- [ ] Security: `authorizedParties` set

---

## 🚀 **Quick Commands**

### **Check DNS:**
```bash
dig opusmentis.app
dig accounts.opusmentis.app
nslookup opusmentis.app
```

### **Check SSL:**
```bash
openssl s_client -connect opusmentis.app:443 -servername opusmentis.app
```

### **Test Webhook:**
```bash
curl -X POST https://opusmentis.app/api/webhooks/clerk \
  -H "Content-Type: application/json" \
  -H "svix-id: msg_xxx" \
  -H "svix-timestamp: 1234567890" \
  -H "svix-signature: v1,xxx" \
  -d '{"type":"user.created","data":{}}'
```

---

## 📚 **Resources**

- [Clerk Deployment Guide](https://clerk.com/docs/guides/development/deployment/production)
- [Railway Custom Domains](https://docs.railway.app/guides/public-networking#custom-domains)
- [Google OAuth Setup](https://clerk.com/docs/guides/configure/auth-strategies/social-connections/google)
- [Clerk DNS Records](https://clerk.com/docs/guides/dashboard/dns-domains)

---

**Ready to deploy!** Follow steps 1-10 in order. 🚀