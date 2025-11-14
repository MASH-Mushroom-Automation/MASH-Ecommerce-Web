# 📧 Email Service Troubleshooting Guide

## Problem: Verification Emails Not Being Sent

**Status**: ✅ Registration API working | ❌ Emails not being received

---

## Diagnosis

The **frontend is working correctly**. The issue is with the **backend email service configuration**.

### What's Working

- ✅ Frontend registration form submits correctly
- ✅ Backend API receives registration request
- ✅ Backend creates user in database
- ✅ Backend generates 6-digit verification code
- ✅ Backend responds with `{ verification: { sent: true } }`

### What's NOT Working

- ❌ Backend email service not actually sending emails
- ❌ Verification code emails not reaching inbox
- ❌ No emails in spam/junk folder either

---

## Root Cause

The backend **email service is not configured** or **credentials are missing/invalid**.

Common causes:

1. **Missing API Keys**: SendGrid/AWS SES API keys not set in Railway environment
2. **Service Not Enabled**: Email service disabled in backend config
3. **Invalid Credentials**: Expired or incorrect email service credentials
4. **Rate Limits**: Email service daily/hourly limits exceeded
5. **Account Issues**: Email service account suspended or needs verification
6. **Template Missing**: Email template not configured

---

## How to Fix (Backend Team)

### Step 1: Check Railway Environment Variables

Log into Railway and check these environment variables:

```bash
# For SendGrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@mash.com
EMAIL_FROM_NAME=MASH Support

# OR for AWS SES
AWS_SES_ACCESS_KEY_ID=AKIA...
AWS_SES_SECRET_ACCESS_KEY=...
AWS_SES_REGION=us-east-1
EMAIL_FROM=noreply@mash.com

# General config
EMAIL_SERVICE_ENABLED=true
NODE_ENV=production
```

**If these are missing → Set them in Railway dashboard**

### Step 2: Check Backend Logs

```bash
# View Railway logs
railway logs --service mash-backend-api

# Look for errors like:
# ❌ "Email service not configured"
# ❌ "SENDGRID_API_KEY not found"
# ❌ "Failed to send email: Authentication failed"
# ❌ "Error sending verification email"
```

### Step 3: Verify Email Service Account

**For SendGrid**:

1. Log into SendGrid dashboard
2. Check API key is active (not expired/deleted)
3. Verify sender email address is verified
4. Check daily sending limit not exceeded
5. Verify account is not suspended

**For AWS SES**:

1. Log into AWS SES console
2. Verify sender email is verified
3. Check account is out of sandbox mode
4. Verify credentials have `ses:SendEmail` permission
5. Check sending limits not exceeded

### Step 4: Test Email Service Directly

**SendGrid Test**:

```bash
curl -X POST https://api.sendgrid.com/v3/mail/send \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "personalizations": [{"to": [{"email": "test@example.com"}]}],
    "from": {"email": "noreply@mash.com"},
    "subject": "Test Email",
    "content": [{"type": "text/plain", "value": "Test"}]
  }'
```

**Expected**: `202 Accepted` response

**AWS SES Test**:

```bash
aws ses send-email \
  --from noreply@mash.com \
  --destination ToAddresses=test@example.com \
  --message Subject={Data="Test"},Body={Text={Data="Test"}}
```

**Expected**: `MessageId` in response

### Step 5: Update Backend Code (if needed)

Check `src/modules/auth/auth.service.ts` (or similar):

```typescript
// Make sure email service is initialized
import { MailService } from '@sendgrid/mail';

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY);

// In register method
async register(dto: RegisterDto) {
  // ... create user, generate code ...

  try {
    // Send verification email
    await mailService.send({
      to: dto.email,
      from: process.env.EMAIL_FROM,
      subject: 'Verify your MASH account',
      text: `Your verification code is: ${verificationCode}`,
      html: `<p>Your verification code is: <strong>${verificationCode}</strong></p>`
    });

    console.log('✅ Verification email sent to:', dto.email);
  } catch (error) {
    console.error('❌ Failed to send verification email:', error);
    // Don't throw error - allow user to continue and resend later
  }

  return {
    success: true,
    message: 'Check your email for verification code',
    verification: { sent: true }
  };
}
```

### Step 6: Redeploy Backend

After fixing environment variables or code:

