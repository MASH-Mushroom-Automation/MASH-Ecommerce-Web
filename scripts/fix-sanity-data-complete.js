/**
 * Complete Fix for Recipes and Growing Guides in Sanity CMS
 * 
 * This script fixes ALL Sanity validation errors:
 * 1. Missing _key properties in arrays
 * 2. Invalid field types (string instead of blockContent)
 * 3. Removes unknown fields (isPublished, mealType, carbs, etc.)
 * 4. Renames/restructures fields to match schema
 * 5. Sets correct status field ('published' instead of isPublished: true)
 * 
 * Run: node scripts/fix-sanity-data-complete.js
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

// Convert string to blockContent format
function toBlockContent(text) {
  if (!text) return null;
  
  // If already blockContent format, return as is
  if (Array.isArray(text) && text[0]?._type === 'block') {
    // Just ensure _key exists
    return text.map(block => ({
      ...block,
      _key: block._key || generateKey(),
    }));
  }
  
  // Convert string to blockContent
  if (typeof text === 'string') {
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
            text: text,
            marks: [],
          },
        ],
      },
    ];
  }
  
  return null;
}

// Fix array items to have _key property
function fixArrayKeys(arr, prefix = 'item') {
  if (!Array.isArray(arr)) return arr;
  return arr.map((item, idx) => {
    if (typeof item === 'object' && item !== null) {
      return { ...item, _key: item._key || `${prefix}_${generateKey()}` };
    }
    return item;
  });
}

// Fix ingredient groups with nested arrays
function fixIngredientGroups(groups) {
  if (!Array.isArray(groups)) return groups;
  return groups.map((group, gIdx) => ({
    ...group,
    _key: group._key || `group_${generateKey()}`,
    ingredients: Array.isArray(group.ingredients)
      ? group.ingredients.map((ing, iIdx) => ({
          ...ing,
          _key: ing._key || `ing_${generateKey()}`,
          substitutes: Array.isArray(ing.substitutes)
            ? ing.substitutes.map(s => (typeof s === 'string' ? s : s))
            : ing.substitutes,
        }))
      : group.ingredients,
  }));
}

// Fix instructions array
function fixInstructions(instructions) {
  if (!Array.isArray(instructions)) return instructions;
  return instructions.map((step, idx) => ({
    ...step,
    _key: step._key || `step_${generateKey()}`,
    stepNumber: step.stepNumber || idx + 1,
    // Convert instruction to blockContent if it's a string and the field expects blockContent
    // But the schema shows 'text' type, so we keep it as is
  }));
}

// Fix growing steps array
function fixGrowingSteps(steps) {
  if (!Array.isArray(steps)) return steps;
  return steps.map((step, idx) => ({
    ...step,
    _key: step._key || `step_${generateKey()}`,
    stepNumber: step.stepNumber || idx + 1,
  }));
}

// Fix troubleshooting array - convert from old format to new schema format (commonProblems)
function fixTroubleshooting(troubleshooting) {
  if (!Array.isArray(troubleshooting)) return null;
  return troubleshooting.map((item, idx) => ({
    _key: item._key || `problem_${generateKey()}`,
    issue: item.problem || item.issue || 'Unknown issue',
    cause: item.cause || '',
    solution: item.solution || '',
    severity: 'moderate', // Default severity
  }));
}

// Fix harvestGuide - convert from object to separate fields
function fixHarvestGuide(harvestGuide) {
  if (!harvestGuide || typeof harvestGuide !== 'object') return null;
  
  const result = {};
  
  // Convert harvestGuide.signs to text
  if (Array.isArray(harvestGuide.signs)) {
    result.harvestingTips = toBlockContent(harvestGuide.signs.join('\n• '));
  }
  
  // Convert harvestGuide.storage to text  
  if (harvestGuide.storage) {
    result.storageTips = toBlockContent(harvestGuide.storage);
  }
  
  // technique goes into harvestingTips as well
  if (harvestGuide.technique) {
    if (result.harvestingTips) {
      result.harvestingTips = toBlockContent(
        harvestGuide.signs?.join('\n• ') + '\n\n' + harvestGuide.technique
      );
    } else {
      result.harvestingTips = toBlockContent(harvestGuide.technique);
    }
  }
  
  return result;
}

// Main fix function for recipes
async function fixRecipes() {
  console.log('\n🔧 Fixing recipes...');
  
  // Fetch all recipes
  const recipes = await client.fetch(`*[_type == "recipe"]`);
  console.log(`   Found ${recipes.length} recipes to fix`);
  
  for (const recipe of recipes) {
    const updates = {};
    const unsets = [];
    let fixCount = 0;
    
    // 1. Fix status field - use 'status' instead of 'isPublished'
    if (recipe.isPublished !== undefined) {
      updates.status = recipe.isPublished ? 'published' : 'draft';
      unsets.push('isPublished');
      fixCount++;
    }
    
    // 2. Remove unknown fields
    if (recipe.mealType !== undefined) {
      unsets.push('mealType');
      fixCount++;
    }
    
    // 3. Fix nutrition carbs → carbohydrates
    if (recipe.nutritionFacts?.carbs !== undefined) {
      updates['nutritionFacts.carbohydrates'] = recipe.nutritionFacts.carbs;
      unsets.push('nutritionFacts.carbs');
      fixCount++;
    }
    
    // 4. Fix description - convert string to blockContent
    if (typeof recipe.description === 'string') {
      updates.description = toBlockContent(recipe.description);
      fixCount++;
    }
    
    // 5. Fix chefNotes - convert string to blockContent
    if (typeof recipe.chefNotes === 'string') {
      updates.chefNotes = toBlockContent(recipe.chefNotes);
      fixCount++;
    }
    
    // 6. Fix ingredientGroups with _key
    if (recipe.ingredientGroups) {
      const fixed = fixIngredientGroups(recipe.ingredientGroups);
      const needsFix = JSON.stringify(fixed) !== JSON.stringify(recipe.ingredientGroups);
      if (needsFix) {
        updates.ingredientGroups = fixed;
        fixCount++;
      }
    }
    
    // 7. Fix instructions with _key
    if (recipe.instructions) {
      const fixed = fixInstructions(recipe.instructions);
      const needsFix = JSON.stringify(fixed) !== JSON.stringify(recipe.instructions);
      if (needsFix) {
        updates.instructions = fixed;
        fixCount++;
      }
    }
    
    // 8. Fix tags array with _key (if they're objects)
    if (recipe.tags) {
      const fixed = fixArrayKeys(recipe.tags, 'tag');
      const needsFix = JSON.stringify(fixed) !== JSON.stringify(recipe.tags);
      if (needsFix) {
        updates.tags = fixed;
        fixCount++;
      }
    }
    
    // 9. Fix equipmentNeeded array
    if (recipe.equipmentNeeded) {
      const fixed = fixArrayKeys(recipe.equipmentNeeded, 'equip');
      const needsFix = JSON.stringify(fixed) !== JSON.stringify(recipe.equipmentNeeded);
      if (needsFix) {
        updates.equipmentNeeded = fixed;
        fixCount++;
      }
    }
    
    // 10. Fix gallery array
    if (recipe.gallery) {
      const fixed = fixArrayKeys(recipe.gallery, 'img');
      const needsFix = JSON.stringify(fixed) !== JSON.stringify(recipe.gallery);
      if (needsFix) {
        updates.gallery = fixed;
        fixCount++;
      }
    }
    
    // 11. Fix additionalVideos array
    if (recipe.additionalVideos) {
      const fixed = fixArrayKeys(recipe.additionalVideos, 'vid');
      const needsFix = JSON.stringify(fixed) !== JSON.stringify(recipe.additionalVideos);
      if (needsFix) {
        updates.additionalVideos = fixed;
        fixCount++;
      }
    }
    
    // Apply updates if there are any
    if (Object.keys(updates).length > 0 || unsets.length > 0) {
      try {
        let patch = client.patch(recipe._id);
        
        if (Object.keys(updates).length > 0) {
          patch = patch.set(updates);
        }
        
        if (unsets.length > 0) {
          patch = patch.unset(unsets);
        }
        
        await patch.commit();
        console.log(`   ✅ Fixed: ${recipe.title} (${fixCount} fields)`);
      } catch (error) {
        console.error(`   ❌ Error fixing ${recipe.title}:`, error.message);
      }
    } else {
      console.log(`   ⏭️ Skipped: ${recipe.title} (no fixes needed)`);
    }
  }
}

// Main fix function for growing guides
async function fixGrowingGuides() {
  console.log('\n🔧 Fixing growing guides...');
  
  // Fetch all growing guides
  const guides = await client.fetch(`*[_type == "growingGuide"]`);
  console.log(`   Found ${guides.length} guides to fix`);
  
  for (const guide of guides) {
    const updates = {};
    const unsets = [];
    let fixCount = 0;
    
    // 1. Fix status field - use 'status' instead of 'isPublished'
    if (guide.isPublished !== undefined) {
      updates.status = guide.isPublished ? 'published' : 'draft';
      unsets.push('isPublished');
      fixCount++;
    }
    
    // 2. Fix description field - schema uses 'excerpt' for short description
    // and 'introduction' for longer content (blockContent)
    if (typeof guide.description === 'string') {
      // If excerpt is empty, use description as excerpt
      if (!guide.excerpt) {
        updates.excerpt = guide.description.substring(0, 160);
      }
      // Also convert to introduction (blockContent)
      if (!guide.introduction) {
        updates.introduction = toBlockContent(guide.description);
      }
      unsets.push('description');
      fixCount++;
    }
    
    // 3. Fix harvestGuide → harvestingTips, storageTips
    if (guide.harvestGuide) {
      const converted = fixHarvestGuide(guide.harvestGuide);
      if (converted) {
        if (converted.harvestingTips && !guide.harvestingTips) {
          updates.harvestingTips = converted.harvestingTips;
        }
        if (converted.storageTips && !guide.storageTips) {
          updates.storageTips = converted.storageTips;
        }
      }
      unsets.push('harvestGuide');
      fixCount++;
    }
    
    // 4. Fix troubleshooting → commonProblems
    if (guide.troubleshooting) {
      const converted = fixTroubleshooting(guide.troubleshooting);
      if (converted && !guide.commonProblems) {
        updates.commonProblems = converted;
      }
      unsets.push('troubleshooting');
      fixCount++;
    }
    
    // 5. Move tags to seoKeywords (if seoKeywords is empty)
    if (guide.tags && !guide.seoKeywords) {
      updates.seoKeywords = guide.tags;
    }
    if (guide.tags !== undefined) {
      unsets.push('tags');
      fixCount++;
    }
    
    // 6. Fix growingSteps with _key
    if (guide.growingSteps) {
      const fixed = fixGrowingSteps(guide.growingSteps);
      const needsFix = JSON.stringify(fixed) !== JSON.stringify(guide.growingSteps);
      if (needsFix) {
        updates.growingSteps = fixed;
        fixCount++;
      }
    }
    
    // 7. Fix suppliesNeeded array
    if (guide.suppliesNeeded) {
      const fixed = fixArrayKeys(guide.suppliesNeeded, 'supply');
      const needsFix = JSON.stringify(fixed) !== JSON.stringify(guide.suppliesNeeded);
      if (needsFix) {
        updates.suppliesNeeded = fixed;
        fixCount++;
      }
    }
    
    // 8. Fix commonProblems array (if exists)
    if (guide.commonProblems) {
      const fixed = fixArrayKeys(guide.commonProblems, 'problem');
      const needsFix = JSON.stringify(fixed) !== JSON.stringify(guide.commonProblems);
      if (needsFix) {
        updates.commonProblems = fixed;
        fixCount++;
      }
    }
    
    // 9. Fix faqSection array
    if (guide.faqSection) {
      const fixed = fixArrayKeys(guide.faqSection, 'faq');
      const needsFix = JSON.stringify(fixed) !== JSON.stringify(guide.faqSection);
      if (needsFix) {
        updates.faqSection = fixed;
        fixCount++;
      }
    }
    
    // 10. Fix additionalVideos array
    if (guide.additionalVideos) {
      const fixed = fixArrayKeys(guide.additionalVideos, 'vid');
      const needsFix = JSON.stringify(fixed) !== JSON.stringify(guide.additionalVideos);
      if (needsFix) {
        updates.additionalVideos = fixed;
        fixCount++;
      }
    }
    
    // 11. Fix introduction if it's a string
    if (typeof guide.introduction === 'string') {
      updates.introduction = toBlockContent(guide.introduction);
      fixCount++;
    }
    
    // 12. Fix harvestingTips if it's a string
    if (typeof guide.harvestingTips === 'string') {
      updates.harvestingTips = toBlockContent(guide.harvestingTips);
      fixCount++;
    }
    
    // 13. Fix storageTips if it's a string
    if (typeof guide.storageTips === 'string') {
      updates.storageTips = toBlockContent(guide.storageTips);
      fixCount++;
    }
    
    // 14. Fix multipleFlushes if it's a string
    if (typeof guide.multipleFlushes === 'string') {
      updates.multipleFlushes = toBlockContent(guide.multipleFlushes);
      fixCount++;
    }
    
    // Apply updates if there are any
    if (Object.keys(updates).length > 0 || unsets.length > 0) {
      try {
        let patch = client.patch(guide._id);
        
        if (Object.keys(updates).length > 0) {
          patch = patch.set(updates);
        }
        
        if (unsets.length > 0) {
          patch = patch.unset(unsets);
        }
        
        await patch.commit();
        console.log(`   ✅ Fixed: ${guide.title} (${fixCount} fields)`);
      } catch (error) {
        console.error(`   ❌ Error fixing ${guide.title}:`, error.message);
      }
    } else {
      console.log(`   ⏭️ Skipped: ${guide.title} (no fixes needed)`);
    }
  }
}

// Verify fixes
async function verifyFixes() {
  console.log('\n📋 Verifying fixes...\n');
  
  // Check recipes
  const recipes = await client.fetch(`*[_type == "recipe"] {
    _id,
    title,
    status,
    "hasIsPublished": defined(isPublished),
    "hasMealType": defined(mealType),
    "descriptionType": typeof(description),
    "ingredientGroupCount": count(ingredientGroups),
    "instructionCount": count(instructions)
  }`);
  
  console.log(`📝 Recipes: ${recipes.length}`);
  recipes.forEach(r => {
    const issues = [];
    if (r.hasIsPublished) issues.push('still has isPublished');
    if (r.hasMealType) issues.push('still has mealType');
    if (r.descriptionType === 'string') issues.push('description is still string');
    
    if (issues.length > 0) {
      console.log(`   ⚠️ ${r.title}: ${issues.join(', ')}`);
    } else {
      console.log(`   ✅ ${r.title} (status: ${r.status || 'no status'})`);
    }
  });
  
  // Check guides
  const guides = await client.fetch(`*[_type == "growingGuide"] {
    _id,
    title,
    status,
    "hasIsPublished": defined(isPublished),
    "hasDescription": defined(description),
    "hasHarvestGuide": defined(harvestGuide),
    "hasTroubleshooting": defined(troubleshooting),
    "hasTags": defined(tags)
  }`);
  
  console.log(`\n🌱 Growing Guides: ${guides.length}`);
  guides.forEach(g => {
    const issues = [];
    if (g.hasIsPublished) issues.push('still has isPublished');
    if (g.hasDescription) issues.push('still has description');
    if (g.hasHarvestGuide) issues.push('still has harvestGuide');
    if (g.hasTroubleshooting) issues.push('still has troubleshooting');
    if (g.hasTags) issues.push('still has tags');
    
    if (issues.length > 0) {
      console.log(`   ⚠️ ${g.title}: ${issues.join(', ')}`);
    } else {
      console.log(`   ✅ ${g.title} (status: ${g.status || 'no status'})`);
    }
  });
}

// Main execution
async function main() {
  console.log('🚀 Starting complete Sanity data fix...');
  console.log('   Project ID:', process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'gerattrr');
  console.log('   Dataset:', process.env.NEXT_PUBLIC_SANITY_DATASET || 'production');
  
  try {
    await fixRecipes();
    await fixGrowingGuides();
    await verifyFixes();
    
    console.log('\n✅ Complete data fix finished!');
    console.log('\n📌 Next steps:');
    console.log('   1. Refresh Sanity Studio to see the fixed data');
    console.log('   2. Refresh http://localhost:3000/blog to see the content');
    console.log('   3. Check individual recipe/guide pages');
  } catch (error) {
    console.error('\n❌ Error during fix:', error);
  }
}

main();
