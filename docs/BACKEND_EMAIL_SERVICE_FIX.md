# 🔧 Backend Email Service Configuration Fix

## ❌ Current Issue
**Registration works BUT verification emails are NOT being sent to users.**

- Frontend: ✅ Working correctly - all API calls implemented properly
- Backend: ❌ Returns **500 Internal Server Error** when attempting to send verification emails
- Root Cause: Email service not configured on backend (Railway)

---

## 🎯 Required Backend Changes

### 1. Configure Email Service (Choose ONE)

#### Option A: SendGrid (Recommended - Easiest)
1. Create SendGrid account at https://sendgrid.com
2. Generate API key in SendGrid dashboard
3. Add to Railway backend environment variables:
```env
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.your-api-key-here
EMAIL_FROM=noreply@mash.com
```

#### Option B: AWS SES (Production-Ready)
1. Set up AWS SES in AWS Console
2. Verify sender email domain
3. Add to Railway backend environment variables:
```env
EMAIL_SERVICE=ses
AWS_SES_REGION=us-east-1
AWS_SES_ACCESS_KEY=your-access-key
AWS_SES_SECRET_KEY=your-secret-key
EMAIL_FROM=noreply@mash.com
```

#### Option C: SMTP (Gmail, Outlook, etc.)
1. Get SMTP credentials from email provider
2. Enable "Less secure app access" if using Gmail
3. Add to Railway backend environment variables:
```env
EMAIL_SERVICE=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
```

---

### 2. Install Required NestJS Packages

```bash
# For SendGrid
npm install @sendgrid/mail

# For AWS SES
npm install @aws-sdk/client-ses

# For SMTP (Nodemailer)
npm install nodemailer @nestjs-modules/mailer
```

---

### 3. Create Email Service in Backend

#### File: `src/email/email.service.ts`

```typescript
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  constructor() {
    // Initialize SendGrid
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }

  /**
   * Send verification code email
   */
  async sendVerificationCode(email: string, code: string): Promise<void> {
    try {
      const msg = {
        to: email,
        from: process.env.EMAIL_FROM,
        subject: 'Verify your MASH account',
        text: `Your verification code is: ${code}. This code expires in 10 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Welcome to MASH!</h2>
            <p>Your verification code is:</p>
            <h1 style="color: #6A994E; font-size: 32px; letter-spacing: 5px;">${code}</h1>
            <p style="color: #666;">This code expires in <strong>10 minutes</strong>.</p>
            <p style="color: #999; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
          </div>
        `
      };

      await sgMail.send(msg);
      console.log(`✅ Verification email sent to ${email}`);
    } catch (error) {
      console.error('❌ Failed to send verification email:', error);
      throw new InternalServerErrorException('Failed to send verification email');
    }
  }

  /**
   * Send password reset code email
   */
  async sendPasswordResetCode(email: string, code: string): Promise<void> {
    try {
      const msg = {
        to: email,
        from: process.env.EMAIL_FROM,
        subject: 'Reset your MASH password',
        text: `Your password reset code is: ${code}. This code expires in 10 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Password Reset Request</h2>
            <p>Your password reset code is:</p>
            <h1 style="color: #6A994E; font-size: 32px; letter-spacing: 5px;">${code}</h1>
            <p style="color: #666;">This code expires in <strong>10 minutes</strong>.</p>
            <p style="color: #999; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
          </div>
        `
      };

      await sgMail.send(msg);
      console.log(`✅ Password reset email sent to ${email}`);
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error);
      throw new InternalServerErrorException('Failed to send password reset email');
    }
  }
}
```

---

### 4. Update Auth Service to Use Email Service

#### File: `src/auth/auth.service.ts`

```typescript
import { Injectable, BadRequestException } from '@nestjs/common';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly emailService: EmailService,
    // ... other dependencies
  ) {}

  /**
   * Register new user and send verification code
   */
  async register(registerDto: RegisterDto) {
    // 1. Check if email already exists
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // 3. Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const codeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // 4. Create user (isVerified = false)
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
      verificationCode,
      verificationCodeExpiry: codeExpiry,
      isVerified: false
    });

    // 5. Send verification email
    await this.emailService.sendVerificationCode(user.email, verificationCode);

    // 6. Return success (DO NOT include code in response)
    return {
      success: true,
      message: 'Registration successful. Please check your email for verification code.'
    };
  }

  /**
   * Resend verification code
   */
  async resendVerificationCode(email: string) {
    // 1. Find user
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isVerified) {
      throw new BadRequestException('Email already verified');
    }

    // 2. Generate new code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const codeExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // 3. Update user
    await this.usersService.update(user.id, {
      verificationCode,
      verificationCodeExpiry: codeExpiry
    });

    // 4. Send email
    await this.emailService.sendVerificationCode(email, verificationCode);

    return {
      success: true,
      message: 'Verification code sent to your email'
    };
  }
}
```

---

### 5. Update Prisma Schema (if not already done)

#### File: `prisma/schema.prisma`

