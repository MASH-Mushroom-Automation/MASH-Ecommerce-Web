/**
 * Check and Create Announcement Bar Data
 * Run: node scripts/setup-announcement-bar.js
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
  console.log('🔍 Checking Announcement Bar data...\n');
  
  try {
    // Check if siteSettings exists
    const siteSettings = await client.fetch('*[_type == "siteSettings"][0]');
    
    if (!siteSettings) {
      console.log('❌ No siteSettings document found!');
      console.log('📝 Creating siteSettings with announcement bar...\n');
      
      const newSettings = await client.create({
        _type: 'siteSettings',
        siteName: 'MASH - Mushroom Automation Smart Hub',
        companyName: 'MASH Philippines',
        tagline: 'Fresh Mushrooms, Smart Growing',
        announcementBar: {
          enabled: true,
          message: '🍄 FREE SHIPPING on orders over ₱1,500!',
          link: '/shop',
          linkText: 'Shop Now',
          backgroundColor: '#1E392A',
          textColor: '#FFFFFF'
        }
      });
      
      console.log('✅ Created siteSettings with announcement bar!');
      console.log('   ID:', newSettings._id);
    } else {
      console.log('✅ siteSettings exists!');
      console.log('   ID:', siteSettings._id);
      console.log('\n📋 Current Announcement Bar:');
      console.log(JSON.stringify(siteSettings.announcementBar, null, 2));
      
      if (!siteSettings.announcementBar?.enabled) {
        console.log('\n⚠️  Announcement bar is not enabled or missing!');
        console.log('📝 Updating with announcement bar...\n');
        
        await client.patch(siteSettings._id)
          .set({
            announcementBar: {
              enabled: true,
              message: '🍄 FREE SHIPPING on orders over ₱1,500!',
              link: '/shop',
              linkText: 'Shop Now',
              backgroundColor: '#1E392A',
              textColor: '#FFFFFF'
            }
          })
          .commit();
        
        console.log('✅ Announcement bar enabled!');
      } else {
        console.log('\n✅ Announcement bar is already enabled!');
      }
    }
    
    // Verify final state
    console.log('\n📋 Final Announcement Bar State:');
    const final = await client.fetch('*[_type == "siteSettings"][0].announcementBar');
    console.log(JSON.stringify(final, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();
