# Firebase Deployment Script
# Deploys Firestore security rules and indexes
# Usage: .\deploy-firebase.ps1

Write-Host "🔥 Firebase Deployment Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if Firebase CLI is installed
Write-Host "Checking Firebase CLI..." -ForegroundColor Yellow
$firebaseInstalled = Get-Command firebase -ErrorAction SilentlyContinue

if (-not $firebaseInstalled) {
    Write-Host "❌ Firebase CLI not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Install Firebase CLI:" -ForegroundColor Yellow
    Write-Host "  npm install -g firebase-tools" -ForegroundColor White
    Write-Host ""
    Write-Host "Then run:" -ForegroundColor Yellow
    Write-Host "  firebase login" -ForegroundColor White
    Write-Host "  firebase use --add" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "✅ Firebase CLI found" -ForegroundColor Green
Write-Host ""

# Show current project
Write-Host "Current Firebase project:" -ForegroundColor Yellow
firebase use

Write-Host ""
Write-Host "Deploying Firestore security rules..." -ForegroundColor Yellow
firebase deploy --only firestore:rules

Write-Host ""
Write-Host "Deploying Firestore indexes..." -ForegroundColor Yellow
firebase deploy --only firestore:indexes

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Test seller orders page: http://localhost:3000/seller/orders" -ForegroundColor White
Write-Host "  2. Verify indexes are created in Firebase Console" -ForegroundColor White
Write-Host "  3. Test Lalamove webhook: https://your-ngrok-url/api/lalamove/webhook" -ForegroundColor White
Write-Host ""
