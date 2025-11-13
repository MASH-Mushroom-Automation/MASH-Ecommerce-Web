# 🗺️ MASH Authentication Backend Connection - Visual Guide

## 📌 Quick Reference

**What This Document Does**: Provides visual flowcharts and diagrams for the dual-backend authentication system.

**Read This First**: `docs/BACKEND_CONNECTION_PLAN.md` (complete plan)  
**Track Progress**: `docs/BACKEND_CONNECTION_PROGRESS.md` (daily updates)

---

## 🌐 Backend Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     MASH FRONTEND                               │
│              http://localhost:3000                              │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │             API Client (api-client.ts)                    │ │
│  │         Dynamic Backend URL Selection                     │ │
│  │                                                           │ │
│  │   getBaseUrl(endpoint) → {                               │ │
│  │     if (endpoint in EMAIL_ENDPOINTS && local)            │ │
│  │       → http://localhost:3000/api/v1                     │ │
│  │     else                                                 │ │
│  │       → https://mash-backend-api...railway.app/api/v1    │ │
│  │   }                                                       │ │
│  └───────────────────────────────────────────────────────────┘ │
│                              │                                  │
│                              ▼                                  │
│                    ┌─────────────────┐                         │
│                    │  Routing Logic  │                         │
│                    └─────────────────┘                         │
│                              │                                  │
│              ┌───────────────┴───────────────┐                 │
│              ▼                               ▼                 │
│   ┌──────────────────┐           ┌──────────────────┐         │
│   │ Email Endpoints  │           │ Other Endpoints  │         │
│   │   (Localhost)    │           │   (Production)   │         │
│   └──────────────────┘           └──────────────────┘         │
└─────────────────────────────────────────────────────────────────┘
              │                               │
              │                               │
              ▼                               ▼
┌────────────────────────┐    ┌────────────────────────────────┐
│  LOCAL BACKEND         │    │  PRODUCTION BACKEND            │
│  localhost:3000        │    │  Railway (Cloud)               │
│                        │    │                                │
│  ✅ Email Service ON   │    │  ❌ Email Service OFF          │
│  ✅ SendGrid Config    │    │  ⚠️ Needs Configuration        │
│                        │    │                                │
│  📧 Handles:           │    │  🔑 Handles:                   │
│  • Registration        │    │  • Login                       │
│  • Email Verification  │    │  • Token Refresh               │
│  • Resend Code         │    │  • Protected API Calls         │
│  • Forgot Password     │    │                                │
│  • Reset Password      │    │                                │
└────────────────────────┘    └────────────────────────────────┘
         │                              │
         ▼                              ▼
┌────────────────────────┐    ┌────────────────────────────────┐
│  PostgreSQL (Local)    │    │  PostgreSQL (Railway)          │
│  Users registered here │    │  Production user database      │
└────────────────────────┘    └────────────────────────────────┘
```

---

## 🔄 Complete User Journey

### Scenario 1: New User Registration

```
USER                    FRONTEND                  LOCAL BACKEND           EMAIL SERVICE
 │                         │                           │                      │
 │  1. Visit /signup       │                           │                      │
 ├────────────────────────>│                           │                      │
 │                         │                           │                      │
 │  2. Fill form           │                           │                      │
 │     - Email             │                           │                      │
 │     - Password          │                           │                      │
 │     - Name              │                           │                      │
 ├────────────────────────>│                           │                      │
 │                         │                           │                      │
 │  3. Submit              │  4. POST /auth/register   │                      │
 ├────────────────────────>├──────────────────────────>│                      │
 │                         │   (localhost:3000) 🏠      │                      │
 │                         │                           │                      │
 │                         │                           │  5. Create user      │
 │                         │                           │  6. Generate code    │
 │                         │                           │     "123456"         │
 │                         │                           │                      │
 │                         │                           │  7. Send email       │
 │                         │                           ├─────────────────────>│
 │                         │                           │   (SendGrid)         │
 │                         │                           │                      │
 │                         │  8. Response: Success     │                      │
 │                         │<──────────────────────────┤                      │
 │                         │   { verification sent }   │                      │
 │                         │                           │                      │
 │  9. Redirect to         │                           │                      │
 │     /verify-otp         │                           │                      │
 │<────────────────────────┤                           │                      │
 │                         │                           │                      │
 │ 10. Check email 📧      │                           │                      │
 │     Code: 123456        │<──────────────────────────────────────────────────┤
 │                         │                           │                      │
 │ 11. Enter code          │                           │                      │
 │     in /verify-otp      │                           │                      │
 ├────────────────────────>│                           │                      │
 │                         │                           │                      │
 │                         │  12. POST /auth/verify-   │                      │
 │                         │      email-code           │                      │
 │                         ├──────────────────────────>│                      │
 │                         │   { email, code }         │                      │
 │                         │   (localhost:3000) 🏠      │                      │
 │                         │                           │                      │
 │                         │                           │  13. Verify code     │
 │                         │                           │  14. Set verified    │
 │                         │                           │  15. Generate JWT    │
 │                         │                           │                      │
 │                         │  16. Response: Token      │                      │
 │                         │<──────────────────────────┤                      │
 │                         │   { token, user }         │                      │
 │                         │                           │                      │
 │ 17. Logged in! ✅       │                           │                      │
 │     Redirect /shop      │                           │                      │
 │<────────────────────────┤                           │                      │
 │                         │                           │                      │
