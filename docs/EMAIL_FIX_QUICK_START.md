# 🚀 Email Service Fix - Quick Start Guide

## 🎯 The Problem
**Your registration works, but emails aren't being sent!**

Error: `500 Internal Server Error` when backend tries to send verification code.

---

## ⚡ Fastest Fix (5 Minutes)

### For Backend Team:

1. **Get SendGrid API Key** (Easiest option)
   - Go to https://sendgrid.com → Sign up (FREE)
   - Dashboard → Settings → API Keys → Create API Key
   - Copy the key (starts with `SG.`)

2. **Add to Railway**
   - Railway Dashboard → Your Project → Variables
   - Add these 3 variables:
     ```
     SENDGRID_API_KEY=SG.your-key-here
     EMAIL_SERVICE=sendgrid
     EMAIL_FROM=noreply@mash.com
     ```
   - Click "Deploy" to apply changes

3. **Install Package in Backend**
   ```bash
   npm install @sendgrid/mail
   ```

4. **Copy Email Service Code**
   - See `docs/BACKEND_EMAIL_SERVICE_FIX.md` → Section 3
   - Create `src/email/email.service.ts` with the SendGrid code
   - Update `src/auth/auth.service.ts` to use it

5. **Deploy & Test**
   ```bash
   git add .
   git commit -m "Add SendGrid email service"
   git push
   ```

---

## 🧪 Test It Works

### From Frontend (You can do this now):

```bash
cd MASH-Ecommerce-Web
node test-backend-email.js
```

**IMPORTANT**: Edit `test-backend-email.js` line 13:
```javascript
const TEST_EMAIL = 'your-actual-email@gmail.com'; // <-- PUT YOUR REAL EMAIL HERE
```

Then run it. You should see:
- ✅ Backend is reachable
- ✅ Registration endpoint responded successfully
- ✅ Check your email inbox for verification code!

---

## 📧 What Happens When It Works

1. User fills out `/signup` form
2. Frontend sends data to backend `/auth/register`
3. **Backend creates user in database**
4. **Backend generates random 6-digit code** (e.g., "123456")
5. **Backend sends email via SendGrid** 📧
6. User receives email with code
7. User enters code on `/verify-otp` page
8. Backend verifies code → returns JWT token
9. User is logged in ✅

---

## 🔍 How to Check Backend Logs

**If emails still not working after adding SendGrid:**

1. Go to Railway Dashboard
2. Click your backend project
3. Click "Deployments" tab
4. Click latest deployment
5. Look for errors like:
   - `❌ Failed to send verification email`
   - `SendGrid API key is invalid`
   - `Unauthorized`

**Common fixes:**
- API key copied wrong → Re-copy from SendGrid
- Environment variable not saved → Click "Deploy" after adding vars
- Package not installed → Run `npm install @sendgrid/mail` in backend

---

## 📝 Files Updated (Frontend - Already Done ✅)

| File | Status | What It Does |
|------|--------|--------------|
| `src/app/(auth)/signup/page.tsx` | ✅ Complete | Calls `/auth/register` API |
| `src/app/(auth)/verify-otp/page.tsx` | ✅ Complete | 6-digit code input, calls `/auth/verify-email-code` |
| `src/lib/api-client.ts` | ✅ Complete | Handles API requests with auth tokens |
| `src/lib/api/auth.ts` | ✅ Complete | Auth service wrapper for all auth endpoints |
| `src/lib/auth.ts` | ✅ Complete | Token storage/retrieval utilities |
| `.env.local` | ✅ Complete | Environment variables configured |

**Frontend is 100% ready! Issue is only on backend.**

---

## 🆘 Need Help?

### Option 1: Run Diagnostic Script
```bash
node test-backend-email.js
```
It will tell you exactly what's wrong!

### Option 2: Check Complete Guide
See `docs/BACKEND_EMAIL_SERVICE_FIX.md` for full step-by-step instructions.

### Option 3: Check Backend Code Examples
The complete guide has:
- ✅ Full `EmailService` implementation
- ✅ Full `AuthService.register()` code
- ✅ Prisma schema updates
- ✅ Module imports

Just copy-paste the code into your backend!

---

## ✅ Success Checklist

- [ ] SendGrid account created
- [ ] API key generated
- [ ] Railway environment variables added (`SENDGRID_API_KEY`, `EMAIL_SERVICE`, `EMAIL_FROM`)
- [ ] `@sendgrid/mail` package installed in backend
- [ ] `EmailService` created in backend (`src/email/email.service.ts`)
- [ ] `AuthService` updated to use `EmailService`
- [ ] Code deployed to Railway
- [ ] Diagnostic script shows ✅ success
- [ ] Test registration with real email → receive verification code
- [ ] Enter code on `/verify-otp` → successfully log in

---

## 🎉 When It's Fixed

You'll know it's working when:
1. Go to `/signup`
2. Register with your real email
3. See "Check your email" message
4. **Email arrives in inbox within 1-2 minutes** 📧
5. Enter 6-digit code on `/verify-otp`
6. **Successfully log in and redirect to `/onboarding`** 🎊

---

**Status**: 🔴 **NEEDS BACKEND FIX**  
**Time to Fix**: ~5-10 minutes  
**Difficulty**: ⭐ Easy (just add SendGrid)
