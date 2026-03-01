# [PHONE VERIFICATION & 2FA] - Master Implementation Plan

## Overview
- **Goal**: Implement phone number verification with OTP and two-factor authentication (2FA) for enhanced account security
- **Status**: Planning
- **Owner**: AI Agent (Ralph)
- **Branch**: `feature/phone-verification-2fa`
- **Target Completion**: 7-10 days

## Technical Stack
- **SMS Service**: Twilio (industry standard, global reach)
- **OTP Storage**: Firestore (temporary, TTL-based)
- **Backend**: NestJS API endpoints for OTP generation/verification
- **Frontend**: React components with real-time validation
- **State Management**: AuthContext + React Hook Form

## Phases

### Phase 1: Foundation & Infrastructure (Days 1-2)

**Goal**: Set up SMS service, backend API endpoints, and database schema

#### Tasks:
- [ ] **STORY-2FA-001**: Twilio SMS Service Integration
  - Set up Twilio account and get credentials
  - Create `src/lib/sms/twilio.ts` service wrapper
  - Implement `sendOTP(phoneNumber, code)` function
  - Add rate limiting (max 3 OTPs per 15 minutes)
  - Add environment variables: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
  - Test SMS delivery to Philippine numbers (+63)

- [ ] **STORY-2FA-002**: Backend OTP Service
  - Create `@/lib/api/otp.ts` API client functions
  - Backend endpoints (NestJS):
    - `POST /api/v1/otp/send` - Generate and send OTP
    - `POST /api/v1/otp/verify` - Verify OTP code
    - `POST /api/v1/otp/resend` - Resend OTP with cooldown
  - OTP format: 6-digit numeric code
  - OTP expiry: 5 minutes
  - Store in Firestore: `otp_verifications/{userId}` collection

- [ ] **STORY-2FA-003**: Database Schema Updates
  - Firestore `otp_verifications` collection:
    ```typescript
    {
      id: string;              // Auto-generated ID
      userId: string;          // User ID
      phoneNumber: string;     // E.164 format (+63...)
      code: string;            // 6-digit OTP (hashed)
      purpose: 'PHONE_VERIFICATION' | '2FA_LOGIN' | 'PHONE_CHANGE';
      attempts: number;        // Failed attempts (max 3)
      expiresAt: Timestamp;    // 5 minutes from creation
      verified: boolean;       // Verification status
      createdAt: Timestamp;
      verifiedAt?: Timestamp;
    }
    ```
  - User profile updates:
    ```typescript
    {
      phoneNumber?: string;           // Verified phone number
      phoneVerified: boolean;         // Verification status
      phoneVerifiedAt?: Timestamp;    // When verified
      twoFactorEnabled: boolean;      // 2FA status
      twoFactorMethod?: 'SMS';        // Future: 'TOTP', 'EMAIL'
    }
    ```

- [ ] **STORY-2FA-004**: Phone Number Validation Utilities
  - Create `src/lib/phone-utils.ts`:
    - `formatPhoneNumber(input: string): string` - Format to E.164
    - `validatePhilippinePhoneNumber(phone: string): boolean`
    - `normalizePhoneNumber(input: string): string` - Remove spaces/dashes
    - `maskPhoneNumber(phone: string): string` - Display as "+63 *** *** **34"
  - Support formats: +63XXXXXXXXXX, 09XXXXXXXXX, 63XXXXXXXXXX

### Phase 2: Phone Verification UI (Days 3-4)

**Goal**: Build UI components for phone number input and OTP verification

#### Tasks:
- [ ] **STORY-2FA-005**: Phone Number Input Component
  - Create `src/components/profile/PhoneNumberInput.tsx`
  - Features:
    - Auto-format as user types (+63 912 345 6789)
    - Validation indicators (checkmark/error icon)
    - Philippine country code selector
    - Loading state during verification
  - Integration with React Hook Form + Zod validation

- [ ] **STORY-2FA-006**: OTP Verification Modal
  - Create `src/components/profile/OTPVerificationModal.tsx`
  - Features:
    - 6-digit OTP input with auto-focus/advance
    - Visual timer countdown (5:00 → 0:00)
    - Resend OTP button (disabled for 60s cooldown)
    - Error states (invalid code, expired, max attempts)
    - Success animation with checkmark
  - Keyboard shortcuts: Paste entire code, Backspace navigation

