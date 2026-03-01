# Branch Workflow - Phone Verification & 2FA Feature

## Overview
This document outlines the git branch workflow for implementing the phone verification and 2FA feature using the RALPH autonomous agent system.

## Branch Strategy

### Branch Names
- **Main branch**: `main` (production-ready code)
- **Feature branch**: `feature/phone-verification-2fa` (active development)
- **Review branch** (optional): `feature/phone-verification-2fa-review` (for CR fixes)

### Branch Protection Rules
Main branch is protected with these requirements:
- ✅ Pull request required
- ✅ Code review required (1+ approvals)
- ✅ Status checks must pass:
  - `npm run build` - Zero errors
  - `npm run lint` - Zero warnings
  - `npm test` - All tests passing
  - TypeScript validation - No type errors

## Creating the Feature Branch

### Initial Setup
```bash
# 1. Ensure main branch is up to date
git checkout main
git pull origin main

# 2. Create feature branch
git checkout -b feature/phone-verification-2fa

# 3. Push to remote (sets up tracking)
git push -u origin feature/phone-verification-2fa

# 4. Verify branch exists
git branch -a
# Should show: remotes/origin/feature/phone-verification-2fa
```

### Branch Details
```bash
# View current branch
git branch --show-current
# Output: feature/phone-verification-2fa

# View branch info
git log --oneline --graph --decorate --all -5

# View remote tracking
git branch -vv
```

## RALPH Commit Workflow

### Commit Pattern
Ralph commits after each story completion with this detailed format:

```
STORY-2FA-001: Twilio SMS Service Integration

Code Changes:
- Created src/lib/sms/twilio.ts with sendOTP() function
- Implemented rate limiting using Firestore counters
- Added exponential backoff retry logic (1s, 3s, 9s)

Function Signatures:
- sendOTP(phoneNumber: string, code: string): Promise<boolean>
- checkRateLimit(phoneNumber: string): Promise<boolean>

Type Changes:
- Added TwilioConfig interface
- Added RateLimitDocument for Firestore

Dependencies Modified:
- Added twilio@5.3.5

Test Coverage:
- src/lib/sms/__tests__/twilio.test.ts: 15 tests
- All tests passing

Build Validation:
- Routes compiled: 143
- Bundle size: +45KB

Reference: STORY-2FA-001
```

### Commit Frequency
- **One commit per story**: Each story = 1 atomic commit
- **Clean history**: No "WIP" or "fix typo" commits
- **Rebase if needed**: Use `git rebase -i` to squash before PR

### Viewing Commits
```bash
# View all commits on this branch (not in main)
git log main..feature/phone-verification-2fa --oneline

# View specific story commits
git log --grep="STORY-2FA" --oneline

# View files changed in last commit
git show --stat

# View detailed diff for story
git show <commit-hash>
```

## Progress Tracking

### Checking Story Completion

**Using jq (recommended)**:
```bash
# Count completed stories
cat prd-phone-verification-2fa.json | jq '[.stories[] | select(.passes == true)] | length'

# List completed stories
cat prd-phone-verification-2fa.json | jq '.stories[] | select(.passes == true) | {id, title}'

# List pending stories
cat prd-phone-verification-2fa.json | jq '.stories[] | select(.passes == false) | {id, title, phase}'

# Show overall progress
cat prd-phone-verification-2fa.json | jq '{total: .stories | length, completed: [.stories[] | select(.passes == true)] | length}'
```

**Without jq**:
```bash
# View PRD file directly
cat prd-phone-verification-2fa.json | grep "\"passes\": true" | wc -l

# View progress.txt updates
tail -n 50 progress.txt | grep "STORY-2FA"
```

### Phase Milestones

**Phase 1 Complete** (Stories 1-4):
- [x] Twilio integration
- [x] OTP backend API
- [x] Database schema
- [x] Phone utilities

**Phase 2 Complete** (Stories 5-8):
- [x] Phone input component
- [x] OTP modal component
- [x] Profile page integration
- [x] Verification flow hook

**Phase 3 Complete** (Stories 9-12):
- [x] 2FA settings UI
- [x] 2FA login flow
- [x] 2FA backend logic
- [x] AuthContext updates

**Phase 4 Complete** (Stories 13-16):
- [x] Rate limiting
- [x] Phone change flow
- [x] Account recovery
- [x] Security audit trail

**Phase 5 Complete** (Stories 17-20):
- [x] Unit/integration tests
- [x] E2E tests
- [x] Accessibility polish
- [x] Documentation

