/**
 * Check Hero Carousel Data in Sanity
 * Diagnoses why images are empty
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'xyq5fhxs',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-11-26',
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN,
});

async function checkHeroData() {
  console.log('\n🔍 Checking Hero Carousel Data in Sanity...\n');

  try {
    // Check if heroCarousel document exists
    const heroCarousel = await client.fetch('*[_type == "heroCarousel"][0]');
    
    if (!heroCarousel) {
      console.log('❌ No heroCarousel document found!');
      console.log('\n📝 To fix:');
      console.log('1. Open Sanity Studio: cd studio && npm run dev');
      console.log('2. Go to http://localhost:3333');
      console.log('3. Look for "Hero Carousel" in sidebar');
      console.log('4. Create the singleton document');
      console.log('5. Add at least 1 slide with title, subtitle, button text');
      return;
    }

    console.log('✅ heroCarousel document found!');
    console.log('\n📊 Document structure:');
    console.log(JSON.stringify(heroCarousel, null, 2));

    // Check slides array
    if (!heroCarousel.slides || heroCarousel.slides.length === 0) {
      console.log('\n⚠️  No slides in heroCarousel!');
      console.log('\n📝 To fix:');
      console.log('1. Open Sanity Studio: http://localhost:3333');
      console.log('2. Click "Hero Carousel" in sidebar');
      console.log('3. Click "+ Add Slide"');
      console.log('4. Fill in: title, subtitle, buttonText, buttonLink');
      console.log('5. Toggle "Is Active" ON');
      console.log('6. Click "Publish"');
      return;
    }

    console.log(`\n✅ Found ${heroCarousel.slides.length} slide(s)`);

    // Check each slide for issues
    heroCarousel.slides.forEach((slide, index) => {
      console.log(`\n📌 Slide ${index + 1}:`);
      console.log(`   Title: ${slide.title || '❌ MISSING'}`);
      console.log(`   Subtitle: ${slide.subtitle || '⚠️  Empty'}`);
      console.log(`   Button Text: ${slide.buttonText || '❌ MISSING'}`);
      console.log(`   Button Link: ${slide.buttonLink || '❌ MISSING'}`);
      console.log(`   Is Active: ${slide.isActive !== false ? '✅ Yes' : '❌ No'}`);
      console.log(`   Image: ${slide.image ? JSON.stringify(slide.image) : '⚠️  No image object'}`);
      
      // Check image reference
      if (slide.image && slide.image._ref) {
        console.log(`   Image Ref: ${slide.image._ref}`);
      } else if (slide.image && slide.image.asset) {
        console.log(`   Image Asset: ${JSON.stringify(slide.image.asset)}`);
      } else {
        console.log('   ⚠️  Image not properly referenced');
      }
    });

    // Now fetch with proper image URL resolution
    console.log('\n🔍 Fetching with image URL resolution...\n');
    
    const query = `*[_type == "heroCarousel"][0] {
      slides[] {
        title,
        subtitle,
        buttonText,
        buttonLink,
        buttonStyle,
        "image": image.asset->url,
        order,
        isActive
      }
    }`;

    const resolved = await client.fetch(query);
    
    console.log('📊 Resolved data:');
    console.log(JSON.stringify(resolved, null, 2));

    if (resolved && resolved.slides) {
      resolved.slides.forEach((slide, index) => {
        console.log(`\n📌 Slide ${index + 1} (resolved):`);
        console.log(`   Image URL: ${slide.image || '❌ NULL/EMPTY'}`);
        
        if (!slide.image) {
          console.log('   🔴 ERROR: Image URL is empty!');
          console.log('   Possible causes:');
          console.log('   - Image not uploaded in Sanity Studio');
          console.log('   - Image reference broken');
          console.log('   - Wrong GROQ query syntax');
        }
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

checkHeroData();
