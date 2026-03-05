# Fix waitFor timeout configuration in integration test file
$filePath = "src\app\(seller)\seller\inventory\page.integration.test.tsx"
$content = Get-Content -Path $filePath -Raw

# Replace waitFor closing patterns - ONLY where followed by newline + code (not test closures)
# Pattern: }); followed by // comment, expect, const, await, or blank line with next code
$pattern = '(?<=await waitFor\([^)]*\) \{\s+[^}]+)\}\);(\s+)(?=//|expect|const |await |mockGet|mockUpdate|render|it\()'
$replacement = '}, WAITFOR_OPTIONS);$1'

$newContent = $content -replace $pattern, $replacement

# Count changes
$originalLines = ($content -split "`n").Length
$newLines = ($newContent -split "`n").Length
$changes = ([regex]::Matches($newContent, "WAITFOR_OPTIONS")).Count

Write-Host "Applied WAITFOR_OPTIONS to $changes waitFor calls"
Set-Content -Path $filePath -Value $newContent -NoNewline
Write-Host "File updated successfully"
