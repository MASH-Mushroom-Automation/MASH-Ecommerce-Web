# MASH Frontend Startup Script
# Port: 3000

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MASH Frontend Startup (Port 3000)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`n[1/2] Building application..." -ForegroundColor Yellow
npm run build

Write-Host "[2/2] Starting development server..." -ForegroundColor Green
Write-Host "`nFrontend will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend should be running at: http://localhost:30000" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
npm run dev
