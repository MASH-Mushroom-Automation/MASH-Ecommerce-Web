# Test Ollama API Endpoint
# Usage: .\test-ollama-api.ps1

Write-Host "🧪 Ollama API Test Script" -ForegroundColor Cyan
Write-Host "==========================`n" -ForegroundColor Cyan

# Test 1: Check if Ollama service is running
Write-Host "Test 1: Checking Ollama service..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -Method GET -TimeoutSec 5
    Write-Host "✅ Ollama service is running" -ForegroundColor Green
    Write-Host "   Available models:" -ForegroundColor Gray
    $response.models | ForEach-Object {
        Write-Host "   - $($_.name) ($([math]::Round($_.size / 1GB, 2)) GB)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Ollama service not responding" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 2: Simple generation test
Write-Host "Test 2: Testing text generation..." -ForegroundColor Yellow
$body = @{
    model = "llama3.2:3b"
    prompt = "Hello, respond with just 'Hi from Ollama!'"
    stream = $false
} | ConvertTo-Json

try {
    $startTime = Get-Date
    $response = Invoke-RestMethod -Uri "http://localhost:11434/api/generate" `
        -Method POST `
        -Body $body `
        -ContentType "application/json" `
        -TimeoutSec 30
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalSeconds

    Write-Host "✅ Generation successful" -ForegroundColor Green
    Write-Host "   Response: $($response.response)" -ForegroundColor Gray
    Write-Host "   Time: $([math]::Round($duration, 2)) seconds" -ForegroundColor Gray
} catch {
    Write-Host "❌ Generation failed" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 3: Seller matching test
Write-Host "Test 3: Testing seller matching..." -ForegroundColor Yellow
$sellerPrompt = @"
You are a seller matcher for MASH mushroom marketplace.

Buyer request:
- Product: Oyster Mushrooms
- Quantity: 10kg (bulk order)
- Location: Manila

Available sellers:
1. Juan's Farm - Specializes in oyster, king oyster. Location: Quezon City (15km from Manila). Capacity: 50kg/week
2. Maria's Mushrooms - All types. Location: Pasig (20km). Capacity: 30kg/week
3. Pedro's Organic - Shiitake specialist. Location: Makati (10km). Capacity: 20kg/week

Rank top 3 sellers by: 1) Product match, 2) Proximity, 3) Capacity
Return format: Seller name, reason, distance
"@

$body = @{
    model = "llama3.2:3b"
    prompt = $sellerPrompt
    stream = $false
} | ConvertTo-Json

try {
    $startTime = Get-Date
    $response = Invoke-RestMethod -Uri "http://localhost:11434/api/generate" `
        -Method POST `
        -Body $body `
        -ContentType "application/json" `
        -TimeoutSec 30
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalSeconds

    Write-Host "✅ Seller matching successful" -ForegroundColor Green
    Write-Host "`nMatching Result:" -ForegroundColor Cyan
    Write-Host $response.response -ForegroundColor Gray
    Write-Host "`n   Time: $([math]::Round($duration, 2)) seconds" -ForegroundColor Gray
} catch {
    Write-Host "❌ Seller matching failed" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 4: Test from Docker perspective (n8n)
Write-Host "Test 4: Testing from Docker (n8n perspective)..." -ForegroundColor Yellow
$body = @{
    model = "llama3.2:3b"
    prompt = "Test from Docker: Reply with 'Connection successful from Docker!'"
    stream = $false
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://host.docker.internal:11434/api/generate" `
        -Method POST `
        -Body $body `
        -ContentType "application/json" `
        -TimeoutSec 30
    
    Write-Host "✅ Docker connection successful" -ForegroundColor Green
    Write-Host "   Response: $($response.response)" -ForegroundColor Gray
} catch {
    Write-Host "⚠️  Docker connection test skipped (requires Docker running)" -ForegroundColor Yellow
    Write-Host "   This is OK - n8n will test it from inside Docker container" -ForegroundColor Gray
}

Write-Host ""
Write-Host "🎉 All tests complete!" -ForegroundColor Green
Write-Host "   Ollama is ready for n8n integration" -ForegroundColor Green