```bash
# Commit changes
git add .
git commit -m "fix: Configure email service"
git push origin main

# Railway will auto-deploy
# Wait for deployment to complete
```

---

## Frontend Workaround (Temporary)

While backend team fixes email service, you can test verification flow manually:

### Option 1: Get Code from Backend Logs

1. Register a new account
2. Check Railway logs: `railway logs --service mash-backend-api`
3. Look for log line like: `Generated verification code for user@email.com: 123456`
4. Enter that code in frontend verify-otp page

### Option 2: Use Test Code Endpoint (if available)

Some backends have a test endpoint:

```bash
# Get verification code (dev/staging only)
curl http://localhost:3000/api/v1/auth/test/get-code?email=test@example.com
```

### Option 3: Directly Update Database (Emergency)

```sql
-- In production database, set emailVerified = true
UPDATE "User" SET "emailVerified" = true WHERE email = 'test@example.com';
```

⚠️ **This bypasses security - only for testing!**

---

## How to Test Email Service

### Test Script (Node.js)

```bash
# Run the test script
node test-backend-email.js
```

This will:

1. Call backend registration endpoint
2. Check if API responds correctly
3. Verify if email claim in response
4. Print diagnostic information
5. Show what to check on backend

### Manual Test

1. Go to http://localhost:3000/signup
2. Fill registration form with a **real email you can access**
3. Submit form
4. ✅ Check: Frontend shows "Registration successful!" toast
5. ✅ Check: Redirected to /verify-otp page
6. ❌ Check: **Email not in inbox**
7. ❌ Check: **Email not in spam folder**
8. 🔴 **Conclusion**: Backend email service not working

---

## Expected Behavior

### When Email Service IS Working

**Email Subject**: `Verify your MASH account`

**Email Body**:

```
Hi Test User,

Thank you for registering with MASH!

Your verification code is: 123456

This code will expire in 10 minutes.

If you didn't request this, please ignore this email.

Best regards,
MASH Team
```

**Email Metadata**:

- From: `noreply@mash.com` or `support@mash.com`
- Reply-To: `support@mash.com`
- Sent within: 2-5 seconds of registration

---

## Backend Email Service Setup Guide

### SendGrid Setup (Recommended)

**Step 1: Create SendGrid Account**

1. Go to https://sendgrid.com
2. Sign up for free account (100 emails/day)
3. Verify your account email

**Step 2: Create API Key**

1. Go to Settings → API Keys
2. Click "Create API Key"
3. Name: `MASH Backend Production`
4. Permissions: `Full Access` (or `Mail Send` only)
5. Copy API key (starts with `SG.`)

**Step 3: Verify Sender Email**

1. Go to Settings → Sender Authentication
2. Click "Verify a Single Sender"
3. Enter `noreply@mash.com` (or your domain)
4. Check email and verify

**Step 4: Set Railway Environment Variables**

```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@mash.com
EMAIL_FROM_NAME=MASH Support
EMAIL_SERVICE_ENABLED=true
```

**Step 5: Update Backend Code**

```bash
npm install @sendgrid/mail
```

```typescript
// src/config/email.config.ts
import { MailService } from "@sendgrid/mail";

export const emailService = new MailService();
emailService.setApiKey(process.env.SENDGRID_API_KEY);

export const sendVerificationEmail = async (email: string, code: string) => {
  await emailService.send({
    to: email,
    from: {
      email: process.env.EMAIL_FROM,
      name: process.env.EMAIL_FROM_NAME,
    },
    subject: "Verify your MASH account",
    text: `Your verification code is: ${code}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Verify your MASH account</h2>
        <p>Your verification code is:</p>
        <h1 style="font-size: 32px; letter-spacing: 8px; color: #1E392A;">${code}</h1>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br/>MASH Team</p>
      </div>
    `,
  });
};
```

---

## AWS SES Setup (Alternative)

**Step 1: Create AWS Account**

1. Go to https://aws.amazon.com
2. Sign up for account
3. Verify payment method

**Step 2: Verify Email Address**

1. Go to SES Console → Verified Identities
2. Click "Create identity"
3. Select "Email address"
4. Enter `noreply@mash.com`
5. Check email and verify

**Step 3: Request Production Access**

1. Go to SES Console → Account dashboard
2. Click "Request production access"
3. Fill form explaining use case
4. Wait for approval (usually 24-48 hours)