- [ ] **STORY-2FA-007**: Profile Page Integration
  - Update `src/app/(user)/profile/my-information/page.tsx`:
    - Add "Phone Number" section with verification badge
    - Show verification status:
      - Unverified: Orange badge "Verify Phone"
      - Verified: Green badge with checkmark
      - Pending: Blue badge "Verification Sent"
    - Edit phone flow: Click edit → Enter phone → Send OTP → Verify
    - Security notice: "We'll send a 6-digit code to verify your number"

- [ ] STORY-2FA-008**: Phone Verification Flow Logic
  - Create `src/hooks/usePhoneVerification.ts`:
    ```typescript
    {
      phoneNumber: string;
      setPhoneNumber: (phone: string) => void;
      isVerified: boolean;
      isLoading: boolean;
      error: string | null;
      sendOTP: () => Promise<void>;
      verifyOTP: (code: string) => Promise<boolean>;
      resendOTP: () => Promise<void>;
      canResend: boolean;
      cooldownSeconds: number;
    }
    ```
  - Handle all API calls with error recovery
  - Update AuthContext user profile on success

### Phase 3: Two-Factor Authentication (Days 5-6)

**Goal**: Implement 2FA for login security

#### Tasks:
- [ ] **STORY-2FA-009**: 2FA Settings UI
  - Create `src/components/profile/TwoFactorSettings.tsx`
  - Features:
    - Toggle switch: "Enable Two-Factor Authentication"
    - Status indicator: Enabled/Disabled badge
    - Requirements tooltip: "Phone number must be verified first"
    - Disable flow requires re-verification
    - Security notice: "Adds an extra layer of security to your account"

- [ ] **STORY-2FA-010**: 2FA Login Flow
  - Update `src/app/(auth)/login/page.tsx`:
    - After successful email/password login, check `user.twoFactorEnabled`
    - If true, show OTP modal instead of redirecting
    - Send OTP to verified phone number
    - Verify OTP before completing login
    - Error handling: Max 3 attempts, then lock for 15 minutes
  - Add "Remember this device" checkbox (30-day cookie)

- [ ] **STORY-2FA-011**: 2FA Backend Logic
  - Backend endpoints:
    - `POST /api/v1/auth/2fa/enable` - Enable 2FA (requires verified phone)
    - `POST /api/v1/auth/2fa/disable` - Disable 2FA (requires OTP verification)
    - `POST /api/v1/auth/2fa/verify` - Verify OTP during login
  - Login flow modification:
    - Initial login returns: `{ requiresTwoFactor: true, tempToken: string }`
    - Client sends OTP with tempToken
    - Backend verifies and returns full JWT
  - Implement device trust tokens (30-day expiry)

- [ ] **STORY-2FA-012**: AuthContext Updates
  - Update `src/contexts/AuthContext.tsx`:
    ```typescript
    {
      enable2FA: () => Promise<void>;
      disable2FA: () => Promise<void>;
      verify2FA: (code: string) => Promise<void>;
      twoFactorEnabled: boolean;
      twoFactorMethod?: 'SMS';
    }
    ```
  - Handle 2FA flow during `signInWithEmailPassword()`
  - Store temp token securely (memory only, not localStorage)

### Phase 4: Security & Edge Cases (Days 7-8)

**Goal**: Harden security and handle edge cases

#### Tasks:
- [ ] **STORY-2FA-013**: Rate Limiting & Abuse Prevention
  - OTP generation limits:
    - Max 3 OTP sends per phone number per 15 minutes
    - Max 5 OTP sends per user per hour
    - Max 3 verification attempts per OTP
  - Login attempt limits:
    - Max 5 failed 2FA attempts per hour → temp lock (1 hour)
    - Max 10 failed attempts per day → account review
  - Implement exponential backoff for resend (30s → 60s → 120s)

- [ ] **STORY-2FA-014**: Phone Number Change Flow
  - Change phone requires:
    1. Verify NEW phone number with OTP
    2. Confirm with current password
    3. If 2FA enabled, also verify OLD phone number
  - Security confirmation email sent to user
  - Old phone number stored in audit log

