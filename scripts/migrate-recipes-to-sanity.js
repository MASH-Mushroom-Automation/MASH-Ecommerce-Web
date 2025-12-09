/**
 * Sanity Migration Script: Sample Recipes
 * 
 * This script creates sample mushroom recipes in Sanity CMS
 * with YouTube videos, ingredients linked to products, and step-by-step instructions.
 * 
 * Run: node scripts/migrate-recipes-to-sanity.js
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

// Sample recipes data
const recipes = [
  {
    _type: 'recipe',
    title: 'Crispy Mushroom Chicharon',
    slug: { current: 'crispy-mushroom-chicharon' },
    excerpt: 'Crispy, crunchy mushroom chicharon - the ultimate Filipino snack! Deep-fried oyster mushrooms with a savory coating.',
    description: 'Transform fresh oyster mushrooms into addictive crispy chips. This vegetarian take on the classic Filipino chicharon is perfect as a snack, pulutan, or side dish.',
    difficulty: 'beginner',
    cuisine: 'filipino',
    mealType: ['snack', 'appetizer'],
    prepTime: 15,
    cookTime: 20,
    totalTime: 35,
    servings: 4,
    isPublished: true,
    isFeatured: true,
    youtubeVideo: {
      videoId: 'dQw4w9WgXcQ', // Replace with actual MASH video ID
      title: 'How to Make Crispy Mushroom Chicharon',
      startTime: 0,
      showOnRecipePage: true,
    },
    ingredientGroups: [
      {
        _type: 'ingredientGroup',
        groupName: 'For the Mushrooms',
        ingredients: [
          {
            _type: 'ingredient',
            quantity: '500g',
            name: 'Fresh Oyster Mushrooms',
            preparation: 'torn into strips',
            isOptional: false,
          },
          {
            _type: 'ingredient',
            quantity: '1 cup',
            name: 'All-purpose flour',
            isOptional: false,
          },
          {
            _type: 'ingredient',
            quantity: '1/2 cup',
            name: 'Cornstarch',
            isOptional: false,
          },
          {
            _type: 'ingredient',
            quantity: '1 tsp',
            name: 'Salt',
            isOptional: false,
          },
          {
            _type: 'ingredient',
            quantity: '1/2 tsp',
            name: 'Black pepper',
            isOptional: false,
          },
          {
            _type: 'ingredient',
            quantity: '1 tsp',
            name: 'Garlic powder',
            isOptional: false,
          },
        ],
      },
      {
        _type: 'ingredientGroup',
        groupName: 'For Frying',
        ingredients: [
          {
            _type: 'ingredient',
            quantity: '2 cups',
            name: 'Cooking oil',
            preparation: 'for deep frying',
            isOptional: false,
          },
        ],
      },
    ],
    instructions: [
      {
        _type: 'step',
        stepNumber: 1,
        title: 'Prepare the Mushrooms',
        instruction: 'Clean the oyster mushrooms and tear them into thin strips about 1 inch wide. Pat completely dry with paper towels - this is crucial for achieving maximum crispiness!',
        tip: 'The drier the mushrooms, the crispier they will be. Let them air dry for 10 minutes if needed.',
        duration: 10,
      },
      {
        _type: 'step',
        stepNumber: 2,
        title: 'Make the Coating',
        instruction: 'In a large bowl, mix together the flour, cornstarch, salt, pepper, and garlic powder until well combined.',
        tip: 'Add a pinch of cayenne pepper for a spicy kick!',
        duration: 2,
      },
      {
        _type: 'step',
        stepNumber: 3,
        title: 'Coat the Mushrooms',
        instruction: 'Dredge each mushroom strip in the flour mixture, pressing gently to ensure an even coating. Shake off excess flour.',
        duration: 5,
      },
      {
        _type: 'step',
        stepNumber: 4,
        title: 'Heat the Oil',
        instruction: 'Heat cooking oil in a deep pan or wok to 180°C (350°F). Test by dropping a small piece of flour - it should sizzle immediately.',
        tip: 'Use a thermometer for consistent results. Too hot = burnt coating, too cold = oily mushrooms.',
        duration: 5,
      },
      {
        _type: 'step',
        stepNumber: 5,
        title: 'Fry Until Golden',
        instruction: 'Carefully add mushroom strips in batches. Don\'t overcrowd the pan! Fry for 3-4 minutes until golden brown and crispy, turning occasionally.',
        tip: 'Fry in small batches to maintain oil temperature.',
        duration: 15,
      },
      {
        _type: 'step',
        stepNumber: 6,
        title: 'Drain and Serve',
        instruction: 'Transfer to a wire rack or paper towels to drain excess oil. Season with additional salt while hot. Serve immediately with spiced vinegar dip.',
        tip: 'Best served hot and fresh! Crispiness decreases as it cools.',
        duration: 2,
      },
    ],
    nutritionFacts: {
      calories: 180,
      protein: 6,
      carbs: 22,
      fat: 8,
      fiber: 3,
    },
    chefNotes: 'This recipe works great with any oyster mushroom variety. Blue oyster and king oyster also produce excellent results. For extra crunch, double-dip the mushrooms in the flour mixture.',
    equipmentNeeded: ['Deep frying pan or wok', 'Thermometer', 'Wire rack', 'Paper towels'],
    tags: ['crispy', 'fried', 'snack', 'pulutan', 'vegetarian', 'quick'],
    publishedAt: new Date().toISOString(),
  },
  {
    _type: 'recipe',
    title: 'Garlic Butter Shiitake Mushrooms',
    slug: { current: 'garlic-butter-shiitake' },
    excerpt: 'Simple yet elegant - shiitake mushrooms sautéed in garlic butter. Ready in 15 minutes!',
    description: 'A quick and delicious side dish featuring fresh shiitake mushrooms cooked in aromatic garlic butter. Perfect as a side for steak, rice, or pasta.',
    difficulty: 'beginner',
    cuisine: 'asian-fusion',
    mealType: ['side-dish', 'appetizer'],
    prepTime: 5,
    cookTime: 10,
    totalTime: 15,
    servings: 2,
    isPublished: true,
    isFeatured: true,
    youtubeVideo: {
      videoId: 'oHg5SJYRHA0', // Replace with actual MASH video ID
      title: 'Quick Garlic Butter Shiitake Recipe',
      startTime: 0,
      showOnRecipePage: true,
    },
    ingredientGroups: [
      {
        _type: 'ingredientGroup',
        ingredients: [
          {
            _type: 'ingredient',
            quantity: '200g',
            name: 'Fresh Shiitake Mushrooms',
            preparation: 'stems removed, caps sliced',
            isOptional: false,
          },
          {
            _type: 'ingredient',
            quantity: '3 tbsp',
            name: 'Butter',
            isOptional: false,
          },
          {
            _type: 'ingredient',
            quantity: '4 cloves',
            name: 'Garlic',
            preparation: 'minced',
            isOptional: false,
          },
          {
            _type: 'ingredient',
            quantity: '2 tbsp',
            name: 'Soy sauce',
            isOptional: false,
          },
          {
            _type: 'ingredient',
            quantity: '1 tbsp',
            name: 'Fresh parsley',
            preparation: 'chopped',
            isOptional: true,
          },
          {
            _type: 'ingredient',
            quantity: 'to taste',
            name: 'Salt and pepper',
            isOptional: false,
          },
        ],
      },
    ],
    instructions: [
      {
        _type: 'step',
        stepNumber: 1,
        title: 'Prep the Mushrooms',
        instruction: 'Remove the stems from the shiitake mushrooms (save for stock!). Slice the caps into 1/4 inch thick slices.',
        duration: 3,
      },
      {
        _type: 'step',
        stepNumber: 2,
        title: 'Melt the Butter',
        instruction: 'Melt butter in a large skillet over medium-high heat until it starts to foam.',
        duration: 1,
      },
      {
        _type: 'step',
        stepNumber: 3,
        title: 'Sauté the Mushrooms',
        instruction: 'Add mushrooms in a single layer. Let them cook undisturbed for 2-3 minutes until golden brown on one side. Flip and cook another 2 minutes.',
        tip: 'Don\'t stir too often! Let them develop a nice sear.',
        duration: 5,
      },
      {
        _type: 'step',
        stepNumber: 4,
        title: 'Add Garlic',
        instruction: 'Push mushrooms to the side, add minced garlic to the empty space. Sauté for 30 seconds until fragrant, then mix everything together.',
        tip: 'Adding garlic at the end prevents burning.',
        duration: 1,
      },
      {
        _type: 'step',
        stepNumber: 5,
        title: 'Season and Serve',
        instruction: 'Add soy sauce, salt, and pepper. Toss to coat. Remove from heat, garnish with parsley, and serve immediately.',
        duration: 1,
      },
    ],
    nutritionFacts: {
      calories: 220,
      protein: 5,
      carbs: 8,
      fat: 18,
      fiber: 2,
    },
    chefNotes: 'For extra umami, add a splash of mirin or white wine. This dish pairs beautifully with grilled meats or simple steamed rice.',
    equipmentNeeded: ['Large skillet', 'Spatula'],
    tags: ['quick', 'easy', 'side-dish', 'garlic', 'butter', 'umami'],
    publishedAt: new Date().toISOString(),
  },
  {
    _type: 'recipe',
    title: 'Creamy Mushroom Pasta',
    slug: { current: 'creamy-mushroom-pasta' },
    excerpt: 'Restaurant-quality creamy mushroom pasta made at home. Rich, savory, and absolutely delicious!',
    description: 'A luxurious pasta dish featuring a medley of fresh mushrooms in a creamy garlic parmesan sauce. Perfect for date night or when you want to impress.',
    difficulty: 'intermediate',
    cuisine: 'italian',
    mealType: ['main-course', 'dinner'],
    prepTime: 15,
    cookTime: 25,
    totalTime: 40,
    servings: 4,
    isPublished: true,
    isFeatured: false,
    youtubeVideo: {
      videoId: 'M7lc1UVf-VE', // Replace with actual MASH video ID
      title: 'Creamy Mushroom Pasta Tutorial',
      startTime: 0,
      showOnRecipePage: true,
    },
    ingredientGroups: [
      {
        _type: 'ingredientGroup',
        groupName: 'Pasta',
        ingredients: [
          {
            _type: 'ingredient',
            quantity: '400g',
            name: 'Fettuccine or Penne',
            isOptional: false,
          },
        ],
      },
      {
        _type: 'ingredientGroup',
        groupName: 'Mushroom Sauce',
        ingredients: [
          {
            _type: 'ingredient',
            quantity: '300g',
            name: 'Mixed Fresh Mushrooms',
            preparation: 'sliced (oyster, shiitake, button)',
            isOptional: false,
          },
          {
            _type: 'ingredient',
            quantity: '4 tbsp',
            name: 'Butter',
            isOptional: false,
          },
          {
            _type: 'ingredient',
            quantity: '5 cloves',
            name: 'Garlic',
            preparation: 'minced',
            isOptional: false,
          },
          {
            _type: 'ingredient',
            quantity: '1 cup',
            name: 'Heavy cream',
            isOptional: false,
          },
          {
            _type: 'ingredient',
            quantity: '1/2 cup',
            name: 'Parmesan cheese',
            preparation: 'grated',
            isOptional: false,
          },
          {
            _type: 'ingredient',
            quantity: '1/4 cup',
            name: 'White wine',
            isOptional: true,
            substitutes: ['chicken broth', 'pasta water'],
          },
          {
            _type: 'ingredient',
            quantity: '1 tsp',
            name: 'Fresh thyme',
            preparation: 'chopped',
            isOptional: true,
          },
        ],
      },
    ],
    instructions: [
      {
        _type: 'step',
        stepNumber: 1,
        title: 'Cook the Pasta',
        instruction: 'Bring a large pot of salted water to boil. Cook pasta according to package directions until al dente. Reserve 1 cup pasta water before draining.',
        duration: 12,
      },
      {
        _type: 'step',
        stepNumber: 2,
        title: 'Sauté Mushrooms',
        instruction: 'In a large pan, melt 2 tbsp butter over high heat. Add mushrooms and cook without stirring for 3-4 minutes until golden. Season with salt and pepper.',
        tip: 'High heat and no stirring = perfect caramelization',
        duration: 5,
      },
      {
        _type: 'step',
        stepNumber: 3,
        title: 'Add Aromatics',
        instruction: 'Add remaining butter and garlic. Cook for 1 minute. Pour in white wine (if using) and let it reduce by half.',
        duration: 2,
      },
      {
        _type: 'step',
        stepNumber: 4,
        title: 'Make the Cream Sauce',
        instruction: 'Reduce heat to medium-low. Pour in heavy cream and bring to a gentle simmer. Cook for 3-4 minutes until slightly thickened.',
        duration: 4,
      },
      {
        _type: 'step',
        stepNumber: 5,
        title: 'Combine and Serve',
        instruction: 'Add drained pasta to the sauce. Toss well, adding pasta water as needed for desired consistency. Remove from heat, stir in parmesan and thyme. Serve immediately.',
        tip: 'Pasta water helps the sauce cling to the noodles',
        duration: 3,
      },
    ],
    nutritionFacts: {
      calories: 580,
      protein: 18,
      carbs: 52,
      fat: 34,
      fiber: 4,
    },
    chefNotes: 'Using a variety of mushroom types creates layers of flavor and texture. King oyster adds meatiness, shiitake brings umami, and oyster mushrooms provide a delicate touch.',
    equipmentNeeded: ['Large pot', 'Large skillet', 'Colander'],
    tags: ['pasta', 'creamy', 'dinner', 'comfort-food', 'vegetarian', 'date-night'],
    publishedAt: new Date().toISOString(),
  },
  {
    _type: 'recipe',
    title: 'Mushroom Adobo',
    slug: { current: 'mushroom-adobo' },
    excerpt: 'The beloved Filipino adobo, reimagined with hearty mushrooms. Savory, tangy, and perfect with rice!',
    description: 'A vegetarian twist on the Filipino classic. Mushrooms absorb the delicious adobo sauce perfectly, making this dish just as satisfying as the traditional version.',
    difficulty: 'beginner',
    cuisine: 'filipino',
    mealType: ['main-course', 'lunch', 'dinner'],
    prepTime: 10,
    cookTime: 25,
    totalTime: 35,
    servings: 4,
    isPublished: true,
    isFeatured: true,
    ingredientGroups: [
      {
        _type: 'ingredientGroup',
        ingredients: [
          {
            _type: 'ingredient',
            quantity: '500g',
            name: 'Mixed Fresh Mushrooms',
            preparation: 'quartered or halved',
            isOptional: false,
          },
          {
            _type: 'ingredient',
            quantity: '1/2 cup',
            name: 'Soy sauce',
            isOptional: false,
          },
          {
            _type: 'ingredient',
            quantity: '1/3 cup',
            name: 'White vinegar',
            isOptional: false,
          },
          {
            _type: 'ingredient',
            quantity: '1 head',
            name: 'Garlic',
            preparation: 'crushed',
            isOptional: false,
          },
          {
            _type: 'ingredient',
            quantity: '3',
            name: 'Bay leaves',
            isOptional: false,
          },
          {
            _type: 'ingredient',
            quantity: '1 tsp',
            name: 'Whole black peppercorns',
            isOptional: false,
          },
          {
            _type: 'ingredient',
            quantity: '1 cup',
            name: 'Water',
            isOptional: false,
          },
          {
            _type: 'ingredient',
            quantity: '2 tbsp',
            name: 'Cooking oil',
            isOptional: false,
          },
        ],
      },
    ],
    instructions: [
      {
        _type: 'step',
        stepNumber: 1,
        title: 'Combine the Braising Liquid',
        instruction: 'In a pot, combine soy sauce, vinegar, water, crushed garlic, bay leaves, and peppercorns. Bring to a boil.',
        tip: 'Don\'t stir while vinegar is simmering to prevent it from becoming too sour.',
        duration: 5,
      },
      {
        _type: 'step',
        stepNumber: 2,
        title: 'Add Mushrooms',
        instruction: 'Add the mushrooms to the pot. Reduce heat to medium-low, cover, and simmer for 15-20 minutes until mushrooms are tender and have absorbed the flavors.',
        duration: 18,
      },
      {
        _type: 'step',
        stepNumber: 3,
        title: 'Reduce the Sauce',
        instruction: 'Remove cover and increase heat to medium. Let the sauce reduce until slightly thickened, about 5 minutes.',
        duration: 5,
      },
      {
        _type: 'step',
        stepNumber: 4,
        title: 'Optional: Pan Fry',
        instruction: 'For extra texture, remove mushrooms and pan-fry in oil until edges are crispy. Return to sauce.',
        tip: 'This step is optional but adds amazing texture contrast!',
        duration: 5,
      },
      {
        _type: 'step',
        stepNumber: 5,
        title: 'Serve',
        instruction: 'Serve hot over steamed rice. Spoon extra sauce over the rice.',
        duration: 1,
      },
    ],
    nutritionFacts: {
      calories: 120,
      protein: 6,
      carbs: 12,
      fat: 6,
      fiber: 3,
    },
    chefNotes: 'King oyster mushrooms work especially well here due to their meaty texture. You can also add tofu or boiled eggs for extra protein.',
    equipmentNeeded: ['Large pot with lid', 'Skillet (optional)'],
    tags: ['adobo', 'filipino', 'vegetarian', 'comfort-food', 'one-pot', 'rice'],
    publishedAt: new Date().toISOString(),
  },
  {
    _type: 'recipe',
    title: 'Mushroom Sisig',
    slug: { current: 'mushroom-sisig' },
    excerpt: 'Sizzling mushroom sisig - all the flavor of the classic pulutan, made vegetarian!',
    description: 'A vegetarian version of the famous Filipino sisig. Finely chopped mushrooms with onions, chili, and calamansi, served on a sizzling plate with an egg on top.',
    difficulty: 'intermediate',
    cuisine: 'filipino',
    mealType: ['appetizer', 'pulutan'],
    prepTime: 15,
    cookTime: 20,
    totalTime: 35,
    servings: 4,
    isPublished: true,
    isFeatured: false,
    ingredientGroups: [
      {
        _type: 'ingredientGroup',
        ingredients: [
          {
            _type: 'ingredient',
            quantity: '400g',
            name: 'Fresh Oyster Mushrooms',
            preparation: 'finely chopped',
            isOptional: false,
          },
          {
            _type: 'ingredient',
            quantity: '100g',
            name: 'Shiitake Mushrooms',
            preparation: 'finely chopped',
            isOptional: false,
          },
          {
            _type: 'ingredient',
            quantity: '1 large',
            name: 'Onion',
            preparation: 'finely diced',
            isOptional: false,
          },
          {
            _type: 'ingredient',
            quantity: '4',
            name: 'Calamansi',
            preparation: 'juiced',
            isOptional: false,
            substitutes: ['lime juice'],
          },
          {
            _type: 'ingredient',
            quantity: '3 tbsp',
            name: 'Mayonnaise',
            isOptional: false,
          },
          {
            _type: 'ingredient',
            quantity: '2 tbsp',
            name: 'Soy sauce',
            isOptional: false,
          },
          {
            _type: 'ingredient',
            quantity: '3-5',
            name: 'Bird\'s eye chili',
            preparation: 'chopped',
            isOptional: true,
          },
          {
            _type: 'ingredient',
            quantity: '1',
            name: 'Egg',
            preparation: 'for topping',
            isOptional: true,
          },
        ],
      },
    ],
    instructions: [
      {
        _type: 'step',
        stepNumber: 1,
        title: 'Prepare Mushrooms',
        instruction: 'Finely chop all mushrooms to resemble the texture of traditional sisig. Pat dry with paper towels.',
        duration: 10,
      },
      {
        _type: 'step',
        stepNumber: 2,
        title: 'Sauté Mushrooms',
        instruction: 'Heat oil in a cast iron skillet or sizzling plate. Cook mushrooms over high heat, stirring occasionally, until golden and slightly crispy, about 8-10 minutes.',
        tip: 'Don\'t overcrowd the pan. Cook in batches if needed.',
        duration: 10,
      },
      {
        _type: 'step',
        stepNumber: 3,
        title: 'Add Onions',
        instruction: 'Add diced onions and continue cooking for 2-3 minutes until onions are slightly softened but still have some crunch.',
        duration: 3,
      },
      {
        _type: 'step',
        stepNumber: 4,
        title: 'Season',
        instruction: 'Add soy sauce, mayonnaise, calamansi juice, and chili. Mix well and cook for another 2 minutes.',
        duration: 2,
      },
      {
        _type: 'step',
        stepNumber: 5,
        title: 'Serve Sizzling',
        instruction: 'Crack an egg on top while still sizzling. Serve immediately with extra calamansi on the side.',
        tip: 'Mix the egg into the sisig as you eat for extra creaminess!',
        duration: 1,
      },
    ],
    nutritionFacts: {
      calories: 165,
      protein: 7,
      carbs: 10,
      fat: 12,
      fiber: 3,
    },
    chefNotes: 'For authentic sisig flavor, use chicken liver pâté instead of regular mayo. The key is getting the mushrooms nice and crispy before adding the sauce.',
    equipmentNeeded: ['Cast iron skillet or sizzling plate', 'Sharp knife'],
    tags: ['sisig', 'filipino', 'vegetarian', 'pulutan', 'sizzling', 'spicy'],
    publishedAt: new Date().toISOString(),
  },
];

async function migrateRecipes() {
  console.log('🍳 Starting recipe migration to Sanity...\n');

  for (const recipe of recipes) {
    try {
      console.log(`Creating recipe: "${recipe.title}"...`);
      
      // Check if recipe already exists
      const existing = await client.fetch(
        `*[_type == "recipe" && slug.current == $slug][0]._id`,
        { slug: recipe.slug.current }
      );

      if (existing) {
        console.log(`  ⚠️ Recipe already exists, skipping.`);
        continue;
      }

      const result = await client.create(recipe);
      console.log(`  ✅ Created: ${result._id}`);
    } catch (error) {
      console.error(`  ❌ Error creating "${recipe.title}":`, error.message);
    }
  }

  console.log('\n✨ Recipe migration complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Open Sanity Studio (cd studio && npm run dev)');
  console.log('2. Add images to each recipe');
  console.log('3. Link ingredients to actual products');
  console.log('4. Replace placeholder YouTube video IDs with real ones');
  console.log('5. Add related products and recipes');
}

migrateRecipes().catch(console.error);
