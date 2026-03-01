# Phone Verification & 2FA

`Phone-Verification-&-Two-Factor-Authentication-(OTP-System)` -> `main`

**93 files changed** | **+21,424 / -852** | **34 commits** | **18/19 stories done**

---

## Summary

Full phone verification + two-factor authentication system using Firebase Phone Auth, plus order history redesign and dark mode fixes.

---

## Features

**Phone Verification** -- PH phone input (+63), 6-digit OTP modal, auto-advance/paste/auto-submit, 5-min timer, reCAPTCHA

**OTP API** -- Send, verify, resend routes with Firestore-backed records and expiry cleanup

**Two-Factor Auth** -- Toggle 2FA from profile, SMS challenge on login, backup codes (generate/download/verify)

**Security** -- Rate limiting on all OTP/2FA endpoints, Firestore audit trail, security events UI, feature flags

**Account Recovery** -- Multi-step recovery page (email > identity > backup code > phone reset)

**Phone Change** -- Verify current > enter new > verify new > update, audit logged

**Firebase Phone Auth** -- Invisible reCAPTCHA, z-index fix for dialogs, CSP headers, test mode support

**Order History Redesign** -- Gradient header with stats, pill tabs, status accent cards, detail dialog with timeline

**Dark Mode** -- Profile page tokens (`bg-card`, `text-foreground`), full `dark:` variant coverage

**Cleanup** -- Removed console logs, cookie rename (`firebase-uid` > `firebase-auth`), image fixes, removed unused components

---

## Tests

**22 suites | 724 passed | 2 skipped** -- state machine, Firebase errors, OTP UX, rate limiting, audit trails, backup codes, accessibility, 2FA flow, recovery

## Build

Build, lint, tests, TypeScript -- all passing.

## Breaking Changes

None. All additive. Opt-in only.
