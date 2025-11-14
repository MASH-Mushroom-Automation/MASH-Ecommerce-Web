# 🔌 MASH E-Commerce Backend Connection Plan

## 📋 Executive Summary

**Document Purpose**: Complete integration plan for connecting MASH frontend to backend API with dual-environment strategy (localhost for email features, production for login).

**Backend URLs**:
- **Production**: `https://mash-backend-api-production.up.railway.app/api/v1`
- **Local**: `http://localhost:3000/api/v1` (for email-dependent endpoints)

**Created**: November 13, 2025  
**Status**: Planning Phase  
**Priority**: 🔴 Critical - Authentication system foundation

---

## 🎯 Connection Strategy

### Dual-Environment Approach

Due to email service issues on production backend, we'll use a **hybrid connection strategy**:

| Feature | Environment | Base URL | Reason |
|---------|-------------|----------|--------|
| **Registration** | 🏠 Localhost | `http://localhost:3000/api/v1` | Email verification codes sent successfully |
| **Email Verification** | 🏠 Localhost | `http://localhost:3000/api/v1` | 6-digit code validation requires working email |
| **Resend Code** | 🏠 Localhost | `http://localhost:3000/api/v1` | Email delivery dependency |
| **Forgot Password** | 🏠 Localhost | `http://localhost:3000/api/v1` | Email reset code dependency |
| **Verify Reset Code** | 🏠 Localhost | `http://localhost:3000/api/v1` | Password reset flow continuity |
| **Reset Password** | 🏠 Localhost | `http://localhost:3000/api/v1` | Password reset flow continuity |
| **Login** | ☁️ Production | `https://mash-backend-api-production.up.railway.app/api/v1` | No email dependency, production-ready |
| **Refresh Token** | ☁️ Production | `https://mash-backend-api-production.up.railway.app/api/v1` | Session management |

### Why This Approach?

✅ **Advantages**:
- Email features work reliably (localhost has configured email service)
- Production login endpoint tested and stable
- User experience uninterrupted by email service issues
- Gradual migration path to full production

⚠️ **Trade-offs**:
- Users registered on localhost won't exist in production database
- Requires local backend running during registration/reset password
- Session management split between environments

🔮 **Future Migration**:
Once production email service is configured (SendGrid/AWS SES), all endpoints will migrate to production URL.

---

## 📁 File Changes Required

### 1. Environment Variables (`.env.local`)

**Current State**:
```env
NEXT_PUBLIC_API_URL=https://mash-backend-api-production.up.railway.app/api/v1
NEXT_PUBLIC_API_TIMEOUT=30000
```

**Required Changes**:
```env
# Backend API Configuration
# Production Backend (for login, token refresh)
NEXT_PUBLIC_API_URL=https://mash-backend-api-production.up.railway.app/api/v1
NEXT_PUBLIC_API_TIMEOUT=30000

# Local Backend (for email-dependent features)
NEXT_PUBLIC_LOCAL_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_LOCAL_API_TIMEOUT=30000

# Feature Flags
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_ENABLE_API_LOGGING=true

# Authentication
NEXT_PUBLIC_AUTH_TOKEN_KEY=auth-token
NEXT_PUBLIC_REFRESH_TOKEN_KEY=refreshToken

# Email Service Environment (determines which backend to use)
# Options: "local" | "production"
NEXT_PUBLIC_EMAIL_SERVICE_ENV=local
```

**Rationale**: Separate URLs allow dynamic switching based on feature requirements.

---

### 2. API Client Updates (`src/lib/api-client.ts`)

**Current Implementation**: Single base URL for all endpoints.

**Required Changes**: Add environment-aware URL selection.

#### New Implementation:

```typescript
// src/lib/api-client.ts

const PRODUCTION_API_URL = process.env.NEXT_PUBLIC_API_URL!;
const LOCAL_API_URL = process.env.NEXT_PUBLIC_LOCAL_API_URL || 'http://localhost:3000/api/v1';
const EMAIL_SERVICE_ENV = process.env.NEXT_PUBLIC_EMAIL_SERVICE_ENV || 'local';

// Email-dependent endpoints that should use local backend
const EMAIL_ENDPOINTS = [
  '/auth/register',
  '/auth/verify-email-code',
  '/auth/resend-verification',
  '/auth/resend-verification-code',
  '/auth/forgot-password',
  '/auth/verify-reset-code',
  '/auth/reset-password',
  '/auth/resend-password-reset-code'
];

/**
 * Determine which base URL to use based on endpoint
 */
function getBaseUrl(endpoint: string): string {
  // Check if endpoint requires email service
  const requiresEmail = EMAIL_ENDPOINTS.some(emailEndpoint => 
    endpoint.includes(emailEndpoint)
  );

  // Use local backend for email-dependent endpoints
  if (requiresEmail && EMAIL_SERVICE_ENV === 'local') {
    console.log(`📧 Using LOCAL backend for: ${endpoint}`);
    return LOCAL_API_URL;
  }

  // Use production backend for all other endpoints
  console.log(`☁️ Using PRODUCTION backend for: ${endpoint}`);
  return PRODUCTION_API_URL;
}

/**
 * Make API request with dynamic base URL
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = getBaseUrl(endpoint);
  const url = `${baseUrl}${endpoint}`;
  
  // ... rest of existing implementation
}
```

**Changes Summary**:
- ✅ Detects email-dependent endpoints automatically
- ✅ Routes to appropriate backend (local or production)
- ✅ Logs which backend is used (helpful for debugging)
- ✅ Maintains existing token refresh logic
- ✅ No breaking changes to existing code

---

### 3. Auth Service Updates (`src/lib/api/auth.ts`)

**Current State**: Uses `apiRequest()` with relative endpoints.

**Required Changes**: None! The service will automatically use the correct backend through `apiRequest()`.

**Verification**:
```typescript
// src/lib/api/auth.ts

// ✅ These will use LOCAL backend (email-dependent)
export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  return apiRequest('/auth/register', { ... }); // → http://localhost:3000
}

export async function verifyEmailCode(data: VerifyEmailCodeRequest): Promise<VerifyEmailCodeResponse> {
  return apiRequest('/auth/verify-email-code', { ... }); // → http://localhost:3000
}

export async function forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
  return apiRequest('/auth/forgot-password', { ... }); // → http://localhost:3000
}

// ✅ This will use PRODUCTION backend (no email dependency)
export async function login(data: LoginRequest): Promise<LoginResponse> {
  return apiRequest('/auth/login', { ... }); // → https://mash-backend-api-production.up.railway.app
}
```

**No code changes required** - routing happens transparently in `api-client.ts`.

---

### 4. Frontend Pages - No Changes Required

All authentication pages (`signup`, `verify-otp`, `login`, `forgot-password`, `reset-password`) already use the auth service. No updates needed!

**Why?**
- ✅ Pages call `auth.register()`, `auth.login()`, etc.
- ✅ Auth service calls `apiRequest()`
- ✅ API client routes to correct backend
- ✅ Zero changes to page components

---

## 🔐 Complete Authentication Flow

### 1️⃣ Registration Flow (Localhost Backend)

```
┌─────────────────────────────────────────────────────────────┐
│ USER ACTION: Fill out /signup form                         │
│ Frontend: http://localhost:3000/signup                     │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND: Call auth.register()                             │
│ Endpoint: POST /auth/register                              │
│ Backend: http://localhost:3000/api/v1 🏠                    │
│ Body: { email, password, firstName, lastName }             │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ BACKEND (LOCAL): Process registration                       │
│ ✅ Validate email/password                                  │
│ ✅ Create user in local database                            │
│ ✅ Generate 6-digit code (e.g., "123456")                   │
│ ✅ Send email with code                                     │
│ ✅ Return success response                                  │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ RESPONSE:                                                   │
│ {                                                           │
│   "success": true,                                          │
│   "message": "Registration successful! Check email",        │
│   "verification": {                                         │
│     "sent": true,                                           │
│     "expiresIn": "10 minutes"                               │
│   }                                                         │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND: Store email in sessionStorage                    │
│ sessionStorage.setItem("pendingVerificationEmail", email)  │
│ Redirect to: /verify-otp                                   │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ USER ACTION: Check email, copy code "123456"               │
│ Enter code in /verify-otp page                             │
└─────────────────────────────────────────────────────────────┘
```

