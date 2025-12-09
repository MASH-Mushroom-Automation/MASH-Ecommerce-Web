/**
 * Sanity Migration Script: Blog Posts
 * 
 * This script creates sample blog posts in Sanity CMS
 * covering mushroom health benefits, growing tips, and sustainability.
 * 
 * Run: node scripts/migrate-blog-posts-to-sanity.js
 */

const { createClient } = require('@sanity/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'gerattrr',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_WRITE_TOKEN,
  apiVersion: '2024-11-22',
  useCdn: false,
});

// Generate unique key for array items
function generateKey() {
  return Math.random().toString(36).substring(2, 12);
}

// Convert text to blockContent format
function toBlockContent(text) {
  if (!text) return [];
  
  // Split by double newline for paragraphs
  const paragraphs = text.split('\n\n').filter(p => p.trim());
  
  return paragraphs.map(para => ({
    _type: 'block',
    _key: generateKey(),
    style: 'normal',
    markDefs: [],
    children: [
      {
        _type: 'span',
        _key: generateKey(),
        text: para.trim(),
        marks: [],
      },
    ],
  }));
}

// Create heading block
function heading(text, level = 'h2') {
  return {
    _type: 'block',
    _key: generateKey(),
    style: level,
    markDefs: [],
    children: [
      {
        _type: 'span',
        _key: generateKey(),
        text: text,
        marks: [],
      },
    ],
  };
}

