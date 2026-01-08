# AI-006 Phase 3: get_availability Automated Test Script

Write-Host "🧪 AI-006 Phase 3: get_availability Test Suite" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

$webhookUrl = "http://localhost:5678/webhook/mash-appointments"

# Test 1: Get all availability for a seller
Write-Host "Test 1: Get all availability slots for seller" -ForegroundColor Yellow
Write-Host "Request:" -ForegroundColor Gray
$test1Body = @{
    action = "get_availability"
    sellerId = "seller_001"
} | ConvertTo-Json

Write-Host $test1Body -ForegroundColor Gray
Write-Host ""

try {
    $test1Response = Invoke-RestMethod -Uri $webhookUrl -Method Post -Body $test1Body -ContentType "application/json"
    Write-Host "✅ Test 1 PASSED" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Gray
    Write-Host ($test1Response | ConvertTo-Json -Depth 5) -ForegroundColor White
    Write-Host ""
    
    # Validate response structure
    if ($test1Response.success -and $test1Response.action -eq "get_availability" -and $test1Response.availabilityByDate) {
        Write-Host "   ✓ Response structure valid" -ForegroundColor Green
        Write-Host "   ✓ Total slots found: $($test1Response.totalSlots)" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Response structure invalid" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Test 1 FAILED" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "---" -ForegroundColor DarkGray
Write-Host ""

# Test 2: Get availability for specific date
Write-Host "Test 2: Get availability for specific date" -ForegroundColor Yellow
Write-Host "Request:" -ForegroundColor Gray
$test2Body = @{
    action = "get_availability"
    sellerId = "seller_001"
    preferredDate = "2026-01-15"
} | ConvertTo-Json

Write-Host $test2Body -ForegroundColor Gray
Write-Host ""

try {
    $test2Response = Invoke-RestMethod -Uri $webhookUrl -Method Post -Body $test2Body -ContentType "application/json"
    Write-Host "✅ Test 2 PASSED" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Gray
    Write-Host ($test2Response | ConvertTo-Json -Depth 5) -ForegroundColor White
    Write-Host ""
    
    # Validate filtered date
    if ($test2Response.success -and $test2Response.preferredDate -eq "2026-01-15") {
        Write-Host "   ✓ Date filter applied correctly" -ForegroundColor Green
        $dateKeys = $test2Response.availabilityByDate.PSObject.Properties.Name
        if ($dateKeys.Count -eq 1 -and $dateKeys[0] -eq "2026-01-15") {
            Write-Host "   ✓ Only requested date returned" -ForegroundColor Green
        }
    } else {
        Write-Host "   ✗ Date filter failed" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Test 2 FAILED" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "---" -ForegroundColor DarkGray
Write-Host ""

# Test 3: Get availability for seller with no slots
Write-Host "Test 3: Get availability for non-existent seller" -ForegroundColor Yellow
Write-Host "Request:" -ForegroundColor Gray
$test3Body = @{
    action = "get_availability"
    sellerId = "seller_999_nonexistent"
} | ConvertTo-Json

Write-Host $test3Body -ForegroundColor Gray
Write-Host ""

try {
    $test3Response = Invoke-RestMethod -Uri $webhookUrl -Method Post -Body $test3Body -ContentType "application/json"
    Write-Host "✅ Test 3 PASSED" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Gray
    Write-Host ($test3Response | ConvertTo-Json -Depth 5) -ForegroundColor White
    Write-Host ""
    
    # Should return empty availability
    if ($test3Response.success -and $test3Response.totalSlots -eq 0) {
        Write-Host "   ✓ Correctly returns empty slots" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Unexpected slots returned" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Test 3 FAILED" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Phase 3 Test Suite Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
