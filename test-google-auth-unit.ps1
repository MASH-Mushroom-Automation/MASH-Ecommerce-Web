# ============================================================================
# Google Auth Unit Tests - Runner Script
# ============================================================================
# 
# This script runs comprehensive unit tests for Google OAuth authentication
# 
# Features Tested:
# - Firebase popup authentication
# - Error handling (popup blocked, closed, network errors)
# - Comprehensive error logging
# - User data synchronization
# 
# Usage:
#   .\test-google-auth-unit.ps1
# 
# ============================================================================

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "Google Auth Unit Tests" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan

Write-Host "`n[INFO] Running Google Authentication unit tests..." -ForegroundColor Yellow

# Run the tests
npm test -- auth.google.test

$exitCode = $LASTEXITCODE

Write-Host "`n============================================================================" -ForegroundColor Cyan

if ($exitCode -eq 0) {
    Write-Host "✅ ALL TESTS PASSED!" -ForegroundColor Green
    Write-Host "`nGoogle Auth is working correctly with proper error logging" -ForegroundColor Green
} else {
    Write-Host "❌ TESTS FAILED!" -ForegroundColor Red
    Write-Host "`nPlease review the errors above and fix the issues" -ForegroundColor Red
}

Write-Host "============================================================================" -ForegroundColor Cyan

exit $exitCode
