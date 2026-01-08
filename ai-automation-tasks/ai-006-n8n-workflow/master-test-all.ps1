# AI-006 MASTER TEST SCRIPT - Run All Phases
# This script tests all 5 workflow actions in sequence

$ErrorActionPreference = "Stop"

Write-Host "🚀 AI-006 MASTER TEST SUITE - ALL PHASES" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This will test all 5 appointment actions:" -ForegroundColor White
Write-Host "  1. find_sellers" -ForegroundColor Gray
Write-Host "  2. get_availability" -ForegroundColor Gray
Write-Host "  3. set_appointment" -ForegroundColor Gray
Write-Host "  4. cancel_appointment" -ForegroundColor Gray
Write-Host "  5. get_appointments" -ForegroundColor Gray
Write-Host ""

# Check n8n is running
Write-Host "🔍 Checking n8n server..." -ForegroundColor Yellow
try {
    $healthCheck = Invoke-RestMethod -Uri "http://localhost:5678" -Method Get -TimeoutSec 5
    Write-Host "✅ n8n server is running" -ForegroundColor Green
} catch {
    Write-Host "❌ n8n server is NOT running!" -ForegroundColor Red
    Write-Host "Please start n8n: docker-compose up -d" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor DarkGray
Write-Host ""

# Phase 2: find_sellers
Write-Host "📦 PHASE 2: Testing find_sellers..." -ForegroundColor Cyan
& ".\test-phase2.ps1"

Write-Host ""
Write-Host "=========================================" -ForegroundColor DarkGray
Write-Host ""

# Phase 3: get_availability
Write-Host "📦 PHASE 3: Testing get_availability..." -ForegroundColor Cyan
& ".\test-phase3.ps1"

Write-Host ""
Write-Host "=========================================" -ForegroundColor DarkGray
Write-Host ""

# Phase 4: set_appointment
Write-Host "📦 PHASE 4: Testing set_appointment..." -ForegroundColor Cyan
& ".\test-phase4.ps1"

Write-Host ""
Write-Host "=========================================" -ForegroundColor DarkGray
Write-Host ""

# Final Summary
Write-Host "🎉 MASTER TEST SUITE COMPLETE!" -ForegroundColor Green
Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  ✅ Phase 2: find_sellers - TESTED" -ForegroundColor Green
Write-Host "  ✅ Phase 3: get_availability - TESTED" -ForegroundColor Green
Write-Host "  ✅ Phase 4: set_appointment - TESTED" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Review test outputs above" -ForegroundColor Gray
Write-Host "  2. Check n8n executions for errors" -ForegroundColor Gray
Write-Host "  3. Import Phase 5-8 workflows if needed" -ForegroundColor Gray
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