**Step 4: Create IAM User**

1. Go to IAM Console → Users
2. Create user: `mash-backend-email`
3. Attach policy: `AmazonSESFullAccess`
4. Create access key
5. Copy Access Key ID and Secret

**Step 5: Set Railway Environment Variables**

```env
AWS_SES_ACCESS_KEY_ID=AKIA...
AWS_SES_SECRET_ACCESS_KEY=...
AWS_SES_REGION=us-east-1
EMAIL_FROM=noreply@mash.com
EMAIL_SERVICE_ENABLED=true
```

**Step 6: Update Backend Code**

```bash
npm install @aws-sdk/client-ses
```

```typescript
// src/config/email.config.ts
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const sesClient = new SESClient({
  region: process.env.AWS_SES_REGION,
  credentials: {
    accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY,
  },
});

export const sendVerificationEmail = async (email: string, code: string) => {
  const command = new SendEmailCommand({
    Source: process.env.EMAIL_FROM,
    Destination: { ToAddresses: [email] },
    Message: {
      Subject: { Data: "Verify your MASH account" },
      Body: {
        Text: { Data: `Your verification code is: ${code}` },
        Html: { Data: `<h1>${code}</h1>` },
      },
    },
  });

  await sesClient.send(command);
};
```

---

## Verification Checklist

### Backend Team Checklist

- [ ] Email service API key set in Railway environment
- [ ] Sender email verified in email service dashboard
- [ ] Email service account active (not suspended)
- [ ] Backend code imports and initializes email service
- [ ] Backend logs show "email sent" message (not errors)
- [ ] Test email sent successfully using service dashboard
- [ ] Railway environment variables reloaded after changes
- [ ] Backend redeployed after configuration changes

### Frontend Team Checklist

- [ ] Registration API call succeeds (200 OK)
- [ ] Response contains `verification.sent = true`
- [ ] Email stored in sessionStorage
- [ ] User redirected to /verify-otp page
- [ ] Verify page displays correct email
- [ ] Resend code button works
- [ ] Error handling shows user-friendly messages

---

## Quick Fix Commands

```bash
# Check if Railway CLI installed
railway --version

# Login to Railway
railway login

# Link to project
railway link

# Check environment variables
railway vars

# Set SendGrid API key
railway vars set SENDGRID_API_KEY=SG.xxxxx

# Set email from address
railway vars set EMAIL_FROM=noreply@mash.com

# Enable email service
railway vars set EMAIL_SERVICE_ENABLED=true

# View logs
railway logs --service mash-backend-api

# Redeploy
railway up
```

---

## Contact Backend Team

**Priority**: 🔴 HIGH - Email verification is blocking user registration

**Required Information**:

- Backend repository: [link]
- Railway project: mash-backend-api-production
- Environment: Production
- Issue: Email service not sending verification emails
- Status: API responds correctly but emails not delivered

**Steps to Reproduce**:

1. Go to frontend /signup page
2. Register with email: test@example.com
3. Backend creates user successfully
4. Backend responds: `{ verification: { sent: true } }`
5. **But email never arrives** (checked inbox and spam)

**Expected**: Receive email with 6-digit verification code within 30 seconds

**Actual**: No email received after 10+ minutes

**Backend Logs Needed**:

```bash
railway logs --service mash-backend-api --tail 100
```

Look for:

- Email service initialization logs
- Verification code generation logs
- Email sending attempt logs
- Any error messages related to email

---

## Success Indicators

Once email service is fixed, you should see:

### In Backend Logs

```
✅ Email service initialized
✅ User registered: test@example.com
✅ Generated verification code: 123456
✅ Sending verification email to: test@example.com
✅ Verification email sent successfully
✅ MessageId: <msg_123abc>
```

### In User's Inbox

- Email appears within 30 seconds
- Subject: "Verify your MASH account"
- From: noreply@mash.com
- Contains 6-digit code (e.g., "123456")
- Code is valid for 10 minutes

### In Frontend

- User receives email
- User enters 6-digit code
- Verification succeeds
- User logged in automatically
- Redirected to /onboarding

---

**Status**: 🔴 **ACTION REQUIRED** - Backend team needs to configure email service

**Last Updated**: November 12, 2025
