/**
 * Fix Products Schema to Match Sanity Structure
 * Converts flat fields to nested objects, fixes type mismatches
 */

const fs = require('fs');
const path = require('path');

async function fixProductsSchema() {
  console.log('🔧 Fixing products.json schema structure...\n');

  try {
    // Load current products
    const dataPath = path.join(__dirname, '../../data/sanity/products.json');
    const products = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    console.log(`   Loaded ${products.length} products\n`);

    // Fix each product
    const fixedProducts = products.map((product, index) => {
      console.log(`   Fixing ${index + 1}. ${product.name}...`);

      // Create fixed product with correct structure
      const fixed = {
        _type: 'product',
        name: product.name,
        slug: product.slug,
        categorySlug: product.categorySlug, // Will be converted to reference in import script
        description: product.description,
        sku: product.sku,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        quantity: product.quantity,

        // Fix: Nest inventory fields in 'inventory' object
        inventory: {
          lowStockThreshold: product.lowStockThreshold || 10,
          trackInventory: product.trackInventory !== undefined ? product.trackInventory : true,
          allowBackorders: product.allowBackorders || false,
        },

        // Fix: Rename availableForPurchase → isAvailable
        isAvailable: product.availableForPurchase !== undefined ? product.availableForPurchase : true,

        // Fix: Rename featuredProduct → isFeatured
        isFeatured: product.featuredProduct || false,

        // Fix: Keep weight, but change unitOfMeasurement → unit (with correct values)
        weight: product.weight,
        unit: convertUnit(product.unitOfMeasurement),

        // Keep searchKeywords as is
        searchKeywords: product.searchKeywords || [],

        // Fix: Nest delivery fields in 'deliveryOptions' object
        deliveryOptions: {
          sameDayDeliveryEligible: product.sameDayDeliveryEligible !== undefined ? product.sameDayDeliveryEligible : false,
          deliveryZones: convertDeliveryZones(product.deliveryZones || []),
          perishable: product.perishable !== undefined ? product.perishable : true,
        },

        // Fix: Nest package weight/dimensions in 'deliveryWeight' object
        deliveryWeight: {
          packageWeight: product.packageWeight || 0.3,
          packageDimensions: product.packageDimensions || {
            length: 20,
            width: 15,
            height: 8,
          },
        },

        // Fix: Update freshnessInfo with correct structure
        freshnessInfo: {
          harvestWindow: convertHarvestWindow(product.freshnessInfo?.harvestWindow),
          shelfLife: convertShelfLife(product.freshnessInfo?.shelfLife),
          storageInstructions: product.freshnessInfo?.storageInstructions || '',
          // FIX TYPE ERROR: Convert array to comma-separated string
          qualityIndicators: Array.isArray(product.freshnessInfo?.qualityIndicators)
            ? product.freshnessInfo.qualityIndicators.join(', ')
            : (product.freshnessInfo?.qualityIndicators || ''),
        },

        // Fix: Update preparationInfo with correct structure
        preparationInfo: {
          difficultyLevel: product.preparationInfo?.difficultyLevel || 'beginner',
          // FIX TYPE ERROR: Convert number to string
          cookingTime: typeof product.preparationInfo?.cookingTime === 'number'
            ? `${product.preparationInfo.cookingTime} minutes`
            : (product.preparationInfo?.cookingTime || '10-15 minutes'),
          preparationTips: product.preparationInfo?.preparationTips || [],
          // FIX TYPE ERROR: Convert objects to simple strings
          recipeIdeas: Array.isArray(product.preparationInfo?.recipeIdeas)
            ? product.preparationInfo.recipeIdeas.map(recipe => 
                typeof recipe === 'string' ? recipe : `${recipe.name || recipe.title} (${recipe.time})`
              )
            : [],
        },

        // Fix: Convert nutritionalHighlights to correct values
        nutritionalHighlights: convertNutritionalHighlights(product.nutritionalHighlights || []),
      };

      return fixed;
    });

    // Save fixed products
    fs.writeFileSync(dataPath, JSON.stringify(fixedProducts, null, 2), 'utf8');
    console.log(`\n✅ Fixed ${fixedProducts.length} products`);
    console.log(`   Saved to: ${dataPath}\n`);

    // Show summary of changes
    console.log('📊 Changes Made:');
    console.log('   ✅ Nested inventory fields in "inventory" object');
    console.log('   ✅ Renamed "availableForPurchase" → "isAvailable"');
    console.log('   ✅ Renamed "featuredProduct" → "isFeatured"');
    console.log('   ✅ Converted "unitOfMeasurement" → "unit" with correct values');
    console.log('   ✅ Nested delivery fields in "deliveryOptions" object');
    console.log('   ✅ Nested package weight/dims in "deliveryWeight" object');
    console.log('   ✅ Fixed qualityIndicators: array → comma-separated string');
    console.log('   ✅ Fixed cookingTime: number → string with "minutes"');
    console.log('   ✅ Fixed recipeIdeas: objects → simple strings');
    console.log('   ✅ Converted delivery zones to schema values');
    console.log('   ✅ Converted harvest window to schema values');
    console.log('   ✅ Converted shelf life to schema values');
    console.log('   ✅ Converted nutritional highlights to schema values\n');

    return fixedProducts;

  } catch (error) {
    console.error('\n❌ Fix failed:', error.message);
    throw error;
  }
}

