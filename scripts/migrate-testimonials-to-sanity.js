/**
 * Migrate Testimonials to Sanity CMS
 * Phase 7: Customer Testimonials
 * 
 * This script populates the Sanity CMS with sample customer testimonials
 * for the homepage testimonials section.
 * 
 * Usage: node scripts/migrate-testimonials-to-sanity.js
 */

const { createClient } = require('@sanity/client');
require('dotenv').config({ path: '.env.local' });

// Initialize Sanity client
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'xyq5fhxs',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_AUTH_TOKEN,
  apiVersion: '2024-11-26',
  useCdn: false,
});

// Sample testimonials data
const testimonials = [
  {
    _type: 'testimonial',
    customerName: 'Maria Santos',
    customerTitle: 'Home Chef',
    location: 'Quezon City',
    rating: 5,
    headline: 'Best mushrooms I\'ve ever tasted!',
    quote: 'I\'ve been ordering from MASH for 6 months now and the quality is consistently amazing. The shiitake mushrooms are always fresh and the same-day delivery means they arrive perfect for my evening cooking. My family loves the variety!',
    isVerified: true,
    displayPosition: 1,
    isFeatured: true,
    showOnHomepage: true,
    isActive: true,
  },
  {
    _type: 'testimonial',
    customerName: 'Chef Ramon Dela Cruz',
    customerTitle: 'Executive Chef',
    customerCompany: 'Bistro Manila',
    location: 'Makati City',
    rating: 5,
    headline: 'Restaurant-quality mushrooms delivered fresh',
    quote: 'As a chef, I\'m very particular about my ingredients. MASH delivers the freshest oyster and king trumpet mushrooms I can find in Metro Manila. The growers really know what they\'re doing. Highly recommend for any serious cook!',
    isVerified: true,
    displayPosition: 2,
    isFeatured: true,
    showOnHomepage: true,
    isActive: true,
  },
  {
    _type: 'testimonial',
    customerName: 'Jessica Lim',
    customerTitle: 'Fitness Enthusiast',
    location: 'Taguig City',
    rating: 5,
    headline: 'Perfect for my healthy lifestyle',
    quote: 'I started growing my own mushrooms with MASH\'s growing kits and it\'s been so rewarding! The Lion\'s Mane kit was super easy to use and I love knowing exactly where my food comes from. Great for health-conscious families.',
    isVerified: true,
    displayPosition: 3,
    isFeatured: true,
    showOnHomepage: true,
    isActive: true,
  },
  {
    _type: 'testimonial',
    customerName: 'Antonio Reyes',
    customerTitle: 'Restaurant Owner',
    customerCompany: 'Cafe Organica',
    location: 'Pasig City',
    rating: 5,
    headline: 'Reliable supplier for our restaurant',
    quote: 'We order mushrooms for our restaurant twice a week from MASH. The consistency and freshness is unmatched. Our customers specifically ask about our mushroom dishes now! The team is professional and delivery is always on time.',
    isVerified: true,
    displayPosition: 4,
    isFeatured: false,
    showOnHomepage: true,
    isActive: true,
  },
  {
    _type: 'testimonial',
    customerName: 'Dr. Patricia Cruz',
    customerTitle: 'Nutritionist',
    location: 'Mandaluyong',
    rating: 5,
    headline: 'I recommend MASH to all my clients',
    quote: 'The nutritional benefits of fresh, locally-grown mushrooms are incredible. MASH makes it easy for my clients to incorporate high-quality mushrooms into their diet. The variety from dried to fresh options is fantastic.',
    isVerified: true,
    displayPosition: 5,
    isFeatured: false,
    showOnHomepage: true,
    isActive: true,
  },
  {
    _type: 'testimonial',
    customerName: 'Mark Gonzales',
    customerTitle: 'Home Gardener',
    location: 'San Juan',
    rating: 4,
    headline: 'Great growing kits for beginners',
    quote: 'I was nervous about growing mushrooms at home but the MASH growing kit made it so simple. Got my first harvest in just 2 weeks! Already ordered another kit. The customer support was also very helpful.',
    isVerified: true,
    displayPosition: 6,
    isFeatured: false,
    showOnHomepage: true,
    isActive: true,
  },
];

async function migrateTestimonials() {
  console.log('🏁 Starting testimonial migration to Sanity...\n');
  console.log(`📋 Migrating ${testimonials.length} testimonials\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const testimonial of testimonials) {
    try {
      // Check if testimonial already exists
      const existingQuery = `*[_type == "testimonial" && customerName == $name][0]`;
      const existing = await client.fetch(existingQuery, { name: testimonial.customerName });

      if (existing) {
        console.log(`⏭️  Skipping "${testimonial.customerName}" - already exists`);
        continue;
      }

      // Create testimonial document
      const result = await client.create(testimonial);
      console.log(`✅ Created testimonial: "${testimonial.customerName}" (${result._id})`);
      successCount++;
    } catch (error) {
      console.error(`❌ Error creating testimonial "${testimonial.customerName}":`, error.message);
      errorCount++;
    }
  }

  console.log('\n📊 Migration Summary:');
  console.log(`   ✅ Successfully created: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   ⏭️  Skipped (existing): ${testimonials.length - successCount - errorCount}`);
  console.log('\n🎉 Testimonial migration complete!');
}

// Run migration
migrateTestimonials().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
