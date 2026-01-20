# Calendly Grower Population Script
# Reads Sanity token from studio/.env and runs the population script
#
# Usage: .\scripts\run-calendly-population.ps1

Write-Host "🚀 Calendly Grower Population Script" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

# Read Sanity write token from studio/.env
$envFile = "studio\.env"

if (-not (Test-Path $envFile)) {
    Write-Host "❌ Error: studio\.env file not found!" -ForegroundColor Red
    Write-Host "Please ensure the file exists with SANITY_API_WRITE_TOKEN" -ForegroundColor Yellow
    exit 1
}

Write-Host "📖 Reading Sanity token from $envFile..." -ForegroundColor Yellow

$token = Get-Content $envFile | Where-Object { $_ -match '^SANITY_API_WRITE_TOKEN=' } | ForEach-Object {
    $_.Replace('SANITY_API_WRITE_TOKEN=', '').Trim('"').Trim()
}

if (-not $token) {
    Write-Host "❌ Error: SANITY_API_WRITE_TOKEN not found in $envFile!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Token loaded successfully" -ForegroundColor Green
Write-Host ""

# Set environment variable and run script
$env:SANITY_API_WRITE_TOKEN = $token

Write-Host "🏃 Running grower population script..." -ForegroundColor Yellow
Write-Host ""

node scripts/enable-growers-calendly.js

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Script completed successfully!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Script failed with exit code: $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}
