/**
 * Update Site Settings with Correct Business Information
 * Run: node scripts/update-site-settings.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: 'production',
  apiVersion: '2024-11-26',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false
});

async function main() {
  console.log('🔧 Updating Site Settings...\n');
  
  try {
    // Check if siteSettings exists
    const siteSettings = await client.fetch('*[_type == "siteSettings"][0]');
    
    if (!siteSettings) {
      console.log('❌ No siteSettings document found! Creating one...');
      await createSiteSettings();
      return;
    }

    console.log('✅ siteSettings exists! ID:', siteSettings._id);
    console.log('\n📝 Updating with correct business information...\n');

    // Update site settings with correct information
    await client.patch(siteSettings._id)
      .set({
        // Company Info
        companyName: 'MASH Mushroom E-Commerce',
        tagline: 'Premium Quality Mushrooms, Farm Fresh',
        description: 'Your trusted source for premium quality fresh, dried, and specialty mushrooms. We deliver farm-fresh mushrooms same-day across Metro Manila, directly from local growers.',
        
        // Contact Info
        contactEmail: 'mash.mushroom.automation@gmail.com',
        contactPhone: '+63 927 253 3969',
        
        // Business Address (Caloocan location)
        address: {
          street: '936 Llano Rd.',
          city: 'Caloocan City',
          state: 'Metro Manila',
          zipCode: '1420',
          country: 'Philippines'
        },
        
        // Social Media Links
        socialMedia: {
          facebook: 'https://www.facebook.com/MASHMarketPH/',
          instagram: null,
          twitter: null,
          linkedin: null,
          youtube: 'https://www.youtube.com/@MASH-UCC',
          tiktok: null
        },
        
        // Announcement Bar
        announcementBar: {
          enabled: true,
          message: '🎉 Free Shipping on Orders Over ₱1,500! Use code FREESHIP',
          link: '/shop',
          linkText: 'Shop Now',
          backgroundColor: '#1E392A',
          textColor: '#FFFFFF'
        },
        
        // Footer Configuration
        footer: {
          aboutText: 'MASH connects you directly with local mushroom growers, bringing you the freshest, highest-quality mushrooms. From farm to table, we ensure quality every step of the way.',
          copyrightText: '© {year} MASH Market. All rights reserved.',
          showNewsletter: true,
          newsletterTitle: 'Stay Updated',
          newsletterDescription: 'Subscribe to get updates on new products, recipes, and special offers.'
        },
        
        // SEO Defaults
        seo: {
          metaTitle: 'MASH - Premium Fresh Mushrooms | Same-Day Delivery Metro Manila',
          metaDescription: 'Order premium fresh, dried, and specialty mushrooms online. Same-day delivery in Metro Manila. Farm-fresh quality guaranteed from local Filipino growers.',
          keywords: ['fresh mushrooms', 'mushroom delivery', 'Metro Manila', 'oyster mushrooms', 'shiitake', 'same-day delivery', 'organic mushrooms', 'Filipino growers']
        },
        
        // Business Hours
        businessHours: {
          monday: '8:00 AM - 6:00 PM',
          tuesday: '8:00 AM - 6:00 PM',
          wednesday: '8:00 AM - 6:00 PM',
          thursday: '8:00 AM - 6:00 PM',
          friday: '8:00 AM - 6:00 PM',
          saturday: '8:00 AM - 4:00 PM',
          sunday: 'Closed',
          timezone: 'Asia/Manila',
          note: 'Holiday hours may vary'
        },
        
        // Feature Toggles
        features: {
          enableBlog: true,
          enableShop: true,
          enableGrowerProfiles: true,
          enableReviews: true,
          enableWishlist: true,
          enableSameDayDelivery: true
        }
      })
      .commit();

    console.log('✅ Site settings updated successfully!\n');

    // Verify the update
    console.log('📋 Verifying update...\n');
    const updated = await client.fetch(`*[_type == "siteSettings"][0] {
      companyName,
      tagline,
      contactEmail,
      contactPhone,
      address,
      "facebook": socialMedia.facebook,
      "youtube": socialMedia.youtube,
      "announcementEnabled": announcementBar.enabled,
      "announcementMessage": announcementBar.message,
      features
    }`);

    console.log('📋 Updated Site Settings:');
    console.log('=' .repeat(50));
    console.log('Company:', updated.companyName);
    console.log('Tagline:', updated.tagline);
    console.log('Email:', updated.contactEmail);
    console.log('Phone:', updated.contactPhone);
    console.log('\nAddress:');
    console.log('  Street:', updated.address?.street);
    console.log('  City:', updated.address?.city);
    console.log('  State:', updated.address?.state);
    console.log('  ZIP:', updated.address?.zipCode);
    console.log('  Country:', updated.address?.country);
    console.log('\nSocial Media:');
    console.log('  Facebook:', updated.facebook || 'Not set');
    console.log('  YouTube:', updated.youtube || 'Not set');
    console.log('\nAnnouncement Bar:');
    console.log('  Enabled:', updated.announcementEnabled);
    console.log('  Message:', updated.announcementMessage);
    console.log('\nFeatures:');
    Object.entries(updated.features || {}).forEach(([key, value]) => {
      console.log(`  ${key}: ${value ? '✅' : '❌'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('Insufficient permissions')) {
      console.log('\n⚠️  Make sure SANITY_API_WRITE_TOKEN has write permissions!');
    }
  }
}

async function createSiteSettings() {
  const newSettings = await client.create({
    _type: 'siteSettings',
    _id: 'siteSettingsDoc',
    companyName: 'MASH Mushroom E-Commerce',
    tagline: 'Premium Quality Mushrooms, Farm Fresh',
    description: 'Your trusted source for premium quality fresh, dried, and specialty mushrooms.',
    contactEmail: 'mash.mushroom.automation@gmail.com',
    contactPhone: '+63 927 253 3969',
    address: {
      street: '936 Llano Rd.',
      city: 'Caloocan City',
      state: 'Metro Manila',
      zipCode: '1420',
      country: 'Philippines'
    },
    socialMedia: {
      facebook: 'https://www.facebook.com/MASHMarketPH/',
      youtube: 'https://www.youtube.com/@MASH-UCC'
    },
    announcementBar: {
      enabled: true,
      message: '🎉 Free Shipping on Orders Over ₱1,500! Use code FREESHIP',
      link: '/shop',
      linkText: 'Shop Now',
      backgroundColor: '#1E392A',
      textColor: '#FFFFFF'
    },
    features: {
      enableBlog: true,
      enableShop: true,
      enableGrowerProfiles: true,
      enableReviews: true,
      enableWishlist: true,
      enableSameDayDelivery: true
    }
  });

  console.log('✅ Created siteSettings!');
  console.log('   ID:', newSettings._id);
}

main();