```

---

### Scenario 2: Existing User Login

```
USER                    FRONTEND                  PRODUCTION BACKEND
 │                         │                           │
 │  1. Visit /login        │                           │
 ├────────────────────────>│                           │
 │                         │                           │
 │  2. Enter credentials   │                           │
 │     - Email             │                           │
 │     - Password          │                           │
 ├────────────────────────>│                           │
 │                         │                           │
 │  3. Submit              │  4. POST /auth/login      │
 ├────────────────────────>├──────────────────────────>│
 │                         │   (Railway) ☁️             │
 │                         │                           │
 │                         │                           │  5. Find user
 │                         │                           │  6. Verify password
 │                         │                           │  7. Generate tokens
 │                         │                           │     - Access (1h)
 │                         │                           │     - Refresh (7d)
 │                         │                           │
 │                         │  8. Response: Tokens      │
 │                         │<──────────────────────────┤
 │                         │   { accessToken,          │
 │                         │     refreshToken, user }  │
 │                         │                           │
 │  9. Logged in! ✅       │                           │
 │     Redirect /shop      │                           │
 │<────────────────────────┤                           │
 │                         │                           │
```

---

### Scenario 3: Password Reset

```
USER                    FRONTEND                  LOCAL BACKEND           EMAIL SERVICE
 │                         │                           │                      │
 │  1. Visit               │                           │                      │
 │     /forgot-password    │                           │                      │
 ├────────────────────────>│                           │                      │
 │                         │                           │                      │
 │  2. Enter email         │                           │                      │
 ├────────────────────────>│                           │                      │
 │                         │                           │                      │
 │  3. Submit              │  4. POST /auth/forgot-    │                      │
 ├────────────────────────>│     password              │                      │
 │                         ├──────────────────────────>│                      │
 │                         │   (localhost:3000) 🏠      │                      │
 │                         │                           │                      │
 │                         │                           │  5. Generate code    │
 │                         │                           │     "654321"         │
 │                         │                           │                      │
 │                         │                           │  6. Send email       │
 │                         │                           ├─────────────────────>│
 │                         │                           │                      │
 │                         │  7. Response: Sent        │                      │
 │                         │<──────────────────────────┤                      │
 │                         │                           │                      │
 │  8. Redirect to         │                           │                      │
 │     /reset-password     │                           │                      │
 │<────────────────────────┤                           │                      │
 │                         │                           │                      │
 │  9. Check email 📧      │                           │                      │
 │     Code: 654321        │<──────────────────────────────────────────────────┤
 │                         │                           │                      │
 │ 10. Enter code +        │                           │                      │
 │     new password        │                           │                      │
 ├────────────────────────>│                           │                      │
 │                         │                           │                      │
 │                         │  11. POST /auth/reset-    │                      │
 │                         │      password             │                      │
 │                         ├──────────────────────────>│                      │
 │                         │   { email, code,          │                      │
 │                         │     newPassword }         │                      │
 │                         │   (localhost:3000) 🏠      │                      │
 │                         │                           │                      │
 │                         │                           │  12. Verify code     │
 │                         │                           │  13. Hash password   │
 │                         │                           │  14. Update user     │
 │                         │                           │                      │
 │                         │  15. Response: Success    │                      │
 │                         │<──────────────────────────┤                      │
 │                         │                           │                      │
 │ 16. Password reset! ✅  │                           │                      │
 │     Redirect /login     │                           │                      │
 │<────────────────────────┤                           │                      │
 │                         │                           │                      │