## Syncing with Main Branch

### During Development

**If main branch gets updated while you're working**:
```bash
# 1. Fetch latest from main
git fetch origin main

# 2. Option A: Merge main into feature branch
git checkout feature/phone-verification-2fa
git merge origin/main
# Resolve conflicts if any

# 3. Option B: Rebase feature branch on main (cleaner history)
git checkout feature/phone-verification-2fa
git rebase origin/main
# Resolve conflicts if any, then:
git rebase --continue

# 4. Push updated branch (may need force push after rebase)
git push origin feature/phone-verification-2fa --force-with-lease
```

**Best practice**: Sync once per phase (after phases 1, 2, 3, 4) to minimize conflicts.

## Pull Request Workflow

### Creating the PR

**When all 20 stories are complete**:
```bash
# 1. Final checks before PR
npm run build    # Must pass
npm run lint     # Must pass
npm run test     # Must pass

# 2. Push final commits
git push origin feature/phone-verification-2fa

# 3. Create PR via GitHub UI
# Title: "Phone Verification & Two-Factor Authentication"
# Description: (see template below)
```

### PR Description Template
```markdown
## Phone Verification & Two-Factor Authentication

Implements phone number verification with OTP and optional 2FA for enhanced account security.

### 📋 Implementation Details
- **Branch**: feature/phone-verification-2fa
- **Stories Completed**: 20/20 (100%)
- **Master Plan**: [PHONE_VERIFICATION_2FA_PLAN.md](.github/PHONE_VERIFICATION_2FA_PLAN.md)
- **PRD**: [prd-phone-verification-2fa.json](prd-phone-verification-2fa.json)

### ✨ New Features
- [x] Phone number verification with SMS OTP
- [x] Two-factor authentication for login
- [x] Device trust (remember for 30 days)
- [x] Account recovery flow
- [x] Security audit trail
- [x] Rate limiting & abuse prevention

### 🔧 Technical Changes
- Added Twilio SMS integration (`src/lib/sms/twilio.ts`)
- Created OTP API endpoints (`/api/v1/otp/*`)
- New Firestore collections: `otp_verifications`, `security_events`, `rate_limits`
- Updated user profile schema with phone verification fields
- Added phone validation utilities (`src/lib/phone-utils.ts`)
- New React components: `PhoneNumberInput`, `OTPVerificationModal`, `TwoFactorSettings`

### 🧪 Testing
- Unit tests: 87 tests added (100% coverage for utilities)
- Integration tests: 23 tests (85% coverage for components)
- E2E tests: 5 Playwright tests covering all flows
- All tests passing: ✅

### 📊 Bundle Impact
- Bundle size increase: +67KB (Twilio SDK + components)
- Performance: OTP delivery < 5s average
- Zero breaking changes

### 🔐 Security
- OTP codes hashed with bcrypt
- Rate limiting on all endpoints
- CAPTCHA for abuse prevention
- Security event logging
- No plaintext sensitive data storage

### 📚 Documentation
- [x] Master plan created
- [x] PRD with 20 stories
- [x] User guides (FAQ)
- [x] Admin guides
- [x] Code comments
- [x] progress.txt updated

### 🎯 Test Plan
- [ ] Manual test: Phone verification flow
- [ ] Manual test: 2FA enable/disable
- [ ] Manual test: 2FA login
- [ ] Manual test: Phone change
- [ ] Manual test: Account recovery
- [ ] Verify SMS delivery (Twilio logs)
- [ ] Check rate limiting effectiveness

### 🚀 Rollout Plan
1. Merge to main (after approval)
2. Deploy to staging environment
3. Enable features via flags: 10% → 50% → 100%
4. Monitor error rates and SMS costs
5. Adjust rate limits if needed

### 📝 Checklist
- [x] All 20 stories completed
- [x] All tests passing
- [x] Build successful
- [x] No TypeScript errors
- [x] No linting warnings
- [x] Documentation complete
- [ ] Code review requested
- [ ] QA tested
- [ ] Security review passed

### 🔗 References
- Master Plan: `.github/PHONE_VERIFICATION_2FA_PLAN.md`
- PRD: `prd-phone-verification-2fa.json`
- Activation Guide: `.github/RALPH_ACTIVATION_GUIDE.md`

---

**Related Issues**: Closes #XXX (if applicable)
**Deployed to**: Staging environment TBD
```

### Requesting Review

**Assign reviewers**:
- Team lead (required)
- Backend developer (for API changes)
- Frontend developer (for UI components)
- Security specialist (for auth/security changes)

**Labels**:
- `enhancement`
- `security`
- `needs-review`
- `size: large`

## Handling Review Feedback

### If Changes Requested

**Option 1: Add commits to existing branch**:
```bash
# Make requested changes
# ... edit files ...

# Commit with descriptive message
git add .
git commit -m "Address review feedback: Update rate limiting logic"

# Push to same branch (PR updates automatically)
git push origin feature/phone-verification-2fa
```

**Option 2: Create review branch** (for major changes):
```bash
# Create review branch from feature branch
git checkout -b feature/phone-verification-2fa-review

# Make changes
# ... edit files ...

# Merge back to feature branch
git checkout feature/phone-verification-2fa
git merge feature/phone-verification-2fa-review

# Push updated feature branch
git push origin feature/phone-verification-2fa
```

### If Conflicts with Main

**Main branch updated during review**:
```bash
# 1. Fetch latest main
git fetch origin main

# 2. Rebase feature branch
git checkout feature/phone-verification-2fa
git rebase origin/main

# 3. Resolve conflicts
# ... resolve in VSCode ...
git add .
git rebase --continue

# 4. Force push (rewrites history)
git push origin feature/phone-verification-2fa --force-with-lease
```

## Merging to Main

### Pre-Merge Checklist
- [ ] All review comments addressed
- [ ] All CI checks passing
- [ ] Required approvals received
- [ ] No merge conflicts
- [ ] Documentation up to date
- [ ] Feature flags configured

### Merge Strategy

**GitHub UI (recommended)**:
1. Click "Squash and merge" button
2. Edit commit message (use PR title)
3. Confirm merge
4. Delete `feature/phone-verification-2fa` branch

**Command line**:
```bash
# 1. Switch to main
git checkout main
git pull origin main

# 2. Merge feature branch
git merge --squash feature/phone-verification-2fa

# 3. Commit with detailed message
git commit -m "Phone Verification & Two-Factor Authentication

Implements phone number verification with OTP and optional 2FA.

- Added Twilio SMS integration
- Created OTP API endpoints
- New UI components for phone verification
- Security audit trail and rate limiting
- Comprehensive test coverage (85%+)

Closes #XXX"

# 4. Push to main
git push origin main

# 5. Delete feature branch
git branch -D feature/phone-verification-2fa
git push origin --delete feature/phone-verification-2fa
```

## Post-Merge Cleanup

```bash
# 1. Verify main branch has changes
git checkout main
git pull origin main
git log --oneline -5

# 2. Remove local feature branch
git branch -d feature/phone-verification-2fa

# 3. Clean up old branches
git remote prune origin
git branch -vv | grep ': gone]' | awk '{print $1}' | xargs git branch -d
```

## Rollback Procedure

### If Issues Found After Merge

**Option 1: Revert merge commit**:
```bash
# 1. Find merge commit
git log --oneline -10

# 2. Revert merge commit
git revert -m 1 <merge-commit-hash>

# 3. Push revert commit
git push origin main
```

**Option 2: Create hotfix branch**:
```bash
# 1. Create hotfix from main
git checkout main
git pull
git checkout -b hotfix/phone-2fa-issues

# 2. Fix issues
# ... make fixes ...

# 3. Fast PR and merge
git push origin hotfix/phone-2fa-issues
# Create PR, review, merge immediately
```

**Option 3: Disable features via flags**:
```env
# In Railway dashboard or .env.production
NEXT_PUBLIC_ENABLE_PHONE_VERIFICATION=false
NEXT_PUBLIC_ENABLE_2FA=false

# Redeploy with flags disabled
```

## Monitoring After Merge

### Metrics to Track
- SMS delivery success rate (Twilio dashboard)
- OTP verification success rate (Backend logs)
- 2FA adoption rate (User profiles)
- Error rates (Sentry/logging)
- Performance (OTP delivery time)

### Alerts to Set Up
- SMS delivery < 95%
- Error rate > 5%
- High SMS costs (>$200/day)
- Multiple failed 2FA attempts (same user)

---

**Questions?** Refer to:
- Master Plan: `.github/PHONE_VERIFICATION_2FA_PLAN.md`
- Activation Guide: `.github/RALPH_ACTIVATION_GUIDE.md`
- Quick Start: `README-PHONE-2FA.md`
