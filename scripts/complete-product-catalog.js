/**
 * Final Product Addition - Complete the Catalog to 35 Products
 * 
 * Run: node scripts/complete-product-catalog.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'gerattrr',
  dataset: 'production',
  apiVersion: '2024-11-26',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

// Final products to add
const finalProducts = [
  {
    name: "Mushroom Jerky Snack",
    slug: "mushroom-jerky-snack",
    categorySlug: "specialty-mushrooms",
    growerName: "Fungi Fresh Farms",
    description: "Savory mushroom jerky made from king oyster mushrooms. A delicious plant-based snack with a meaty texture. Seasoned with soy, garlic, and black pepper. 75g pack.",
    sku: "SPEC-JERK-75",
    price: 280,
    compareAtPrice: 350,
    quantity: 100,
    weight: 75,
    unit: "g",
    isFeatured: false,
    searchKeywords: ["mushroom jerky", "vegan jerky", "plant-based snack", "mushroom snack", "healthy snack"],
    nutritionalHighlights: ["protein-rich", "low-calorie", "fiber-rich", "vegan", "no-preservatives"]
  },
  {
    name: "Golden Oyster Mushroom Kit",
    slug: "golden-oyster-mushroom-kit",
    categorySlug: "growing-kits",
    growerName: "Fungi Fresh Farms",
    description: "Grow vibrant golden yellow oyster mushrooms at home. These tropical mushrooms thrive in warm environments and have a nutty, slightly citrusy flavor. Multiple harvests possible.",
    sku: "KIT-GOLD-001",
    price: 1700,
    compareAtPrice: 2100,
    quantity: 45,
    weight: 1500,
    unit: "g",
    isFeatured: false,
    searchKeywords: ["golden oyster", "yellow oyster", "pleurotus citrinopileatus", "tropical mushroom", "warm climate"],
    nutritionalHighlights: ["vitamin-d", "protein-rich", "antioxidants", "immune-support", "low-calorie"]
  }
];

async function completeProducts() {
  console.log('='.repeat(60));
  console.log('COMPLETING PRODUCT CATALOG');
  console.log('='.repeat(60));

  try {
    // Fetch categories and growers
    const categories = await client.fetch('*[_type == "category"]{ _id, "slug": slug.current }');
    const growers = await client.fetch('*[_type == "grower"]{ _id, name }');
    
    const categoryMap = {};
    categories.forEach(c => categoryMap[c.slug] = c._id);
    
    const growerMap = {};
    growers.forEach(g => growerMap[g.name] = g._id);

    // Check existing products
    const existingProducts = await client.fetch('*[_type == "product"]{ "slug": slug.current }');
    const existingSlugs = existingProducts.map(p => p.slug);

    console.log('\nCurrent products: ' + existingSlugs.length);
    console.log('Products to add: ' + finalProducts.length);

    let addedCount = 0;

    for (const product of finalProducts) {
      if (existingSlugs.includes(product.slug)) {
        console.log('  Skipped: ' + product.name + ' (already exists)');
        continue;
      }

      const categoryId = categoryMap[product.categorySlug];
      const growerId = growerMap[product.growerName];

      if (!categoryId || !growerId) {
        console.log('  Skipped: ' + product.name + ' (missing category or grower)');
        continue;
      }

      const productDoc = {
        _type: 'product',
        name: product.name,
        slug: { _type: 'slug', current: product.slug },
        category: { _type: 'reference', _ref: categoryId },
        grower: { _type: 'reference', _ref: growerId },
        description: product.description,
        sku: product.sku,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        quantity: product.quantity,
        inventory: {
          lowStockThreshold: 10,
          trackInventory: true,
          allowBackorders: false
        },
        isAvailable: true,
        isFeatured: product.isFeatured || false,
        weight: product.weight,
        unit: product.unit,
        searchKeywords: product.searchKeywords || [],
        nutritionalHighlights: product.nutritionalHighlights || [],
        deliveryOptions: {
          sameDayDeliveryEligible: false,
          deliveryZones: [],
          perishable: product.categorySlug === 'fresh-mushrooms'
        },
        deliveryWeight: {
          packageWeight: product.weight / 1000,
          packageDimensions: { length: 20, width: 15, height: 10 }
        },
        freshnessInfo: {
          harvestWindow: 'N/A',
          shelfLife: '12 months sealed',
          storageInstructions: 'Store in cool, dry place away from direct sunlight.',
          qualityIndicators: 'Check packaging date and ensure seal is intact'
        },
        preparationInfo: {
          difficultyLevel: 'beginner',
          cookingTime: '10-15 minutes',
          preparationTips: ['Follow package instructions', 'Start with small portions'],
          recipeIdeas: ['Add to dishes', 'Use as directed']
        }
      };

      await client.create(productDoc);
      console.log('  Created: ' + product.name);
      addedCount++;
    }

    // Final count
    const finalCount = await client.fetch('count(*[_type == "product"])');
    console.log('\n' + '='.repeat(60));
    console.log('FINAL RESULT');
    console.log('='.repeat(60));
    console.log('Products added: ' + addedCount);
    console.log('Total products in Sanity: ' + finalCount);

    // Show distribution
    console.log('\nProducts by Category:');
    for (const [slug, id] of Object.entries(categoryMap)) {
      const count = await client.fetch('count(*[_type == "product" && category._ref == $id])', { id });
      console.log('  ' + slug + ': ' + count);
    }

    console.log('\nProducts by Grower:');
    for (const [name, id] of Object.entries(growerMap)) {
      const count = await client.fetch('count(*[_type == "product" && grower._ref == $id])', { id });
      console.log('  ' + name + ': ' + count);
    }

    // Verify all products have growers
    const noGrower = await client.fetch('count(*[_type == "product" && !defined(grower)])');
    console.log('\nProducts without growers: ' + noGrower);

  } catch (error) {
    console.error('\nError:', error.message);
    throw error;
  }
}

completeProducts().catch(console.error);
