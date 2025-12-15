/**
 * Add More Products to Sanity CMS
 * 
 * Adds 15 new products distributed across all categories
 * and connected to existing growers
 * 
 * Run: node scripts/add-more-products.js
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

// New products to add - 15 products across all categories
const newProducts = [
  // Fresh Mushrooms (3 new products)
  {
    name: "Fresh Maitake Mushrooms",
    slug: "fresh-maitake-mushrooms",
    categorySlug: "fresh-mushrooms",
    growerSlug: "fungi-fresh-farms",
    description: "Also known as Hen of the Woods, these premium maitake mushrooms offer a rich, earthy flavor with a firm texture. Excellent for grilling, roasting, or adding to soups and stews. Known for their immune-boosting properties.",
    sku: "MUSH-MAIT-250",
    price: 520,
    compareAtPrice: 650,
    quantity: 80,
    weight: 250,
    unit: "g",
    isFeatured: true,
    searchKeywords: ["maitake", "hen of the woods", "grifola frondosa", "dancing mushroom", "immune boost"],
    nutritionalHighlights: ["immune-support", "vitamin-d", "antioxidants", "beta-glucans", "low-calorie"]
  },
  {
    name: "Fresh Enoki Mushrooms",
    slug: "fresh-enoki-mushrooms",
    categorySlug: "fresh-mushrooms",
    growerSlug: "kabutehan-ni-aling-nena",
    description: "Delicate enoki mushrooms with long, thin stems and tiny caps. Perfect for hot pots, soups, and Asian cuisine. Their mild, slightly fruity flavor adds an elegant touch to any dish.",
    sku: "MUSH-ENOK-200",
    price: 280,
    compareAtPrice: 350,
    quantity: 120,
    weight: 200,
    unit: "g",
    isFeatured: false,
    searchKeywords: ["enoki", "enokitake", "golden needle", "winter mushroom", "hotpot mushroom"],
    nutritionalHighlights: ["low-calorie", "fiber-rich", "antioxidants", "vitamin-b", "immune-support"]
  },
  {
    name: "Fresh Cremini Mushrooms",
    slug: "fresh-cremini-mushrooms",
    categorySlug: "fresh-mushrooms",
    growerSlug: "the-mushroom-patch-bukidnon",
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

  // Dried Mushrooms (3 new products)
  {
    name: "Dried Porcini Mushrooms",
    slug: "dried-porcini-mushrooms",
    categorySlug: "dried-mushrooms",
    growerSlug: "the-mushroom-patch-bukidnon",
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
  {
    name: "Dried Wood Ear Mushrooms",
    slug: "dried-wood-ear-mushrooms",
    categorySlug: "dried-mushrooms",
    growerSlug: "shroomarket",
    description: "Also called cloud ear or black fungus, these dried wood ear mushrooms have a crunchy texture and neutral flavor. Essential for Chinese cuisine, hot and sour soup, and stir-fries.",
    sku: "MUSH-WDEAR-150",
    price: 380,
    compareAtPrice: 480,
    quantity: 90,
    weight: 150,
    unit: "g",
    isFeatured: false,
    searchKeywords: ["wood ear", "cloud ear", "black fungus", "auricularia", "chinese mushroom"],
    nutritionalHighlights: ["iron-rich", "fiber-rich", "blood-health", "low-calorie", "antioxidants"]
  },
  {
    name: "Dried Chanterelle Mushrooms",
    slug: "dried-chanterelle-mushrooms",
    categorySlug: "dried-mushrooms",
    growerSlug: "fungi-fresh-farms",
    description: "Golden dried chanterelle mushrooms with a fruity, peppery aroma. Prized by chefs worldwide for their unique flavor profile. Perfect for cream sauces, omelets, and gourmet dishes.",
    sku: "MUSH-CHAN-100",
    price: 950,
    compareAtPrice: 1200,
    quantity: 45,
    weight: 100,
    unit: "g",
    isFeatured: true,
    searchKeywords: ["chanterelle", "golden chanterelle", "cantharellus", "gourmet mushroom", "french cuisine"],
    nutritionalHighlights: ["vitamin-d", "vitamin-c", "potassium", "antioxidants", "anti-inflammatory"]
  },

  // Growing Kits (3 new products)
  {
    name: "Pink Oyster Mushroom Growing Kit",
    slug: "pink-oyster-mushroom-growing-kit",
    categorySlug: "growing-kits",
    growerSlug: "fungi-fresh-farms",
    description: "Grow stunning pink oyster mushrooms at home with this complete kit. These beautiful mushrooms have a mild, woodsy flavor and striking appearance. Harvests in 7-10 days.",
    sku: "KIT-PINK-001",
    price: 1650,
    compareAtPrice: 2000,
    quantity: 50,
    weight: 1500,
    unit: "g",
    isFeatured: true,
    searchKeywords: ["pink oyster", "growing kit", "home growing", "pleurotus djamor", "beginner kit"],
    nutritionalHighlights: ["vitamin-d", "protein-rich", "antioxidants", "low-calorie", "fiber-rich"]
  },
  {
    name: "Blue Oyster Mushroom Growing Kit",
    slug: "blue-oyster-mushroom-growing-kit",
    categorySlug: "growing-kits",
    growerSlug: "kabutehan-ni-aling-nena",
    description: "Cultivate beautiful blue oyster mushrooms with this easy-to-use kit. Features stunning blue-gray caps that fade as they mature. Perfect for cooler environments. Multiple harvests possible.",
    sku: "KIT-BLUE-001",
    price: 1550,
    compareAtPrice: 1900,
    quantity: 55,
    weight: 1500,
    unit: "g",
    isFeatured: false,
    searchKeywords: ["blue oyster", "growing kit", "pleurotus ostreatus", "cool weather", "home cultivation"],
    nutritionalHighlights: ["protein-rich", "b-vitamins", "antioxidants", "immune-support", "low-calorie"]
  },
  {
    name: "Reishi Mushroom Growing Kit",
    slug: "reishi-mushroom-growing-kit",
    categorySlug: "growing-kits",
    growerSlug: "the-mushroom-patch-bukidnon",
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

  // Medicinal Mushrooms (3 new products)
  {
    name: "Cordyceps Mushroom Capsules",
    slug: "cordyceps-mushroom-capsules",
    categorySlug: "medicinal-mushrooms",
    growerSlug: "shroomarket",
    description: "Premium cordyceps militaris capsules for energy and athletic performance. Traditionally used to enhance stamina and support respiratory health. 60 vegetarian capsules per bottle.",
    sku: "MED-CORD-60",
    price: 1450,
    compareAtPrice: 1800,
    quantity: 70,
    weight: 60,
    unit: "capsules",
    isFeatured: true,
    searchKeywords: ["cordyceps", "cordyceps militaris", "energy supplement", "athletic performance", "adaptogen"],
    nutritionalHighlights: ["energy-boost", "adaptogenic", "respiratory-health", "endurance", "immune-support"]
  },
  {
    name: "Chaga Mushroom Powder",
    slug: "chaga-mushroom-powder",
    categorySlug: "medicinal-mushrooms",
    growerSlug: "the-mushroom-patch-bukidnon",
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
  {
    name: "Turkey Tail Mushroom Extract",
    slug: "turkey-tail-mushroom-extract",
    categorySlug: "medicinal-mushrooms",
    growerSlug: "fungi-fresh-farms",
    description: "Concentrated turkey tail mushroom extract for immune system support. Rich in polysaccharopeptides (PSP and PSK). Liquid extract for easy absorption. 60ml dropper bottle.",
    sku: "MED-TURK-60",
    price: 980,
    compareAtPrice: 1200,
    quantity: 80,
    weight: 60,
    unit: "ml",
    isFeatured: false,
    searchKeywords: ["turkey tail", "trametes versicolor", "immune support", "PSK", "polysaccharides"],
    nutritionalHighlights: ["immune-modulating", "gut-health", "antioxidants", "prebiotic", "anti-viral"]
  },

  // Specialty Mushrooms (3 new products)
  {
    name: "Black Truffle Slices",
    slug: "black-truffle-slices",
    categorySlug: "specialty-mushrooms",
    growerSlug: "shroomarket",
    description: "Premium preserved black truffle slices in olive oil. Intense, earthy aroma and luxurious flavor. Perfect for pasta, risotto, eggs, and gourmet dishes. 50g jar.",
    sku: "SPEC-TRUF-50",
    price: 2500,
    compareAtPrice: 3200,
    quantity: 25,
    weight: 50,
    unit: "g",
    isFeatured: true,
    searchKeywords: ["black truffle", "tuber melanosporum", "gourmet mushroom", "luxury ingredient", "italian cuisine"],
    nutritionalHighlights: ["protein-rich", "antioxidants", "minerals", "amino-acids", "umami"]
  },
  {
    name: "Morel Mushrooms Dried",
    slug: "dried-morel-mushrooms",
    categorySlug: "specialty-mushrooms",
    growerSlug: "kabutehan-ni-aling-nena",
    description: "Wild-foraged dried morel mushrooms with their distinctive honeycomb appearance. Prized for their deep, smoky flavor. Essential for French cuisine, cream sauces, and special occasions.",
    sku: "SPEC-MORE-50",
    price: 1800,
    compareAtPrice: 2300,
    quantity: 30,
    weight: 50,
    unit: "g",
    isFeatured: true,
    searchKeywords: ["morel", "morchella", "spring mushroom", "gourmet", "french cuisine"],
    nutritionalHighlights: ["iron-rich", "vitamin-d", "protein-rich", "copper", "antioxidants"]
  },
  {
    name: "Matsutake Mushrooms Frozen",
    slug: "frozen-matsutake-mushrooms",
    categorySlug: "specialty-mushrooms",
    growerSlug: "the-mushroom-patch-bukidnon",
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
  }
];

async function addMoreProducts() {
  console.log('='.repeat(60));
  console.log('ADDING NEW PRODUCTS TO SANITY CMS');
  console.log('='.repeat(60));

  try {
    // Fetch existing categories
    console.log('\nFetching categories...');
    const categories = await client.fetch('*[_type == "category"]{ _id, name, "slug": slug.current }');
    const categoryMap = {};
    categories.forEach(c => {
      categoryMap[c.slug] = c._id;
    });
    console.log('Found ' + categories.length + ' categories');

    // Fetch existing growers
    console.log('Fetching growers...');
    const growers = await client.fetch('*[_type == "grower"]{ _id, name, "slug": slug.current }');
    const growerMap = {};
    growers.forEach(g => {
      growerMap[g.slug] = g._id;
    });
    console.log('Found ' + growers.length + ' growers');

    // Fetch existing product slugs to prevent duplicates
    console.log('Checking existing products...');
    const existingProducts = await client.fetch('*[_type == "product"]{ "slug": slug.current }');
    const existingSlugs = existingProducts.map(p => p.slug);
    console.log('Current products: ' + existingSlugs.length);

    // Filter and prepare products
    const productsToAdd = [];
    const skippedProducts = [];

    for (const product of newProducts) {
      // Check if product already exists
      if (existingSlugs.includes(product.slug)) {
        skippedProducts.push(product.name + ' (already exists)');
        continue;
      }

      // Validate category
      const categoryId = categoryMap[product.categorySlug];
      if (!categoryId) {
        skippedProducts.push(product.name + ' (category not found: ' + product.categorySlug + ')');
        continue;
      }

      // Validate grower
      const growerId = growerMap[product.growerSlug];
      if (!growerId) {
        skippedProducts.push(product.name + ' (grower not found: ' + product.growerSlug + ')');
        continue;
      }

      // Build product document
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

      productsToAdd.push(productDoc);
    }

    console.log('\n' + '-'.repeat(40));
    console.log('Products to add: ' + productsToAdd.length);
    if (skippedProducts.length > 0) {
      console.log('Skipped: ' + skippedProducts.length);
      skippedProducts.forEach(s => console.log('  - ' + s));
    }

    if (productsToAdd.length === 0) {
      console.log('\nNo new products to add.');
      return;
    }

    // Create products
    console.log('\nCreating products...');
    let successCount = 0;
    let failCount = 0;

    for (const product of productsToAdd) {
      try {
        const result = await client.create(product);
        console.log('  Created: ' + product.name);
        successCount++;
      } catch (err) {
        console.log('  Failed: ' + product.name + ' - ' + err.message);
        failCount++;
      }
    }

    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('IMPORT COMPLETE');
    console.log('='.repeat(60));
    console.log('Successfully added: ' + successCount + ' products');
    if (failCount > 0) {
      console.log('Failed: ' + failCount + ' products');
    }

    // Verify final count
    const finalCount = await client.fetch('count(*[_type == "product"])');
    console.log('\nTotal products in Sanity: ' + finalCount);

    // Show distribution by category
    console.log('\nProducts by Category:');
    for (const [slug, id] of Object.entries(categoryMap)) {
      const count = await client.fetch('count(*[_type == "product" && category._ref == $id])', { id });
      console.log('  ' + slug + ': ' + count);
    }

    // Show distribution by grower
    console.log('\nProducts by Grower:');
    for (const [slug, id] of Object.entries(growerMap)) {
      const count = await client.fetch('count(*[_type == "product" && grower._ref == $id])', { id });
      console.log('  ' + slug + ': ' + count);
    }

  } catch (error) {
    console.error('\nError:', error.message);
    throw error;
  }
}

// Run the script
addMoreProducts().catch(console.error);
