# Google Auth Firebase Testing Script
Write-Host "========================================"
Write-Host "Google Auth Firebase Testing"
Write-Host "========================================"

Write-Host "`n[1/5] Checking Firebase Configuration..."

# Check .env file
$envPath = ".env"
if (Test-Path $envPath) {
    Write-Host "OK: .env file found"
    $envContent = Get-Content $envPath -Raw
    
    if ($envContent -match "NEXT_PUBLIC_FIREBASE_API_KEY=") {
        Write-Host "  OK: NEXT_PUBLIC_FIREBASE_API_KEY is set"
    } else {
        Write-Host "  ERROR: NEXT_PUBLIC_FIREBASE_API_KEY is MISSING!"
    }
    
    if ($envContent -match "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=") {
        Write-Host "  OK: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN is set"
    } else {
        Write-Host "  ERROR: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN is MISSING!"
    }
} else {
    Write-Host "ERROR: .env file NOT found!"
}

Write-Host "`n[2/5] Checking Firebase Auth Implementation..."

$authFilePath = "src\lib\firebase\auth.ts"
if (Test-Path $authFilePath) {
    Write-Host "OK: Firebase auth.ts found"
    $authContent = Get-Content $authFilePath -Raw
    
    if ($authContent -match "signInWithGoogle") {
        Write-Host "  OK: signInWithGoogle function exists"
    }
    
    if ($authContent -match "GoogleAuthProvider") {
        Write-Host "  OK: GoogleAuthProvider imported"
    }
} else {
    Write-Host "ERROR: Firebase auth.ts NOT found!"
}

Write-Host "`n[3/5] Checking AuthContext Integration..."

$contextPath = "src\contexts\AuthContext.tsx"
if (Test-Path $contextPath) {
    Write-Host "OK: AuthContext.tsx found"
} else {
    Write-Host "ERROR: AuthContext.tsx NOT found!"
}

Write-Host "`n[4/5] Checking Google Sign-In Button..."

$buttonPath = "src\components\auth\google-sign-in-button.tsx"
if (Test-Path $buttonPath) {
    Write-Host "OK: Google Sign-In button found"
} else {
    Write-Host "ERROR: Google Sign-In button NOT found!"
}

Write-Host "`n[5/5] Firebase Console Configuration"
Write-Host "Please verify in Firebase Console:"
Write-Host "1. Go to: https://console.firebase.google.com/u/7/project/mash-ddf8d/authentication/providers"
Write-Host "2. Ensure Google provider is ENABLED"
Write-Host "3. Check Authorized domains includes localhost"

Write-Host "`n========================================"
Write-Host "Test Complete!"
Write-Host "========================================"

Write-Host "`nNEXT STEPS:"
Write-Host "1. Start backend: cd MASH-Backend && npm run start:dev"
Write-Host "2. Start frontend: cd MASH-Ecommerce-Web && npm run dev"
Write-Host "3. Open http://localhost:3000/login"
Write-Host "4. Click Sign in with Google"