- [ ] **STORY-2FA-015**: Account Recovery
  - Create recovery flow when user loses phone access:
    - "Can't access your phone?" link on 2FA login screen
    - Requires email verification + identity proof (order history questions)
    - Admin review required for high-value accounts
    - Temporary 2FA disable (7 days grace period)
  - Recovery code generation (one-time use backup codes)

- [ ] **STORY-2FA-016**: Security Audit Trail
  - Firestore `security_events` collection:
    ```typescript
    {
      userId: string;
      eventType: 'PHONE_VERIFIED' | 'PHONE_CHANGED' | '2FA_ENABLED' 
                | '2FA_DISABLED' | '2FA_LOGIN_SUCCESS' | '2FA_LOGIN_FAILED';
      ipAddress: string;
      userAgent: string;
      phoneNumber?: string;  // Masked
      success: boolean;
      metadata?: Record<string, any>;
      createdAt: Timestamp;
    }
    ```
  - Show recent security events in profile page
  - Email notifications for critical events (phone change, 2FA disable)

### Phase 5: Testing & Polish (Days 9-10)

**Goal**: Comprehensive testing and UX polish

#### Tasks:
- [ ] **STORY-2FA-017**: Unit & Integration Tests
  - Test coverage targets:
    - Phone utilities: 100%
    - OTP service: 90%
    - Verification flow: 85%
    - 2FA login flow: 85%
  - Test files:
    - `src/lib/sms/__tests__/twilio.test.ts`
    - `src/lib/__tests__/phone-utils.test.ts`
    - `src/hooks/__tests__/usePhoneVerification.test.ts`
    - `src/components/profile/__tests__/OTPVerificationModal.test.tsx`

- [ ] **STORY-2FA-018**: E2E Testing (Playwright)
  - Test scenarios:
    - Phone verification: Enter phone → Receive OTP → Verify → Success
    - 2FA enable: Verify phone → Enable 2FA → Settings updated
    - 2FA login: Login → OTP modal → Verify → Dashboard
    - Phone change: Change phone → Verify new → Verify old → Success
    - Recovery: Lost phone → Email recovery → Disable 2FA
  - Use Twilio test credentials (no actual SMS)

- [ ] **STORY-2FA-019**: UX Polish & Accessibility
  - Accessibility:
    - ARIA labels for all inputs
    - Keyboard navigation (Tab, Enter, Backspace)
    - Screen reader announcements for OTP timer
    - Focus management in modal
  - UX improvements:
    - Auto-paste OTP from SMS (Web OTP API)
    - Haptic feedback on mobile
    - Smooth animations (success checkmark, timer countdown)
    - Error messages with actionable solutions

- [ ] **STORY-2FA-020**: Documentation & Rollout
  - Update documentation:
    - `.github/PHONE_VERIFICATION_2FA.md` - Technical details
    - `progress.txt` - Implementation patterns
    - User-facing help docs (FAQ)
  - Feature flags:
    - `NEXT_PUBLIC_ENABLE_PHONE_VERIFICATION=true`
    - `NEXT_PUBLIC_ENABLE_2FA=true`
  - Gradual rollout: 10% → 50% → 100% over 3 days
  - Monitor error rates and SMS delivery success

## Technical Decisions

### Why Twilio?
- **Global reach**: 180+ countries
- **Philippine support**: Full SMS delivery to all carriers
- **Reliability**: 99.95% uptime SLA
- **Pricing**: Competitive ($0.0445/SMS in Philippines)
- **Alternative considered**: AWS SNS (less reliable for PH)

### Why 6-digit OTP?
- **Balance**: 1 million combinations (sufficient for 5-minute window)
- **User-friendly**: Easy to type/remember
- **Industry standard**: Matches user expectations
- **Alternative considered**: 4-digit (too weak), 8-digit (too long)

### Why Firebase for OTP storage?
- **TTL support**: Auto-delete expired documents
- **Real-time**: Instant verification status updates
- **Security**: Granular security rules
- **Alternative considered**: Backend Postgres (more complex TTL)

### Why SMS over TOTP?
- **User-friendly**: No app installation required
- **Target market**: Philippine users familiar with SMS OTP
- **Recovery**: Easier for non-technical users
- **Future**: TOTP option for advanced users (Phase 6)

## Success Metrics

### Performance:
- OTP delivery: < 5 seconds (95th percentile)
- Verification API: < 500ms response time
- SMS delivery success rate: > 99%
- Frontend bundle impact: < 20KB

