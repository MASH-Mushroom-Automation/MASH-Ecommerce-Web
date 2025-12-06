@echo off
REM ============================================================
REM SANITY CMS DATA SEEDER - MASH E-Commerce
REM ============================================================
REM This script runs all Sanity CMS seeders in the correct order.
REM Run from: c:\Users\Kenneth\Desktop\PP Namias\MASH-Ecommerce-Web
REM ============================================================

echo.
echo ========================================================
echo    MASH SANITY CMS DATA SEEDER
echo    Project: PP_Namias (gerattrr)
echo ========================================================
echo.

REM Change to project directory
cd /d "c:\Users\Kenneth\Desktop\PP Namias\MASH-Ecommerce-Web"

echo [Step 0] Testing Sanity connection...
call node scripts/sanity/test-connection.js
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Connection test failed. Check your .env.local tokens.
    pause
    exit /b 1
)
echo.

echo ========================================================
echo    PHASE 1: CORE E-COMMERCE DATA
echo ========================================================
echo.

echo [Step 1/15] Importing Categories (3)...
call node scripts/sanity/import-categories.js
echo.

echo [Step 2/15] Importing Products (15)...
call node scripts/sanity/import-products.js
echo.

echo [Step 3/15] Importing Variants (15)...
call node scripts/sanity/import-variants.js
echo.

echo [Step 4/15] Importing Bundles (6)...
call node scripts/sanity/import-bundles.js
echo.

echo [Step 5/15] Importing Reviews (45)...
call node scripts/sanity/import-reviews.js
echo.

echo [Step 6/15] Linking Product Relationships...
call node scripts/sanity/link-relationships.js
echo.

echo ========================================================
echo    PHASE 2: GROWERS ^& STORES
echo ========================================================
echo.

echo [Step 7/15] Creating Growers (6)...
call node scripts/migrate-growers-to-sanity.js
echo.

echo [Step 8/15] Creating Stores (3)...
call node scripts/migrate-stores-to-sanity.js
echo.

echo [Step 9/15] Linking Growers to Stores...
call node scripts/link-growers-stores.js
echo.

echo [Step 10/15] Linking Products to Growers...
call node scripts/link-products-growers.js
echo.

echo ========================================================
echo    PHASE 3: CONTENT ^& SETTINGS
echo ========================================================
echo.

echo [Step 11/15] Creating FAQ Content...
call node scripts/migrate-faq-to-sanity.js
echo.

echo [Step 12/15] Creating Feature Sections...
call node scripts/migrate-features-to-sanity.js
echo.

echo [Step 13/15] Creating Site Settings...
call node scripts/migrate-site-settings-to-sanity.js
echo.

echo [Step 14/15] Creating Testimonials...
call node scripts/migrate-testimonials-to-sanity.js
echo.

echo [Step 15/15] Creating Featured Products...
call node scripts/create-featured-products.js
echo.

echo ========================================================
echo    VERIFICATION
echo ========================================================
echo.

echo Checking data counts...
call node scripts/sanity/check-data-counts.js
echo.

echo ========================================================
echo    SEEDING COMPLETE!
echo ========================================================
echo.
echo Next steps:
echo 1. Open https://ppnamias.sanity.studio
echo 2. Upload images for products, categories, growers, stores
echo 3. Review and publish any draft documents
echo 4. Test the frontend: npm run dev
echo.
echo See: .github\SANITY_SEEDING_PLAN.md for image checklist
echo ========================================================
echo.
pause
