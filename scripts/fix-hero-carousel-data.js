/**
 * Fix Hero Carousel Data Script
 * 
 * This script migrates legacy hero carousel data to the new schema.
 * It converts ctaText/ctaLink to buttonText/buttonLink and ensures
 * all required fields have proper values.
 * 
 * Run: node scripts/fix-hero-carousel-data.js
 */

const { createClient } = require('@sanity/client');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'gerattrr',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-11-26',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

async function fixHeroCarouselData() {
  console.log('🔧 Fixing Hero Carousel Data...\n');

  try {
    // Fetch existing hero carousel
    const heroCarousel = await client.fetch(`*[_type == "heroCarousel"][0]`);

    if (!heroCarousel) {
      console.log('❌ No hero carousel found. Creating default...');
      await createDefaultHeroCarousel();
      return;
    }

    console.log('📋 Found existing hero carousel:', heroCarousel._id);
    console.log('   Current title:', heroCarousel.title || '(none)');
    console.log('   Slides count:', heroCarousel.slides?.length || 0);

    // Check if slides need migration
    const slides = heroCarousel.slides || [];
    const needsMigration = slides.some(slide => 
      slide.ctaText && !slide.buttonText ||
      slide.ctaLink && !slide.buttonLink ||
      !slide.order ||
      slide.isActive === undefined
    );

    if (!needsMigration && heroCarousel.title) {
      console.log('\n✅ Hero carousel data is already up to date!');
      return;
    }

    // Migrate slides
    const migratedSlides = slides.map((slide, index) => {
      const migrated = {
        ...slide,
        _key: slide._key || `slide-${index + 1}`,
        title: slide.title || 'Welcome to MASH',
        subtitle: slide.subtitle || slide.description || '',
        description: slide.description || '',
        // Migrate CTA fields to button fields
        buttonText: slide.buttonText || slide.ctaText || 'Shop Now',
        buttonLink: slide.buttonLink || slide.ctaLink || '/shop',
        buttonStyle: slide.buttonStyle || 'primary',
        backgroundColor: slide.backgroundColor || '#6A994E',
        textColor: slide.textColor || '#FFFFFF',
        order: slide.order || (index + 1),
        isActive: slide.isActive !== false,
      };

      console.log(`\n   Slide ${index + 1}:`);
      console.log(`     Title: ${migrated.title}`);
      console.log(`     Button: ${migrated.buttonText} → ${migrated.buttonLink}`);
      console.log(`     Order: ${migrated.order}, Active: ${migrated.isActive}`);

      return migrated;
    });

    // Update the document
    console.log('\n📝 Updating hero carousel...');
    
    await client
      .patch(heroCarousel._id)
      .set({
        title: heroCarousel.title || 'Homepage Hero',
        slides: migratedSlides,
      })
      .commit();

    console.log('\n✅ Hero carousel data migrated successfully!');
    console.log('   - Title set to:', heroCarousel.title || 'Homepage Hero');
    console.log('   - Migrated', migratedSlides.length, 'slides');

  } catch (error) {
    console.error('\n❌ Error fixing hero carousel:', error);
    throw error;
  }
}

async function createDefaultHeroCarousel() {
  console.log('\n📝 Creating default hero carousel...');

  const defaultHeroCarousel = {
    _type: 'heroCarousel',
    _id: 'heroCarousel',
    title: 'Homepage Hero',
    slides: [
      {
        _key: 'slide-1',
        _type: 'slide',
        title: 'Fresh Farm Mushrooms Delivered Daily',
        subtitle: 'Premium quality mushrooms from local organic farms, delivered straight to your door.',
        description: 'Discover the finest selection of fresh, sustainably grown mushrooms from our network of local farmers.',
        buttonText: 'Shop Now',
        buttonLink: '/shop',
        buttonStyle: 'primary',
        backgroundColor: '#1E392A',
        textColor: '#FFFFFF',
        order: 1,
        isActive: true,
      },
      {
        _key: 'slide-2',
        _type: 'slide',
        title: 'Mushroom Growing Kits',
        subtitle: 'Start your mushroom growing journey with our beginner-friendly kits.',
        description: 'Fresh mushrooms in just 2 weeks! Perfect for home growers.',
        buttonText: 'Get Started',
        buttonLink: '/shop?category=growing-kits',
        buttonStyle: 'primary',
        backgroundColor: '#6A994E',
        textColor: '#FFFFFF',
        order: 2,
        isActive: true,
      },
      {
        _key: 'slide-3',
        _type: 'slide',
        title: 'Meet Our Local Growers',
        subtitle: 'Connect directly with passionate mushroom farmers in your area.',
        description: 'Support local agriculture and get the freshest mushrooms possible.',
        buttonText: 'Explore Growers',
        buttonLink: '/growers',
        buttonStyle: 'secondary',
        backgroundColor: '#A7C957',
        textColor: '#1E392A',
        order: 3,
        isActive: true,
      },
    ],
  };

  try {
    await client.createOrReplace(defaultHeroCarousel);
    console.log('✅ Default hero carousel created successfully!');
    console.log('   - ID: heroCarousel');
    console.log('   - Slides: 3');
    console.log('\n📌 You can now edit the hero carousel in Sanity Studio:');
    console.log('   https://ppnamias.sanity.studio/');
  } catch (error) {
    console.error('❌ Error creating default hero carousel:', error);
    throw error;
  }
}

// Run the script
fixHeroCarouselData()
  .then(() => {
    console.log('\n🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error.message);
    process.exit(1);
  });
