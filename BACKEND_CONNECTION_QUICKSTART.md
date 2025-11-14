# 🎯 MASH Backend Connection - Quick Start

## ✅ Implementation Complete!

All backend connection work is finished. The system now automatically routes:

- 📧 **Email endpoints** → Localhost backend (`http://localhost:3000`)
- 🔑 **Login endpoints** → Production backend (Railway)

---

## 🚀 Next Steps (Testing)

### Step 1: Start Local Backend

```bash
# Navigate to your backend directory
cd path/to/your/backend

# Install dependencies (if not done)
npm install

# Start backend in development mode
npm run start:dev

# You should see:
# "Application is running on: http://localhost:3000"
```

### Step 2: Start Frontend

```bash
# In this directory (MASH-Ecommerce-Web)
npm run dev

# Frontend will run on http://localhost:3001 (or next available port)
```

### Step 3: Run Test Script

```bash
# In this directory
node test-backend-connection.js
```

**IMPORTANT**: Before running, edit `test-backend-connection.js`:

- Line 8: Change `TEST_EMAIL` to your real email address
- You'll receive actual verification codes at this email

---

## 📧 Test Registration Flow

1. **Open**: `http://localhost:3001/signup` (or your frontend port)
2. **Fill form**:
   - First Name: Your name
   - Last Name: Your surname
   - Email: **YOUR REAL EMAIL** (you'll receive codes here)
   - Password: Strong password (8+ chars, uppercase, lowercase, numbers, special chars)
3. **Submit**: Click "Create Account"
4. **Expected**: "Check your email for verification code" message
5. **Check email**: Look for email from MASH (check spam folder too!)
6. **Copy code**: 6-digit code (e.g., "123456")
7. **Navigate**: `http://localhost:3001/verify-otp`
8. **Enter**: Email + 6-digit code
9. **Verify**: Click "Verify Code"
10. **Success**: Should be logged in → Redirected to `/onboarding` or `/shop`

**Backend Used**: 🏠 Localhost (has working email service)

---

## 🔑 Test Login Flow

1. **Open**: `http://localhost:3001/login`
2. **Enter**: Email + Password
3. **Login**: Click "Log In"
4. **Expected**: Logged in → Redirected to `/shop`

**Backend Used**: ☁️ Production (Railway)

**Note**: Login may fail because:

- User was registered on LOCAL backend (different database)
- Production backend doesn't have this user yet

**Solution**: Once production email service is configured, all users will be in same database.

---

## 🔐 Test Password Reset

1. **Open**: `http://localhost:3001/forgot-password`
2. **Enter**: Your email
3. **Submit**: Click "Send Reset Code"
4. **Check email**: Look for password reset email
5. **Copy code**: 6-digit reset code
6. **Navigate**: `http://localhost:3001/reset-password`
7. **Enter**: Email + Code + New Password
8. **Submit**: Click "Reset Password"
9. **Success**: "Password reset successfully" message
10. **Test**: Login with new password

**Backend Used**: 🏠 Localhost (has working email service)

---

## 🔍 Verify It's Working

### Check Browser Console (F12)

You should see logs like:

```
[API] 📧 Email endpoint detected: /auth/register → Using LOCAL backend (http://localhost:3000/api/v1)
[API] 📡 Request: POST http://localhost:3000/api/v1/auth/register

[API] ☁️ Standard endpoint: /auth/login → Using PRODUCTION backend (http://localhost:3000/api/v1)
[API] 📡 Request: POST http://localhost:3000/api/v1/auth/login
```

### Check Network Tab (F12 → Network)

- **Registration request**: Should go to `http://localhost:3000/api/v1/auth/register`
- **Login request**: Should go to `http://localhost:3000/api/v1/auth/login`

---

## 📝 Files Changed Summary

| File                                                 | Status     | Purpose                                     |
| ---------------------------------------------------- | ---------- | ------------------------------------------- |
| `.env.local`                                         | ✅ Updated | Added local backend URL + email service env |
| `.env.local.example`                                 | ✅ Created | Template for future setup                   |
| `src/lib/api-client.ts`                              | ✅ Updated | Dual-backend routing logic                  |
| `test-backend-connection.js`                         | ✅ Created | Automated testing script                    |
| `docs/IMPLEMENTATION_COMPLETE_BACKEND_CONNECTION.md` | ✅ Created | Complete implementation guide               |
| `docs/BACKEND_CONNECTION_PROGRESS.md`                | ✅ Updated | Progress tracking                           |

---

## ⚠️ Troubleshooting

### "Local backend not running"

**Fix**: Start backend with `npm run start:dev` in backend directory

### "Email not received"

**Fix**:

1. Check spam folder
2. Verify SendGrid/SMTP configured on backend
3. Run `node test-backend-email.js` to diagnose

### "Login fails after verification"

**Reason**: User in local database, trying to login on production (different databases)

**Fix**: Wait for production email service, then register on production

### "Wrong backend being used"

**Fix**: Check `.env.local` - ensure `NEXT_PUBLIC_EMAIL_SERVICE_ENV=local`

---

## 📚 Full Documentation

- **Implementation Guide**: `docs/IMPLEMENTATION_COMPLETE_BACKEND_CONNECTION.md`
- **Planning Document**: `docs/BACKEND_CONNECTION_PLAN.md`
- **Progress Tracker**: `docs/BACKEND_CONNECTION_PROGRESS.md`
- **Visual Guide**: `docs/BACKEND_CONNECTION_VISUAL_GUIDE.md`
- **Navigation Index**: `docs/BACKEND_CONNECTION_INDEX.md`

---

## ✅ Success Checklist

- [ ] Local backend running on port 3000
- [ ] Frontend running (any port)
- [ ] Email service configured on local backend
- [ ] Test script updated with real email
- [ ] Registration works → Email received
- [ ] Verification works → User logged in
- [ ] Login works (if user in production DB)
- [ ] Password reset works → Email received
- [ ] Console shows correct backend routing

---

## 🎉 When Everything Works

You'll see:

1. ✅ Registration successful → "Check email" message
2. 📧 Email arrives within 1-2 minutes
3. ✅ Verification successful → Logged in automatically
4. ✅ Login works (if in production DB)
5. ✅ Password reset → New email with code
6. ✅ Console logs show correct backend routing

---

**Status**: 🟢 **READY FOR TESTING**  
**Implementation**: 100% Complete  
**Next**: Start backends and test! 🚀
