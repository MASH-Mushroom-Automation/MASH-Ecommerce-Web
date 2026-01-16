# MASH Frontend Startup Script
# Port: 3000 (default Next.js port)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MASH Frontend Startup (Port 3000)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`n✅ Port Configuration:" -ForegroundColor Green
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "   Backend:  http://localhost:30000" -ForegroundColor Cyan

Write-Host "`n[1/2] Building application..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Build failed! Check errors above." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "`n✅ Build successful!" -ForegroundColor Green

Write-Host "`n[2/2] Starting development server..." -ForegroundColor Yellow
Write-Host "`n🌐 Frontend will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "📊 Make sure backend is running at: http://localhost:30000" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

npm run dev