```

---

## 🔀 Backend Routing Logic

### API Client Decision Tree

```
                         apiRequest(endpoint, options)
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │  Is endpoint in     │
                         │  EMAIL_ENDPOINTS?   │
                         └─────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
                  ┌───┐                           ┌────┐
                  │YES│                           │ NO │
                  └───┘                           └────┘
                    │                               │
                    ▼                               ▼
         ┌────────────────────┐        ┌─────────────────────┐
         │ EMAIL_SERVICE_ENV  │        │  Use PRODUCTION     │
         │    === "local"?    │        │  Backend URL        │
         └────────────────────┘        │                     │
                    │                  │  Railway Cloud ☁️   │
        ┌───────────┴───────────┐      └─────────────────────┘
        ▼                       ▼                  │
      ┌───┐                   ┌────┐               │
      │YES│                   │ NO │               │
      └───┘                   └────┘               │
        │                       │                  │
        ▼                       │                  │
  ┌──────────────────┐          │                  │
  │  Use LOCAL       │          │                  │
  │  Backend URL     │          │                  │
  │                  │          │                  │
  │  localhost:3000  │          │                  │
  │  🏠              │          │                  │
  └──────────────────┘          │                  │
        │                       │                  │
        └───────────────────────┴──────────────────┘
                                │
                                ▼
                         ┌─────────────┐
                         │  Make HTTP  │
                         │  Request    │
                         └─────────────┘
```

### Email Endpoints List

These endpoints will route to **localhost backend**:

```
✅ /auth/register
✅ /auth/verify-email-code
✅ /auth/resend-verification
✅ /auth/resend-verification-code
✅ /auth/forgot-password
✅ /auth/verify-reset-code
✅ /auth/reset-password
✅ /auth/resend-password-reset-code
```

All other endpoints route to **production backend** (Railway).

---

## 📊 Implementation Phases

```
┌─────────────────────────────────────────────────────────────────┐
│                     IMPLEMENTATION ROADMAP                      │
└─────────────────────────────────────────────────────────────────┘

Phase 0: Documentation ✅ [████████████████████████] 100% (3 hours)
         - Planning document created
         - Progress tracker created
         - Diagnostic tools prepared

Phase 1: Environment Setup ⬜ [░░░░░░░░░░░░░░░░░░░░░░░] 0% (15 min)
         - Add new env variables
         - Verify local backend
         - Test email service

Phase 2: API Client Update ⬜ [░░░░░░░░░░░░░░░░░░░░░░░] 0% (30 min)
         - Add routing logic
         - Update apiRequest()
         - Add logging

Phase 3: Integration Testing ⬜ [░░░░░░░░░░░░░░░░░░░░░░░] 0% (2 hours)
         - Test registration
         - Test verification
         - Test login
         - Test password reset

Phase 4: Error Handling ⬜ [░░░░░░░░░░░░░░░░░░░░░░░] 0% (1.5 hours)
         - Backend offline
         - Rate limits
         - Expired codes
         - Invalid codes

Phase 5: Documentation ⬜ [░░░░░░░░░░░░░░░░░░░░░░░] 0% (1 hour)
         - Update guides
         - Create examples
         - Write FAQ

┌─────────────────────────────────────────────────────────────────┐
│  TOTAL PROGRESS: 16.67% Complete                               │
│  TIME SPENT: 3 hours                                           │
│  TIME REMAINING: ~5.25 hours                                   │
│  ETA: November 14-15, 2025                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Success Metrics Dashboard