### 2️⃣ Email Verification Flow (Localhost Backend)

```
┌─────────────────────────────────────────────────────────────┐
│ USER ACTION: Enter 6-digit code in /verify-otp             │
│ Frontend: http://localhost:3000/verify-otp                 │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND: Call auth.verifyEmailCode()                      │
│ Endpoint: POST /auth/verify-email-code                     │
│ Backend: http://localhost:3000/api/v1 🏠                    │
│ Body: { email, code: "123456" }                            │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ BACKEND (LOCAL): Verify code                                │
│ ✅ Find user by email                                       │
│ ✅ Check code matches                                       │
│ ✅ Check code not expired (10 min)                          │
│ ✅ Set emailVerified = true                                 │
│ ✅ Generate JWT token                                       │
│ ✅ Return token + user data                                 │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ RESPONSE:                                                   │
│ {                                                           │
│   "success": true,                                          │
│   "message": "Email verified! You are now logged in.",     │
│   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",      │
│   "user": {                                                 │
│     "id": "cmhwl0m0s...",                                   │
│     "email": "user@example.com",                            │
│     "emailVerified": true                                   │
│   }                                                         │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND: Store token                                       │
│ setAuthToken(response.token)                                │
│ localStorage.setItem("refreshToken", response.refreshToken) │
│ Clear sessionStorage.removeItem("pendingVerificationEmail")│
│ Redirect to: /onboarding or /shop                          │
└─────────────────────────────────────────────────────────────┘
```

### 3️⃣ Login Flow (Production Backend)

```
┌─────────────────────────────────────────────────────────────┐
│ USER ACTION: Fill out /login form                          │
│ Frontend: http://localhost:3000/login                      │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND: Call auth.login()                                │
│ Endpoint: POST /auth/login                                 │
│ Backend: https://mash-backend...railway.app/api/v1 ☁️       │
│ Body: { email, password }                                  │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ BACKEND (PRODUCTION): Authenticate user                     │
│ ✅ Find user by email                                       │
│ ✅ Verify password (bcrypt compare)                         │
│ ✅ Check emailVerified = true                               │
│ ✅ Generate JWT tokens (access + refresh)                   │
│ ✅ Create session record                                    │
│ ✅ Return tokens + user data                                │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ RESPONSE:                                                   │
│ {                                                           │
│   "success": true,                                          │
│   "message": "Authentication successful",                   │
│   "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",│
│   "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",│
│   "user": {                                                 │
│     "id": "cmhwl0m0s...",                                   │
│     "email": "user@example.com",                            │
│     "firstName": "John",                                    │
│     "lastName": "Doe"                                       │
│   }                                                         │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND: Store tokens                                      │
│ setAuthToken(response.accessToken)                          │
│ localStorage.setItem("refreshToken", response.refreshToken) │
│ Redirect to: /shop or previous page                        │
└─────────────────────────────────────────────────────────────┘
```

### 4️⃣ Forgot Password Flow (Localhost Backend)

