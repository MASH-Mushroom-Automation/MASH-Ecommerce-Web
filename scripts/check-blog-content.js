/**
 * Check Sanity content for recipes and guides
 */
const { createClient } = require('@sanity/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'gerattrr',
  dataset: 'production',
  apiVersion: '2024-11-22',
  useCdn: false,
});

async function checkContent() {
  console.log('🔍 Checking Sanity content...\n');
  
  try {
    // Check recipes (using 'status' field)
    const recipes = await client.fetch('*[_type == "recipe"]{_id, title, status, "slug": slug.current}');
    console.log(`📝 Found ${recipes.length} recipes:`);
    recipes.forEach((r, i) => {
      const statusEmoji = r.status === 'published' ? '✅' : '⏸️';
      console.log(`  ${i + 1}. ${statusEmoji} ${r.title} (status: ${r.status || 'not set'}, slug: ${r.slug})`);
    });
    
    // Check guides (using 'status' field)
    const guides = await client.fetch('*[_type == "growingGuide"]{_id, title, status, "slug": slug.current}');
    console.log(`\n🌱 Found ${guides.length} growing guides:`);
    guides.forEach((g, i) => {
      const statusEmoji = g.status === 'published' ? '✅' : '⏸️';
      console.log(`  ${i + 1}. ${statusEmoji} ${g.title} (status: ${g.status || 'not set'}, slug: ${g.slug})`);
    });
    
    // Check blog posts
    const posts = await client.fetch('*[_type == "post"]{_id, title, isPublished, "slug": slug.current}');
    console.log(`\n📖 Found ${posts.length} blog posts:`);
    posts.forEach((p, i) => {
      const statusEmoji = p.isPublished ? '✅' : '⏸️';
      console.log(`  ${i + 1}. ${statusEmoji} ${p.title} (slug: ${p.slug})`);
    });
    
    // Summary
    const publishedRecipes = recipes.filter(r => r.status === 'published').length;
    const publishedGuides = guides.filter(g => g.status === 'published').length;
    const publishedPosts = posts.filter(p => p.isPublished).length;
    
    console.log('\n✅ Summary:');
    console.log(`  - Recipes: ${recipes.length} total (${publishedRecipes} published)`);
    console.log(`  - Guides: ${guides.length} total (${publishedGuides} published)`);
    console.log(`  - Posts: ${posts.length} total (${publishedPosts} published)`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkContent();
