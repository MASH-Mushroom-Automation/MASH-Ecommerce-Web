# AI-006 Phase 4: set_appointment Automated Test Script

Write-Host "🧪 AI-006 Phase 4: set_appointment Test Suite" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

$webhookUrl = "http://localhost:5678/webhook/mash-appointments"

# Test 1: Create new appointment
Write-Host "Test 1: Create appointment with valid data" -ForegroundColor Yellow
Write-Host "Request:" -ForegroundColor Gray
$test1Body = @{
    action = "set_appointment"
    buyerUid = "buyer_test_001"
    sellerUid = "seller_001"
    slotId = "slot_001"
    productType = "Oyster Mushroom"
    quantity = 10
    scheduledTime = "2026-01-15T10:00:00Z"
    location = "Manila"
    notes = "Please bring samples"
} | ConvertTo-Json

Write-Host $test1Body -ForegroundColor Gray
Write-Host ""

try {
    $test1Response = Invoke-RestMethod -Uri $webhookUrl -Method Post -Body $test1Body -ContentType "application/json"
    Write-Host "✅ Test 1 PASSED" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Gray
    Write-Host ($test1Response | ConvertTo-Json -Depth 5) -ForegroundColor White
    Write-Host ""
    
    # Validate response
    if ($test1Response.success -and $test1Response.appointmentId -and $test1Response.appointment.status -eq "pending") {
        Write-Host "   ✓ Appointment created successfully" -ForegroundColor Green
        Write-Host "   ✓ Appointment ID: $($test1Response.appointmentId)" -ForegroundColor Green
        Write-Host "   ✓ Status: $($test1Response.appointment.status)" -ForegroundColor Green
        
        # Store appointment ID for later tests
        $global:TestAppointmentId = $test1Response.appointmentId
    } else {
        Write-Host "   ✗ Appointment creation failed" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Test 1 FAILED" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "---" -ForegroundColor DarkGray
Write-Host ""

# Test 2: Create appointment with different product
Write-Host "Test 2: Create Shiitake mushroom appointment" -ForegroundColor Yellow
Write-Host "Request:" -ForegroundColor Gray
$test2Body = @{
    action = "set_appointment"
    buyerUid = "buyer_test_002"
    sellerUid = "seller_002"
    slotId = "slot_002"
    productType = "Shiitake Mushroom"
    quantity = 5
    scheduledTime = "2026-01-20T14:00:00Z"
    location = "Quezon City"
    notes = ""
} | ConvertTo-Json

Write-Host $test2Body -ForegroundColor Gray
Write-Host ""

try {
    $test2Response = Invoke-RestMethod -Uri $webhookUrl -Method Post -Body $test2Body -ContentType "application/json"
    Write-Host "✅ Test 2 PASSED" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Gray
    Write-Host ($test2Response | ConvertTo-Json -Depth 5) -ForegroundColor White
    Write-Host ""
    
    if ($test2Response.success -and $test2Response.appointment.productType -eq "Shiitake Mushroom") {
        Write-Host "   ✓ Shiitake appointment created" -ForegroundColor Green
        Write-Host "   ✓ Quantity: $($test2Response.appointment.quantity) kg" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Test 2 FAILED" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "---" -ForegroundColor DarkGray
Write-Host ""

# Test 3: Large order appointment
Write-Host "Test 3: Create large order appointment (50kg)" -ForegroundColor Yellow
Write-Host "Request:" -ForegroundColor Gray
$test3Body = @{
    action = "set_appointment"
    buyerUid = "buyer_test_003"
    sellerUid = "seller_001"
    slotId = "slot_003"
    productType = "King Oyster Mushroom"
    quantity = 50
    scheduledTime = "2026-01-22T09:00:00Z"
    location = "Makati"
    notes = "Bulk order for restaurant chain"
} | ConvertTo-Json

Write-Host $test3Body -ForegroundColor Gray
Write-Host ""

try {
    $test3Response = Invoke-RestMethod -Uri $webhookUrl -Method Post -Body $test3Body -ContentType "application/json"
    Write-Host "✅ Test 3 PASSED" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Gray
    Write-Host ($test3Response | ConvertTo-Json -Depth 5) -ForegroundColor White
    Write-Host ""
    
    if ($test3Response.success -and $test3Response.appointment.quantity -eq 50) {
        Write-Host "   ✓ Large order appointment created" -ForegroundColor Green
        Write-Host "   ✓ Notes preserved: $($test3Response.appointment.notes)" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Test 3 FAILED" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Phase 4 Test Suite Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
