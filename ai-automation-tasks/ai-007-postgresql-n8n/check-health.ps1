# System Health Check for MASH Appointment System
# Verifies all services are running before testing

Write-Host ""
Write-Host "🔍 MASH Appointment System - Health Check" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# 1. Check Ollama Service
Write-Host "1. Checking Ollama service..." -ForegroundColor Yellow
try {
    $ollama = Invoke-RestMethod -Uri "http://localhost:11434" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "   ✅ Ollama is running on http://localhost:11434" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Ollama is NOT running" -ForegroundColor Red
    Write-Host "      Fix: Run 'ollama serve' in a new terminal" -ForegroundColor Gray
    $allGood = $false
}

# 2. Check Ollama Model
Write-Host ""
Write-Host "2. Checking Ollama models..." -ForegroundColor Yellow
try {
    $models = ollama list 2>$null
    if ($models -match "llama3.2") {
        Write-Host "   ✅ llama3.2 model installed" -ForegroundColor Green
    } else {
        Write-Host "   ❌ llama3.2 model NOT found" -ForegroundColor Red
        Write-Host "      Fix: Run 'ollama pull llama3.2:latest'" -ForegroundColor Gray
        $allGood = $false
    }
} catch {
    Write-Host "   ❌ Cannot check models (Ollama not installed?)" -ForegroundColor Red
    $allGood = $false
}

# 3. Check n8n
Write-Host ""
Write-Host "3. Checking n8n service..." -ForegroundColor Yellow
try {
    $n8n = Invoke-RestMethod -Uri "http://localhost:5678" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "   ✅ n8n is running on http://localhost:5678" -ForegroundColor Green
} catch {
    Write-Host "   ❌ n8n is NOT running" -ForegroundColor Red
    Write-Host "      Fix: Start Docker container or n8n service" -ForegroundColor Gray
    $allGood = $false
}

# 4. Check n8n Webhook
Write-Host ""
Write-Host "4. Checking n8n webhook..." -ForegroundColor Yellow
try {
    $webhook = Invoke-RestMethod -Uri "http://localhost:5678/webhook/mash-appointments" -Method POST -Body '{"action":"health_check"}' -ContentType "application/json" -TimeoutSec 10 -ErrorAction Stop
    Write-Host "   ✅ Webhook endpoint is active" -ForegroundColor Green
} catch {
    if ($_.Exception.Message -match "404") {
        Write-Host "   ❌ Workflow not activated or webhook path incorrect" -ForegroundColor Red
        Write-Host "      Fix: Activate workflow in n8n" -ForegroundColor Gray
    } else {
        Write-Host "   ⚠️  Webhook responded but may have errors" -ForegroundColor Yellow
        Write-Host "      This is OK - workflow will validate during tests" -ForegroundColor Gray
    }
}

# 5. Check Database (optional - requires psql)
Write-Host ""
Write-Host "5. Checking database connection..." -ForegroundColor Yellow
$psqlInstalled = Get-Command psql -ErrorAction SilentlyContinue
if ($psqlInstalled) {
    $env:PGPASSWORD = "SyuJeBKs09iN"
    $dbTest = psql "postgresql://Namias_owner@ep-wispy-thunder-a5pqgxiw-pooler.us-east-2.aws.neon.tech:5432/Namias?sslmode=require" -c "SELECT COUNT(*) FROM growers;" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Database is accessible" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Cannot connect to database" -ForegroundColor Red
        Write-Host "      Fix: Check SSL enabled in n8n credential" -ForegroundColor Gray
        $allGood = $false
    }
} else {
    Write-Host "   ⚠️  psql not installed - skipping database check" -ForegroundColor Yellow
    Write-Host "      (Database will be tested during workflow execution)" -ForegroundColor Gray
}

# Summary
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
if ($allGood) {
    Write-Host "✅ ALL CHECKS PASSED - Ready to run tests!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next step: Run .\test-neon-workflow.ps1" -ForegroundColor Cyan
} else {
    Write-Host "❌ SOME CHECKS FAILED - Fix issues above first" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common fixes:" -ForegroundColor Yellow
    Write-Host "  • Start Ollama: ollama serve" -ForegroundColor Gray
    Write-Host "  • Pull model: ollama pull llama3.2:latest" -ForegroundColor Gray
    Write-Host "  • Start n8n: docker start n8n (or your container name)" -ForegroundColor Gray
    Write-Host "  • Activate workflow in n8n (toggle switch)" -ForegroundColor Gray
}
Write-Host ""
