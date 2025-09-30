# 🚀 OpusMentis - Production Deployment Checklist

## ✅ **CRITICAL - Must Do Before Launch**

### 1. Railway Volume Setup (File Storage)
- [ ] Go to Railway dashboard → Your service
- [ ] Navigate to "Variables" tab
- [ ] Scroll to "Volumes" section
- [ ] Click "+ New Volume"
- [ ] Set Mount Path: `/app/uploads`
- [ ] Set Size: **5-10 GB** (start small, can increase later)
- [ ] Click "Add"
- [ ] **Cost: ~$1.25-2.50/month**

**Why:** Without this, all uploaded files will be deleted on every redeploy!

---

### 2. OpenAI API Key Setup
- [ ] Go to [platform.openai.com](https://platform.openai.com)
- [ ] Create API key
- [ ] Add to Railway environment variables:
  ```
  OPENAI_API_KEY=sk-proj-xxxxx
  ```
- [ ] Verify you have credits/billing set up
- [ ] Test models needed:
  - `whisper-1` (audio transcription)
  - `gpt-4-turbo-preview` or `gpt-3.5-turbo` (content generation)

**Cost:** ~$0.01-0.05 per study pack generated (depends on file size)

**Why:** Without this, AI processing completely fails - users get error messages instead of study materials.

---

### 3. Environment Variables Check
Verify all these are set in Railway:

```bash
# Database (Auto-provided by Railway)
DATABASE_URL=postgresql://...

# Clerk Authentication (REQUIRED)
CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# OpenAI (REQUIRED for AI features)
OPENAI_API_KEY=sk-proj-xxx

# Node Environment
NODE_ENV=production
```

---

### 4. Test Critical Flows
After deployment, test these flows:

**User Registration & Auth:**
- [ ] Sign up with Google OAuth works
- [ ] Login works
- [ ] Dashboard loads after login

**File Upload & AI Processing:**
- [ ] Upload a PDF (< 10 pages for free tier)
- [ ] File uploads successfully
- [ ] Processing starts (shows "processing" status)
- [ ] AI generates summary, flashcards, kanban tasks
- [ ] Study pack displays correctly

**Payment System:**
- [ ] User can upload GCash payment proof
- [ ] Screenshot gets saved
- [ ] Discord webhook fires (check your Discord)
- [ ] Admin can see payment in admin panel (`/admin`)
- [ ] Admin can approve payment
- [ ] User subscription upgrades
- [ ] Discord approval webhook fires

**Admin Panel:**
- [ ] Login as `tony@opusautomations.com`
- [ ] Can see real-time stats
- [ ] Can view all users
- [ ] Can approve/reject payments
- [ ] Auto-refresh works

---

## ⚠️ **HIGH PRIORITY - Launch Week 1**

### 5. Set Up Error Monitoring
**Option A: Sentry (Recommended)**
```bash
npm install @sentry/nextjs
# Follow setup wizard
npx @sentry/wizard@latest -i nextjs
```

**Option B: LogRocket**
```bash
npm install logrocket
```

Add to Railway env vars:
```
SENTRY_DSN=https://xxx@sentry.io/xxx
```

**Why:** You need to know when things break in production!

---

### 6. Add Rate Limiting
Prevent API abuse:

```bash
npm install express-rate-limit
```

Add to critical routes:
- `/api/upload` (max 10 uploads per hour)
- `/api/payment-proofs` (max 5 submissions per hour)
- `/api/admin/*` (admin routes)

**Why:** Prevent abuse, control costs

---

### 7. Set Up Uptime Monitoring
**Free Options:**
- [UptimeRobot](https://uptimerobot.com) - Free 50 monitors
- [Healthchecks.io](https://healthchecks.io) - Free 20 checks
- Railway Health Checks (built-in)

Monitor:
- [ ] Homepage: `https://your-domain.com`
- [ ] API health: `https://your-domain.com/api/health`
- [ ] Database connection

---

## 📋 **MEDIUM PRIORITY - Month 1**

### 8. Enforce Subscription Limits
Currently checking but not enforcing:

**Files to update:**
- [ ] `src/lib/subscriptions.ts` - Add PDF page count validation
- [ ] `src/lib/subscriptions.ts` - Add audio/video duration validation
- [ ] `src/app/api/upload/route.ts` - Reject files exceeding limits

**Limits to enforce:**
- Free: PDF ≤ 10 pages, Audio/Video ≤ 10 min
- Pro: PDF ≤ 50 pages, Audio/Video ≤ 60 min
- Premium: PDF ≤ 200 pages, Audio/Video ≤ 180 min

---

### 9. Implement Email Notifications
Use [Resend](https://resend.com) (100 emails/day free) or SendGrid

**Emails needed:**
- [ ] Payment approved confirmation
- [ ] Payment rejected notification
- [ ] Subscription expiring (7 days warning)
- [ ] Subscription expired notice
- [ ] Study pack processing complete
- [ ] Welcome email on sign-up

---

### 10. PDF Export Feature
Complete the PDF export functionality:

**File:** `src/app/api/study-packs/[id]/export/route.ts`

Currently returns mock data - needs pdf-lib implementation:
```typescript
import { PDFDocument, rgb } from 'pdf-lib'
// Generate actual PDF from study pack data
```

---

### 11. Analytics Setup
Track user behavior and conversions:

**Options:**
- [PostHog](https://posthog.com) - Free 1M events/month
- [Plausible](https://plausible.io) - Privacy-focused
- [Mixpanel](https://mixpanel.com) - Free tier available

**Events to track:**
- User sign-ups
- File uploads (by type)
- AI processing completions
- Payment submissions
- Subscription upgrades
- Feature usage (flashcards, kanban, notes)

---

## 📌 **LOW PRIORITY - Month 2+**

### 12. Team Sharing (Premium Feature)
- [ ] Create team management UI
- [ ] Implement team invitation system
- [ ] Add permission controls
- [ ] Share study packs within teams

### 13. Advanced Features
- [ ] Spaced repetition for flashcards
- [ ] Progress tracking per user
- [ ] Study streaks and gamification
- [ ] Mobile app (PWA or React Native)

### 14. Integrations
- [ ] Google Drive import
- [ ] Notion integration
- [ ] Calendar sync for study schedules
- [ ] Anki flashcard export

---

## 💰 **Expected Costs (Monthly)**

| Service | Cost | Purpose |
|---------|------|---------|
| Railway Postgres | ~$5 | Database |
| Railway Volume (10GB) | ~$2.50 | File storage |
| OpenAI API | ~$10-50 | AI processing (depends on usage) |
| Clerk | Free | Authentication (free tier: 10k MAU) |
| Railway Compute | ~$5 | App hosting |
| **Total** | **~$22.50-62.50** | MVP monthly costs |

**Revenue needed:** ~1 Pro subscriber/month to break even!

---

## 🎯 **Current Status**

### What's Working ✅
- User authentication & management
- Manual GCash payment system
- Admin dashboard with real-time data
- Discord notifications
- Database & relationships
- UI components
- Subscription expiration tracking

### What Needs Setup 🚨
- **Railway Volume** (files will be lost without this!)
- **OpenAI API key** (AI features won't work!)
- Error monitoring
- Rate limiting
- Email notifications

### What Can Wait 📅
- PDF export
- Team sharing
- Advanced analytics
- Mobile app

---

## 📞 **Support Contacts**

- **Admin Email:** tony@opusautomations.com
- **Support Email:** team@opusautomations.com
- **Discord Webhook:** Already configured ✅
- **Company:** Opus Automations

---

## 🚨 **Immediate Action Items**

**Do these TODAY before accepting real users:**

1. ✅ **Add Railway Volume** (`/app/uploads`, 10GB)
2. ✅ **Add OpenAI API Key** (with billing enabled)
3. ✅ **Test upload → AI processing flow**
4. ✅ **Test payment approval workflow**
5. ✅ **Verify Discord webhooks working**

**After these 5 steps, you can accept users!**

Everything else can be added incrementally as you grow.