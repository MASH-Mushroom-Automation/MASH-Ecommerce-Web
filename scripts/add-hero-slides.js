/**
 * Add Hero Carousel Slides Script
 * Adds additional slides to the hero carousel
 * 
 * Run: node scripts/add-hero-slides.js
 */

const { createClient } = require('@sanity/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'xyq5fhxs',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-11-26',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

// Hero slides data
const heroSlides = [
  {
    title: 'Farm Fresh Mushrooms',
    subtitle: 'Locally Grown, Premium Quality',
    description: 'Discover our selection of freshly harvested mushrooms, grown by local Filipino farmers using sustainable practices.',
    ctaText: 'Shop Fresh',
    ctaLink: '/shop?category=fresh-mushrooms',
    backgroundColor: '#1E392A',
    textColor: '#FFFFFF',
    order: 1,
    isActive: true,
  },
  {
    title: 'Grow Your Own',
    subtitle: 'Mushroom Growing Kits',
    description: 'Start your mushroom growing journey with our beginner-friendly kits. Fresh mushrooms in just 2 weeks!',
    ctaText: 'Get Started',
    ctaLink: '/shop?category=growing-kits',
    backgroundColor: '#6A994E',
    textColor: '#FFFFFF',
    order: 2,
    isActive: true,
  },
  {
    title: 'Meet Our Growers',
    subtitle: 'Family Farms Across the Philippines',
    description: 'We partner with local farming families who share our passion for quality mushrooms and sustainable agriculture.',
    ctaText: 'Meet the Growers',
    ctaLink: '/growers',
    backgroundColor: '#A7C957',
    textColor: '#1E392A',
    order: 3,
    isActive: true,
  },
  {
    title: 'Same-Day Delivery',
    subtitle: 'Fresh to Your Door in Metro Manila',
    description: 'Order before 2PM for same-day delivery via Lalamove. Your mushrooms arrive fresh, guaranteed!',
    ctaText: 'Order Now',
    ctaLink: '/shop',
    backgroundColor: '#2D5016',
    textColor: '#FFFFFF',
    order: 4,
    isActive: true,
  },
];

async function addHeroSlides() {
  console.log('🎨 Adding Hero Carousel Slides...\n');

  try {
    // Check if heroCarousel singleton exists
    let heroCarousel = await client.fetch(`*[_type == "heroCarousel"][0]`);
    
    if (!heroCarousel) {
      console.log('📝 Creating new heroCarousel document...');
      heroCarousel = await client.create({
        _type: 'heroCarousel',
        _id: 'heroCarousel',
        title: 'Homepage Hero',
        slides: [],
      });
      console.log('✅ Created heroCarousel document\n');
    } else {
      console.log(`📋 Found existing heroCarousel with ${heroCarousel.slides?.length || 0} slides\n`);
    }

    // Check existing slides
    const existingSlides = heroCarousel.slides || [];
    const existingTitles = existingSlides.map(s => s.title);
    
    // Filter out slides that already exist
    const newSlides = heroSlides.filter(slide => !existingTitles.includes(slide.title));
    
    if (newSlides.length === 0) {
      console.log('ℹ️  All slides already exist. No new slides to add.');
      return;
    }

    console.log(`📝 Adding ${newSlides.length} new slides...\n`);

    // Create slide objects with proper structure
    const slidesToAdd = newSlides.map((slide, index) => ({
      _type: 'object',
      _key: `slide-${Date.now()}-${index}`,
      title: slide.title,
      subtitle: slide.subtitle,
      description: slide.description,
      ctaText: slide.ctaText,
      ctaLink: slide.ctaLink,
      backgroundColor: slide.backgroundColor,
      textColor: slide.textColor,
      order: existingSlides.length + index + 1,
      isActive: slide.isActive,
    }));

    // Append new slides to existing ones
    const allSlides = [...existingSlides, ...slidesToAdd];

    // Update the heroCarousel document
    await client
      .patch(heroCarousel._id)
      .set({ slides: allSlides })
      .commit();

    console.log('✅ Hero carousel updated successfully!\n');
    
    // Show all slides
    console.log('📊 Current slides:');
    allSlides.forEach((slide, index) => {
      console.log(`   ${index + 1}. ${slide.title} (${slide.isActive ? '✅ Active' : '❌ Inactive'})`);
    });

    console.log(`\n🎉 Total slides: ${allSlides.length}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the script
addHeroSlides();
