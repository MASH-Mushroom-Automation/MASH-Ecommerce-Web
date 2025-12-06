/**
 * Migration Script: Phase 8 - Blog Categories, Team Members, About & Contact Pages
 * 
 * This script migrates:
 * - 5 blog categories (Recipes, Growing Tips, Nutrition, News, Community)
 * - 6 team members (BSCS students working on MASH project)
 * - 1 mentor (Prof. Joemen G. Barrios)
 * - About page singleton content
 * - Contact page singleton content
 * - 3 sample blog posts
 * 
 * Run: node scripts/migrate-phase8-content.js
 * 
 * Prerequisites:
 * - SANITY_API_WRITE_TOKEN in .env.local
 * - Sanity Studio running (npm run dev in /studio)
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@sanity/client')

// ═══════════════════════════════════════════════════════════════════════════════
// SANITY CLIENT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'gerattrr',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-11-26',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

// ═══════════════════════════════════════════════════════════════════════════════
// BLOG CATEGORIES DATA
// ═══════════════════════════════════════════════════════════════════════════════

const blogCategories = [
  {
    _id: 'blogCategory-recipes',
    _type: 'blogCategory',
    name: 'Recipes',
    slug: { _type: 'slug', current: 'recipes' },
    description: 'Delicious mushroom recipes for every skill level',
    icon: 'utensils',
    color: 'green',
    displayOrder: 1,
    isActive: true,
  },
  {
    _id: 'blogCategory-growing-tips',
    _type: 'blogCategory',
    name: 'Growing Tips',
    slug: { _type: 'slug', current: 'growing-tips' },
    description: 'Expert advice for growing mushrooms at home',
    icon: 'sprout',
    color: 'green',
    displayOrder: 2,
    isActive: true,
  },
  {
    _id: 'blogCategory-nutrition',
    _type: 'blogCategory',
    name: 'Health & Nutrition',
    slug: { _type: 'slug', current: 'nutrition' },
    description: 'Discover the health benefits of mushrooms',
    icon: 'heart-pulse',
    color: 'blue',
    displayOrder: 3,
    isActive: true,
  },
  {
    _id: 'blogCategory-news',
    _type: 'blogCategory',
    name: 'News & Updates',
    slug: { _type: 'slug', current: 'news' },
    description: 'Latest news from MASH and the mushroom industry',
    icon: 'newspaper',
    color: 'purple',
    displayOrder: 4,
    isActive: true,
  },
  {
    _id: 'blogCategory-community',
    _type: 'blogCategory',
    name: 'Community',
    slug: { _type: 'slug', current: 'community' },
    description: 'Stories from our growers and customers',
    icon: 'users',
    color: 'orange',
    displayOrder: 5,
    isActive: true,
  },
]

// ═══════════════════════════════════════════════════════════════════════════════
// TEAM MEMBERS DATA
// ═══════════════════════════════════════════════════════════════════════════════

const teamMembers = [
  {
    _id: 'person-mentor-barrios',
    _type: 'person',
    firstName: 'Joemen G.',
    lastName: 'Barrios, MIT',
    role: 'Thesis Adviser',
    personType: 'mentor',
    shortBio: 'Our academic adviser guiding the MASH project with expertise in information technology.',
    email: 'joemen.barrios@ucc.edu.ph',
    displayOrder: 1,
    showOnAboutPage: true,
    isFeatured: true,
    isActive: true,
  },
  {
    _id: 'person-team-kenneth',
    _type: 'person',
    firstName: 'Kenneth',
    lastName: 'Bautista',
    role: 'Lead Developer',
    personType: 'team',
    shortBio: 'Full-stack developer specializing in React, Next.js, and system architecture.',
    specializations: ['React', 'Next.js', 'TypeScript', 'Node.js', 'System Design'],
    displayOrder: 2,
    showOnAboutPage: true,
    isFeatured: true,
    isActive: true,
  },
  {
    _id: 'person-team-melrhin',
    _type: 'person',
    firstName: 'Melrhin',
    lastName: 'Bayan',
    role: 'Project Manager',
    personType: 'team',
    shortBio: 'Coordinates the team and manages mushroom farm operations for MASH.',
    specializations: ['Project Management', 'Operations', 'Agriculture'],
    displayOrder: 3,
    showOnAboutPage: true,
    isFeatured: false,
    isActive: true,
  },
  {
    _id: 'person-team-member3',
    _type: 'person',
    firstName: 'Team Member',
    lastName: 'Three',
    role: 'IoT Engineer',
    personType: 'team',
    shortBio: 'Designs and maintains the smart automation systems for mushroom cultivation.',
    specializations: ['IoT', 'Arduino', 'Sensors', 'Automation'],
    displayOrder: 4,
    showOnAboutPage: true,
    isFeatured: false,
    isActive: true,
  },
  {
    _id: 'person-team-member4',
    _type: 'person',
    firstName: 'Team Member',
    lastName: 'Four',
    role: 'UI/UX Designer',
    personType: 'team',
    shortBio: 'Creates intuitive user interfaces and engaging experiences for the MASH platform.',
    specializations: ['Figma', 'UI Design', 'UX Research', 'Prototyping'],
    displayOrder: 5,
    showOnAboutPage: true,
    isFeatured: false,
    isActive: true,
  },
  {
    _id: 'person-team-member5',
    _type: 'person',
    firstName: 'Team Member',
    lastName: 'Five',
    role: 'AI/ML Engineer',
    personType: 'team',
    shortBio: 'Develops AI models for mushroom health detection and growth prediction.',
    specializations: ['Python', 'TensorFlow', 'Machine Learning', 'Data Analysis'],
    displayOrder: 6,
    showOnAboutPage: true,
    isFeatured: false,
    isActive: true,
  },
]

// ═══════════════════════════════════════════════════════════════════════════════
// ABOUT PAGE SINGLETON DATA
// ═══════════════════════════════════════════════════════════════════════════════

const aboutPageContent = {
  _id: 'aboutPageContent',
  _type: 'aboutPage',
  
  // Hero
  heroTitle: 'Cultivating the Future of Philippine Agriculture',
  heroSubtitle: 'We are a team of student innovators from the University of Caloocan City dedicated to bridging the gap between technology and farming.',
  
  // Challenges
  challengesTitle: 'The Challenge Facing Filipino Growers',
  challengesSubtitle: 'Mushroom production in the Philippines holds immense potential, but small-scale farmers face persistent obstacles.',
  challenges: [
    {
      _key: 'challenge-1',
      title: 'Climate Conditions',
      description: 'Unpredictable climate conditions and high tropical heat make consistent cultivation difficult.',
      icon: 'thermometer',
    },
    {
      _key: 'challenge-2',
      title: 'Pest & Contamination',
      description: 'Devastating pest infestations and contamination threaten yields.',
      icon: 'bug',
    },
    {
      _key: 'challenge-3',
      title: 'Labor-Intensive Methods',
      description: 'Traditional, labor-intensive methods leading to inconsistent harvests.',
      icon: 'clock',
    },
    {
      _key: 'challenge-4',
      title: 'Limited Market Access',
      description: 'Limited market access and dependence on middlemen.',
      icon: 'store',
    },
    {
      _key: 'challenge-5',
      title: 'Pricing Uncertainties',
      description: 'Pricing uncertainties that discourage growth and investment.',
      icon: 'dollar-sign',
    },
  ],
  
  // Solutions
  solutionsTitle: 'Our Solution: The M.A.S.H. System',
  solutionsSubtitle: 'M.A.S.H. (Mushroom Automation with Smart Hydro-environment) is an integrated ecosystem designed to solve these challenges.',
  solutionsAcronym: 'M.A.S.H. stands for Mushroom Automation with Smart Hydro-environment - combining IoT sensors, AI analytics, and e-commerce into one seamless platform.',
  solutions: [
    {
      _key: 'solution-1',
      title: 'Automated Growing',
      description: 'An IoT-enabled chamber monitors and controls temperature, humidity, and CO₂ in real-time, ensuring optimal growing conditions 24/7.',
      icon: 'cpu',
    },
    {
      _key: 'solution-2',
      title: 'AI-Powered Insights',
      description: 'An AI model analyzes data to predict environmental needs, recommend adjustments, and help detect contamination early.',
      icon: 'brain',
    },
    {
      _key: 'solution-3',
      title: 'Direct Market Access',
      description: 'An integrated e-commerce platform connects growers directly with consumers, ensuring fairer prices and a streamlined supply chain.',
      icon: 'shopping-cart',
    },
  ],
  
  // Vision
  visionTitle: 'Our Vision for a Greener Tomorrow',
  visionCTA: 'Join us in growing the mushroom movement!',
  
  // Mentor
  mentorTitle: 'Our Academic Adviser',
  mentorSubtitle: 'We are grateful for the guidance and expertise of our Thesis Adviser in bringing this project to life.',
  mentor: {
    _type: 'reference',
    _ref: 'person-mentor-barrios',
  },
  
  // Team
  teamTitle: 'Meet the Team',
  teamSubtitle: 'The brilliant minds behind MASH - passionate about technology and sustainable agriculture.',
  autoFetchTeam: true, // Will auto-fetch from persons with showOnAboutPage=true
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTACT PAGE SINGLETON DATA
// ═══════════════════════════════════════════════════════════════════════════════

const contactPageContent = {
  _id: 'contactPageContent',
  _type: 'contactPage',
  
  // Header
  title: 'Get in Touch',
  subtitle: "Have questions about our products or services? We'd love to hear from you!",
  
  // Contact Methods
  contactMethods: [
    {
      _key: 'contact-phone',
      type: 'phone',
      label: 'Phone',
      value: '+63 966 169 2000',
      description: 'Mon-Fri: 8AM-6PM',
      link: 'tel:+639661692000',
      displayOrder: 1,
    },
    {
      _key: 'contact-email',
      type: 'email',
      label: 'Email',
      value: 'support@mashmushrooms.ph',
      description: "We'll respond within 24 hours",
      link: 'mailto:support@mashmushrooms.ph',
      displayOrder: 2,
    },
    {
      _key: 'contact-address',
      type: 'address',
      label: 'Address',
      value: '1019 Quirino Highway, Brgy Sta. Monica, Novaliches, Quezon City',
      description: 'Visit our store',
      displayOrder: 3,
    },
    {
      _key: 'contact-whatsapp',
      type: 'whatsapp',
      label: 'WhatsApp',
      value: '+63 966 169 2000',
      description: 'Chat with us',
      link: 'https://wa.me/639661692000',
      displayOrder: 4,
    },
  ],
  
  // Business Hours
  businessHoursTitle: 'Business Hours',
  businessHours: [
    { _key: 'hours-mon', day: 'monday', openTime: '8:00 AM', closeTime: '6:00 PM', isClosed: false },
    { _key: 'hours-tue', day: 'tuesday', openTime: '8:00 AM', closeTime: '6:00 PM', isClosed: false },
    { _key: 'hours-wed', day: 'wednesday', openTime: '8:00 AM', closeTime: '6:00 PM', isClosed: false },
    { _key: 'hours-thu', day: 'thursday', openTime: '8:00 AM', closeTime: '6:00 PM', isClosed: false },
    { _key: 'hours-fri', day: 'friday', openTime: '8:00 AM', closeTime: '6:00 PM', isClosed: false },
    { _key: 'hours-sat', day: 'saturday', openTime: '9:00 AM', closeTime: '4:00 PM', isClosed: false },
    { _key: 'hours-sun', day: 'sunday', openTime: '', closeTime: '', isClosed: true },
  ],
  holidayNote: 'Hours may vary during holidays. Please check our social media for updates.',
  timezone: 'Philippine Time (GMT+8)',
  
  // Social Media
  socialMediaTitle: 'Follow Us',
  socialLinks: [
    { _key: 'social-fb', platform: 'facebook', url: 'https://facebook.com/mashmushrooms', handle: '@mashmushrooms', displayOrder: 1 },
    { _key: 'social-ig', platform: 'instagram', url: 'https://instagram.com/mashmushrooms', handle: '@mashmushrooms', displayOrder: 2 },
    { _key: 'social-tw', platform: 'twitter', url: 'https://twitter.com/mashmushrooms', handle: '@mashmushrooms', displayOrder: 3 },
    { _key: 'social-tiktok', platform: 'tiktok', url: 'https://tiktok.com/@mashmushrooms', handle: '@mashmushrooms', displayOrder: 4 },
  ],
  
  // Location
  locationTitle: 'Visit Us',
  address: {
    street: '1019 Quirino Highway',
    barangay: 'Brgy Sta. Monica',
    city: 'Novaliches, Quezon City',
    province: 'Metro Manila',
    zipCode: '1116',
    country: 'Philippines',
  },
  coordinates: {
    latitude: 14.724177785776938,
    longitude: 121.03866187637956,
  },
  directionsLink: 'https://maps.google.com/?q=14.724177785776938,121.03866187637956',
  nearbyLandmarks: 'In front of BDO Novaliches, near SM Fairview',
  
  // Contact Form
  formTitle: 'Send Us a Message',
  formSubtitle: "Fill out the form below and we'll get back to you as soon as possible.",
  formRecipientEmail: 'support@mashmushrooms.ph',
  formSuccessMessage: "Thank you for your message! We'll respond within 24 hours.",
  showContactForm: true,
}

// ═══════════════════════════════════════════════════════════════════════════════
// SAMPLE BLOG POSTS DATA
// ═══════════════════════════════════════════════════════════════════════════════

const sampleBlogPosts = [
  {
    _id: 'post-mushroom-health-benefits',
    _type: 'post',
    title: '10 Amazing Health Benefits of Mushrooms',
    slug: { _type: 'slug', current: '10-amazing-health-benefits-of-mushrooms' },
    excerpt: 'Discover why mushrooms are called superfoods and how they can boost your immune system, improve brain health, and more.',
    date: new Date().toISOString(),
    isFeatured: true,
    isPublished: true,
    readTime: 5,
    allowComments: true,
    categories: [{ _type: 'reference', _ref: 'blogCategory-nutrition' }],
    tags: ['health', 'nutrition', 'immune system', 'superfoods'],
    author: { _type: 'reference', _ref: 'person-team-kenneth' },
    seo: {
      metaTitle: '10 Amazing Health Benefits of Mushrooms | MASH Blog',
      metaDescription: 'Learn about the incredible health benefits of mushrooms, from boosting immunity to improving brain function.',
      keywords: ['mushroom health benefits', 'mushroom nutrition', 'superfoods'],
    },
  },
  {
    _id: 'post-growing-oyster-mushrooms',
    _type: 'post',
    title: "Beginner's Guide to Growing Oyster Mushrooms at Home",
    slug: { _type: 'slug', current: 'beginners-guide-growing-oyster-mushrooms' },
    excerpt: 'Everything you need to know to start your mushroom growing journey. Step-by-step instructions for beginners.',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    isFeatured: true,
    isPublished: true,
    readTime: 8,
    allowComments: true,
    categories: [{ _type: 'reference', _ref: 'blogCategory-growing-tips' }],
    tags: ['growing', 'oyster mushrooms', 'beginner', 'DIY', 'cultivation'],
    author: { _type: 'reference', _ref: 'person-team-melrhin' },
    seo: {
      metaTitle: 'How to Grow Oyster Mushrooms at Home | MASH Blog',
      metaDescription: 'Complete beginner guide to growing oyster mushrooms at home. Easy steps, tips, and common mistakes to avoid.',
      keywords: ['grow oyster mushrooms', 'mushroom cultivation', 'home growing'],
    },
  },
  {
    _id: 'post-mushroom-soup-recipe',
    _type: 'post',
    title: 'Creamy Mushroom Soup Recipe - Perfect for Rainy Days',
    slug: { _type: 'slug', current: 'creamy-mushroom-soup-recipe' },
    excerpt: 'A warm, comforting mushroom soup that highlights the earthy flavors of fresh oyster and shiitake mushrooms.',
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
    isFeatured: false,
    isPublished: true,
    readTime: 4,
    allowComments: true,
    categories: [{ _type: 'reference', _ref: 'blogCategory-recipes' }],
    tags: ['recipe', 'soup', 'comfort food', 'easy recipe'],
    author: { _type: 'reference', _ref: 'person-team-kenneth' },
    seo: {
      metaTitle: 'Creamy Mushroom Soup Recipe | MASH Blog',
      metaDescription: 'Easy creamy mushroom soup recipe using fresh oyster and shiitake mushrooms. Perfect comfort food for rainy days.',
      keywords: ['mushroom soup recipe', 'creamy soup', 'comfort food'],
    },
  },
]

// ═══════════════════════════════════════════════════════════════════════════════
// MIGRATION FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

async function migrateBlogCategories() {
  console.log('\n📂 Migrating Blog Categories...')
  
  for (const category of blogCategories) {
    try {
      await client.createOrReplace(category)
      console.log(`   ✅ Created category: ${category.name}`)
    } catch (error) {
      console.error(`   ❌ Error creating category ${category.name}:`, error.message)
    }
  }
  
  console.log(`   📊 Total: ${blogCategories.length} blog categories`)
}

async function migrateTeamMembers() {
  console.log('\n👥 Migrating Team Members...')
  
  for (const member of teamMembers) {
    try {
      await client.createOrReplace(member)
      console.log(`   ✅ Created person: ${member.firstName} ${member.lastName} (${member.role})`)
    } catch (error) {
      console.error(`   ❌ Error creating person ${member.firstName} ${member.lastName}:`, error.message)
    }
  }
  
  console.log(`   📊 Total: ${teamMembers.length} team members`)
}

async function migrateAboutPage() {
  console.log('\n📄 Migrating About Page Content...')
  
  try {
    await client.createOrReplace(aboutPageContent)
    console.log('   ✅ Created About page singleton')
  } catch (error) {
    console.error('   ❌ Error creating About page:', error.message)
  }
}

async function migrateContactPage() {
  console.log('\n📞 Migrating Contact Page Content...')
  
  try {
    await client.createOrReplace(contactPageContent)
    console.log('   ✅ Created Contact page singleton')
  } catch (error) {
    console.error('   ❌ Error creating Contact page:', error.message)
  }
}

async function migrateBlogPosts() {
  console.log('\n📝 Migrating Sample Blog Posts...')
  
  for (const post of sampleBlogPosts) {
    try {
      await client.createOrReplace(post)
      console.log(`   ✅ Created post: ${post.title}`)
    } catch (error) {
      console.error(`   ❌ Error creating post ${post.title}:`, error.message)
    }
  }
  
  console.log(`   📊 Total: ${sampleBlogPosts.length} blog posts`)
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXECUTION
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  console.log('═══════════════════════════════════════════════════════════')
  console.log('       MASH Phase 8 Migration: Blog & Content Pages        ')
  console.log('═══════════════════════════════════════════════════════════')
  console.log(`Project: ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}`)
  console.log(`Dataset: ${process.env.NEXT_PUBLIC_SANITY_DATASET}`)
  console.log('═══════════════════════════════════════════════════════════')

  if (!process.env.SANITY_API_WRITE_TOKEN) {
    console.error('\n❌ Error: SANITY_API_WRITE_TOKEN not found in .env.local')
    console.log('   Please add your Sanity write token to continue.')
    process.exit(1)
  }

  try {
    // Run migrations in order
    await migrateBlogCategories()
    await migrateTeamMembers()
    await migrateAboutPage()
    await migrateContactPage()
    await migrateBlogPosts()

    console.log('\n═══════════════════════════════════════════════════════════')
    console.log('                    MIGRATION COMPLETE                      ')
    console.log('═══════════════════════════════════════════════════════════')
    console.log('\n📋 Summary:')
    console.log(`   • ${blogCategories.length} blog categories`)
    console.log(`   • ${teamMembers.length} team members (incl. mentor)`)
    console.log('   • 1 About page singleton')
    console.log('   • 1 Contact page singleton')
    console.log(`   • ${sampleBlogPosts.length} sample blog posts`)
    console.log('\n✅ Next Steps:')
    console.log('   1. Open Sanity Studio (cd studio && npm run dev)')
    console.log('   2. Upload profile pictures for team members')
    console.log('   3. Add hero/vision images to About page')
    console.log('   4. Add cover images to blog posts')
    console.log('   5. Update team member names (currently placeholders)')
    console.log('')
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message)
    process.exit(1)
  }
}

main()
