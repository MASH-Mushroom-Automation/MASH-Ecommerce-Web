# CI/CD Quick Reference

## Before Creating PR

```bash
npm run lint      # Fix linting issues
npm run build     # MUST PASS before PR
npm test          # Optional
```

## PR Check Status

| Check | Required | If Fails |
|-------|----------|----------|
| Build | ✅ Yes | Fix build errors |
| Lint | ❌ No | Fix warnings |
| TypeScript | ❌ No | Fix type errors |
| Tests | ❌ No | Fix test failures |
| Security | ❌ No | Review npm audit |

## Quick Fixes

### Build Failed
```bash
npm run build   # See exact errors
# Fix the errors
npm run build   # Verify fix
```

### Lint Failed
```bash
npm run lint    # See issues
# Fix issues in code
```

### Vercel Error
Remove Vercel integration:
- https://vercel.com → Settings → Git → Disconnect
- Or: https://github.com/settings/installations → Remove Vercel

## Deployment

Railway deploys automatically:
- `main` → https://www.mashmarket.app
- `develop` → https://beta.mashmarket.app
