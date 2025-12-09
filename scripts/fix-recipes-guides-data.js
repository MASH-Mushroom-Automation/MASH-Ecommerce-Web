/**
 * Fix Recipes and Guides Data in Sanity CMS
 * 
 * This script fixes:
 * 1. Missing _key properties in arrays
 * 2. Invalid field types (string instead of blockContent)
 * 3. Ensures all required fields are properly set
 * 
 * Run: node scripts/fix-recipes-guides-data.js
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
  return Math.random().toString(36).substring(2, 15);
}

// Convert string to blockContent format
function toBlockContent(text) {
  if (!text) return [];
  if (Array.isArray(text)) return text; // Already blockContent
  
  return [
    {
      _type: 'block',
      _key: generateKey(),
      style: 'normal',
      markDefs: [],
      children: [
        {
          _type: 'span',
          _key: generateKey(),
          text: String(text),
          marks: [],
        },
      ],
    },
  ];
}

// Fix array items to have _key property
function fixArrayKeys(arr) {
  if (!Array.isArray(arr)) return arr;
  return arr.map(item => {
    if (typeof item === 'object' && item !== null && !item._key) {
      return { ...item, _key: generateKey() };
    }
    return item;
  });
}

// Fix ingredient groups
function fixIngredientGroups(groups) {
  if (!Array.isArray(groups)) return [];
  return groups.map(group => ({
    ...group,
    _key: group._key || generateKey(),
    ingredients: (group.ingredients || []).map(ing => ({
      ...ing,
      _key: ing._key || generateKey(),
    })),
  }));
}

// Fix instructions
function fixInstructions(instructions) {
  if (!Array.isArray(instructions)) return [];
  return instructions.map(step => ({
    ...step,
    _key: step._key || generateKey(),
    instruction: typeof step.instruction === 'string' 
      ? toBlockContent(step.instruction) 
      : step.instruction,
    tip: typeof step.tip === 'string' ? step.tip : step.tip,
  }));
}

// Fix growing steps
function fixGrowingSteps(steps) {
  if (!Array.isArray(steps)) return [];
  return steps.map(step => ({
    ...step,
    _key: step._key || generateKey(),
    instruction: typeof step.instruction === 'string' 
      ? toBlockContent(step.instruction) 
      : step.instruction,
  }));
}

// Fix troubleshooting
function fixTroubleshooting(items) {
  if (!Array.isArray(items)) return [];
  return items.map(item => ({
    ...item,
    _key: item._key || generateKey(),
  }));
}

async function fixRecipes() {
  console.log('🔧 Fixing recipes...\n');
  
  const recipes = await client.fetch('*[_type == "recipe"]');
  console.log(`Found ${recipes.length} recipes to fix\n`);
  
  for (const recipe of recipes) {
    console.log(`  Fixing: ${recipe.title}`);
    
    const updates = {};
    
    // Fix description if it's a string
    if (typeof recipe.description === 'string') {
      updates.description = toBlockContent(recipe.description);
    }
    
    // Fix chefNotes if it's a string
    if (typeof recipe.chefNotes === 'string') {
      updates.chefNotes = toBlockContent(recipe.chefNotes);
    }
    
    // Fix ingredient groups
    if (recipe.ingredientGroups) {
      updates.ingredientGroups = fixIngredientGroups(recipe.ingredientGroups);
    }
    
    // Fix instructions
    if (recipe.instructions) {
      updates.instructions = fixInstructions(recipe.instructions);
    }
    
    // Fix tags
    if (recipe.tags) {
      updates.tags = fixArrayKeys(recipe.tags);
    }
    
    // Ensure isPublished is set
    if (recipe.isPublished === undefined) {
      updates.isPublished = true;
    }
    
    // Apply updates if any
    if (Object.keys(updates).length > 0) {
      try {
        await client.patch(recipe._id).set(updates).commit();
        console.log(`    ✅ Fixed ${Object.keys(updates).length} fields`);
      } catch (err) {
        console.log(`    ❌ Error: ${err.message}`);
      }
    } else {
      console.log(`    ✓ No fixes needed`);
    }
  }
}

async function fixGuides() {
  console.log('\n🔧 Fixing growing guides...\n');
  
  const guides = await client.fetch('*[_type == "growingGuide"]');
  console.log(`Found ${guides.length} guides to fix\n`);
  
  for (const guide of guides) {
    console.log(`  Fixing: ${guide.title}`);
    
    const updates = {};
    
    // Fix introduction if it's a string
    if (typeof guide.introduction === 'string') {
      updates.introduction = toBlockContent(guide.introduction);
    }
    
    // Fix growing steps
    if (guide.growingSteps) {
      updates.growingSteps = fixGrowingSteps(guide.growingSteps);
    }
    
    // Fix troubleshooting
    if (guide.troubleshooting) {
      updates.troubleshooting = fixTroubleshooting(guide.troubleshooting);
    }
    
    // Fix supplies needed
    if (guide.suppliesNeeded) {
      updates.suppliesNeeded = fixArrayKeys(guide.suppliesNeeded);
    }
    
    // Fix tags
    if (guide.tags) {
      updates.tags = fixArrayKeys(guide.tags);
    }
    
    // Ensure isPublished is set
    if (guide.isPublished === undefined) {
      updates.isPublished = true;
    }
    
    // Apply updates if any
    if (Object.keys(updates).length > 0) {
      try {
        await client.patch(guide._id).set(updates).commit();
        console.log(`    ✅ Fixed ${Object.keys(updates).length} fields`);
      } catch (err) {
        console.log(`    ❌ Error: ${err.message}`);
      }
    } else {
      console.log(`    ✓ No fixes needed`);
    }
  }
}

async function main() {
  console.log('🔄 Starting Sanity Data Fix Script\n');
  console.log('=====================================\n');
  
  try {
    await fixRecipes();
    await fixGuides();
    
    console.log('\n=====================================');
    console.log('✅ Data fix complete!');
    console.log('\nRefresh the blog page to see the content.');
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

main();
