# Update all Sanity scripts to use new project ID
# Old: xyq5fhxs
# New: gerattrr

$scriptsPath = "c:\Users\Kenneth\Desktop\PP Namias\MASH-Ecommerce-Web\scripts"

Get-ChildItem -Path $scriptsPath -Recurse -Filter "*.js" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -match "xyq5fhxs") {
        Write-Host "Updating: $($_.Name)"
        $content = $content -replace "xyq5fhxs", "gerattrr"
        Set-Content -Path $_.FullName -Value $content -NoNewline
    }
}

Write-Host "`nDone! All scripts updated to use 'gerattrr' project ID."
