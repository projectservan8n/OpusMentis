# OpusMentis API Testing Guide

**Complete endpoint testing documentation for production deployment.**

---

## 📋 **API Endpoints Inventory**

### **Authentication & User Management**
- `POST /api/webhooks/clerk` - Clerk user lifecycle webhooks

### **Subscription Management**
- `GET /api/subscription/status` - Get user's subscription status and expiration
- `GET /api/payment-proofs/status` - Check pending/rejected payment proofs
- `POST /api/payment-proofs` - Submit GCash payment proof
- `POST /api/admin/payment-proofs` - Approve/reject payment proofs (admin only)
- `POST /api/admin/process-expired` - Process expired subscriptions (cron job)

### **File Upload & AI Processing**
- `POST /api/upload` - Upload file and trigger AI processing

### **Study Packs**
- `GET /api/study-packs` - List user's study packs
- `GET /api/study-packs/[id]` - Get specific study pack details
- `PATCH /api/study-packs/[id]` - Update study pack (title, description)
- `DELETE /api/study-packs/[id]` - Delete study pack
- `GET /api/study-packs/[id]/status` - Get processing status
- `POST /api/study-packs/[id]/export` - Export study pack to PDF

### **Notes**
- `GET /api/study-packs/[id]/notes` - Get all notes for a study pack
- `POST /api/study-packs/[id]/notes` - Create new note
- `PATCH /api/notes/[id]` - Update note content
- `DELETE /api/notes/[id]` - Delete note

### **Admin Panel**
- `GET /api/admin/stats` - Get real-time dashboard statistics
- `GET /api/admin/users` - List all users with details

---

## 🧪 **Testing Checklist**

### **1. Authentication & User Webhooks**

#### **Test: User Creation Webhook**
```bash
# Trigger: Sign up a new user via /sign-up
# Expected: User created in database with default 'free_plan' tier
```

**Manual Test Steps:**
1. Go to `/sign-up`
2. Create account with Google or Email
3. Verify user exists in database:
   ```sql
   SELECT * FROM "User" WHERE email = 'test@example.com';
   ```
4. Check Clerk metadata has `plan: 'free_plan'`

**✅ Success Criteria:**
- User record created in database
- Clerk webhook received and processed
- Default subscription tier set to 'free_plan'

---

### **2. Subscription Status**

#### **Test: GET /api/subscription/status**
```bash
curl -X GET "https://your-domain.com/api/subscription/status" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN"
```

**Expected Response:**
```json
{
  "tier": "free",
  "expiresAt": null,
  "daysRemaining": null
}
```

**Test Cases:**
- [ ] Free user returns tier: 'free', expiresAt: null
- [ ] Pro user returns tier: 'pro', expiresAt: valid date
- [ ] Premium user returns tier: 'premium', expiresAt: valid date
- [ ] Expired subscription returns tier: 'free'

---

### **3. Payment Proof Submission**

#### **Test: POST /api/payment-proofs**
```bash
# Use multipart/form-data with file upload
```

**Test via UI:**
1. Go to `/billing`
2. Click "Upgrade to Pro"
3. Follow GCash payment modal
4. Upload screenshot (PNG/JPG)
5. Enter reference number
6. Submit

**Expected:**
- Payment proof saved to database with status: 'pending'
- Screenshot saved to `/app/uploads` directory
- Discord webhook notification sent
- User sees "Payment Under Review" badge

**✅ Success Criteria:**
- [ ] File uploads successfully
- [ ] Database record created with correct planRequested
- [ ] Discord notification received
- [ ] UI updates to show pending status

---

### **4. Payment Approval Flow (Admin)**

#### **Test: POST /api/admin/payment-proofs**
```json
{
  "paymentProofId": "clxxxxx",
  "action": "approve",
  "adminNotes": "Payment verified"
}
```

**Test via UI:**
1. Login as admin: `tony@opusautomations.com`
2. Go to `/admin`
3. Find pending payment in "Payment Approvals" section
4. Click "Approve"

**Expected:**
- Payment proof status → 'approved'
- User's Clerk metadata updated to new tier
- `expiresAt` set to 30 days from now in PaymentProof table
- Discord approval notification sent
- User's billing page shows upgraded tier

**✅ Success Criteria:**
- [ ] Payment status updated to 'approved'
- [ ] User subscription tier upgraded in Clerk
- [ ] Expiration date set correctly (30 days)
- [ ] Discord webhook fires
- [ ] User can access Pro/Premium features

