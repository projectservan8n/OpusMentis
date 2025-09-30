# OpusMentis - Quick Test Checklist

**30-Minute Manual Testing Guide for Production Verification**

---

## ⚡ **Quick Test Sequence**

### **Test 1: User Registration (2 min)**
1. Open incognito window → https://your-railway-url.com
2. Click "Sign Up"
3. Register with Google or email
4. Verify: Redirected to `/dashboard`

✅ **Pass if:** Dashboard loads, shows "Welcome" message

---

### **Test 2: File Upload (5 min)**
**Prepare:** Download a small PDF (5-10 pages) to your desktop

1. Click "Upload" in sidebar
2. Drag & drop the PDF
3. Wait for processing (should take 1-3 minutes)
4. Verify: Progress indicator shows
5. Wait for completion
6. Verify: Redirected to study pack viewer

✅ **Pass if:**
- File uploads successfully
- Processing completes
- Summary appears (not empty)
- Flashcards generated
- Kanban board has tasks

❌ **Fail if:**
- Upload times out
- Processing stuck at "processing" forever
- No summary/flashcards generated
- Error message appears

**If failed:** Check OpenAI API key in Railway

---

### **Test 3: Study Pack Features (3 min)**
1. View the generated study pack
2. Switch between tabs: Summary, Kanban, Flashcards, Notes
3. Try dragging a kanban task to different column
4. Click a flashcard to flip it
5. Try adding a note in Notes tab

✅ **Pass if:** All tabs work, interactions smooth

---

### **Test 4: Payment Submission (5 min)**
1. Go to "Billing" in sidebar
2. Click "Upgrade to Pro" (₱149)
3. Modal opens with GCash details
4. Upload a dummy screenshot (any image)
5. Enter fake reference number: "TEST123456789"
6. Submit

✅ **Pass if:**
- Payment proof uploads
- Discord notification received
- Billing page shows "Payment Under Review" badge

**Check Discord:** You should see notification with:
- User email
- Plan requested: PRO
- Amount: ₱149
- Reference: TEST123456789

---

### **Test 5: Admin Panel (5 min)**
1. **Important:** Login as `tony@opusautomations.com`
2. Go to `/admin`
3. Check dashboard stats:
   - Total users (should show >= 1)
   - Total study packs (should show >= 1)
   - Pending payments (should show 1 from Test 4)

4. Scroll to "Payment Approvals" section
5. Find the test payment from Test 4
6. Click "Approve"
7. Check Discord for approval notification

✅ **Pass if:**
- Admin panel loads
- Stats accurate
- Can approve payment
- Discord approval notification received

---

### **Test 6: Verify Upgrade (2 min)**
1. Logout from admin account
2. Login as the test user from Test 1
3. Go to `/billing`
4. Verify: Badge now shows "PRO"
5. Check expiration date (should be 30 days from now)

✅ **Pass if:** User upgraded, expiration set correctly

---

### **Test 7: Pro User Features (3 min)**
1. Go to `/upload`
2. Try uploading another file
3. Verify: No "3 uploads per month" limit warning
4. Go to study pack
5. Click "Export to PDF"
6. Verify: PDF downloads

✅ **Pass if:**
- Pro user can upload unlimited
- PDF export works
- PDF contains all study pack content

---

### **Test 8: Admin User List (2 min)**
1. Login as admin (`tony@opusautomations.com`)
2. Go to `/admin`
3. Scroll to "Recent Users" section
4. Verify: Test user appears in list
5. Check user details:
   - Email shown
   - Subscription tier: PRO
   - Study pack count: 1 (or more)
   - Last active: recent timestamp

✅ **Pass if:** User list accurate, data correct

---

### **Test 9: Notes CRUD (3 min)**
1. Go to any study pack
2. Click "Notes" tab
3. Click "Add Note"
4. Enter content: "Test note for OpusMentis"
5. Select section: "Summary"
6. Save
7. Verify: Note appears in list
8. Edit the note
9. Delete the note

✅ **Pass if:** Create, read, update, delete all work

---

### **Test 10: Settings Page (2 min)**
1. Click "Settings" in sidebar
2. Verify:
   - Profile info shows correct
   - AI preferences can be changed
   - Export preferences can be toggled
   - "About OpusMentis" section shows (not StudyFlow AI)

✅ **Pass if:** All settings load, branding correct

---

## 🚨 **Critical Issues to Watch For**

### **Blocker Issues (Fix Immediately):**
- ❌ File upload fails or times out
- ❌ OpenAI processing returns empty results
- ❌ Payment approval doesn't upgrade user
- ❌ Admin panel doesn't load
- ❌ Discord webhooks not firing

### **High Priority Issues (Fix Soon):**
- ⚠️ PDF export fails
- ⚠️ Notes don't save
- ⚠️ Study pack viewer crashes
- ⚠️ Expiration date not set on approval

### **Low Priority Issues (Can Wait):**
- 🔵 UI styling inconsistencies
- 🔵 Mobile responsive issues
- 🔵 Auto-refresh in admin panel slow

---

## 📊 **Test Results Template**

```
OpusMentis Production Test - [DATE]
Tested by: [YOUR NAME]
Railway URL: [YOUR URL]

✅ PASS | ❌ FAIL | ⚠️ PARTIAL

[ ] Test 1: User Registration
[ ] Test 2: File Upload & AI Processing
[ ] Test 3: Study Pack Features
[ ] Test 4: Payment Submission
[ ] Test 5: Admin Panel Access
[ ] Test 6: Verify Upgrade
[ ] Test 7: Pro User Features
[ ] Test 8: Admin User List
[ ] Test 9: Notes CRUD
[ ] Test 10: Settings Page

Overall Status: ________
Critical Issues: ________
Notes: ________________
```

---

## 🔍 **Where to Check for Errors**

### **Railway Logs:**
```bash
# View real-time logs in Railway dashboard
# Look for:
- [err] messages
- OpenAI API errors
- Database connection errors
- 500 status codes
```

### **Discord Webhooks:**
Check your Discord server for notifications:
- 🔔 New payment submission (orange)
- ✅ Payment approved (green)
- ❌ Payment rejected (red)

### **Database (Railway PostgreSQL):**
```sql
-- Check users created
SELECT * FROM "User" ORDER BY "createdAt" DESC LIMIT 10;

-- Check study packs
SELECT * FROM "StudyPack" ORDER BY "createdAt" DESC LIMIT 10;

-- Check payment proofs
SELECT * FROM "PaymentProof" ORDER BY "createdAt" DESC;

-- Check notes
SELECT * FROM "Note" ORDER BY "createdAt" DESC LIMIT 10;
```

---

## ✅ **Success Criteria**

**Production Ready if:**
- All 10 tests pass
- No critical issues
- Discord webhooks working
- OpenAI API processing files
- Admin can approve payments
- Users can upload and generate study packs

**Not Ready if:**
- File upload fails
- AI processing returns nothing
- Payment approvals don't work
- Admin panel inaccessible

---

## 🎯 **Next Steps After Testing**

### **If All Tests Pass:**
1. ✅ Mark production ready
2. 🚀 Announce launch
3. 📊 Monitor metrics for 24 hours
4. 💰 Start accepting real payments

### **If Tests Fail:**
1. 📝 Document failures in test results
2. 🐛 Create bug list with priorities
3. 🔧 Fix critical issues first
4. 🔄 Re-test after fixes

---

**Happy Testing! 🚀**

For detailed API documentation, see `API_TESTING_GUIDE.md`