# 🚀 ONE-COMMAND FIX FOR SANITY FRONTEND ERROR
# Run this script to fix all Sanity frontend issues automatically

Write-Host "🔧 SANITY FRONTEND FIX SCRIPT" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: Check environment variables
Write-Host "Step 1: Checking environment variables..." -ForegroundColor Yellow

$envFile = ".env.local"
$content = Get-Content $envFile -Raw

if ($content -match "NEXT_PUBLIC_USE_MOCK_DATA=true") {
    Write-Host "   ❌ Mock data is enabled (blocks Sanity)" -ForegroundColor Red
    Write-Host "   📝 Updating to use real Sanity data..." -ForegroundColor Yellow
    
    $content = $content -replace "NEXT_PUBLIC_USE_MOCK_DATA=true", "NEXT_PUBLIC_USE_MOCK_DATA=false"
    $content | Set-Content $envFile
    
    Write-Host "   ✅ Updated NEXT_PUBLIC_USE_MOCK_DATA=false`n" -ForegroundColor Green
} else {
    Write-Host "   ✅ Mock data already disabled`n" -ForegroundColor Green
}

# Step 2: Verify data exists
Write-Host "Step 2: Verifying Sanity data..." -ForegroundColor Yellow
node scripts/sanity/check-data-counts.js

# Step 3: Check if .next cache exists
Write-Host "`nStep 3: Checking Next.js cache..." -ForegroundColor Yellow

if (Test-Path ".next") {
    Write-Host "   ⚠️  Found .next cache folder" -ForegroundColor Yellow
    Write-Host "   🗑️  Deleting cache..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force .next
    Write-Host "   ✅ Cache deleted`n" -ForegroundColor Green
} else {
    Write-Host "   ✅ No cache to clear`n" -ForegroundColor Green
}

# Step 4: Show CORS instructions
Write-Host "Step 4: CORS Configuration (MANUAL)" -ForegroundColor Yellow
Write-Host "   ⚠️  You need to configure CORS in Sanity dashboard:" -ForegroundColor Yellow
Write-Host "   1. Go to: https://sanity.io/manage/personal/project/xyq5fhxs/api" -ForegroundColor White
Write-Host "   2. Click 'CORS Origins' tab" -ForegroundColor White
Write-Host "   3. Click 'Add CORS origin' button" -ForegroundColor White
Write-Host "   4. Add: http://localhost:3000" -ForegroundColor White
Write-Host "   5. Check 'Allow credentials' ✅" -ForegroundColor White
Write-Host "   6. Click 'Save'`n" -ForegroundColor White

# Step 5: Test query
Write-Host "Step 5: Testing Sanity query..." -ForegroundColor Yellow
node scripts/sanity/test-frontend-query.js

# Step 6: Final instructions
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "🎯 FINAL STEPS:" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "1. Configure CORS (see Step 4 above)" -ForegroundColor Yellow
Write-Host "2. Restart dev server:" -ForegroundColor Yellow
Write-Host "   Press Ctrl+C in terminal running Next.js" -ForegroundColor White
Write-Host "   Then run: npm run dev`n" -ForegroundColor White

Write-Host "3. Open website:" -ForegroundColor Yellow
Write-Host "   http://localhost:3000`n" -ForegroundColor White

Write-Host "4. Check console (F12):" -ForegroundColor Yellow
Write-Host "   Should see NO 'Request error'" -ForegroundColor White
Write-Host "   Should see categories and products`n" -ForegroundColor White

Write-Host "✅ Fix script complete!" -ForegroundColor Green
Write-Host "`nIf still not working, read: .github/SANITY_FRONTEND_FIX_GUIDE.md" -ForegroundColor Cyan