// Helper: Convert unit of measurement to schema value
function convertUnit(unit) {
  const unitMap = {
    'grams': 'g',
    'kilograms': 'kg',
    'kg': 'kg',
    'pieces': 'pcs',
    'pack': 'pack',
    'box': 'box',
    'kit': 'pack',
  };
  return unitMap[unit?.toLowerCase()] || 'g';
}

// Helper: Convert delivery zones to schema values
function convertDeliveryZones(zones) {
  const zoneMap = {
    'Metro Manila': 'metro-manila',
    'Quezon City': 'quezon-city',
    'Makati': 'makati',
    'BGC Taguig': 'bgc',
    'BGC': 'bgc',
    'Mandaluyong': 'mandaluyong',
    'Pasig': 'pasig',
    'Manila': 'manila',
    'Muntinlupa': 'muntinlupa',
    'Parañaque': 'paranaque',
    'Las Piñas': 'las-pinas',
    'Nationwide': 'nationwide',
  };

  return zones.map(zone => zoneMap[zone] || zone.toLowerCase().replace(/\s+/g, '-'));
}

// Helper: Convert harvest window to schema value
function convertHarvestWindow(window) {
  if (!window) return '24h';
  if (window.includes('24')) return '24h';
  if (window.includes('48')) return '48h';
  if (window.includes('3-5')) return '3-5d';
  return 'n/a';
}

// Helper: Convert shelf life to schema value
function convertShelfLife(shelfLife) {
  if (!shelfLife) return '5-7d';
  if (shelfLife.includes('3-5')) return '3-5d';
  if (shelfLife.includes('5-7')) return '5-7d';
  if (shelfLife.includes('1-2 week')) return '1-2w';
  if (shelfLife.includes('7-10')) return '5-7d'; // Map to closest option
  if (shelfLife.includes('6-12 month') || shelfLife.includes('6 months')) return '6-12m';
  if (shelfLife.includes('1 year') || shelfLife.includes('12 month')) return '1y+';
  return '5-7d';
}

// Helper: Convert nutritional highlights to schema values
function convertNutritionalHighlights(highlights) {
  const highlightMap = {
    'High in Vitamin D': 'vitamin-d',
    'Rich in Antioxidants': 'antioxidants',
    'High Protein': 'high-protein',
    'Low Calorie': 'low-calorie',
    'Immune Support': 'immune-support',
    'Heart Healthy': 'heart-healthy',
    'Vegan': 'vegan',
    'Organic': 'organic',
    'Brain Health': 'brain-health',
    'Bone Health': 'bone-health',
  };

  return highlights.map(h => highlightMap[h] || h.toLowerCase().replace(/\s+/g, '-'));
}

// Run fix
if (require.main === module) {
  fixProductsSchema()
    .then(() => {
      console.log('✅ Schema fix complete! You can now run:');
      console.log('   node scripts/sanity/import-products.js\n');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Fix failed:', error);
      process.exit(1);
    });
}

module.exports = {fixProductsSchema};