```
┌─────────────────────────────────────────────────────────────┐
│ USER ACTION: Enter email on /forgot-password               │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND: Call auth.forgotPassword()                       │
│ Endpoint: POST /auth/forgot-password                       │
│ Backend: http://localhost:3000/api/v1 🏠                    │
│ Body: { email }                                            │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ BACKEND (LOCAL): Send reset code                            │
│ ✅ Find user by email                                       │
│ ✅ Generate 6-digit reset code                              │
│ ✅ Send email with code                                     │
│ ✅ Return success (doesn't reveal if email exists)          │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ RESPONSE:                                                   │
│ {                                                           │
│   "success": true,                                          │
│   "message": "Reset code sent to your email",              │
│   "expiresIn": "10 minutes"                                │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND: Store email, redirect to /reset-password         │
│ sessionStorage.setItem("resetPasswordEmail", email)        │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ USER ACTION: Enter code + new password on /reset-password  │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND: Call auth.resetPassword()                        │
│ Endpoint: POST /auth/reset-password                        │
│ Backend: http://localhost:3000/api/v1 🏠                    │
│ Body: { email, code, newPassword }                         │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ BACKEND (LOCAL): Reset password                             │
│ ✅ Verify code is valid                                     │
│ ✅ Hash new password                                        │
│ ✅ Update user password                                     │
│ ✅ Invalidate reset code                                    │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ RESPONSE:                                                   │
│ {                                                           │
│   "success": true,                                          │
│   "message": "Password reset successful! You can now login" │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND: Clear sessionStorage, redirect to /login         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧪 Testing Plan

### Prerequisites

1. **Local Backend Running**:
   ```bash
   # In backend project directory
   npm run start:dev
   # Backend should be accessible at http://localhost:3000
   ```

2. **Frontend Dev Server Running**:
   ```bash
   # In frontend project directory
   npm run dev
   # Frontend at http://localhost:3000
   ```

3. **Environment Variables Set**:
   ```env
   NEXT_PUBLIC_API_URL=https://mash-backend-api-production.up.railway.app/api/v1
   NEXT_PUBLIC_LOCAL_API_URL=http://localhost:3000/api/v1
   NEXT_PUBLIC_EMAIL_SERVICE_ENV=local
   ```

### Test Cases

#### ✅ Test 1: User Registration (Localhost)

**Steps**:
1. Navigate to `/signup`
2. Fill form:
   - Email: `test@example.com`
   - Password: `Test@1234`
   - First Name: `John`
   - Last Name: `Doe`
3. Submit form
4. Check browser console for: `📧 Using LOCAL backend for: /auth/register`
5. Check email inbox for 6-digit code

**Expected Results**:
- ✅ Form submits successfully
- ✅ Backend logs show request to `http://localhost:3000/api/v1/auth/register`
- ✅ Email received with 6-digit code
- ✅ Redirected to `/verify-otp`
- ✅ Email stored in sessionStorage

**Success Criteria**: Email with verification code received within 1-2 minutes.

---

#### ✅ Test 2: Email Verification (Localhost)

**Steps**:
1. On `/verify-otp` page
2. Enter 6-digit code from email
3. Submit code
4. Check console for: `📧 Using LOCAL backend for: /auth/verify-email-code`

**Expected Results**:
- ✅ Code accepted
- ✅ JWT token returned
- ✅ Token stored in cookie (`auth-token`)
- ✅ Redirected to `/onboarding` or `/shop`
- ✅ User is logged in

**Success Criteria**: User successfully logged in after verification.

---

#### ✅ Test 3: Resend Verification Code (Localhost)

**Steps**:
1. On `/verify-otp` page
2. Wait 60 seconds (cooldown)
3. Click "Resend Code"
4. Check console for: `📧 Using LOCAL backend for: /auth/resend-verification-code`
5. Check email for new code

**Expected Results**:
- ✅ New code sent to email
- ✅ Old code invalidated
- ✅ Success toast shown
- ✅ New code works for verification

**Success Criteria**: New verification code received and works.

---

#### ✅ Test 4: Login with Production Backend (Production)

**Steps**:
1. Navigate to `/login`
2. Enter credentials:
   - Email: `mash.mushroom.automation@gmail.com`
   - Password: `PP@Namias99`
3. Submit form
4. Check console for: `☁️ Using PRODUCTION backend for: /auth/login`

**Expected Results**:
- ✅ Login successful
- ✅ Backend logs show request to production URL
- ✅ JWT tokens returned (access + refresh)
- ✅ Tokens stored (cookie + localStorage)
- ✅ Redirected to `/shop`

**Success Criteria**: User successfully logged in using production backend.

---

#### ✅ Test 5: Forgot Password (Localhost)

**Steps**:
1. Navigate to `/forgot-password`
2. Enter email: `test@example.com`
3. Submit form
4. Check console for: `📧 Using LOCAL backend for: /auth/forgot-password`
5. Check email for reset code

**Expected Results**:
- ✅ Success message shown
- ✅ Email with 6-digit reset code received
- ✅ Redirected to `/reset-password`
- ✅ Email stored in sessionStorage

