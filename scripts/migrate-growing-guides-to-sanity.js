/**
 * Sanity Migration Script: Growing Guides
 * 
 * This script creates sample mushroom growing guides in Sanity CMS
 * with YouTube videos, step-by-step instructions, and troubleshooting tips.
 * 
 * Run: node scripts/migrate-growing-guides-to-sanity.js
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

// Sample growing guides data
const growingGuides = [
  {
    _type: 'growingGuide',
    title: 'Oyster Mushroom Growing Kit - Complete Guide',
    slug: { current: 'oyster-mushroom-growing-guide' },
    description: 'Learn how to grow delicious oyster mushrooms at home with our easy-to-use growing kit. Perfect for beginners - harvest in just 7-14 days!',
    mushroomType: 'oyster',
    difficulty: 'beginner',
    isPublished: true,
    isFeatured: true,
    timeToFirstHarvest: '7-14 days',
    harvestWindow: '2-3 flushes over 4-6 weeks',
    expectedYield: '300-600g per kit',
    youtubeVideo: {
      videoId: 'dQw4w9WgXcQ', // Replace with actual MASH video ID
      title: 'How to Grow Oyster Mushrooms at Home',
      startTime: 0,
      showOnGuidePage: true,
    },
    idealConditions: {
      temperature: '18-24°C (65-75°F)',
      humidity: '80-90%',
      light: 'Indirect light, 4-8 hours daily',
      airflow: 'Fresh air exchange 2-3 times daily',
    },
    suppliesNeeded: [
      'Spray bottle with clean water',
      'Humidity tent (included)',
      'Sharp knife or scissors',
      'Paper towels',
    ],
    growingSteps: [
      {
        _type: 'step',
        stepNumber: 1,
        day: 'Day 1',
        title: 'Unbox Your Kit',
        instruction: 'Carefully remove the growing kit from the packaging. The kit contains a colonized substrate block in a plastic bag. Do not remove the block from the bag.',
        tip: 'Check that the mycelium (white fuzzy growth) covers most of the block. Some green or blue patches are normal, but large areas of contamination mean the kit should be replaced.',
        duration: '5 minutes',
      },
      {
        _type: 'step',
        stepNumber: 2,
        day: 'Day 1',
        title: 'Create the Opening',
        instruction: 'Using a sharp knife or scissors, cut an X-shaped slit (about 5cm) on the side of the bag where you see the most white mycelium. This is where your mushrooms will grow from.',
        tip: 'Make the cut at eye level when the kit is standing - this makes misting and monitoring easier.',
        duration: '2 minutes',
      },
      {
        _type: 'step',
        stepNumber: 3,
        day: 'Day 1',
        title: 'Set Up Location',
        instruction: 'Place your kit in a location with indirect light. Avoid direct sunlight, heating vents, and drafty areas. A kitchen counter or bathroom shelf works great!',
        tip: 'Bathrooms are often ideal due to naturally higher humidity.',
        duration: '5 minutes',
      },
      {
        _type: 'step',
        stepNumber: 4,
        day: 'Days 2-7',
        title: 'Daily Misting',
        instruction: 'Mist the opening and surrounding area 2-3 times daily with clean water. Keep the humidity tent over the kit, opening it briefly during misting for fresh air exchange.',
        tip: 'Use filtered or bottled water if your tap water is heavily chlorinated. Mist the air around the opening, not directly on the substrate.',
        duration: '2 minutes, 3x daily',
      },
      {
        _type: 'step',
        stepNumber: 5,
        day: 'Days 5-10',
        title: 'Watch for Pins',
        instruction: 'Look for tiny mushroom pins (baby mushrooms) forming at the opening. They look like small white bumps. Once pins appear, increase misting frequency slightly.',
        tip: 'Pins can appear as early as day 3 or as late as day 14. Patience is key!',
        duration: 'Observation',
      },
      {
        _type: 'step',
        stepNumber: 6,
        day: 'Days 10-14',
        title: 'Rapid Growth Phase',
        instruction: 'Mushrooms grow quickly once pinning starts! They can double in size daily. Continue misting and ensure good air circulation.',
        tip: 'If caps look dry or cracked, increase misting. If they\'re slimy or soggy, improve ventilation.',
        duration: '2 minutes, 3x daily',
      },
      {
        _type: 'step',
        stepNumber: 7,
        day: 'Days 12-16',
        title: 'Harvest Time!',
        instruction: 'Harvest when cap edges begin to flatten or curl slightly upward. Twist and pull the entire cluster gently, or cut at the base with a sharp knife.',
        tip: 'Harvest before the caps fully flatten for best texture and shelf life.',
        duration: '5 minutes',
      },
      {
        _type: 'step',
        stepNumber: 8,
        day: 'After Harvest',
        title: 'Prepare for Next Flush',
        instruction: 'After harvesting, let the kit rest for 1-2 days without misting. Then soak the entire block in cool water for 6-12 hours, drain, and resume misting for the next flush.',
        tip: 'Most kits produce 2-4 flushes. Each subsequent flush may be smaller than the first.',
        duration: 'Rest period',
      },
    ],
    troubleshooting: [
      {
        problem: 'No pins after 2 weeks',
        cause: 'Temperature too cold/hot, insufficient humidity, or lack of fresh air',
        solution: 'Check that temperature is 18-24°C. Increase misting frequency. Open humidity tent more often for air exchange. Be patient - some kits take up to 3 weeks.',
      },
      {
        problem: 'Green or black mold appearing',
        cause: 'Contamination from spores in the environment or excessive moisture',
        solution: 'If small area, try removing affected portion with a clean knife. If widespread, the kit may be compromised. Ensure clean hands and tools when handling.',
      },
      {
        problem: 'Mushrooms are dry and cracking',
        cause: 'Humidity too low',
        solution: 'Increase misting frequency to 4-5 times daily. Ensure humidity tent is properly positioned. Consider adding a shallow dish of water near the kit.',
      },
      {
        problem: 'Long thin stems with tiny caps',
        cause: 'Not enough light or insufficient fresh air',
        solution: 'Move to brighter location (indirect light). Open humidity tent more frequently for better air exchange. Mushrooms stretch toward light and CO2 causes elongated stems.',
      },
      {
        problem: 'Slimy or soggy mushrooms',
        cause: 'Too much moisture, poor air circulation',
        solution: 'Reduce misting frequency. Improve ventilation by opening tent more often. Pat mushrooms dry gently if already waterlogged.',
      },
      {
        problem: 'Mushrooms smell bad',
        cause: 'Bacterial contamination, usually from overwatering',
        solution: 'Unfortunately, if mushrooms smell off, they should not be eaten. Reduce watering for future flushes and ensure proper drainage.',
      },
    ],
    harvestGuide: {
      signs: [
        'Cap edges beginning to flatten or curl upward',
        'Caps are 5-10cm in diameter',
        'Gills are visible and well-formed',
        'Color is characteristic of variety (grey, pink, yellow, etc.)',
      ],
      technique: 'Grasp the entire cluster at the base and twist while pulling gently. The cluster should come away cleanly. Alternatively, use a sharp knife to cut at the base. Avoid leaving stumps which can attract contamination.',
      storage: 'Store fresh oyster mushrooms in a paper bag in the refrigerator for up to 1 week. Do not wash until ready to use. For longer storage, dry them in a dehydrator or oven on low heat.',
    },
    tags: ['oyster', 'beginner', 'indoor', 'kit', 'quick-growing'],
    publishedAt: new Date().toISOString(),
  },
  {
    _type: 'growingGuide',
    title: 'Shiitake Mushroom Growing Kit - Complete Guide',
    slug: { current: 'shiitake-mushroom-growing-guide' },
    description: 'Grow gourmet shiitake mushrooms at home! This guide covers everything from setup to harvest for our premium shiitake growing kits.',
    mushroomType: 'shiitake',
    difficulty: 'intermediate',
    isPublished: true,
    isFeatured: true,
    timeToFirstHarvest: '10-21 days',
    harvestWindow: '3-4 flushes over 8-12 weeks',
    expectedYield: '400-800g per kit',
    youtubeVideo: {
      videoId: 'oHg5SJYRHA0', // Replace with actual MASH video ID
      title: 'Shiitake Mushroom Growing Tutorial',
      startTime: 0,
      showOnGuidePage: true,
    },
    idealConditions: {
      temperature: '16-22°C (60-72°F)',
      humidity: '85-95%',
      light: 'Indirect light, 6-10 hours daily',
      airflow: 'Moderate fresh air, avoid drafts',
    },
    suppliesNeeded: [
      'Spray bottle with clean water',
      'Humidity tent or plastic bag',
      'Sharp knife',
      'Container for soaking',
      'Thermometer (optional)',
    ],
    growingSteps: [
      {
        _type: 'step',
        stepNumber: 1,
        day: 'Day 1',
        title: 'Inspect Your Kit',
        instruction: 'Remove the shiitake block from packaging. The block should be firm and covered in brown "skin" (mycelium casing). Some white patches are normal. Check for any off smells or green mold.',
        tip: 'Shiitake blocks have a distinctive earthy smell - this is normal and indicates healthy mycelium.',
        duration: '5 minutes',
      },
      {
        _type: 'step',
        stepNumber: 2,
        day: 'Day 1',
        title: 'Initial Soak (Cold Shock)',
        instruction: 'Submerge the entire block in cold water (10-15°C) for 12-24 hours. Use a weight to keep it submerged. This "cold shock" triggers fruiting.',
        tip: 'Adding ice to the water helps achieve the cold shock effect, especially in warm climates.',
        duration: '12-24 hours',
      },
      {
        _type: 'step',
        stepNumber: 3,
        day: 'Day 2',
        title: 'Position the Block',
        instruction: 'Remove from water and let drain for 30 minutes. Place in a humid location with indirect light. The block can sit on a plate or tray to catch excess water.',
        tip: 'A bathroom shelf or kitchen counter away from the stove works well.',
        duration: '30 minutes + setup',
      },
      {
        _type: 'step',
        stepNumber: 4,
        day: 'Days 3-10',
        title: 'Maintain Humidity',
        instruction: 'Cover with a humidity tent or loosely with plastic. Mist the block and inside of the tent 2-3 times daily. The surface should stay moist but not waterlogged.',
        tip: 'If you see white fuzzy growth (aerial mycelium), increase fresh air exchange.',
        duration: '5 minutes, 3x daily',
      },
      {
        _type: 'step',
        stepNumber: 5,
        day: 'Days 7-14',
        title: 'Watch for Pins',
        instruction: 'Look for small brown bumps forming on the block surface. These are shiitake primordia (baby mushrooms). They may appear on any surface of the block.',
        tip: 'Shiitake pins look different from oyster pins - they\'re brown and rounded, not white.',
        duration: 'Observation',
      },
      {
        _type: 'step',
        stepNumber: 6,
        day: 'Days 14-21',
        title: 'Mushroom Development',
        instruction: 'As mushrooms grow, continue misting but allow for more air circulation. Shiitakes develop slowly but steadily, forming the characteristic brown caps with white edges.',
        tip: 'The crackled pattern on shiitake caps (called "flower pattern") develops with good temperature fluctuation between day and night.',
        duration: '5 minutes, 2x daily',
      },
      {
        _type: 'step',
        stepNumber: 7,
        day: 'Days 18-25',
        title: 'Harvest',
        instruction: 'Harvest when caps are 70-80% open and edges are still slightly curled under. Cut at the stem base with a sharp knife, leaving no stump.',
        tip: 'Shiitake stems are woody - trim them short or use for stock.',
        duration: '10 minutes',
      },
      {
        _type: 'step',
        stepNumber: 8,
        day: 'After Harvest',
        title: 'Rest and Repeat',
        instruction: 'Let the block rest for 2-3 weeks, misting only once or twice weekly. Then repeat the cold soak process to trigger the next flush.',
        tip: 'Shiitake blocks can produce 3-4 flushes over several months with proper care.',
        duration: 'Rest period',
      },
    ],
    troubleshooting: [
      {
        problem: 'Block is soft or mushy',
        cause: 'Over-watering or bacterial contamination',
        solution: 'Reduce misting frequency. Allow more air circulation. If foul smell develops, the block may be compromised.',
      },
      {
        problem: 'No fruiting after 3 weeks',
        cause: 'Insufficient cold shock or temperature too warm',
        solution: 'Try another cold soak with ice water for 24 hours. Ensure environment is 16-22°C. Sometimes blocks need more time to mature.',
      },
      {
        problem: 'Mushrooms cracking on top',
        cause: 'Humidity too low',
        solution: 'Increase misting frequency. Ensure humidity tent is properly sealed. Add a small dish of water near the block.',
      },
      {
        problem: 'Mushrooms growing from bottom only',
        cause: 'Light direction or humidity patterns',
        solution: 'Rotate the block 90 degrees every few days for even growth. Ensure indirect light reaches all sides.',
      },
      {
        problem: 'Green mold on block',
        cause: 'Trichoderma contamination',
        solution: 'Try removing affected area with clean knife. If contamination spreads, the block may be compromised. Improve air circulation.',
      },
    ],
    harvestGuide: {
      signs: [
        'Cap is 5-8cm in diameter',
        'Edges of cap still slightly curled under',
        'Cap color is rich brown with possible cracking pattern',
        'Gills underneath are visible and tan/cream colored',
      ],
      technique: 'Cut stems close to the block with a sharp knife. Shiitakes can also be twisted off, but cutting is cleaner. Harvest in the morning for best shelf life.',
      storage: 'Fresh shiitakes keep 1-2 weeks refrigerated in a paper bag. They dry exceptionally well - slice and dehydrate at 50°C (120°F) for 6-8 hours.',
    },
    tags: ['shiitake', 'intermediate', 'indoor', 'gourmet', 'kit'],
    publishedAt: new Date().toISOString(),
  },
  {
    _type: 'growingGuide',
    title: 'Lion\'s Mane Growing Kit - Complete Guide',
    slug: { current: 'lions-mane-growing-guide' },
    description: 'Grow brain-boosting lion\'s mane mushrooms at home! This unique mushroom looks like a white pom-pom and has amazing health benefits.',
    mushroomType: 'lions-mane',
    difficulty: 'intermediate',
    isPublished: true,
    isFeatured: true,
    timeToFirstHarvest: '10-21 days',
    harvestWindow: '2-3 flushes over 4-8 weeks',
    expectedYield: '200-500g per kit',
    youtubeVideo: {
      videoId: 'M7lc1UVf-VE', // Replace with actual MASH video ID
      title: 'Lion\'s Mane Growing Guide',
      startTime: 0,
      showOnGuidePage: true,
    },
    idealConditions: {
      temperature: '18-24°C (65-75°F)',
      humidity: '85-95%',
      light: 'Low indirect light, 4-6 hours daily',
      airflow: 'Good fresh air exchange, critical for proper development',
    },
    suppliesNeeded: [
      'Spray bottle with clean water',
      'Humidity tent or large plastic bag',
      'Sharp knife',
      'Humidifier (optional but helpful)',
    ],
    growingSteps: [
      {
        _type: 'step',
        stepNumber: 1,
        day: 'Day 1',
        title: 'Unbox and Inspect',
        instruction: 'Remove the lion\'s mane block from packaging. It should be fully colonized with white mycelium. Some blocks may already show small white bumps indicating readiness to fruit.',
        tip: 'Lion\'s mane blocks are often ready to fruit immediately upon arrival.',
        duration: '5 minutes',
      },
      {
        _type: 'step',
        stepNumber: 2,
        day: 'Day 1',
        title: 'Create Growing Opening',
        instruction: 'Cut a 5-7cm X or circular opening in the bag. Unlike oyster mushrooms, lion\'s mane benefits from a larger opening for its unique growth form.',
        tip: 'One large fruit body from one opening is typical - don\'t expect clusters like oysters.',
        duration: '2 minutes',
      },
      {
        _type: 'step',
        stepNumber: 3,
        day: 'Day 1',
        title: 'Set Up Humidity Chamber',
        instruction: 'Place the kit in a humidity tent or cover with a large plastic bag with holes for air. Lion\'s mane requires consistently high humidity (85-95%).',
        tip: 'A small humidifier or ultrasonic fogger dramatically improves results.',
        duration: '10 minutes',
      },
      {
        _type: 'step',
        stepNumber: 4,
        day: 'Days 2-7',
        title: 'Heavy Misting',
        instruction: 'Mist 3-4 times daily, focusing on the air and inside of the tent rather than directly on the block. Lion\'s mane is very sensitive to humidity.',
        tip: 'If using a humidifier, aim for 90% humidity. Check with a hygrometer if possible.',
        duration: '3 minutes, 4x daily',
      },
      {
        _type: 'step',
        stepNumber: 5,
        day: 'Days 5-10',
        title: 'Initial Growth',
        instruction: 'A white, bumpy mass will emerge from the opening. This will develop into the characteristic "teeth" or "spines" of lion\'s mane.',
        tip: 'If the growth is compact and doesn\'t develop teeth, increase fresh air exchange.',
        duration: 'Observation',
      },
      {
        _type: 'step',
        stepNumber: 6,
        day: 'Days 10-18',
        title: 'Teeth Development',
        instruction: 'Long white spines (teeth) will grow downward, giving the mushroom its lion\'s mane appearance. Continue high humidity and good airflow.',
        tip: 'The "teeth" should be 1-2cm long for optimal harvest. Longer teeth indicate over-maturity.',
        duration: '3 minutes misting, 3x daily',
      },
      {
        _type: 'step',
        stepNumber: 7,
        day: 'Days 14-21',
        title: 'Harvest',
        instruction: 'Harvest when the mushroom is white and teeth are well-developed (1-2cm). Cut at the base where it meets the substrate. Do not wait until it yellows.',
        tip: 'Lion\'s mane should be pure white. Yellowing indicates over-maturity or stress.',
        duration: '5 minutes',
      },
      {
        _type: 'step',
        stepNumber: 8,
        day: 'After Harvest',
        title: 'Prepare for Next Flush',
        instruction: 'Let the kit rest for 5-7 days with reduced misting. Then increase humidity again to trigger the next flush. May produce 2-3 flushes total.',
        tip: 'Second flush often produces from a different spot on the block.',
        duration: 'Rest period',
      },
    ],
    troubleshooting: [
      {
        problem: 'Growth is compact/coral-like without teeth',
        cause: 'Insufficient fresh air, CO2 buildup',
        solution: 'Dramatically increase air circulation. Open tent more frequently. Add a small fan for air movement (not directly on mushroom).',
      },
      {
        problem: 'Mushroom is yellowing',
        cause: 'Over-maturity, drying out, or stress',
        solution: 'Harvest immediately if yellowing. For future: increase humidity and harvest earlier. Some yellowing is caused by age - harvest before this happens.',
      },
      {
        problem: 'No growth after 2 weeks',
        cause: 'Block not mature or conditions not optimal',
        solution: 'Check humidity is 85%+. Ensure temperature is 18-24°C. Some blocks need more time to initiate. Be patient and maintain conditions.',
      },
      {
        problem: 'Brown spots on mushroom',
        cause: 'Bacterial contamination, usually from overwatering',
        solution: 'Mist the air, not directly on the mushroom. Improve air circulation. Brown spots don\'t affect edibility but affect appearance.',
      },
      {
        problem: 'Mushroom is very small',
        cause: 'Low humidity, insufficient nutrients, or aged block',
        solution: 'Increase humidity. Second and third flushes are typically smaller. Ensure block is from reputable source.',
      },
    ],
    harvestGuide: {
      signs: [
        'Overall size is baseball to softball sized',
        'Color is pure white (not yellow or brown)',
        'Teeth/spines are 1-2cm long',
        'Texture is firm, not soft or mushy',
      ],
      technique: 'Cut at the base where mushroom meets substrate. Lion\'s mane bruises easily, so handle gently. The entire mushroom is edible.',
      storage: 'Use within 5-7 days refrigerated in a paper bag. Lion\'s mane does not store as long as other mushrooms. For longer storage, dry at 50°C (120°F) for 8-10 hours or sauté and freeze.',
    },
    tags: ['lions-mane', 'medicinal', 'brain-health', 'intermediate', 'kit', 'unique'],
    publishedAt: new Date().toISOString(),
  },
  {
    _type: 'growingGuide',
    title: 'King Oyster Mushroom Growing Kit - Complete Guide',
    slug: { current: 'king-oyster-growing-guide' },
    description: 'Grow gourmet king oyster mushrooms with thick, meaty stems perfect for grilling and stir-frying. A chef\'s favorite!',
    mushroomType: 'king-oyster',
    difficulty: 'intermediate',
    isPublished: true,
    isFeatured: false,
    timeToFirstHarvest: '14-21 days',
    harvestWindow: '2-3 flushes over 6-8 weeks',
    expectedYield: '300-600g per kit',
    idealConditions: {
      temperature: '12-18°C (55-65°F)',
      humidity: '80-90%',
      light: 'Moderate indirect light, 8-12 hours daily',
      airflow: 'Good fresh air, important for stem development',
    },
    suppliesNeeded: [
      'Spray bottle with clean water',
      'Humidity tent',
      'Sharp knife',
      'Cool location (basement or air-conditioned room)',
    ],
    growingSteps: [
      {
        _type: 'step',
        stepNumber: 1,
        day: 'Day 1',
        title: 'Unbox and Inspect',
        instruction: 'Remove the king oyster block from packaging. The block should be fully colonized with white mycelium. Unlike regular oysters, king oysters prefer cooler conditions.',
        tip: 'King oysters are fussier than regular oysters - temperature control is key.',
        duration: '5 minutes',
      },
      {
        _type: 'step',
        stepNumber: 2,
        day: 'Day 1',
        title: 'Create Small Opening',
        instruction: 'Cut a small 3-4cm slit or remove a small section of plastic at the top. King oysters benefit from a more restricted opening.',
        tip: 'Smaller opening = thicker stems. King oysters grown from small openings develop the prized thick stems.',
        duration: '2 minutes',
      },
      {
        _type: 'step',
        stepNumber: 3,
        day: 'Day 1',
        title: 'Cool Location',
        instruction: 'Place in the coolest location available (12-18°C ideal). King oysters struggle in warm conditions. A basement, wine cellar, or air-conditioned room works well.',
        tip: 'If your home is warm, place near an air conditioner vent or in front of a window at night.',
        duration: 'Setup',
      },
      {
        _type: 'step',
        stepNumber: 4,
        day: 'Days 2-14',
        title: 'Maintain Conditions',
        instruction: 'Mist 2-3 times daily. Maintain high humidity but ensure good air circulation. Temperature consistency is more important than with other varieties.',
        tip: 'Temperature fluctuation between day and night can actually help trigger pinning.',
        duration: '2 minutes, 3x daily',
      },
      {
        _type: 'step',
        stepNumber: 5,
        day: 'Days 10-18',
        title: 'Pin Formation',
        instruction: 'Look for small pins forming at the opening. King oyster pins are thicker than regular oyster pins. Only a few mushrooms will typically develop.',
        tip: 'Quality over quantity - king oysters produce fewer but larger mushrooms.',
        duration: 'Observation',
      },
      {
        _type: 'step',
        stepNumber: 6,
        day: 'Days 14-21',
        title: 'Stem Development',
        instruction: 'Watch as thick, white stems develop. The restricted opening and good airflow encourage thick stem growth. Continue misting and cool conditions.',
        tip: 'The stem is the prized part - it should be thick and white, like a scallop!',
        duration: '2 minutes, 2x daily',
      },
      {
        _type: 'step',
        stepNumber: 7,
        day: 'Days 18-25',
        title: 'Harvest',
        instruction: 'Harvest when caps are 5-8cm wide and just starting to flatten. The stem should be thick (3-5cm diameter) and firm. Cut at the base.',
        tip: 'Don\'t wait too long - over-mature king oysters become spongy.',
        duration: '5 minutes',
      },
      {
        _type: 'step',
        stepNumber: 8,
        day: 'After Harvest',
        title: 'Rest and Repeat',
        instruction: 'Rest the block for 1-2 weeks with minimal misting. Then resume regular misting for subsequent flushes.',
        tip: 'King oysters may produce from different spots on subsequent flushes.',
        duration: 'Rest period',
      },
    ],
    troubleshooting: [
      {
        problem: 'Thin stems',
        cause: 'Too much CO2, opening too large, or temperature too warm',
        solution: 'Use smaller opening. Increase fresh air. Lower temperature if possible. King oysters need CO2 restriction at the opening but good air otherwise.',
      },
      {
        problem: 'Caps growing but no stems',
        cause: 'Temperature too warm or CO2 too low',
        solution: 'King oysters need cool conditions for proper stem development. Move to cooler location. Use smaller opening.',
      },
      {
        problem: 'No fruiting after 3 weeks',
        cause: 'Temperature too warm or block not mature',
        solution: 'King oysters require cool temperatures (12-18°C). If your environment is warmer, try placing in refrigerator for a few hours daily to trigger fruiting.',
      },
      {
        problem: 'Mushrooms are spongy/soft',
        cause: 'Over-maturity or high temperature',
        solution: 'Harvest earlier next time. Maintain cooler temperatures. Spongy mushrooms are still edible but less desirable.',
      },
    ],
    harvestGuide: {
      signs: [
        'Cap is 5-8cm in diameter',
        'Cap edges still slightly curved down',
        'Stem is thick (3-5cm diameter) and firm',
        'Color is cream/white (cap) with white stem',
      ],
      technique: 'Cut at the very base of the stem. The entire stem is edible and prized for its meaty texture. Trim off only the very bottom if it has substrate attached.',
      storage: 'King oysters store well - up to 2 weeks refrigerated in a paper bag. Their firm texture makes them excellent for grilling, slicing into "scallops," or stir-frying.',
    },
    tags: ['king-oyster', 'gourmet', 'meaty', 'intermediate', 'kit', 'grilling'],
    publishedAt: new Date().toISOString(),
  },
  {
    _type: 'growingGuide',
    title: 'Blue Oyster Mushroom Growing Kit - Complete Guide',
    slug: { current: 'blue-oyster-growing-guide' },
    description: 'Grow stunning blue oyster mushrooms at home! Fast-growing and beautiful, these mushrooms add a gourmet touch to any dish.',
    mushroomType: 'blue-oyster',
    difficulty: 'beginner',
    isPublished: true,
    isFeatured: false,
    timeToFirstHarvest: '7-12 days',
    harvestWindow: '2-3 flushes over 4-6 weeks',
    expectedYield: '400-700g per kit',
    idealConditions: {
      temperature: '15-21°C (60-70°F)',
      humidity: '85-95%',
      light: 'Moderate indirect light, 6-10 hours daily',
      airflow: 'Fresh air exchange 3-4 times daily',
    },
    suppliesNeeded: [
      'Spray bottle with clean water',
      'Humidity tent (included)',
      'Sharp knife or scissors',
    ],
    growingSteps: [
      {
        _type: 'step',
        stepNumber: 1,
        day: 'Day 1',
        title: 'Unbox and Inspect',
        instruction: 'Remove the blue oyster block from packaging. It should be fully colonized with white mycelium. Blue oysters are aggressive fruiters and may already show pins.',
        tip: 'Blue oysters are the most forgiving of all oyster varieties - perfect for beginners!',
        duration: '5 minutes',
      },
      {
        _type: 'step',
        stepNumber: 2,
        day: 'Day 1',
        title: 'Create Opening',
        instruction: 'Cut an X-shaped opening (5-6cm) in the bag where you see the most mycelium activity. Blue oysters fruit aggressively and may try to fruit from any tiny hole.',
        tip: 'Check the bag for any existing holes - blue oysters will fruit from them too!',
        duration: '2 minutes',
      },
      {
        _type: 'step',
        stepNumber: 3,
        day: 'Day 1',
        title: 'Setup Location',
        instruction: 'Place in a location with good indirect light. Blue oysters tolerate a wider temperature range than other varieties but prefer cooler temps for best color.',
        tip: 'Cooler temperatures (15-18°C) produce deeper blue coloring.',
        duration: '5 minutes',
      },
      {
        _type: 'step',
        stepNumber: 4,
        day: 'Days 2-5',
        title: 'Maintain Humidity',
        instruction: 'Mist 3-4 times daily. Blue oysters require high humidity and dry out quickly. Keep humidity tent positioned properly with small gaps for air.',
        tip: 'Blue oysters grow FAST - check twice daily for rapid development.',
        duration: '2 minutes, 4x daily',
      },
      {
        _type: 'step',
        stepNumber: 5,
        day: 'Days 3-7',
        title: 'Pin Formation',
        instruction: 'Pins appear as small greyish-blue bumps. They develop extremely fast - sometimes doubling in size in just one day!',
        tip: 'Don\'t be alarmed by the blue color - it\'s normal and beautiful!',
        duration: 'Observation',
      },
      {
        _type: 'step',
        stepNumber: 6,
        day: 'Days 5-10',
        title: 'Rapid Growth',
        instruction: 'Blue oysters grow incredibly fast once pinning starts. Continue misting and ensure adequate air circulation. Watch them transform daily.',
        tip: 'The blue color fades slightly as they mature and with cooking.',
        duration: '2 minutes, 3x daily',
      },
      {
        _type: 'step',
        stepNumber: 7,
        day: 'Days 7-12',
        title: 'Harvest',
        instruction: 'Harvest when cap edges are wavy and just beginning to curl upward. Twist and pull entire clusters, or cut at the base.',
        tip: 'Blue oysters should be harvested slightly younger than grey oysters for best texture.',
        duration: '5 minutes',
      },
      {
        _type: 'step',
        stepNumber: 8,
        day: 'After Harvest',
        title: 'Next Flush',
        instruction: 'Blue oysters often fruit again within just 5-7 days of harvest. Continue misting to encourage additional flushes.',
        tip: 'Second and third flushes may have slightly less intense blue coloring.',
        duration: 'Ongoing',
      },
    ],
    troubleshooting: [
      {
        problem: 'Color is grey instead of blue',
        cause: 'Temperature too warm or genetics',
        solution: 'Move to cooler location. Some blue oyster strains are less intensely colored. Color doesn\'t affect taste.',
      },
      {
        problem: 'Growing from all sides of bag',
        cause: 'Natural behavior - blue oysters are aggressive fruiters',
        solution: 'This is normal! You can harvest from multiple openings. If unwanted, tape over extra holes before pinning starts.',
      },
      {
        problem: 'Caps are cracking',
        cause: 'Humidity too low, possibly combined with too much airflow',
        solution: 'Increase misting frequency. Ensure humidity tent is properly positioned. Add a dish of water near the kit.',
      },
      {
        problem: 'Edges are curling up too fast',
        cause: 'Ready for harvest! Blue oysters mature quickly.',
        solution: 'Harvest immediately. Blue oysters should be harvested younger than you might expect.',
      },
    ],
    harvestGuide: {
      signs: [
        'Cap edges are wavy and just starting to curl upward',
        'Caps are 4-8cm in diameter',
        'Color is blue-grey (may be paler in warmer conditions)',
        'Gills are visible and well-formed',
      ],
      technique: 'Harvest the entire cluster by twisting and pulling at the base, or cut with a sharp knife. Blue oysters are delicate - handle gently.',
      storage: 'Use within 5-7 days refrigerated in a paper bag. Blue oysters are more delicate than grey oysters and don\'t store as long. Best used fresh!',
    },
    tags: ['blue-oyster', 'colorful', 'fast-growing', 'beginner', 'kit', 'beautiful'],
    publishedAt: new Date().toISOString(),
  },
];

async function migrateGrowingGuides() {
  console.log('🌱 Starting growing guide migration to Sanity...\n');

  for (const guide of growingGuides) {
    try {
      console.log(`Creating guide: "${guide.title}"...`);
      
      // Check if guide already exists
      const existing = await client.fetch(
        `*[_type == "growingGuide" && slug.current == $slug][0]._id`,
        { slug: guide.slug.current }
      );

      if (existing) {
        console.log(`  ⚠️ Guide already exists, skipping.`);
        continue;
      }

      const result = await client.create(guide);
      console.log(`  ✅ Created: ${result._id}`);
    } catch (error) {
      console.error(`  ❌ Error creating "${guide.title}":`, error.message);
    }
  }

  console.log('\n✨ Growing guide migration complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Open Sanity Studio (cd studio && npm run dev)');
  console.log('2. Add cover images to each guide');
  console.log('3. Add step-by-step images');
  console.log('4. Replace placeholder YouTube video IDs with real ones');
  console.log('5. Link each guide to its related growing kit product');
  console.log('6. Add related recipes for each mushroom type');
}

migrateGrowingGuides().catch(console.error);