#### **Test: Rejection Flow**
```json
{
  "paymentProofId": "clxxxxx",
  "action": "reject",
  "adminNotes": "Incorrect amount"
}
```

**Expected:**
- Payment proof status → 'rejected'
- User remains on current tier
- Discord rejection notification sent
- User sees "Payment Rejected" badge with option to resubmit

---

### **5. File Upload & AI Processing**

#### **Test: POST /api/upload**
```bash
# Upload a test PDF (< 10 pages for Free tier)
```

**Test Files Needed:**
- ✅ `test-pdf-5pages.pdf` (should succeed for Free tier)
- ⚠️ `test-pdf-15pages.pdf` (should fail for Free tier)
- ✅ `test-audio-5min.mp3` (should succeed for Free tier)
- ⚠️ `test-audio-15min.mp3` (should fail for Free tier)

**Test via UI:**
1. Go to `/upload`
2. Drag and drop test PDF
3. Click "Upload and Process"
4. Monitor processing status

**Expected Flow:**
1. File validation (size, type, page count)
2. File saved to `/app/uploads`
3. Study pack created with status: 'processing'
4. AI processing:
   - PDF → text extraction (pdf-parse)
   - Audio/Video → Whisper transcription
   - Text → OpenAI GPT summary + flashcards + kanban
5. Study pack updated with AI results
6. Status changed to 'completed'

**✅ Success Criteria:**
- [ ] File uploads and saves to volume
- [ ] Study pack created in database
- [ ] OpenAI API called successfully
- [ ] Summary generated (not empty)
- [ ] Flashcards generated (array with Q&A)
- [ ] Kanban tasks generated (with columns)
- [ ] Status updates to 'completed'
- [ ] User redirected to study pack viewer

**❌ Expected Failures:**
- [ ] Free user uploading 15-page PDF → error message
- [ ] Invalid file type → error message
- [ ] File > plan limit → upgrade prompt

---

### **6. Study Pack Operations**

#### **Test: GET /api/study-packs**
```bash
curl -X GET "https://your-domain.com/api/study-packs" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN"
```

**Expected Response:**
```json
[
  {
    "id": "clxxxxx",
    "title": "My Study Pack",
    "status": "completed",
    "createdAt": "2024-01-01T00:00:00Z",
    "summary": "...",
    "flashcards": "[...]",
    "kanbanTasks": "[...]"
  }
]
```

**✅ Success Criteria:**
- [ ] Returns only current user's study packs
- [ ] Sorted by createdAt descending
- [ ] Includes all fields

---

#### **Test: GET /api/study-packs/[id]**
```bash
curl -X GET "https://your-domain.com/api/study-packs/clxxxxx" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN"
```

**✅ Success Criteria:**
- [ ] Returns full study pack details
- [ ] Includes notes relationship
- [ ] 404 if study pack doesn't exist
- [ ] 403 if trying to access another user's study pack

---

#### **Test: PATCH /api/study-packs/[id]**
```bash
curl -X PATCH "https://your-domain.com/api/study-packs/clxxxxx" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -d '{
    "title": "Updated Title",
    "description": "New description"
  }'
```

**Test via UI:**
1. Go to study pack viewer
2. Edit title or description
3. Save changes

**✅ Success Criteria:**
- [ ] Title/description updated in database
- [ ] UI reflects changes immediately
- [ ] Cannot update another user's study pack

---

#### **Test: DELETE /api/study-packs/[id]**
```bash
curl -X DELETE "https://your-domain.com/api/study-packs/clxxxxx" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN"
```

**Test via UI:**
1. Go to dashboard
2. Click delete on a study pack
3. Confirm deletion

**✅ Success Criteria:**
- [ ] Study pack deleted from database
- [ ] Associated notes deleted (cascade)
- [ ] Removed from dashboard list
- [ ] Cannot delete another user's study pack

---

### **7. Notes Operations**

#### **Test: GET /api/study-packs/[id]/notes**
```bash
curl -X GET "https://your-domain.com/api/study-packs/clxxxxx/notes" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN"
```

**Expected Response:**
```json
[
  {
    "id": "clxxxxx",
    "content": "My note content",
    "section": "summary",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

---

#### **Test: POST /api/study-packs/[id]/notes**
```bash
curl -X POST "https://your-domain.com/api/study-packs/clxxxxx/notes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -d '{
    "content": "My new note",
    "section": "flashcards"
  }'
