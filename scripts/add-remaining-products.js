/**
 * Add Remaining Products and Fix Missing Growers
 * 
 * Run: node scripts/add-remaining-products.js
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

// Additional products to complete the catalog
const additionalProducts = [
  // Fresh Mushrooms
  {
    name: "Fresh Cremini Mushrooms",
    slug: "fresh-cremini-mushrooms",
    categorySlug: "fresh-mushrooms",
    description: "Baby bella or cremini mushrooms offer a deeper, more robust flavor than white button mushrooms. Ideal for sauteing, stuffing, or adding to pasta and risotto dishes.",
    sku: "MUSH-CREM-300",
    price: 320,
    compareAtPrice: 400,
    quantity: 100,
    weight: 300,
    unit: "g",
    isFeatured: false,
    searchKeywords: ["cremini", "baby bella", "brown mushroom", "italian cooking", "stuffed mushroom"],
    nutritionalHighlights: ["selenium", "vitamin-d", "b-vitamins", "copper", "potassium"]
  },
  // Dried Mushrooms
  {
    name: "Dried Porcini Mushrooms",
    slug: "dried-porcini-mushrooms",
    categorySlug: "dried-mushrooms",
    description: "Premium dried porcini mushrooms with an intense, nutty flavor. A staple in Italian cuisine, perfect for risottos, pasta sauces, and soups. Rehydrating creates a flavorful broth.",
    sku: "MUSH-PORC-100",
    price: 850,
    compareAtPrice: 1050,
    quantity: 60,
    weight: 100,
    unit: "g",
    isFeatured: true,
    searchKeywords: ["porcini", "boletus", "cep mushroom", "italian mushroom", "risotto mushroom"],
    nutritionalHighlights: ["protein-rich", "fiber-rich", "iron", "b-vitamins", "antioxidants"]
  },
  // Growing Kits
  {
    name: "Reishi Mushroom Growing Kit",
    slug: "reishi-mushroom-growing-kit",
    categorySlug: "growing-kits",
    description: "Grow the legendary reishi mushroom at home. Known as the mushroom of immortality in traditional medicine. This kit produces beautiful antler-shaped reishi perfect for teas and tinctures.",
    sku: "KIT-REIS-001",
    price: 2200,
    compareAtPrice: 2700,
    quantity: 35,
    weight: 2000,
    unit: "g",
    isFeatured: true,
    searchKeywords: ["reishi", "lingzhi", "ganoderma", "medicinal mushroom", "adaptogen"],
    nutritionalHighlights: ["immune-support", "adaptogenic", "antioxidants", "beta-glucans", "stress-relief"]
  },
  // Medicinal Mushrooms
  {
    name: "Chaga Mushroom Powder",
    slug: "chaga-mushroom-powder",
    categorySlug: "medicinal-mushrooms",
    description: "Wild-harvested chaga mushroom powder from birch trees. One of the highest antioxidant foods known. Perfect for adding to coffee, smoothies, or tea. 100g resealable pouch.",
    sku: "MED-CHAG-100",
    price: 1100,
    compareAtPrice: 1400,
    quantity: 55,
    weight: 100,
    unit: "g",
    isFeatured: false,
    searchKeywords: ["chaga", "inonotus obliquus", "antioxidant", "birch mushroom", "superfood"],
    nutritionalHighlights: ["highest-antioxidants", "immune-support", "anti-inflammatory", "digestive-health", "skin-health"]
  },
  // Specialty Mushrooms
  {
    name: "Frozen Matsutake Mushrooms",
    slug: "frozen-matsutake-mushrooms",
    categorySlug: "specialty-mushrooms",
    description: "Premium grade frozen matsutake mushrooms, flash-frozen to preserve their distinctive spicy-aromatic scent. Highly prized in Japanese cuisine for sukiyaki and rice dishes. 200g pack.",
    sku: "SPEC-MATS-200",
    price: 3200,
    compareAtPrice: 4000,
    quantity: 20,
    weight: 200,
    unit: "g",
    isFeatured: false,
    searchKeywords: ["matsutake", "pine mushroom", "japanese mushroom", "tricholoma", "autumn mushroom"],
    nutritionalHighlights: ["protein-rich", "vitamin-d", "potassium", "fiber-rich", "immune-support"]
  },
  // More products for better variety
  {
    name: "Lions Mane Mushroom Powder",
    slug: "lions-mane-mushroom-powder",
    categorySlug: "medicinal-mushrooms",
    description: "Organic lions mane mushroom powder for cognitive support and nerve health. Add to coffee, smoothies, or recipes. 100g pouch provides a 30-day supply.",
    sku: "MED-LION-100",
    price: 1250,
    compareAtPrice: 1550,
    quantity: 65,
    weight: 100,
    unit: "g",
    isFeatured: true,
    searchKeywords: ["lions mane", "hericium erinaceus", "brain health", "nootropic", "nerve regeneration"],
    nutritionalHighlights: ["brain-health", "nerve-support", "antioxidants", "immune-support", "cognitive-function"]
  },
  {
    name: "Mushroom Coffee Blend",
    slug: "mushroom-coffee-blend",
    categorySlug: "medicinal-mushrooms",
    description: "Premium arabica coffee infused with lions mane and chaga mushroom extracts. Provides focused energy without jitters. 250g bag makes approximately 25 cups.",
    sku: "MED-COFF-250",
    price: 890,
    compareAtPrice: 1100,
    quantity: 75,
    weight: 250,
    unit: "g",
    isFeatured: true,
    searchKeywords: ["mushroom coffee", "functional coffee", "lions mane coffee", "chaga coffee", "adaptogenic"],
    nutritionalHighlights: ["focus", "energy", "antioxidants", "immune-support", "stress-relief"]
  },
  {
    name: "White Beech Mushrooms",
    slug: "white-beech-mushrooms",
    categorySlug: "fresh-mushrooms",
    description: "Delicate white beech mushrooms, also known as bunapi or white clamshell mushrooms. Mild, slightly sweet flavor with a firm, crunchy texture. Perfect for stir-fries and hot pots.",
    sku: "MUSH-BEEC-150",
    price: 340,
    compareAtPrice: 420,
    quantity: 90,
    weight: 150,
    unit: "g",
    isFeatured: false,
    searchKeywords: ["beech mushroom", "bunapi", "white clamshell", "hypsizygus tessellatus", "asian mushroom"],
    nutritionalHighlights: ["low-calorie", "fiber-rich", "vitamin-d", "potassium", "antioxidants"]
  },
  {
    name: "Mushroom Jerky Snack",
    slug: "mushroom-jerky-snack",
    categorySlug: "specialty-mushrooms",
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

// Grower assignments - distribute evenly across growers
const growerAssignments = {
  "fresh-cremini-mushrooms": "The Mushroom Patch Bukidnon",
  "dried-porcini-mushrooms": "The Mushroom Patch Bukidnon",
  "reishi-mushroom-growing-kit": "The Mushroom Patch Bukidnon",
  "chaga-mushroom-powder": "The Mushroom Patch Bukidnon",
  "frozen-matsutake-mushrooms": "The Mushroom Patch Bukidnon",
  "lions-mane-mushroom-powder": "Shroomarket",
  "mushroom-coffee-blend": "Shroomarket",
  "white-beech-mushrooms": "Kabutehan ni Aling Nena",
  "mushroom-jerky-snack": "Fungi Fresh Farms",
  "golden-oyster-mushroom-kit": "Fungi Fresh Farms"
};

// Products that need grower assignments (currently have None)
const productsNeedingGrowers = [
  { slug: "fresh-lions-mane-mushrooms", grower: "Fungi Fresh Farms" },
  { slug: "fresh-portobello-mushrooms", grower: "Kabutehan ni Aling Nena" },
  { slug: "lions-mane-mushroom-growing-kit", grower: "The Mushroom Patch Bukidnon" },
  { slug: "mushroom-extract-tincture", grower: "Shroomarket" }
];

async function addProducts() {
  console.log('='.repeat(60));
  console.log('ADDING REMAINING PRODUCTS AND FIXING GROWER LINKS');
  console.log('='.repeat(60));

  try {
    // Fetch categories and growers
    console.log('\nFetching categories and growers...');
    const categories = await client.fetch('*[_type == "category"]{ _id, name, "slug": slug.current }');
    const growers = await client.fetch('*[_type == "grower"]{ _id, name, "slug": slug.current }');
    
    const categoryMap = {};
    categories.forEach(c => categoryMap[c.slug] = c._id);
    
    const growerMapByName = {};
    growers.forEach(g => growerMapByName[g.name] = g._id);

    console.log('Categories: ' + categories.length);
    console.log('Growers: ' + Object.keys(growerMapByName).join(', '));

    // Fetch existing products
    const existingProducts = await client.fetch('*[_type == "product"]{ _id, name, "slug": slug.current }');
    const existingSlugs = existingProducts.map(p => p.slug);
    const productMap = {};
    existingProducts.forEach(p => productMap[p.slug] = p._id);

    console.log('Existing products: ' + existingSlugs.length);

    // PART 1: Fix products with missing growers
    console.log('\n' + '-'.repeat(40));
    console.log('FIXING PRODUCTS WITHOUT GROWERS');
    console.log('-'.repeat(40));

    for (const fix of productsNeedingGrowers) {
      const productId = productMap[fix.slug];
      const growerId = growerMapByName[fix.grower];

      if (!productId) {
        console.log('  Skipped: ' + fix.slug + ' (product not found)');
        continue;
      }
      if (!growerId) {
        console.log('  Skipped: ' + fix.slug + ' (grower not found: ' + fix.grower + ')');
        continue;
      }

      try {
        await client.patch(productId)
          .set({
            grower: {
              _type: 'reference',
              _ref: growerId
            }
          })
          .commit();
        console.log('  Fixed: ' + fix.slug + ' -> ' + fix.grower);
      } catch (err) {
        console.log('  Error fixing ' + fix.slug + ': ' + err.message);
      }
    }

    // PART 2: Add new products
    console.log('\n' + '-'.repeat(40));
    console.log('ADDING NEW PRODUCTS');
    console.log('-'.repeat(40));

    let addedCount = 0;
    let skippedCount = 0;

    for (const product of additionalProducts) {
      // Check if exists
      if (existingSlugs.includes(product.slug)) {
        console.log('  Skipped: ' + product.name + ' (already exists)');
        skippedCount++;
        continue;
      }

      // Get category ID
      const categoryId = categoryMap[product.categorySlug];
      if (!categoryId) {
        console.log('  Skipped: ' + product.name + ' (category not found)');
        skippedCount++;
        continue;
      }

      // Get grower ID
      const growerName = growerAssignments[product.slug];
      const growerId = growerMapByName[growerName];
      if (!growerId) {
        console.log('  Skipped: ' + product.name + ' (grower not found: ' + growerName + ')');
        skippedCount++;
        continue;
      }

      // Create product document
      const productDoc = {
        _type: 'product',
        name: product.name,
        slug: {
          _type: 'slug',
          current: product.slug
        },
        category: {
          _type: 'reference',
          _ref: categoryId
        },
        grower: {
          _type: 'reference',
          _ref: growerId
        },
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
          packageDimensions: {
            length: 20,
            width: 15,
            height: 10
          }
        },
        freshnessInfo: {
          harvestWindow: product.categorySlug === 'fresh-mushrooms' ? '24-48h' : 'N/A',
          shelfLife: product.categorySlug === 'fresh-mushrooms' ? '5-7 days refrigerated' : '12 months sealed',
          storageInstructions: product.categorySlug === 'fresh-mushrooms' 
            ? 'Store in paper bag in refrigerator. Do not wash until ready to use.'
            : 'Store in cool, dry place away from direct sunlight.',
          qualityIndicators: 'Check packaging date and ensure seal is intact'
        },
        preparationInfo: {
          difficultyLevel: 'beginner',
          cookingTime: '10-15 minutes',
          preparationTips: [
            'Follow package instructions',
            'Start with small portions',
            'Store properly after opening'
          ],
          recipeIdeas: [
            'Add to soups and stews',
            'Saute with garlic and herbs',
            'Use in pasta dishes'
          ]
        }
      };

      try {
        await client.create(productDoc);
        console.log('  Created: ' + product.name);
        addedCount++;
      } catch (err) {
        console.log('  Error creating ' + product.name + ': ' + err.message);
      }
    }

    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('COMPLETE');
    console.log('='.repeat(60));
    console.log('Products added: ' + addedCount);
    console.log('Products skipped: ' + skippedCount);

    // Verify final counts
    const finalProducts = await client.fetch('count(*[_type == "product"])');
    console.log('\nTotal products in Sanity: ' + finalProducts);

    // Show distribution
    console.log('\nProducts by Category:');
    for (const [slug, id] of Object.entries(categoryMap)) {
      const count = await client.fetch('count(*[_type == "product" && category._ref == $id])', { id });
      console.log('  ' + slug + ': ' + count);
    }

    console.log('\nProducts by Grower:');
    for (const [name, id] of Object.entries(growerMapByName)) {
      const count = await client.fetch('count(*[_type == "product" && grower._ref == $id])', { id });
      console.log('  ' + name + ': ' + count);
    }

    // Check for products still without growers
    const noGrower = await client.fetch('*[_type == "product" && !defined(grower)]{ name }');
    if (noGrower.length > 0) {
      console.log('\nProducts still without growers:');
      noGrower.forEach(p => console.log('  - ' + p.name));
    } else {
      console.log('\nAll products have growers assigned.');
    }

  } catch (error) {
    console.error('\nError:', error.message);
    throw error;
  }
}

addProducts().catch(console.error);