**Success Criteria**: Password reset code received via email.

---

#### ✅ Test 6: Reset Password (Localhost)

**Steps**:
1. On `/reset-password` page
2. Enter code from email
3. Enter new password: `NewPass@123`
4. Confirm password: `NewPass@123`
5. Submit form
6. Check console for: `📧 Using LOCAL backend for: /auth/reset-password`

**Expected Results**:
- ✅ Password reset successful
- ✅ Success message shown
- ✅ Redirected to `/login`
- ✅ Can log in with new password

**Success Criteria**: Password successfully changed, can login with new credentials.

---

#### ✅ Test 7: Token Refresh (Production)

**Steps**:
1. Login to get access token
2. Wait for token to expire (or manually expire)
3. Make an authenticated API call (e.g., fetch user profile)
4. Check console for token refresh attempt

**Expected Results**:
- ✅ Token refresh triggered automatically
- ✅ New access token retrieved from production backend
- ✅ Original API call retried with new token
- ✅ No re-login required

**Success Criteria**: Seamless token refresh without user intervention.

---

#### ✅ Test 8: Logout

**Steps**:
1. While logged in, click Logout
2. Check storage cleared

**Expected Results**:
- ✅ `auth-token` cookie removed
- ✅ `refreshToken` removed from localStorage
- ✅ User data cleared
- ✅ sessionStorage cleared
- ✅ Redirected to `/` (home page)

**Success Criteria**: All auth data cleared, user logged out.

---

## 📊 Implementation Progress Tracker

### Phase 1: Environment Setup ⏳

| Task | Status | Assigned To | Notes |
|------|--------|-------------|-------|
| Add `NEXT_PUBLIC_LOCAL_API_URL` to `.env.local` | ⬜ Not Started | - | New env var for localhost backend |
| Add `NEXT_PUBLIC_EMAIL_SERVICE_ENV` to `.env.local` | ⬜ Not Started | - | Feature flag: "local" or "production" |
| Update `.env.example` with new variables | ⬜ Not Started | - | Documentation for other devs |
| Verify local backend running on port 3000 | ⬜ Not Started | Backend Team | Required for email features |

**Estimated Time**: 15 minutes  
**Blockers**: None

---

### Phase 2: API Client Update ⏳

| Task | Status | Assigned To | Notes |
|------|--------|-------------|-------|
| Add `getBaseUrl()` function to `api-client.ts` | ⬜ Not Started | Frontend | URL routing logic |
| Define `EMAIL_ENDPOINTS` array | ⬜ Not Started | Frontend | List of email-dependent endpoints |
| Update `apiRequest()` to use `getBaseUrl()` | ⬜ Not Started | Frontend | Dynamic URL selection |
| Add console logging for debugging | ⬜ Not Started | Frontend | Track which backend is used |
| Test URL routing with mock calls | ⬜ Not Started | Frontend | Unit test coverage |

**Estimated Time**: 30 minutes  
**Blockers**: Phase 1 complete

---

### Phase 3: Frontend Integration ⏳

| Task | Status | Assigned To | Notes |
|------|--------|-------------|-------|
| Test `/signup` with localhost backend | ⬜ Not Started | QA | Verify email sent |
| Test `/verify-otp` with localhost backend | ⬜ Not Started | QA | Verify code validation |
| Test `/login` with production backend | ⬜ Not Started | QA | Verify token generation |
| Test `/forgot-password` with localhost backend | ⬜ Not Started | QA | Verify reset code sent |
| Test `/reset-password` with localhost backend | ⬜ Not Started | QA | Verify password changed |
| Test resend code functionality | ⬜ Not Started | QA | Both verification & password reset |
| Verify token refresh with production backend | ⬜ Not Started | QA | Automatic token refresh |

**Estimated Time**: 2 hours  
**Blockers**: Phase 2 complete

---

### Phase 4: Error Handling & Edge Cases ⏳