```

**Test via UI:**
1. Go to study pack viewer
2. Switch to "Notes" tab
3. Click "Add Note"
4. Enter content and select section
5. Save

**✅ Success Criteria:**
- [ ] Note created in database
- [ ] Associated with correct study pack
- [ ] Shows in notes list immediately

---

#### **Test: PATCH /api/notes/[id]**
```bash
curl -X PATCH "https://your-domain.com/api/notes/clxxxxx" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -d '{
    "content": "Updated note content"
  }'
```

**✅ Success Criteria:**
- [ ] Note content updated
- [ ] UI reflects changes
- [ ] Cannot update another user's note

---

#### **Test: DELETE /api/notes/[id]**
```bash
curl -X DELETE "https://your-domain.com/api/notes/clxxxxx" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN"
```

**✅ Success Criteria:**
- [ ] Note deleted from database
- [ ] Removed from UI
- [ ] Cannot delete another user's note

---

### **8. PDF Export**

#### **Test: POST /api/study-packs/[id]/export**
```bash
curl -X POST "https://your-domain.com/api/study-packs/clxxxxx/export" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  --output study-pack.pdf
```

**Test via UI:**
1. Go to study pack viewer
2. Click "Export to PDF" button
3. Verify PDF downloads

**Expected PDF Contents:**
- OpusMentis branding
- Study pack title and metadata
- AI-generated summary
- Key topics list
- Flashcards with Q&A
- Kanban tasks by column
- Personal notes
- Footer: "Generated by OpusMentis"

**✅ Success Criteria:**
- [ ] PDF generates successfully
- [ ] All sections included
- [ ] Proper formatting
- [ ] Branding correct (OpusMentis)
- [ ] Pro/Premium users can export
- [ ] Free users see upgrade prompt

---

### **9. Admin Panel**

#### **Test: GET /api/admin/stats**
```bash
curl -X GET "https://your-domain.com/api/admin/stats" \
  -H "Authorization: Bearer ADMIN_CLERK_TOKEN"
```

**Expected Response:**
```json
{
  "totalUsers": 42,
  "newUsersThisMonth": 12,
  "totalStudyPacks": 156,
  "activeSubscriptions": 8,
  "pendingPayments": 3,
  "totalRevenue": "₱1,192",
  "processingJobs": 2
}
```

**Test via UI:**
1. Login as `tony@opusautomations.com`
2. Go to `/admin`
3. Verify stats display correctly
4. Check auto-refresh works (every 30 seconds)

**✅ Success Criteria:**
- [ ] Only accessible by admin email
- [ ] All stats calculated correctly
- [ ] Real-time data from database
- [ ] Auto-refresh works

---

#### **Test: GET /api/admin/users**
```bash
curl -X GET "https://your-domain.com/api/admin/users" \
  -H "Authorization: Bearer ADMIN_CLERK_TOKEN"
```

**Expected Response:**
```json
[
  {
    "id": "user_xxx",
    "email": "user@example.com",
    "name": "John Doe",
    "subscriptionTier": "pro",
    "studyPackCount": 5,
    "lastActive": "2024-01-01T00:00:00Z",
    "createdAt": "2023-12-01T00:00:00Z"
  }
]
```

**✅ Success Criteria:**
- [ ] Lists all users (Clerk + database combined)
- [ ] Shows accurate study pack counts
- [ ] Subscription tier from Clerk metadata
- [ ] Last active calculated from most recent activity
- [ ] Only accessible by admin

---

### **10. Subscription Expiration Processing**

#### **Test: POST /api/admin/process-expired**
```bash
curl -X POST "https://your-domain.com/api/admin/process-expired" \
  -H "Authorization: Bearer ADMIN_CLERK_TOKEN"