```
┌────────────────────────────────────────────────────────────────┐
│                      AUTHENTICATION METRICS                    │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  📧 EMAIL DELIVERY                                             │
│  Target: >95% within 2 minutes                                │
│  Current: Not measured yet                                    │
│  Status: ⚪ Pending implementation                             │
│                                                                │
│  ✅ VERIFICATION SUCCESS RATE                                  │
│  Target: >80% complete verification                           │
│  Current: Not measured yet                                    │
│  Status: ⚪ Pending implementation                             │
│                                                                │
│  🔑 LOGIN SUCCESS RATE                                         │
│  Target: >98% successful logins                               │
│  Current: Not measured yet                                    │
│  Status: ⚪ Pending implementation                             │
│                                                                │
│  🔄 TOKEN REFRESH SUCCESS                                      │
│  Target: 100% automatic refresh                               │
│  Current: Not measured yet                                    │
│  Status: ⚪ Pending implementation                             │
│                                                                │
│  ⚠️ ERROR RATE                                                 │
│  Target: <1% of requests fail                                 │
│  Current: Not measured yet                                    │
│  Status: ⚪ Pending implementation                             │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start Checklist

### For Developers Setting Up

```
□ Clone repository
   git clone https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web.git

□ Install dependencies
   npm install

□ Copy environment template
   cp .env.local.example .env.local

□ Add required environment variables:
   NEXT_PUBLIC_API_URL=https://mash-backend-api-production.up.railway.app/api/v1
   NEXT_PUBLIC_LOCAL_API_URL=http://localhost:3000/api/v1
   NEXT_PUBLIC_EMAIL_SERVICE_ENV=local

□ Start local backend (in backend repo)
   cd ../MASH-Backend
   npm run start:dev

□ Verify local backend running
   curl http://localhost:3000/api/v1/health

□ Start frontend dev server
   npm run dev

□ Test authentication flow
   1. Visit http://localhost:3000/signup
   2. Register new account
   3. Check email for verification code
   4. Enter code on /verify-otp
   5. Should be logged in and redirected to /shop

□ Check console logs for backend routing
   Look for: "📧 Using LOCAL backend" or "☁️ Using PRODUCTION backend"
```

---

## 📚 Related Documentation

| Document | Purpose | When to Read |
|----------|---------|--------------|
| `BACKEND_CONNECTION_PLAN.md` | Complete integration plan | **START HERE** |
| `BACKEND_CONNECTION_PROGRESS.md` | Daily progress tracking | Check daily |
| `BACKEND_EMAIL_SERVICE_FIX.md` | Backend email setup | Backend team only |
| `EMAIL_FIX_QUICK_START.md` | 5-minute setup guide | Quick reference |
| `AUTH_IMPLEMENTATION_GUIDE.md` | Original auth docs | Background reading |

---

## 🆘 Common Issues - Quick Fixes

### Issue: "Network request failed"

```
❌ Error: Failed to fetch from http://localhost:3000

✅ Fix:
1. Check if local backend is running:
   curl http://localhost:3000/api/v1/health

2. If not running, start it:
   cd ../MASH-Backend
   npm run start:dev

3. Verify port 3000 is not blocked by firewall
```

---

### Issue: "Email not received"

```
❌ Error: Verification code email not arriving

✅ Fix:
1. Check spam folder
2. Verify local backend email service:
   node test-backend-email.js
3. Check backend logs for email errors
4. Verify SendGrid API key configured
```

---

### Issue: "Invalid credentials" on login

```
❌ Error: User not found or wrong password

✅ Fix:
1. Check if user registered on same backend
   - Localhost registration → Cannot login via production
   - Production registration → Cannot login via localhost

2. Solution: Complete entire flow on same backend
   OR: Configure production email service
```

---

**Last Updated**: November 13, 2025, 10:50 PM  
**Version**: 1.0  
**Status**: ✅ Documentation Complete  
**Next**: Begin Phase 1 (Environment Setup)
