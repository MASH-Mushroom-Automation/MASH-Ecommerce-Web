/**
 * Phase 5: Site Settings & Navigation Migration Script
 * 
 * This script populates the Sanity CMS with:
 * 1. siteSettings singleton with MASH company info
 * 2. Navigation menus (header, footer)
 * 
 * Run: node scripts/migrate-site-settings-to-sanity.js
 * 
 * Prerequisites:
 * - Sanity CLI installed
 * - .env.local with SANITY_API_WRITE_TOKEN
 * - Studio schema deployed (cd studio && npm run deploy)
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

// ═══════════════════════════════════════════════════════════════════════════
// SITE SETTINGS DATA
// ═══════════════════════════════════════════════════════════════════════════

const siteSettingsData = {
  _id: 'siteSettingsDoc', // Singleton ID (matches structure.ts documentId)
  _type: 'siteSettings',
  
  // Company Info
  companyName: 'MASH Mushroom E-Commerce',
  tagline: 'Premium Quality Mushrooms, Farm Fresh',
  description: 'Your trusted source for premium quality fresh, dried, and specialty mushrooms. We deliver farm-fresh mushrooms same-day across Metro Manila, directly from local growers.',
  
  // Contact Info
  contactEmail: 'hello@mashmushrooms.ph',
  contactPhone: '+63 966 169 2000',
  address: {
    street: '1019 Quirino Highway, Brgy Sta. Monica',
    city: 'Novaliches, Quezon City',
    state: 'Metro Manila',
    zipCode: '1116',
    country: 'Philippines',
  },
  
  // Social Media
  socialMedia: {
    facebook: 'https://facebook.com/mashmushrooms',
    instagram: 'https://instagram.com/mashmushrooms',
    youtube: 'https://youtube.com/@mashmushrooms',
    tiktok: 'https://tiktok.com/@mashmushrooms',
  },
  
  // Announcement Bar
  announcementBar: {
    enabled: true,
    message: '🎉 Free Shipping on Orders Over ₱1,500! Use code FREESHIP',
    link: '/shop',
    linkText: 'Shop Now',
    backgroundColor: '#1E392A',
    textColor: '#FFFFFF',
  },
  
  // Footer
  footer: {
    aboutText: 'MASH connects you directly with local mushroom growers, bringing you the freshest, highest-quality mushrooms. From farm to table, we ensure quality every step of the way.',
    copyrightText: '© {year} MASH Market. All rights reserved.',
    showNewsletter: true,
    newsletterTitle: 'Stay Updated',
    newsletterDescription: 'Subscribe to get updates on new products, recipes, and special offers.',
    links: [
      { title: 'Privacy Policy', url: '/privacy', external: false },
      { title: 'Terms of Service', url: '/terms', external: false },
      { title: 'Return Policy', url: '/returns-policy', external: false },
      { title: 'Shipping Info', url: '/shipping-info', external: false },
    ],
  },
  
  // SEO
  seo: {
    metaTitle: 'MASH - Fresh Mushrooms Delivered Same-Day',
    metaDescription: 'Order premium fresh, dried, and specialty mushrooms online. Same-day delivery in Metro Manila. Farm-fresh quality guaranteed from local Filipino growers.',
    keywords: [
      'fresh mushrooms',
      'mushroom delivery',
      'Metro Manila',
      'oyster mushrooms',
      'shiitake',
      'same-day delivery',
      'organic mushrooms',
      'Filipino growers',
    ],
  },
  
  // Business Hours
  businessHours: {
    monday: '8:00 AM - 6:00 PM',
    tuesday: '8:00 AM - 6:00 PM',
    wednesday: '8:00 AM - 6:00 PM',
    thursday: '8:00 AM - 6:00 PM',
    friday: '8:00 AM - 6:00 PM',
    saturday: '9:00 AM - 4:00 PM',
    sunday: 'Closed',
    timezone: 'Asia/Manila (GMT+8)',
    note: 'Holiday hours may vary. Same-day delivery available Mon-Sat.',
  },
  
  // Features
  features: {
    enableBlog: true,
    enableShop: true,
    enableGrowerProfiles: true,
    enableReviews: true,
    enableWishlist: true,
    enableSameDayDelivery: true,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// NAVIGATION DATA
// ═══════════════════════════════════════════════════════════════════════════

const navigationMenus = [
  // Header Main Navigation
  {
    _type: 'navigation',
    title: 'Main Navigation',
    slug: { _type: 'slug', current: 'header-main' },
    menuType: 'header-main',
    isActive: true,
    displayOrder: 1,
    items: [
      {
        _key: 'nav-shop',
        label: 'Shop',
        linkType: 'internal',
        internalPath: '/shop',
        icon: 'Store',
      },
      {
        _key: 'nav-growers',
        label: 'Our Growers',
        linkType: 'internal',
        internalPath: '/grower',
        icon: 'Sprout',
      },
      {
        _key: 'nav-about',
        label: 'About',
        linkType: 'internal',
        internalPath: '/about',
        icon: '',
      },
      {
        _key: 'nav-contact',
        label: 'Contact',
        linkType: 'internal',
        internalPath: '/contact',
        icon: 'Mail',
      },
    ],
  },
  
  // Header Secondary (Top Bar)
  {
    _type: 'navigation',
    title: 'Header Secondary Links',
    slug: { _type: 'slug', current: 'header-secondary' },
    menuType: 'header-secondary',
    isActive: true,
    displayOrder: 1,
    items: [
      {
        _key: 'sec-blog',
        label: 'Blog',
        linkType: 'internal',
        internalPath: '/blog',
        icon: 'Newspaper',
      },
      {
        _key: 'sec-faq',
        label: 'FAQ',
        linkType: 'internal',
        internalPath: '/faq',
        icon: 'HelpCircle',
      },
      {
        _key: 'sec-contact',
        label: 'Contact Us',
        linkType: 'internal',
        internalPath: '/contact',
        icon: 'Mail',
      },
    ],
  },
  
  // Footer Shop Links
  {
    _type: 'navigation',
    title: 'Footer - Shop',
    slug: { _type: 'slug', current: 'footer-shop' },
    menuType: 'footer-shop',
    isActive: true,
    displayOrder: 1,
    items: [
      {
        _key: 'fs-products',
        label: 'All Products',
        linkType: 'internal',
        internalPath: '/shop',
      },
      {
        _key: 'fs-fresh',
        label: 'Fresh Mushrooms',
        linkType: 'internal',
        internalPath: '/shop?category=fresh-mushrooms',
      },
      {
        _key: 'fs-dried',
        label: 'Dried Mushrooms',
        linkType: 'internal',
        internalPath: '/shop?category=dried-mushrooms',
      },
      {
        _key: 'fs-growers',
        label: 'Our Growers',
        linkType: 'internal',
        internalPath: '/grower',
      },
      {
        _key: 'fs-order',
        label: 'How to Order',
        linkType: 'internal',
        internalPath: '/faq',
      },
    ],
  },
  
  // Footer Customer Service
  {
    _type: 'navigation',
    title: 'Footer - Customer Service',
    slug: { _type: 'slug', current: 'footer-support' },
    menuType: 'footer-support',
    isActive: true,
    displayOrder: 2,
    items: [
      {
        _key: 'fcs-faq',
        label: 'FAQs',
        linkType: 'internal',
        internalPath: '/faq',
      },
      {
        _key: 'fcs-contact',
        label: 'Contact Us',
        linkType: 'internal',
        internalPath: '/contact',
      },
      {
        _key: 'fcs-shipping',
        label: 'Shipping Info',
        linkType: 'internal',
        internalPath: '/shipping-info',
      },
      {
        _key: 'fcs-returns',
        label: 'Return Policy',
        linkType: 'internal',
        internalPath: '/returns-policy',
      },
      {
        _key: 'fcs-privacy',
        label: 'Privacy Policy',
        linkType: 'internal',
        internalPath: '/privacy',
      },
      {
        _key: 'fcs-terms',
        label: 'Terms of Service',
        linkType: 'internal',
        internalPath: '/terms',
      },
    ],
  },
  
  // Footer About Links
  {
    _type: 'navigation',
    title: 'Footer - About MASH',
    slug: { _type: 'slug', current: 'footer-about' },
    menuType: 'footer-about',
    isActive: true,
    displayOrder: 3,
    items: [
      {
        _key: 'fa-about',
        label: 'About Us',
        linkType: 'internal',
        internalPath: '/about',
      },
      {
        _key: 'fa-mission',
        label: 'Our Mission',
        linkType: 'internal',
        internalPath: '/about#mission',
      },
      {
        _key: 'fa-grower',
        label: 'Become a Grower',
        linkType: 'internal',
        internalPath: '/start-selling',
      },
      {
        _key: 'fa-blog',
        label: 'Blog',
        linkType: 'internal',
        internalPath: '/blog',
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// MIGRATION FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

async function migrateSiteSettings() {
  console.log('\n📦 Migrating Site Settings...\n');
  
  try {
    // Check if settings already exist
    const existing = await client.fetch(`*[_id == "siteSettings"][0]`);
    
    if (existing) {
      console.log('⚠️  Site settings already exist. Updating...');
      await client
        .patch('siteSettings')
        .set(siteSettingsData)
        .commit();
      console.log('✅ Site settings updated!');
    } else {
      console.log('📝 Creating new site settings...');
      await client.createOrReplace(siteSettingsData);
      console.log('✅ Site settings created!');
    }
    
    // Log summary
    console.log('\n📋 Site Settings Summary:');
    console.log(`   Company: ${siteSettingsData.companyName}`);
    console.log(`   Tagline: ${siteSettingsData.tagline}`);
    console.log(`   Email: ${siteSettingsData.contactEmail}`);
    console.log(`   Phone: ${siteSettingsData.contactPhone}`);
    console.log(`   Announcement: ${siteSettingsData.announcementBar.enabled ? 'Enabled' : 'Disabled'}`);
    console.log(`   Features: ${Object.values(siteSettingsData.features).filter(Boolean).length} enabled`);
    
    return true;
  } catch (error) {
    console.error('❌ Error migrating site settings:', error);
    return false;
  }
}

async function migrateNavigation() {
  console.log('\n📦 Migrating Navigation Menus...\n');
  
  let created = 0;
  let updated = 0;
  let errors = 0;
  
  for (const menu of navigationMenus) {
    try {
      // Check if navigation already exists
      const existing = await client.fetch(
        `*[_type == "navigation" && menuType == $menuType][0]`,
        { menuType: menu.menuType }
      );
      
      if (existing) {
        console.log(`⚠️  ${menu.title} already exists. Updating...`);
        await client
          .patch(existing._id)
          .set(menu)
          .commit();
        updated++;
        console.log(`   ✅ Updated: ${menu.title} (${menu.items.length} items)`);
      } else {
        console.log(`📝 Creating: ${menu.title}...`);
        await client.create(menu);
        created++;
        console.log(`   ✅ Created: ${menu.title} (${menu.items.length} items)`);
      }
    } catch (error) {
      console.error(`❌ Error with ${menu.title}:`, error.message);
      errors++;
    }
  }
  
  console.log('\n📋 Navigation Summary:');
  console.log(`   Created: ${created}`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Errors: ${errors}`);
  console.log(`   Total Menus: ${navigationMenus.length}`);
  
  return errors === 0;
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🍄 MASH E-Commerce - Phase 5: Site Settings & Navigation');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`Project ID: ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'xyq5fhxs'}`);
  console.log(`Dataset: ${process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'}`);
  console.log(`Token: ${process.env.SANITY_API_WRITE_TOKEN ? '✅ Found' : '❌ Missing'}`);
  
  if (!process.env.SANITY_API_WRITE_TOKEN) {
    console.error('\n❌ SANITY_API_WRITE_TOKEN is required!');
    console.error('   Add it to .env.local file');
    process.exit(1);
  }
  
  const settingsResult = await migrateSiteSettings();
  const navResult = await migrateNavigation();
  
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('📊 MIGRATION COMPLETE');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`Site Settings: ${settingsResult ? '✅ Success' : '❌ Failed'}`);
  console.log(`Navigation: ${navResult ? '✅ Success' : '❌ Failed'}`);
  console.log('');
  console.log('🔗 Next Steps:');
  console.log('   1. Open Sanity Studio: cd studio && npm run dev');
  console.log('   2. Verify "Site Settings" singleton in Studio');
  console.log('   3. Check navigation menus under "Navigation Menu"');
  console.log('   4. Upload logo image in Site Settings');
  console.log('   5. Test header/footer on frontend');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  process.exit(settingsResult && navResult ? 0 : 1);
}

main();