```

**Expected Behavior:**
1. Finds all PaymentProof records with expiresAt < now()
2. Downgrades users to 'free_plan' in Clerk
3. Returns list of processed users

**Manual Test:**
1. Create payment proof with expiresAt in the past (via DB edit)
2. Call endpoint
3. Verify user downgraded to Free tier

**✅ Success Criteria:**
- [ ] Expired subscriptions detected
- [ ] Users downgraded to free_plan
- [ ] Clerk metadata updated
- [ ] Response includes processed user count

**Note:** This should be set up as a Railway cron job to run daily.

---

## 🔒 **Security Tests**

### **Authorization Tests**
- [ ] Unauthenticated user cannot access protected endpoints (401)
- [ ] User cannot access another user's study packs (403)
- [ ] User cannot access another user's notes (403)
- [ ] Non-admin cannot access `/api/admin/*` endpoints (403)
- [ ] Admin endpoints only work for `tony@opusautomations.com`

### **Input Validation Tests**
- [ ] Invalid file types rejected
- [ ] Files exceeding plan limits rejected
- [ ] SQL injection attempts handled safely
- [ ] XSS attempts in notes/titles sanitized

### **Rate Limiting** (TODO - Not implemented yet)
- [ ] Upload endpoint limited to prevent abuse
- [ ] Payment proof submission limited

---

## 📊 **Performance Tests**

### **File Processing**
- [ ] 5-page PDF processes in < 2 minutes
- [ ] 10-minute audio processes in < 3 minutes
- [ ] No timeout errors for valid files

### **Database Queries**
- [ ] Study pack list loads in < 500ms
- [ ] Admin dashboard loads in < 1 second
- [ ] Notes queries are fast (< 200ms)

---

## 🐛 **Error Handling Tests**

### **Expected Errors**
- [ ] 401 when not authenticated
- [ ] 403 when accessing unauthorized resource
- [ ] 404 when resource doesn't exist
- [ ] 400 when invalid input provided
- [ ] 500 with proper error message (no stack traces to user)

### **AI Processing Errors**
- [ ] OpenAI API failure handled gracefully
- [ ] Invalid PDF format detected and reported
- [ ] Corrupted file upload handled
- [ ] Study pack status set to 'failed' if processing fails

---

## ✅ **Critical Path Test Scenarios**

### **Scenario 1: New User Complete Flow**
1. Sign up → User created ✅
2. Upload PDF → Study pack created ✅
3. View study pack → Summary/flashcards display ✅
4. Create note → Note saved ✅
5. Export PDF → Download successful ✅
6. Hit upload limit → Upgrade prompt ✅

### **Scenario 2: Payment & Upgrade Flow**
1. User at upload limit → Upgrade prompt ✅
2. Go to billing → See plans ✅
3. Choose Pro plan → GCash modal opens ✅
4. Upload payment proof → Discord notification ✅
5. Admin approves → User upgraded ✅
6. User can upload again → No limits ✅

### **Scenario 3: Subscription Expiration**
1. User has Pro plan with expiresAt = today ✅
2. Cron job runs → User downgraded ✅
3. User sees "Expired" message ✅
4. User uploads hit limit again ✅
5. User can renew subscription ✅

---

## 🚀 **Production Readiness Checklist**

### **Before Launch**
- [ ] All critical endpoints tested manually
- [ ] OpenAI API key verified working
- [ ] Railway Volume configured (50GB at /app/uploads)
- [ ] Discord webhooks firing correctly
- [ ] Admin email configured (`tony@opusautomations.com`)
- [ ] Database backups enabled in Railway
- [ ] Error monitoring set up (Sentry recommended)
- [ ] Clerk webhooks endpoint accessible

### **Post-Launch Monitoring**
- [ ] Monitor upload success rate (target: >95%)
- [ ] Monitor AI processing times (target: <3 min average)
- [ ] Monitor payment approval flow
- [ ] Check Discord notifications working
- [ ] Verify Railway Volume usage
- [ ] Monitor database size

---

## 📝 **Test Results Log**

| Endpoint | Status | Tested By | Date | Notes |
|----------|--------|-----------|------|-------|
| `/api/upload` | ⏳ Pending | - | - | Needs OpenAI key test |
| `/api/payment-proofs` | ⏳ Pending | - | - | Test file upload |
| `/api/admin/payment-proofs` | ⏳ Pending | - | - | Test approval flow |
| `/api/study-packs` | ⏳ Pending | - | - | Test CRUD |
| `/api/notes` | ⏳ Pending | - | - | Test CRUD |
| `/api/study-packs/[id]/export` | ⏳ Pending | - | - | Test PDF generation |
| `/api/admin/stats` | ⏳ Pending | - | - | Test admin access |
| `/api/admin/users` | ⏳ Pending | - | - | Test admin access |

---

**Generated for OpusMentis MVP - Railway Deployment**
**Last Updated:** 2024-09-30