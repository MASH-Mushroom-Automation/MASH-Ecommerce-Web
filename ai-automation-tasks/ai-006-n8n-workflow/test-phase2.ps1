# AI-006 Phase 2: find_sellers Automated Test Script
# Tests the find_sellers action with live data

Write-Host "🧪 AI-006 Phase 2: find_sellers Test Suite" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Find sellers for Oyster Mushrooms
Write-Host "Test 1: Find sellers for Oyster Mushrooms" -ForegroundColor Yellow
Write-Host "Request:" -ForegroundColor Gray
$testBody1 = @{
    action = "find_sellers"
    productType = "Oyster Mushroom"
    quantity = 10
    buyerLocation = "Manila"
    preferredDate = "2026-01-15"
} | ConvertTo-Json

Write-Host $testBody1 -ForegroundColor DarkGray
Write-Host ""

try {
    $response1 = Invoke-RestMethod -Uri "http://localhost:5678/webhook/mash-appointments" `
        -Method POST `
        -ContentType "application/json" `
        -Body $testBody1 `
        -TimeoutSec 30
    
    Write-Host "✅ Response received!" -ForegroundColor Green
    Write-Host ($response1 | ConvertTo-Json -Depth 5) -ForegroundColor White
    
    # Validate response
    if ($response1.success -eq $true) {
        Write-Host "✅ Success flag: TRUE" -ForegroundColor Green
    } else {
        Write-Host "❌ Success flag: FALSE or missing" -ForegroundColor Red
    }
    
    if ($response1.sellers -and $response1.sellers.Count -gt 0) {
        Write-Host "✅ Sellers found: $($response1.sellers.Count)" -ForegroundColor Green
        foreach ($seller in $response1.sellers) {
            Write-Host "   📍 $($seller.name) - $($seller.location)" -ForegroundColor Cyan
            Write-Host "      Slots: $($seller.availableSlots.Count)" -ForegroundColor Gray
        }
    } else {
        Write-Host "⚠️  No sellers returned" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Test 1 FAILED: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Full error: $_" -ForegroundColor DarkRed
}

Write-Host ""
Write-Host "---" -ForegroundColor Gray
Write-Host ""

# Test 2: Find sellers for Shiitake Mushrooms
Write-Host "Test 2: Find sellers for Shiitake Mushrooms" -ForegroundColor Yellow
$testBody2 = @{
    action = "find_sellers"
    productType = "Shiitake Mushroom"
    quantity = 5
    buyerLocation = "Quezon City"
    preferredDate = "2026-01-20"
} | ConvertTo-Json

try {
    $response2 = Invoke-RestMethod -Uri "http://localhost:5678/webhook/mash-appointments" `
        -Method POST `
        -ContentType "application/json" `
        -Body $testBody2 `
        -TimeoutSec 30
    
    Write-Host "✅ Response received!" -ForegroundColor Green
    Write-Host ($response2 | ConvertTo-Json -Depth 5) -ForegroundColor White
} catch {
    Write-Host "❌ Test 2 FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "---" -ForegroundColor Gray
Write-Host ""

# Test 3: Large order (tests AI matching logic)
Write-Host "Test 3: Large order (50kg) - Tests AI matching" -ForegroundColor Yellow
$testBody3 = @{
    action = "find_sellers"
    productType = "Oyster Mushroom"
    quantity = 50
    buyerLocation = "Manila"
    preferredDate = "2026-01-25"
} | ConvertTo-Json

try {
    $response3 = Invoke-RestMethod -Uri "http://localhost:5678/webhook/mash-appointments" `
        -Method POST `
        -ContentType "application/json" `
        -Body $testBody3 `
        -TimeoutSec 30
    
    Write-Host "✅ Response received!" -ForegroundColor Green
    Write-Host "Sellers matched for large order:" -ForegroundColor Cyan
    if ($response3.sellers) {
        foreach ($seller in $response3.sellers) {
            Write-Host "   📦 $($seller.name) - Capacity: $($seller.capacity)" -ForegroundColor Green
        }
    }
} catch {
    Write-Host "❌ Test 3 FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Suite Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Verify sellers have relevant specialties" -ForegroundColor Gray
Write-Host "2. Check availability slots are valid dates" -ForegroundColor Gray
Write-Host "3. Ensure AI ranking makes sense (if enabled)" -ForegroundColor Gray
Write-Host ""