// Sample blog posts
const blogPosts = [
  {
    _type: 'post',
    title: '5 Amazing Health Benefits of Mushrooms You Need to Know',
    slug: { current: '5-health-benefits-of-mushrooms', _type: 'slug' },
    excerpt: 'Discover the incredible health benefits of mushrooms, from boosting immunity to supporting brain health. Learn why mushrooms should be part of your daily diet.',
    body: [
      heading('Why Mushrooms Are a Superfood'),
      ...toBlockContent(`Mushrooms have been consumed for thousands of years, not just for their delicious taste but for their remarkable health benefits. These fascinating fungi are packed with nutrients and bioactive compounds that can significantly improve your overall health.

In this article, we'll explore five amazing health benefits of mushrooms that will make you want to include them in your daily diet.`),
      
      heading('1. Boosts Immune System'),
      ...toBlockContent(`Mushrooms contain beta-glucans, powerful compounds that enhance immune function. Studies have shown that regular consumption of mushrooms can increase the production of white blood cells, helping your body fight off infections more effectively.

Varieties like shiitake and oyster mushrooms are particularly rich in these immune-boosting compounds.`),
      
      heading('2. Rich in Antioxidants'),
      ...toBlockContent(`Mushrooms are one of the best sources of ergothioneine and glutathione, two powerful antioxidants that protect your cells from damage. These antioxidants help reduce inflammation and may lower the risk of chronic diseases.

The darker the mushroom, the more antioxidants it typically contains.`),
      
      heading('3. Supports Brain Health'),
      ...toBlockContent(`Lion's Mane mushroom has been shown to stimulate the production of nerve growth factor (NGF), which is essential for brain health. Regular consumption may improve memory, focus, and cognitive function.

Research suggests that Lion's Mane may also help protect against neurodegenerative diseases.`),
      
      heading('4. Low in Calories, High in Nutrients'),
      ...toBlockContent(`Mushrooms are incredibly nutrient-dense while being low in calories. They're an excellent source of B vitamins, selenium, potassium, and copper. They're also one of the few plant-based sources of vitamin D when exposed to sunlight.

This makes them perfect for anyone watching their calorie intake while wanting to maximize nutrition.`),
      
      heading('5. May Support Heart Health'),
      ...toBlockContent(`The fiber, potassium, and vitamin C in mushrooms all contribute to cardiovascular health. Studies have shown that shiitake mushrooms in particular may help lower cholesterol levels and improve circulation.

Including mushrooms in a heart-healthy diet can be a delicious way to support your cardiovascular system.`),
      
      heading('Conclusion'),
      ...toBlockContent(`Mushrooms are truly a nutritional powerhouse that deserves a place in everyone's diet. Whether you enjoy them fresh, dried, or in supplement form, these amazing fungi offer countless health benefits.

At MASH, we're proud to offer a variety of fresh, locally-grown mushrooms that can help you enjoy all these health benefits. Check out our shop to explore our selection!`),
    ],
    publishedAt: '2025-12-01T10:00:00Z',
    isPublished: true,
  },
  {
    _type: 'post',
    title: 'Beginner\'s Guide to Growing Mushrooms at Home',
    slug: { current: 'beginners-guide-growing-mushrooms', _type: 'slug' },
    excerpt: 'Learn how to grow your own mushrooms at home with our comprehensive beginner guide. From choosing the right kit to harvesting your first crop.',
    body: [
      heading('Your Journey to Home Mushroom Growing'),
      ...toBlockContent(`Growing mushrooms at home is easier than you might think! With the right kit and some basic knowledge, you can harvest fresh, organic mushrooms right in your kitchen or balcony.

This guide will walk you through everything you need to know to get started with mushroom cultivation.`),
      
      heading('Why Grow Mushrooms at Home?'),
      ...toBlockContent(`There are many reasons to start growing your own mushrooms:

Fresh mushrooms taste significantly better than store-bought ones
You know exactly what goes into your food - no pesticides or chemicals
It's a fun and rewarding hobby that the whole family can enjoy
It's more sustainable than buying imported mushrooms
You can grow gourmet varieties that are expensive or hard to find in stores`),
      
      heading('Choosing Your First Growing Kit'),
      ...toBlockContent(`For beginners, we recommend starting with an oyster mushroom kit. Oyster mushrooms are the easiest to grow and very forgiving of beginner mistakes. They grow quickly (usually within 7-14 days) and produce generous yields.

At MASH, we offer ready-to-grow kits that include everything you need to get started. Just follow the simple instructions and watch your mushrooms grow!`),
      
      heading('The Growing Process'),
      ...toBlockContent(`Step 1: Unbox your kit and place it in a suitable location with indirect light
Step 2: Cut an X-shaped opening in the bag where indicated
Step 3: Mist the opening with water 2-3 times daily
Step 4: Maintain humidity using the included humidity tent
Step 5: Watch for pins (baby mushrooms) within 5-7 days
Step 6: Harvest when caps begin to flatten (usually 10-14 days from start)`),
      
      heading('Common Beginner Mistakes to Avoid'),
      ...toBlockContent(`Too much water - Misting is key, but don't soak the substrate
Too little humidity - Keep that humidity tent in place
Direct sunlight - Mushrooms prefer indirect or ambient light
Harvesting too late - Pick before spores drop for best taste
Not enough fresh air - Mushrooms need oxygen to grow properly`),
      
      heading('Ready to Start Growing?'),
      ...toBlockContent(`We hope this guide has inspired you to try growing mushrooms at home! Check out our selection of growing kits to find the perfect one for your first mushroom-growing adventure.

Remember, our detailed growing guides are always available to help you every step of the way. Happy growing!`),
    ],
    publishedAt: '2025-11-28T10:00:00Z',
    isPublished: true,
  },
  {
    _type: 'post',
    title: 'The Environmental Benefits of Local Mushroom Farming',
    slug: { current: 'environmental-benefits-mushroom-farming', _type: 'slug' },
    excerpt: 'Discover how local mushroom farming is helping create a more sustainable food system. Learn about the eco-friendly practices that make mushroom cultivation special.',
    body: [
      heading('Mushrooms: Nature\'s Recyclers'),
      ...toBlockContent(`Mushrooms play a crucial role in our ecosystem as nature's recyclers. They break down organic matter, returning nutrients to the soil and completing the cycle of life. But their environmental benefits extend far beyond their natural role.

In this article, we'll explore how mushroom farming is one of the most sustainable forms of agriculture and why choosing local mushrooms matters.`),
      
      heading('Low Carbon Footprint'),
      ...toBlockContent(`Unlike many agricultural products, mushrooms can be grown vertically in small spaces, making them perfect for urban farming. A single room can produce thousands of kilograms of mushrooms annually.

This efficient use of space means less land is needed, preserving natural habitats and reducing the need for deforestation.`),
      
      heading('Minimal Water Usage'),
      ...toBlockContent(`Mushrooms require significantly less water than traditional crops. While it takes about 1,800 liters of water to grow 1kg of meat and 1,300 liters for 1kg of wheat, mushrooms need only about 15-20 liters per kilogram.

This makes mushroom farming an excellent choice for water-conscious agriculture.`),
      
      heading('Converting Waste into Food'),
      ...toBlockContent(`One of the most remarkable aspects of mushroom farming is the ability to grow on agricultural waste products. Mushrooms can be cultivated on:

Rice straw and wheat straw
Coffee grounds
Sawdust from sustainable forestry
Corn cobs and husks
Sugarcane bagasse

At MASH, we work with local farmers to source agricultural waste products, turning what would be trash into nutritious food.`),
      
      heading('Why Local Matters'),
      ...toBlockContent(`When you choose locally grown mushrooms, you're:

Reducing transportation emissions - No air freight from other countries
Supporting local farmers and the community
Getting fresher, more nutritious produce
Contributing to local food security

Our mushrooms travel from farm to table in hours, not days or weeks.`),
      
      heading('Join the Sustainable Food Movement'),
      ...toBlockContent(`By choosing MASH mushrooms, you're not just getting delicious, fresh produce - you're supporting a more sustainable food system. Every purchase helps us continue our mission of producing high-quality, eco-friendly mushrooms right here in the Philippines.

Together, we can make a difference, one mushroom at a time!`),
    ],
    publishedAt: '2025-11-25T10:00:00Z',
    isPublished: true,
  },
  {
    _type: 'post',
    title: 'Cooking with Lion\'s Mane: Tips and Tricks',
    slug: { current: 'cooking-with-lions-mane', _type: 'slug' },
    excerpt: 'Learn expert tips for cooking with Lion\'s Mane mushroom, the "seafood" of the mushroom world. From searing to sautéing, master this unique ingredient.',
    body: [
      heading('Meet the Lion\'s Mane Mushroom'),
      ...toBlockContent(`Lion's Mane (Hericium erinaceus) is truly a unique mushroom. With its cascading white tendrils, it looks like no other mushroom - and its taste is equally distinctive. Many people describe its flavor as similar to crab or lobster, making it a popular choice for plant-based seafood dishes.

In this article, we'll share our best tips for cooking with this extraordinary fungus.`),
      
      heading('Selecting and Storing'),
      ...toBlockContent(`When selecting Lion's Mane, look for specimens that are white to cream-colored with firm, intact "teeth." Avoid any that are yellow or brown, as this indicates age.

Store fresh Lion's Mane in a paper bag in the refrigerator for up to one week. Never store mushrooms in plastic, as this traps moisture and causes them to spoil quickly.`),
      
      heading('Preparing for Cooking'),
      ...toBlockContent(`Unlike other mushrooms, Lion's Mane doesn't need to be washed - simply brush off any debris. The key to preparing Lion's Mane is to tear it into pieces rather than cut it. This creates more surface area for browning and better texture.

Tear the mushroom into strips or chunks about 1-2 cm thick. The "stringy" texture that results is what gives it that seafood-like quality.`),
      
      heading('The Best Cooking Methods'),
      ...toBlockContent(`Pan-Searing: The best way to cook Lion's Mane! Heat oil in a pan until very hot, add the torn pieces, and don't touch them for 2-3 minutes. Let them develop a golden crust before flipping.

Sautéing: Great for quick dishes. Sauté in butter with garlic for an easy side dish.

Grilling: Brush with oil and grill for 3-4 minutes per side for a smoky flavor.

Baking: Roast at 200°C for 15-20 minutes for a crispy texture.`),
      
      heading('Flavor Pairings'),
      ...toBlockContent(`Lion's Mane pairs beautifully with:

Butter and garlic - the classic combination
Lemon and herbs - brings out the seafood-like quality  
Old Bay seasoning - for a crab cake-inspired dish
Soy sauce and sesame - for an Asian twist
White wine and cream - elegant and rich`),
      
      heading('Try It Yourself!'),
      ...toBlockContent(`Ready to cook with Lion's Mane? Order fresh Lion's Mane from our shop, or try our Lion's Mane growing kit to have this amazing mushroom fresh from your own home!

Check out our recipes section for specific Lion's Mane recipes including our popular Lion's Mane "Crab" Cakes!`),
    ],
    publishedAt: '2025-11-20T10:00:00Z',
    isPublished: true,
  },
];

async function migrateBlogPosts() {
  console.log('🚀 Starting blog post migration...\n');
  
  for (const post of blogPosts) {
    try {
      // Check if post already exists
      const existing = await client.fetch(
        `*[_type == "post" && slug.current == $slug][0]`,
        { slug: post.slug.current }
      );
      
      if (existing) {
        console.log(`⏭️ Skipping: ${post.title} (already exists)`);
        continue;
      }
      
      // Create the post
      const result = await client.create(post);
      console.log(`✅ Created: ${post.title}`);
      
    } catch (error) {
      console.error(`❌ Error creating ${post.title}:`, error.message);
    }
  }
  
  console.log('\n✅ Blog post migration complete!');
}

migrateBlogPosts();
