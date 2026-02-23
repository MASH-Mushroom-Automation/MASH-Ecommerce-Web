# Add All GitHub Secrets for CI/CD Workflows
# Run this script: .\add-github-secrets.ps1

Write-Host "🔐 Adding GitHub Secrets for CI/CD Workflows..." -ForegroundColor Cyan
Write-Host ""

# Backend API
Write-Host "➡️ Adding Backend API secrets..." -ForegroundColor Yellow
gh secret set NEXT_PUBLIC_API_URL -b "https://api.mashmarket.app/api/v1"

# Sanity CMS
Write-Host "➡️ Adding Sanity CMS secrets..." -ForegroundColor Yellow
gh secret set NEXT_PUBLIC_SANITY_PROJECT_ID -b "gerattrr"
gh secret set NEXT_PUBLIC_SANITY_DATASET -b "production"
gh secret set NEXT_PUBLIC_SANITY_API_VERSION -b "2024-11-26"

# Firebase Authentication
Write-Host "➡️ Adding Firebase secrets..." -ForegroundColor Yellow
gh secret set NEXT_PUBLIC_FIREBASE_API_KEY -b "AIzaSyBQ1r2ZHKorNknHpzBDeaLY8FXMM58CNL4"
gh secret set NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN -b "mash-ddf8d.firebaseapp.com"
gh secret set NEXT_PUBLIC_FIREBASE_PROJECT_ID -b "mash-ddf8d"
gh secret set NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET -b "mash-ddf8d.firebasestorage.app"
gh secret set NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID -b "784415877696"
gh secret set NEXT_PUBLIC_FIREBASE_APP_ID -b "1:784415877696:web:89853cbc7b1c54d6da4da5"

Write-Host ""
Write-Host "✅ All GitHub Secrets added successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Verifying secrets..." -ForegroundColor Cyan
gh secret list

Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Magenta
Write-Host "1. Wait 30 seconds for secrets to propagate"
Write-Host "2. Re-run failed workflows: gh pr checks --watch"
Write-Host "3. All checks should now pass!"
