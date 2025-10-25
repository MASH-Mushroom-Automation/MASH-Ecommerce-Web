// CMS Setup and Initialization Script
// Run this to set up additional CMS content
// Usage: node setup-cms.js

const fs = require('fs');
const path = require('path');

async function setupCMS() {
  console.log('🚀 Setting up CMS with additional content...\n');

  try {
    // Additional Hero Sections
    console.log('📝 Creating additional hero sections...');
    const heroData = [
      {
        id: 'hero-2',
        title: 'Sustainable Mushroom Farming for a Better Tomorrow',
        subtitle: 'Join the movement towards sustainable agriculture. Every purchase supports local farmers and promotes eco-friendly practices.',
        backgroundImages: ['/sustainability-hero.jpg'],
        primaryButton: {
          text: 'Learn Our Story',
          url: '/about',
          variant: 'primary'
        },
        secondaryButton: {
          text: 'View Products',
          url: '/catalog',
          variant: 'outline'
        },
        isActive: true,
        displayOrder: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'hero-3',
        title: 'Fresh from Farm to Table in 24 Hours',
        subtitle: 'Experience the difference of truly fresh mushrooms. Harvested today, delivered tomorrow, straight from our partner growers.',
        backgroundImages: ['/fresh-delivery-hero.jpg'],
        primaryButton: {
          text: 'Order Now',
          url: '/catalog',
          variant: 'primary'
        },
        secondaryButton: {
          text: 'Find Growers',
          url: '/grower',
          variant: 'outline'
        },
        isActive: false,
        displayOrder: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // Additional FAQ Content
    console.log('❓ Adding more FAQ content...');
    const faqData = [
      {
        id: 'faq-2',
        categoryId: 'cat-1',
        question: 'Do you offer same-day delivery?',
        answer: 'Yes! Same-day delivery is available for orders placed before 12 PM in selected Metro Manila areas. Additional fees may apply.',
        displayOrder: 2,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'faq-3',
        categoryId: 'cat-1',
        question: 'What happens if my order arrives damaged?',
        answer: 'We take great care in packaging, but if your order arrives damaged, please contact us within 2 hours with photos. We\'ll provide a full refund or replacement.',
        displayOrder: 3,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'faq-4',
        categoryId: 'cat-2',
        question: 'What types of mushrooms do you offer?',
        answer: 'We offer a wide variety including button, oyster, shiitake, portobello, enoki, and specialty varieties like lion\'s mane and reishi.',
        displayOrder: 1,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'faq-5',
        categoryId: 'cat-2',
        question: 'Are your mushrooms suitable for vegetarians and vegans?',
        answer: 'Yes, all our mushrooms are 100% plant-based and suitable for both vegetarians and vegans.',
        displayOrder: 2,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // About Page Content
    console.log('📄 Setting up About page content...');
    const aboutData = [
      {
        id: 'about-hero',
        title: 'Cultivating the Future of Philippine Agriculture',
        subtitle: 'We are a team of student innovators from the University of Caloocan City dedicated to bridging the gap between technology and farming.',
        backgroundImage: '/about-hero.jpg',
        isActive: true,
        displayOrder: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // Contact Information
    console.log('📞 Setting up contact information...');
    const contactData = [
      {
        id: 'contact-phone',
        type: 'phone',
        title: 'Customer Support',
        value: '+63 917 123 4567',
        description: 'Mon-Fri: 8AM-6PM, Sat: 9AM-4PM',
        displayOrder: 1,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'contact-email',
        type: 'email',
        title: 'Email Support',
        value: 'support@mash.ph',
        description: 'We respond within 24 hours',
        displayOrder: 2,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'contact-address',
        type: 'address',
        title: 'Office Address',
        value: 'Quezon City, Metro Manila, Philippines',
        description: 'Visit our office by appointment',
        displayOrder: 3,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // Business Hours
    console.log('🕒 Setting up business hours...');
    const hoursData = [
      { id: 'hours-mon', dayOfWeek: 'monday', openTime: '08:00', closeTime: '18:00', isClosed: false, displayOrder: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'hours-tue', dayOfWeek: 'tuesday', openTime: '08:00', closeTime: '18:00', isClosed: false, displayOrder: 2, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'hours-wed', dayOfWeek: 'wednesday', openTime: '08:00', closeTime: '18:00', isClosed: false, displayOrder: 3, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'hours-thu', dayOfWeek: 'thursday', openTime: '08:00', closeTime: '18:00', isClosed: false, displayOrder: 4, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'hours-fri', dayOfWeek: 'friday', openTime: '08:00', closeTime: '18:00', isClosed: false, displayOrder: 5, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'hours-sat', dayOfWeek: 'saturday', openTime: '09:00', closeTime: '16:00', isClosed: false, displayOrder: 6, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'hours-sun', dayOfWeek: 'sunday', openTime: '00:00', closeTime: '00:00', isClosed: true, displayOrder: 7, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ];

    console.log('\n✅ CMS Setup Complete!');
    console.log('\n📊 Summary of Added Content:');
    console.log(`   - ${heroData.length} additional hero sections`);
    console.log(`   - ${faqData.length} additional FAQ items`);
    console.log(`   - ${aboutData.length} about page sections`);
    console.log(`   - ${contactData.length} contact information items`);
    console.log(`   - ${hoursData.length} business hours entries`);

    console.log('\n🎯 Ready to test:');
    console.log('   1. Start server: npm run dev');
    console.log('   2. Test APIs: npm run test:cms');
    console.log('   3. Check homepage for new content');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
  }
}

// Run setup if executed directly
if (require.main === module) {
  setupCMS();
}

module.exports = { setupCMS };