| Task | Status | Assigned To | Notes |
|------|--------|-------------|-------|
| Handle localhost backend offline | ⬜ Not Started | Frontend | Graceful fallback or error message |
| Handle production backend offline | ⬜ Not Started | Frontend | Graceful fallback or error message |
| Test expired verification codes | ⬜ Not Started | QA | 10-minute expiry enforcement |
| Test rate limiting (too many requests) | ⬜ Not Started | QA | Backend throttling |
| Test invalid codes (wrong digits) | ⬜ Not Started | QA | Error messages |
| Test maximum attempts lockout (5 failures) | ⬜ Not Started | QA | Security enforcement |
| Test network timeouts | ⬜ Not Started | QA | 30-second timeout handling |

**Estimated Time**: 1.5 hours  
**Blockers**: Phase 3 complete

---

### Phase 5: Documentation & Handoff ⏳

| Task | Status | Assigned To | Notes |
|------|--------|-------------|-------|
| Update `AUTH_IMPLEMENTATION_GUIDE.md` | ⬜ Not Started | Docs | Reflect dual-backend approach |
| Create `.env.local.example` file | ⬜ Not Started | Docs | Template for other developers |
| Document testing procedures | ⬜ Not Started | Docs | QA test cases |
| Update README.md with setup instructions | ⬜ Not Started | Docs | Local backend requirement |
| Create troubleshooting guide | ⬜ Not Started | Docs | Common issues & solutions |

**Estimated Time**: 1 hour  
**Blockers**: Phase 4 complete

---

## ⚠️ Known Issues & Limitations

### 1. Database Isolation

**Issue**: Users registered on localhost won't exist in production database.

**Impact**: Users who register locally cannot login using production backend.

**Workaround**: 
- Users must use the same backend environment for registration + login.
- OR: Manually migrate user data from local to production database.

**Long-term Solution**: Configure email service on production backend → all endpoints use production.

---

### 2. Session Management Split

**Issue**: Verification tokens stored in local database, but login sessions in production database.

**Impact**: User must complete entire registration flow using localhost backend.

**Workaround**: Ensure local backend stays running during registration → verification → login flow.

**Long-term Solution**: Unified backend (production with email service).

---

### 3. Local Backend Dependency

**Issue**: Registration/password reset features require local backend running.

**Impact**: If local backend is down, users cannot register or reset passwords.

**Workaround**: 
- Provide clear error message if local backend unreachable.
- Display instructions for starting local backend.

**Long-term Solution**: Production email service configuration.

---

### 4. CORS Configuration

**Issue**: Frontend on `localhost:3000` must call backend on `localhost:3000` (same port).

**Impact**: Potential CORS errors if ports don't match.

**Workaround**: 
- Ensure backend allows CORS from `http://localhost:3000` (frontend).
- OR: Use different ports (frontend on 3001, backend on 3000).

**Configuration Required** (Backend):
```typescript
// backend/src/main.ts
app.enableCors({
  origin: 'http://localhost:3000', // Frontend URL
  credentials: true
});
```

---

### 5. Email Rate Limiting

**Issue**: Backend enforces rate limits on email endpoints.

**Limits**:
- Registration: 3 requests per minute
- Resend code: 1 request per minute (with 1-minute cooldown)
- Forgot password: 3 requests per 5 minutes

**Impact**: Users spamming "Resend Code" will be temporarily blocked.

**Workaround**: Display countdown timer after resend (e.g., "Wait 60 seconds before resending").

---

## 🚀 Deployment Checklist

### Pre-Deployment (Development)

- [ ] Local backend running on `http://localhost:3000`
- [ ] Frontend `.env.local` configured with both URLs
- [ ] `NEXT_PUBLIC_EMAIL_SERVICE_ENV=local` set
- [ ] Test all authentication flows end-to-end
- [ ] Verify email delivery on localhost backend
- [ ] Check console logs show correct backend routing

### Production Deployment (Future)

- [ ] Production backend email service configured (SendGrid/AWS SES)
- [ ] Update `NEXT_PUBLIC_EMAIL_SERVICE_ENV=production`
- [ ] Remove `NEXT_PUBLIC_LOCAL_API_URL` from production `.env`
- [ ] Test registration flow on production
- [ ] Verify emails sent from production backend
- [ ] Monitor email delivery rates
- [ ] Set up email service error alerts

---

## 📞 Support & Troubleshooting

