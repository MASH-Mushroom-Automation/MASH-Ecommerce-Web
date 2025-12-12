/**
 * Generate Final Product Report
 * 
 * Run: node scripts/product-report.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'gerattrr',
  dataset: 'production',
  apiVersion: '2024-11-26',
  useCdn: false,
});

async function generateReport() {
  console.log('='.repeat(70));
  console.log('MASH E-COMMERCE - PRODUCT CATALOG REPORT');
  console.log('Generated: ' + new Date().toISOString().split('T')[0]);
  console.log('='.repeat(70));

  // Get categories with product counts
  const categories = await client.fetch(`
    *[_type == "category"] | order(name asc) {
      _id,
      name,
      "slug": slug.current,
      "productCount": count(*[_type == "product" && references(^._id)])
    }
  `);

  // Get growers with product counts
  const growers = await client.fetch(`
    *[_type == "grower"] | order(name asc) {
      _id,
      name,
      location,
      "productCount": count(*[_type == "product" && references(^._id)])
    }
  `);

  // Get all products grouped by category
  const products = await client.fetch(`
    *[_type == "product"] | order(name asc) {
      _id,
      name,
      price,
      isFeatured,
      "slug": slug.current,
      "category": category->name,
      "categorySlug": category->slug.current,
      "grower": grower->name
    }
  `);

  // Summary stats
  const totalProducts = products.length;
  const featuredProducts = products.filter(p => p.isFeatured).length;
  const priceRange = {
    min: Math.min(...products.map(p => p.price)),
    max: Math.max(...products.map(p => p.price)),
    avg: Math.round(products.reduce((sum, p) => sum + p.price, 0) / products.length)
  };

  console.log('\nSUMMARY STATISTICS');
  console.log('-'.repeat(70));
  console.log('Total Products:     ' + totalProducts);
  console.log('Featured Products:  ' + featuredProducts);
  console.log('Categories:         ' + categories.length);
  console.log('Growers:            ' + growers.length);
  console.log('Price Range:        P' + priceRange.min + ' - P' + priceRange.max);
  console.log('Average Price:      P' + priceRange.avg);

  console.log('\n\nPRODUCTS BY CATEGORY');
  console.log('-'.repeat(70));
  
  for (const category of categories) {
    console.log('\n' + category.name.toUpperCase() + ' (' + category.productCount + ' products)');
    console.log('  Slug: ' + category.slug);
    
    const categoryProducts = products.filter(p => p.categorySlug === category.slug);
    categoryProducts.forEach((p, i) => {
      const featured = p.isFeatured ? ' [FEATURED]' : '';
      console.log('  ' + (i + 1) + '. ' + p.name + ' - P' + p.price + featured);
      console.log('     Grower: ' + p.grower);
    });
  }

  console.log('\n\nPRODUCTS BY GROWER');
  console.log('-'.repeat(70));
  
  for (const grower of growers) {
    console.log('\n' + grower.name.toUpperCase() + ' (' + grower.productCount + ' products)');
    console.log('  Location: ' + grower.location);
    
    const growerProducts = products.filter(p => p.grower === grower.name);
    growerProducts.forEach((p, i) => {
      console.log('  ' + (i + 1) + '. ' + p.name + ' [' + p.category + '] - P' + p.price);
    });
  }

  console.log('\n\nFEATURED PRODUCTS');
  console.log('-'.repeat(70));
  
  const featured = products.filter(p => p.isFeatured);
  if (featured.length === 0) {
    console.log('No featured products set.');
  } else {
    featured.forEach((p, i) => {
      console.log((i + 1) + '. ' + p.name + ' [' + p.category + '] - P' + p.price);
    });
  }

  console.log('\n\n' + '='.repeat(70));
  console.log('END OF REPORT');
  console.log('='.repeat(70));
}

generateReport().catch(console.error);
