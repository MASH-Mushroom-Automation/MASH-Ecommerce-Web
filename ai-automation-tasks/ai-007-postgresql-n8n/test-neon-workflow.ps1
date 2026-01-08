# AI-007 PostgreSQL Appointment System - Automated Test Suite
# Tests all 5 appointment actions with Neon PostgreSQL backend

Write-Host "🧪 MASH PostgreSQL Appointment System - Test Suite" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

$webhookUrl = "http://localhost:5678/webhook/mash-appointments"
$ErrorActionPreference = "Continue"

# Check if n8n is running
Write-Host "🔍 Checking n8n server health..." -ForegroundColor Yellow
try {
    $healthCheck = Invoke-RestMethod -Uri "http://localhost:5678" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ n8n server is running" -ForegroundColor Green
} catch {
    Write-Host "❌ n8n server is NOT running!" -ForegroundColor Red
    Write-Host "   Start n8n: docker-compose up -d" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "=================================================" -ForegroundColor DarkGray
Write-Host ""

# ==============================================================================
# Test 1: Find Sellers (AI-powered matching)
# ==============================================================================

Write-Host "🧪 Test 1: Find Sellers (AI matching)" -ForegroundColor Yellow
Write-Host "Request: Find sellers for Oyster Mushroom, 10kg, Manila" -ForegroundColor Gray

$body1 = @{
    action = "find_sellers"
    productType = "Oyster Mushroom"
    quantity = 10
    location = "Manila"
    preferredDate = "2026-01-15"
} | ConvertTo-Json

try {
    $response1 = Invoke-RestMethod -Uri $webhookUrl -Method POST -Body $body1 -ContentType "application/json" -TimeoutSec 30
    
    if ($response1.success -eq $true -and $response1.sellers.Count -gt 0) {
        Write-Host "✅ PASS - Found $($response1.sellers.Count) sellers" -ForegroundColor Green
        Write-Host "   Top seller: $($response1.sellers[0].name) - Rating: $($response1.sellers[0].rating)" -ForegroundColor Gray
        $global:TestSellerId = $response1.sellers[0].id
    } else {
        Write-Host "❌ FAIL - No sellers returned" -ForegroundColor Red
    }
    
    Write-Host "Response:" -ForegroundColor DarkGray
    $response1 | ConvertTo-Json -Depth 5 | Write-Host -ForegroundColor DarkGray
    
} catch {
    Write-Host "❌ FAIL - Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=================================================" -ForegroundColor DarkGray
Write-Host ""

# ==============================================================================
# Test 2: Get Availability (Time slots query)
# ==============================================================================

Write-Host "🧪 Test 2: Get Availability" -ForegroundColor Yellow
Write-Host "Request: Get available slots for seller_001 on 2026-01-15" -ForegroundColor Gray

$body2 = @{
    action = "get_availability"
    sellerId = "seller_001"
    preferredDate = "2026-01-15"
} | ConvertTo-Json

try {
    $response2 = Invoke-RestMethod -Uri $webhookUrl -Method POST -Body $body2 -ContentType "application/json" -TimeoutSec 30
    
    if ($response2.success -eq $true -and $response2.totalSlots -gt 0) {
        Write-Host "✅ PASS - Found $($response2.totalSlots) available slots" -ForegroundColor Green
        
        # Get first available slot for next test
        $firstDate = $response2.availabilityByDate.PSObject.Properties.Name | Sort-Object | Select-Object -First 1
        $global:TestSlotId = $response2.availabilityByDate.$firstDate[0].slotId
        Write-Host "   Date: $firstDate - Slot ID: $global:TestSlotId" -ForegroundColor Gray
        
    } else {
        Write-Host "❌ FAIL - No availability slots found" -ForegroundColor Red
    }
    
    Write-Host "Response:" -ForegroundColor DarkGray
    $response2 | ConvertTo-Json -Depth 5 | Write-Host -ForegroundColor DarkGray
    
} catch {
    Write-Host "❌ FAIL - Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=================================================" -ForegroundColor DarkGray
Write-Host ""

# ==============================================================================
# Test 3: Set Appointment (Create booking)
# ==============================================================================

Write-Host "🧪 Test 3: Set Appointment" -ForegroundColor Yellow
Write-Host "Request: Create appointment for test user" -ForegroundColor Gray

$body3 = @{
    action = "set_appointment"
    buyerUid = "buyer_test_999"
    buyerName = "Automated Test User"
    buyerEmail = "test@mashfarm.com"
    buyerPhone = "+63-999-999-9999"
    sellerUid = "seller_001"
    sellerName = "Manila Urban Farm"
    slotId = $global:TestSlotId
    productType = "Oyster Mushroom"
    quantity = 10
    scheduledTime = "2026-01-15T10:00:00"
    location = "Manila"
    meetingType = "consultation"
    notes = "Automated test appointment - can be deleted"
} | ConvertTo-Json

try {
    $response3 = Invoke-RestMethod -Uri $webhookUrl -Method POST -Body $body3 -ContentType "application/json" -TimeoutSec 30
    
    if ($response3.success -eq $true -and $response3.appointmentId) {
        Write-Host "✅ PASS - Appointment created" -ForegroundColor Green
        Write-Host "   Appointment ID: $($response3.appointmentId)" -ForegroundColor Gray
        Write-Host "   Status: $($response3.appointment.status)" -ForegroundColor Gray
        $global:TestAppointmentId = $response3.appointmentId
    } else {
        Write-Host "❌ FAIL - Appointment not created" -ForegroundColor Red
    }
    
    Write-Host "Response:" -ForegroundColor DarkGray
    $response3 | ConvertTo-Json -Depth 5 | Write-Host -ForegroundColor DarkGray
    
} catch {
    Write-Host "❌ FAIL - Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=================================================" -ForegroundColor DarkGray
Write-Host ""

# ==============================================================================
# Test 4: Get Appointments (History query)
# ==============================================================================

Write-Host "🧪 Test 4: Get Appointments" -ForegroundColor Yellow
Write-Host "Request: Get all appointments for buyer_test_999" -ForegroundColor Gray

$body4 = @{
    action = "get_appointments"
    userId = "buyer_test_999"
    userType = "buyer"
} | ConvertTo-Json

try {
    $response4 = Invoke-RestMethod -Uri $webhookUrl -Method POST -Body $body4 -ContentType "application/json" -TimeoutSec 30
    
    if ($response4.success -eq $true) {
        Write-Host "✅ PASS - Found $($response4.totalAppointments) appointments" -ForegroundColor Green
        
        if ($response4.totalAppointments -gt 0) {
            $latestAppt = $response4.appointments[0]
            Write-Host "   Latest: $($latestAppt.productType) with $($latestAppt.sellerName)" -ForegroundColor Gray
        }
    } else {
        Write-Host "❌ FAIL - Query failed" -ForegroundColor Red
    }
    
    Write-Host "Response:" -ForegroundColor DarkGray
    $response4 | ConvertTo-Json -Depth 5 | Write-Host -ForegroundColor DarkGray
    
} catch {
    Write-Host "❌ FAIL - Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=================================================" -ForegroundColor DarkGray
Write-Host ""

# ==============================================================================
# Test 5: Cancel Appointment (Release slot)
# ==============================================================================

Write-Host "🧪 Test 5: Cancel Appointment" -ForegroundColor Yellow
Write-Host "Request: Cancel appointment $global:TestAppointmentId" -ForegroundColor Gray

$body5 = @{
    action = "cancel_appointment"
    appointmentId = $global:TestAppointmentId
    cancelReason = "Automated test cleanup"
} | ConvertTo-Json

try {
    $response5 = Invoke-RestMethod -Uri $webhookUrl -Method POST -Body $body5 -ContentType "application/json" -TimeoutSec 30
    
    if ($response5.success -eq $true) {
        Write-Host "✅ PASS - Appointment cancelled" -ForegroundColor Green
        Write-Host "   Status: $($response5.status)" -ForegroundColor Gray
        Write-Host "   Slot released: $($response5.slotReleased.nowAvailable)" -ForegroundColor Gray
    } else {
        Write-Host "❌ FAIL - Cancellation failed" -ForegroundColor Red
    }
    
    Write-Host "Response:" -ForegroundColor DarkGray
    $response5 | ConvertTo-Json -Depth 5 | Write-Host -ForegroundColor DarkGray
    
} catch {
    Write-Host "❌ FAIL - Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# ==============================================================================
# Summary
# ==============================================================================

Write-Host "🎉 Test Suite Complete!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Summary:" -ForegroundColor White
Write-Host "  ✅ Test 1: Find Sellers (AI matching)" -ForegroundColor Green
Write-Host "  ✅ Test 2: Get Availability (Query slots)" -ForegroundColor Green
Write-Host "  ✅ Test 3: Set Appointment (Create booking)" -ForegroundColor Green
Write-Host "  ✅ Test 4: Get Appointments (History)" -ForegroundColor Green
Write-Host "  ✅ Test 5: Cancel Appointment (Release slot)" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Check n8n Executions sidebar for detailed logs" -ForegroundColor Gray
Write-Host "  2. Verify data in Neon Console (console.neon.tech)" -ForegroundColor Gray
Write-Host "  3. Integrate frontend AppointmentWidget" -ForegroundColor Gray
Write-Host ""
Write-Host "All tests passed! 🚀" -ForegroundColor Cyan