### Issue: "Failed to send verification email"

**Cause**: Local backend email service not configured or SMTP credentials invalid.

**Solution**:
1. Check local backend logs for email errors
2. Verify SMTP credentials in backend `.env`
3. Test email service manually (send test email)
4. Check spam folder

---

### Issue: "Network request failed" for registration

**Cause**: Local backend not running or wrong URL.

**Solution**:
1. Start local backend: `npm run start:dev`
2. Verify backend accessible at `http://localhost:3000`
3. Check `NEXT_PUBLIC_LOCAL_API_URL` in frontend `.env.local`
4. Check browser Network tab for actual request URL

---

### Issue: "Invalid credentials" during login

**Cause**: User registered on localhost, trying to login via production backend.

**Solution**:
- Users must use the same backend environment.
- OR: Manually create user account in production database.
- OR: Configure production email service and use production for all flows.

---

### Issue: Verification code expired

**Cause**: 10-minute expiry window passed.

**Solution**:
1. Click "Resend Code" button
2. Wait for new email (check spam folder)
3. Enter new code within 10 minutes

---

### Issue: "Too many requests" error

**Cause**: Rate limit exceeded (too many registration/resend attempts).

**Solution**:
- Wait for rate limit to reset (1-5 minutes depending on endpoint).
- Display countdown timer to user.
- Implement exponential backoff on frontend.

---

## 🎯 Success Metrics

### Registration Flow

- ✅ **Email Delivery Rate**: >95% of verification emails delivered within 2 minutes
- ✅ **Verification Completion**: >80% of users complete email verification
- ✅ **Code Expiry**: <5% of codes expire before use
- ✅ **Error Rate**: <1% of registration requests fail

### Login Flow

- ✅ **Login Success Rate**: >98% of login attempts succeed
- ✅ **Token Refresh**: 100% of expired tokens auto-refresh successfully
- ✅ **Session Duration**: Average session >30 minutes
- ✅ **Error Rate**: <0.5% of login requests fail

### Password Reset Flow

- ✅ **Reset Code Delivery**: >95% of codes delivered within 2 minutes
- ✅ **Reset Completion**: >70% of users complete password reset
- ✅ **Code Expiry**: <10% of reset codes expire before use
- ✅ **Error Rate**: <1% of reset requests fail

---

## 📅 Timeline

### Week 1: Setup & Development

- **Day 1-2**: Environment setup (Phase 1)
- **Day 3-4**: API client updates (Phase 2)
- **Day 5**: Frontend integration testing (Phase 3)

### Week 2: Testing & Documentation

- **Day 1-2**: Error handling & edge cases (Phase 4)
- **Day 3-4**: Documentation & handoff (Phase 5)
- **Day 5**: Final QA and bug fixes

### Week 3: Production Migration (Future)

- **Day 1-2**: Configure production email service
- **Day 3**: Update environment variables
- **Day 4**: Test production authentication flows
- **Day 5**: Monitor and optimize

**Total Estimated Time**: 2-3 weeks (including production migration)

---

## 🔗 Related Documentation

- **Primary Reference**: `docs/AUTH_IMPLEMENTATION_GUIDE.md` - Complete authentication system guide
- **API Guide**: `docs/BACKEND_API_CONNECTION_GUIDE.md` - Full API integration reference
- **Quick Start**: `docs/EMAIL_FIX_QUICK_START.md` - 5-minute email service setup
- **Backend Fix**: `docs/BACKEND_EMAIL_SERVICE_FIX.md` - Complete backend email configuration
- **Component Guide**: `docs/COMPONENT_GUIDE.md` - UI component usage
- **Diagnostic Tool**: `test-backend-email.js` - Backend email service testing script

---

## ✅ Sign-Off

**Document Status**: ✅ Complete - Ready for Implementation  
**Reviewed By**: AI Assistant (GitHub Copilot)  
**Approved By**: Pending (Kenneth - Project Owner)  
**Next Steps**: Begin Phase 1 (Environment Setup)

---

**Last Updated**: November 13, 2025  
**Version**: 1.0  
**Maintainer**: MASH Development Team  
**Contact**: mash.mushroom.automation@gmail.com