### Security:
- No plaintext OTP storage (hashed with bcrypt)
- Rate limiting effectiveness: 100% abuse prevention
- Failed attempt lockout: < 0.1% false positives
- Token security: HTTP-only cookies + CSRF protection

### UX:
- Verification completion rate: > 85%
- 2FA adoption rate: > 30% within 30 days
- User errors (invalid format): < 5%
- Resend OTP rate: < 20%

## Rollback Plan

### Phase-level Rollback:
1. **Phase 1-2**: Delete branch, no user impact
2. **Phase 3**: Disable 2FA via feature flag, phone verification still works
3. **Phase 4-5**: Disable features via flags, restore previous version

### Emergency Rollback:
```bash
# Disable features immediately
NEXT_PUBLIC_ENABLE_PHONE_VERIFICATION=false
NEXT_PUBLIC_ENABLE_2FA=false

# Revert database changes
# - Keep user phone numbers (no data loss)
# - Disable 2FA enforcement in proxy.ts
# - Clear otp_verifications collection (temporary data only)

# Redeploy previous version
git revert <commit-hash>
git push origin main
```

### Data Protection:
- **Phone numbers**: Preserved in user profiles
- **OTP codes**: Auto-expire after 5 minutes (safe to clear)
- **Security events**: Archived, not deleted
- **2FA settings**: Safely disable without data loss

## Cost Estimate

### Development:
- **Time**: 7-10 days (1 developer)
- **Lines of code**: ~3000 LOC
- **Files changed**: ~25 files

### Infrastructure:
- **Twilio**: $100/month (estimate for 1000 users, 3 OTPs/user/month)
- **Firebase**: Included in existing free tier
- **Backend**: No additional costs

### Ongoing:
- **SMS costs**: Variable based on usage
- **Maintenance**: ~2 hours/month
- **Support tickets**: Estimate 5-10/month initially

## Dependencies

### External Services:
- Twilio account with verified Sender ID
- Philippine regulatory compliance (NTC approval for commercial SMS)

### Internal Systems:
- Backend API live at `https://api.mashmarket.app/api/v1`
- Firebase project with Firestore enabled
- User authentication system (AuthContext)

### Technical Requirements:
- Node.js 18+ (Twilio SDK compatibility)
- Next.js 16 (current version)
- React 18+ (hooks support)

## Risk Assessment

### High Risk:
- [ ] **SMS delivery failures**: Twilio reliability in Philippines
  - **Mitigation**: Fallback to email OTP, use multiple SMS providers
- [ ] **User lockout**: Lost phone access during 2FA login
  - **Mitigation**: Recovery flow with email + backup codes

### Medium Risk:
- [ ] **Rate limiting bypass**: Bad actors spamming OTPs
  - **Mitigation**: IP-based limits + CAPTCHA on excessive requests
- [ ] **Cost overrun**: SMS abuse driving up Twilio bills
  - **Mitigation**: Hard daily limits + fraud detection

### Low Risk:
- [ ] **Phone number change errors**: User enters wrong number
  - **Mitigation**: Confirmation step + timer before finalizing
- [ ] **Browser compatibility**: OTP input quirks
  - **Mitigation**: Progressive enhancement + fallback to simple text input

## Phase-by-Phase Checklist

### Before Starting:
- [ ] Read this plan completely
- [ ] Review `progress.txt` Codebase Patterns
- [ ] Create branch: `feature/phone-verification-2fa`
- [ ] Set up Twilio account and get credentials
- [ ] Update `.env` with Twilio variables

### After Each Phase:
- [ ] All stories in phase have `passes: true` in `prd.json`
- [ ] All tests passing: `npm run test`
- [ ] Build successful: `npm run build`
- [ ] Manual testing completed
- [ ] Documentation updated in `progress.txt`
- [ ] Commit with detailed technical message

### Before Completion:
- [ ] All 20 stories completed
- [ ] E2E tests passing in Playwright
- [ ] Security audit completed
- [ ] Performance benchmarks met
- [ ] Rollout plan ready
- [ ] User documentation published

---

**Next Steps**: Create `prd-phone-verification-2fa.json` with detailed story definitions and acceptance criteria. Then activate RALPH agent to begin Phase 1.