```prisma
model User {
  id                       String    @id @default(cuid())
  email                    String    @unique
  password                 String
  firstName                String
  lastName                 String
  isVerified               Boolean   @default(false)
  verificationCode         String?
  verificationCodeExpiry   DateTime?
  passwordResetCode        String?
  passwordResetCodeExpiry  DateTime?
  role                     UserRole  @default(BUYER)
  createdAt                DateTime  @default(now())
  updatedAt                DateTime  @updatedAt
  // ... other fields
}
```

After updating schema:
```bash
npx prisma generate
npx prisma db push
```

---

### 6. Add Email Module to NestJS

#### File: `src/email/email.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { EmailService } from './email.service';

@Module({
  providers: [EmailService],
  exports: [EmailService]
})
export class EmailModule {}
```

#### Update `src/app.module.ts`:

```typescript
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    // ... other imports
    EmailModule
  ]
})
export class AppModule {}
```

#### Update `src/auth/auth.module.ts`:

```typescript
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    // ... other imports
    EmailModule
  ]
})
export class AuthModule {}
```

---

## 🧪 Testing the Fix

### Step 1: Run Diagnostic Script (Frontend)
```bash
cd MASH-Ecommerce-Web
node test-backend-email.js
```
Update the `TEST_EMAIL` variable in the script first!

### Step 2: Test Registration Flow
1. Go to https://localhost:3000/signup
2. Fill out registration form with REAL email address
3. Click "Create Account"
4. **Expected Result**: Should see "Check your email for verification code" message
5. **Check email inbox** (and spam folder!) for verification code
6. Go to /verify-otp and enter the 6-digit code
7. Should successfully log in and redirect to /onboarding

### Step 3: Test Resend Code
1. On /verify-otp page, wait 30 seconds
2. Click "Resend Code" button
3. Should receive NEW verification code in email

---

## 📋 Deployment Checklist

- [ ] Choose email service (SendGrid/AWS SES/SMTP)
- [ ] Add email service credentials to Railway environment variables
- [ ] Install required npm packages (`@sendgrid/mail`, etc.)
- [ ] Create `EmailService` in backend
- [ ] Update `AuthService.register()` to send verification email
- [ ] Update `AuthService.resendVerificationCode()` to resend email
- [ ] Add email fields to Prisma schema (`verificationCode`, `verificationCodeExpiry`)
- [ ] Run `npx prisma generate` and `npx prisma db push`
- [ ] Import `EmailModule` in `AppModule` and `AuthModule`
- [ ] Deploy to Railway
- [ ] Test registration flow with real email
- [ ] Verify email delivery (check inbox and spam)
- [ ] Test resend code functionality

---

## 🚨 Common Issues & Solutions

### Issue 1: "Failed to send email" error
- **Check**: Email service API key is correct
- **Check**: Railway environment variables are saved and deployed
- **Check**: Email service account is active (not suspended)

### Issue 2: Emails going to spam
- **Solution**: Configure SPF and DKIM records for your domain
- **Solution**: Use verified sender domain in SendGrid/AWS SES
- **Solution**: Add "no-reply@yourdomain.com" as sender

### Issue 3: Rate limiting
- **SendGrid**: Free tier allows 100 emails/day
- **AWS SES**: Sandbox allows 200 emails/day (request production access)
- **Solution**: Implement rate limiting on backend to prevent abuse

### Issue 4: Code expires too quickly
- **Current**: 10 minutes expiry
- **Solution**: Increase to 15-30 minutes if users complain
- **Code**: Change `10 * 60 * 1000` to `30 * 60 * 1000` in auth.service.ts

---

## 📧 Email Service Comparison

| Service | Free Tier | Setup Difficulty | Reliability | Cost |
|---------|-----------|------------------|-------------|------|
| **SendGrid** | 100 emails/day | ⭐ Easy | ⭐⭐⭐⭐⭐ | $15/mo for 40k |
| **AWS SES** | 62k emails/month (if in EC2) | ⭐⭐⭐ Medium | ⭐⭐⭐⭐⭐ | $0.10 per 1k |
| **SMTP** | Varies | ⭐⭐ Easy-Medium | ⭐⭐⭐ | Free (Gmail limits) |

**Recommendation**: Use **SendGrid** for development, switch to **AWS SES** for production.

---

## 🔗 Helpful Links

- SendGrid Setup: https://docs.sendgrid.com/for-developers/sending-email/quickstart-nodejs
- AWS SES Setup: https://docs.aws.amazon.com/ses/latest/dg/send-email-nodejs.html
- NestJS Mailer: https://nest-modules.github.io/mailer/
- Railway Environment Variables: https://docs.railway.app/deploy/variables

---

## ✅ Success Criteria

**The email service is working when:**
1. ✅ Registration form submits successfully (no 500 error)
2. ✅ User receives email with 6-digit code within 1-2 minutes
3. ✅ Email lands in inbox (not spam)
4. ✅ Code can be entered on /verify-otp page and verifies successfully
5. ✅ Resend code button sends new code via email
6. ✅ Expired codes are rejected with proper error message
7. ✅ Invalid codes are rejected with proper error message

---

**Last Updated**: Current session  
**Priority**: 🔴 **CRITICAL** - Blocks entire registration flow  
**Owner**: Backend Team  
**Frontend Status**: ✅ Complete and ready
