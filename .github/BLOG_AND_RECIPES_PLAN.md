# 🍄 MASH Blog & Recipe Content Strategy

**Version:** 1.0  
**Created:** December 8, 2025  
**Last Updated:** December 8, 2025  
**Project:** MASH Mushroom E-Commerce Platform  
**CMS:** Sanity CMS (Project ID: `gerattrr`)

---

## 📋 Table of Contents

1. [Overview](#-overview)
2. [Content Types](#-content-types)
3. [Blog Categories](#-blog-categories)
4. [Recipe Structure](#-recipe-structure)
5. [Growing Guide Structure](#-growing-guide-structure)
6. [YouTube Integration](#-youtube-integration)
7. [Product Linking Strategy](#-product-linking-strategy)
8. [Content Calendar](#-content-calendar)
9. [Sample Content](#-sample-content)
10. [Sanity Schema Updates](#-sanity-schema-updates)
11. [Implementation Checklist](#-implementation-checklist)

---

## 🎯 Overview

### Purpose

Create a comprehensive content hub that:
- **Educates customers** on mushroom preparation and growing
- **Increases engagement** with cooking recipes and video tutorials
- **Drives product sales** by linking content directly to purchasable products
- **Builds trust** through expert guides and community content

### Content Pillars

| Pillar | Description | Target Audience |
|--------|-------------|-----------------|
| 🍳 **Recipes** | Mushroom cooking recipes with step-by-step instructions | Home cooks, food enthusiasts |
| 🌱 **Growing Guides** | How to grow mushrooms using our kits | DIY growers, hobbyists |
| 📚 **Educational** | Mushroom nutrition, varieties, storage | Health-conscious consumers |
| 📰 **News & Updates** | Company news, market updates, seasonal content | Existing customers |

---

## 📝 Content Types

### 1. Blog Posts (General)

Standard blog articles for news, education, and updates.

**Schema:** `post` (existing)

**Use Cases:**
- Company announcements
- Mushroom nutrition facts
- Seasonal content
- Industry news

### 2. Recipes (NEW)

Dedicated recipe content type with structured data for cooking.

**Schema:** `recipe` (to be created)

**Key Features:**
- Prep/cook time
- Servings
- Difficulty level
- Ingredients list with quantities
- Step-by-step instructions
- Nutrition facts
- YouTube video embed
- Related products

### 3. Growing Guides (NEW)

Step-by-step guides for growing mushrooms using our kits.

**Schema:** `growingGuide` (to be created)

**Key Features:**
- Difficulty level
- Duration (days to harvest)
- Required materials
- Step-by-step timeline
- Troubleshooting tips
- YouTube video embed
- Related products (growing kits)

---

## 📂 Blog Categories

### Current Categories (in Sanity)

| Category | Icon | Color | Description |
|----------|------|-------|-------------|
| Recipes | 🍳 utensils | green | Mushroom cooking recipes |
| Growing Tips | 🌱 sprout | blue | Cultivation guides |
| Health & Nutrition | 💊 heart-pulse | purple | Health benefits |
| News | 📰 newspaper | gray | Company updates |
| Education | 🎓 graduation-cap | orange | Learning content |

### Proposed New Categories

| Category | Icon | Color | Description |
|----------|------|-------|-------------|
| **Video Tutorials** | 🎬 video | red | YouTube-embedded guides |
| **Quick Tips** | ⚡ zap | yellow | Short, actionable tips |
| **Seasonal** | 🍂 calendar | brown | Seasonal recipes & guides |
| **Community** | 👥 users | teal | Customer stories & submissions |

---

## 🍳 Recipe Structure

### Recipe Schema Fields

```typescript
recipe {
  // Basic Info
  title: string                    // "Mushroom Chicharon Crispy Snack"
  slug: slug                       // "mushroom-chicharon"
  description: text                // Short description
  
  // Media
  coverImage: image                // Hero image
  gallery: image[]                 // Step photos
  youtubeVideo: object {           // NEW: YouTube embed
    videoId: string                // "dQw4w9WgXcQ"
    title: string                  // Video title
    thumbnail: image               // Custom thumbnail (optional)
  }
  
  // Recipe Details
  prepTime: number                 // Minutes
  cookTime: number                 // Minutes
  totalTime: number                // Calculated
  servings: number                 // 4 servings
  difficulty: string               // "Easy" | "Medium" | "Hard"
  cuisine: string                  // "Filipino" | "Asian" | "Western"
  mealType: string[]               // ["Snack", "Appetizer"]
  
  // Ingredients
  ingredients: array {
    item: string                   // "Fresh Oyster Mushrooms"
    quantity: string               // "500g"
    notes: string                  // "cleaned and sliced"
    product: reference             // Link to Product
  }[]
  
  // Instructions
  instructions: array {
    step: number                   // 1, 2, 3...
    title: string                  // "Prepare the mushrooms"
    description: text              // Detailed instruction
    image: image                   // Optional step image
    tip: string                    // Pro tip for this step
    duration: number               // Minutes for this step
  }[]
  
  // Nutrition
  nutrition: object {
    calories: number
    protein: string                // "12g"
    carbs: string
    fat: string
    fiber: string
  }
  
  // Relationships
  relatedProducts: reference[]     // Products needed for recipe
  relatedRecipes: reference[]      // Similar recipes
  author: reference                // person
  
  // SEO
  seo: object                      // Same as blog post
  
  // Settings
  isFeatured: boolean
  isPublished: boolean
  publishedAt: datetime
  tags: string[]
}
```

### Recipe Example: Mushroom Chicharon

```json
{
  "title": "Crispy Mushroom Chicharon",
  "slug": "crispy-mushroom-chicharon",
  "description": "A healthy, plant-based alternative to pork chicharon that's just as crispy and flavorful!",
  "prepTime": 15,
  "cookTime": 25,
  "servings": 4,
  "difficulty": "Easy",
  "cuisine": "Filipino",
  "mealType": ["Snack", "Pulutan"],
  "youtubeVideo": {
    "videoId": "example123",
    "title": "How to Make Mushroom Chicharon"
  },
  "ingredients": [
    {
      "item": "Fresh Oyster Mushrooms",
      "quantity": "500g",
      "notes": "cleaned and torn into strips",
      "product": "ref:fresh-oyster-mushrooms"
    },
    {
      "item": "All-purpose flour",
      "quantity": "1 cup"
    },
    {
      "item": "Cornstarch",
      "quantity": "1/2 cup"
    },
    {
      "item": "Salt",
      "quantity": "1 tsp"
    },
    {
      "item": "Pepper",
      "quantity": "1/2 tsp"
    },
    {
      "item": "Garlic powder",
      "quantity": "1 tsp"
    },
    {
      "item": "Cooking oil",
      "quantity": "for deep frying"
    }
  ],
  "instructions": [
    {
      "step": 1,
      "title": "Prepare the Mushrooms",
      "description": "Clean the oyster mushrooms and tear them into thin strips. Pat dry with paper towels - they must be completely dry for maximum crispiness.",
      "tip": "The drier the mushrooms, the crispier they'll be!"
    },
    {
      "step": 2,
      "title": "Make the Coating",
      "description": "Mix flour, cornstarch, salt, pepper, and garlic powder in a bowl.",
      "tip": "Add a pinch of cayenne for a spicy kick"
    },
    {
      "step": 3,
      "title": "Coat the Mushrooms",
      "description": "Dredge mushroom strips in the flour mixture, pressing to coat evenly. Shake off excess.",
      "duration": 5
    },
    {
      "step": 4,
      "title": "Fry Until Golden",
      "description": "Deep fry in batches at 180°C (350°F) for 3-4 minutes until golden and crispy. Don't overcrowd the pan!",
      "tip": "Fry in small batches to maintain oil temperature"
    },
    {
      "step": 5,
      "title": "Drain and Serve",
      "description": "Transfer to paper towels to drain excess oil. Serve immediately with spiced vinegar dip.",
      "tip": "Best served hot and fresh!"
    }
  ],
  "nutrition": {
    "calories": 180,
    "protein": "6g",
    "carbs": "22g",
    "fat": "8g",
    "fiber": "3g"
  },
  "relatedProducts": [
    "ref:fresh-oyster-mushrooms",
    "ref:mushroom-seasoning-mix"
  ],
  "tags": ["snack", "crispy", "deep-fried", "pulutan", "Filipino", "easy"]
}
```

---

## 🌱 Growing Guide Structure

### Growing Guide Schema Fields

```typescript
growingGuide {
  // Basic Info
  title: string                    // "Shiitake Mushroom Growing Kit Guide"
  slug: slug                       // "shiitake-growing-guide"
  description: text                // What you'll learn
  
  // Media
  coverImage: image                // Hero image (harvested mushrooms)
  gallery: image[]                 // Progress photos
  youtubeVideo: object {           // NEW: YouTube embed
    videoId: string
    title: string
  }
  
  // Guide Details
  difficulty: string               // "Beginner" | "Intermediate" | "Advanced"
  daysToHarvest: number            // 14
  yieldEstimate: string            // "200-400g per flush"
  flushes: number                  // 3-4 harvests
  
  // Requirements
  requirements: object {
    temperature: string            // "18-24°C"
    humidity: string               // "80-90%"
    light: string                  // "Indirect light, 8-12 hours"
    space: string                  // "Countertop or shelf"
    materials: string[]            // ["Spray bottle", "Humidity tent"]
  }
  
  // Timeline Steps
  timeline: array {
    day: string                    // "Day 1", "Days 2-5", "Week 2"
    title: string                  // "Setup & First Watering"
    description: text              // What to do
    image: image                   // Progress photo
    tips: string[]                 // ["Mist twice daily", "Avoid direct sunlight"]
    expectedProgress: string       // "Mycelium should be visible"
  }[]
  
  // Troubleshooting
  troubleshooting: array {
    problem: string                // "Green mold appearing"
    cause: string                  // "Too much moisture or contamination"
    solution: string               // "Reduce misting, improve airflow"
    image: image                   // What it looks like
  }[]
  
  // Harvest Guide
  harvestGuide: object {
    signs: string[]                // ["Caps fully open", "Edges curling"]
    technique: text                // How to harvest properly
    storage: text                  // How to store harvested mushrooms
  }
  
  // Relationships
  relatedProduct: reference        // The growing kit product
  relatedRecipes: reference[]      // Recipes using this mushroom
  author: reference                // person
  
  // SEO & Settings
  seo: object
  isFeatured: boolean
  isPublished: boolean
  publishedAt: datetime
  tags: string[]
}
```

### Growing Guide Example: Shiitake Kit

```json
{
  "title": "Complete Shiitake Mushroom Growing Guide",
  "slug": "shiitake-mushroom-growing-guide",
  "description": "Learn how to grow delicious shiitake mushrooms at home with our easy-to-use growing kit. From setup to harvest in just 2 weeks!",
  "difficulty": "Beginner",
  "daysToHarvest": 14,
  "yieldEstimate": "200-400g per flush",
  "flushes": 4,
  "youtubeVideo": {
    "videoId": "shiitake-grow-123",
    "title": "How to Grow Shiitake Mushrooms at Home"
  },
  "requirements": {
    "temperature": "18-24°C (65-75°F)",
    "humidity": "80-90%",
    "light": "Indirect light, 8-12 hours daily",
    "space": "Countertop, shelf, or kitchen cabinet",
    "materials": [
      "Spray bottle with clean water",
      "Humidity tent (included)",
      "Sharp knife for harvesting"
    ]
  },
  "timeline": [
    {
      "day": "Day 1",
      "title": "Unboxing & Setup",
      "description": "Remove the kit from packaging. Cut an X-shaped slit in the plastic bag where indicated. Place in a cool, shaded area away from direct sunlight.",
      "tips": ["Don't remove the bag completely", "Keep away from drafts"],
      "expectedProgress": "White mycelium visible through the bag"
    },
    {
      "day": "Days 2-7",
      "title": "Daily Misting",
      "description": "Mist the cut opening 2-3 times daily with clean water. Maintain high humidity by keeping the included humidity tent over the kit.",
      "tips": ["Use filtered or bottled water", "Mist the air, not directly on substrate"],
      "expectedProgress": "Small pin-like growths appearing (primordial stage)"
    },
    {
      "day": "Days 8-10",
      "title": "Pin Development",
      "description": "Tiny mushroom pins will grow rapidly. Continue misting. Increase airflow slightly by opening the tent briefly each day.",
      "tips": ["Don't touch the pins", "Mushrooms double in size daily now"],
      "expectedProgress": "Pins growing into recognizable mushroom shapes"
    },
    {
      "day": "Days 11-14",
      "title": "Harvest Time!",
      "description": "Harvest when caps are 2-3 inches wide and edges are still slightly curled under. Twist and pull gently at the base, or cut with a sharp knife.",
      "tips": ["Harvest before caps flatten completely", "Morning harvest is best"],
      "expectedProgress": "Full-sized shiitake mushrooms ready to eat!"
    }
  ],
  "troubleshooting": [
    {
      "problem": "No growth after 1 week",
      "cause": "Temperature too cold or too hot",
      "solution": "Move to area with 18-24°C temperature. Avoid heating vents or cold drafts."
    },
    {
      "problem": "Green or black mold",
      "cause": "Contamination from dirty water or handling",
      "solution": "If small, carefully remove affected area. If widespread, the block may be compromised."
    },
    {
      "problem": "Mushrooms are dry and cracking",
      "cause": "Humidity too low",
      "solution": "Increase misting frequency. Ensure humidity tent is properly covering the kit."
    },
    {
      "problem": "Long thin stems with small caps",
      "cause": "Not enough light or too much CO2",
      "solution": "Move to brighter location with indirect light. Increase ventilation."
    }
  ],
  "harvestGuide": {
    "signs": [
      "Cap diameter reaches 2-3 inches",
      "Edges still slightly curled under",
      "Gills visible but veil not completely broken"
    ],
    "technique": "Grasp the mushroom at the base and twist gently while pulling. Alternatively, use a sharp knife to cut at the base. Avoid leaving stumps.",
    "storage": "Store in a paper bag in the refrigerator for up to 1 week. Do not wash until ready to use. Can also be dried for long-term storage."
  },
  "relatedProduct": "ref:shiitake-mushroom-growing-kit",
  "relatedRecipes": [
    "ref:garlic-butter-shiitake",
    "ref:shiitake-stir-fry",
    "ref:shiitake-ramen"
  ],
  "tags": ["growing", "shiitake", "beginner", "indoor", "kit"]
}
```

---

## 🎬 YouTube Integration

### YouTube Video Schema Object

Add to both `recipe` and `growingGuide` schemas:

```typescript
defineField({
  name: 'youtubeVideo',
  title: 'YouTube Video',
  type: 'object',
  description: 'Embed a YouTube video tutorial',
  fields: [
    {
      name: 'videoId',
      title: 'Video ID',
      type: 'string',
      description: 'The YouTube video ID (e.g., dQw4w9WgXcQ from youtube.com/watch?v=dQw4w9WgXcQ)',
      validation: (rule) => rule.required().regex(/^[a-zA-Z0-9_-]{11}$/, {
        name: 'YouTube Video ID',
        invert: false,
      }),
    },
    {
      name: 'title',
      title: 'Video Title',
      type: 'string',
      description: 'Title to display above the video',
    },
    {
      name: 'startTime',
      title: 'Start Time (seconds)',
      type: 'number',
      description: 'Optional: Start video at specific timestamp',
    },
    {
      name: 'showControls',
      title: 'Show Video Controls',
      type: 'boolean',
      initialValue: true,
    },
  ],
}),
```

### YouTube Embed Component (Frontend)

```tsx
// src/components/content/YouTubeEmbed.tsx
'use client';

interface YouTubeEmbedProps {
  videoId: string;
  title?: string;
  startTime?: number;
  showControls?: boolean;
  className?: string;
}

export function YouTubeEmbed({
  videoId,
  title,
  startTime = 0,
  showControls = true,
  className = '',
}: YouTubeEmbedProps) {
  const embedUrl = `https://www.youtube.com/embed/${videoId}?start=${startTime}&controls=${showControls ? 1 : 0}&rel=0`;

  return (
    <div className={`aspect-video w-full ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
      )}
      <iframe
        src={embedUrl}
        title={title || 'YouTube video'}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full rounded-lg"
      />
    </div>
  );
}
```

### Recommended YouTube Channels

| Channel | Content Type | Integration |
|---------|-------------|-------------|
| **MASH Official** | Product tutorials, recipes | Primary channel |
| **Mushroom Growing Philippines** | Growing tutorials | Embed with credit |
| **Filipino Cooking Channels** | Mushroom recipes | Embed with credit |

---

## 🔗 Product Linking Strategy

### How Content Links to Products

```
┌─────────────────────────────────────────────────────────────────┐
│                         RECIPE                                   │
│  "Crispy Mushroom Chicharon"                                    │
├─────────────────────────────────────────────────────────────────┤
│  Ingredients:                                                    │
│  ├── Fresh Oyster Mushrooms (500g) ──► [BUY NOW: ₱180/500g]    │
│  ├── Mushroom Seasoning Mix ──────────► [BUY NOW: ₱45/pack]    │
│  └── Other ingredients (no link)                                 │
├─────────────────────────────────────────────────────────────────┤
│  📦 Related Products:                                            │
│  ├── Fresh Oyster Mushrooms                                      │
│  ├── Mushroom Chicharon Seasoning (NEW!)                        │
│  └── Shiitake Mushrooms (alternative)                            │
└─────────────────────────────────────────────────────────────────┘
```

### Product Integration in Ingredients

```typescript
// Ingredient with optional product link
ingredients: [{
  item: "Fresh Oyster Mushrooms",
  quantity: "500g",
  notes: "cleaned and sliced",
  product: reference(product)  // Link to purchasable product
}]
```

### Frontend Display

```tsx
// Ingredient with product link
<div className="flex justify-between items-center">
  <span>{ingredient.quantity} {ingredient.item}</span>
  {ingredient.product && (
    <Link href={`/product/${ingredient.product.slug}`}>
      <Button size="sm" variant="outline">
        Add to Cart - ₱{ingredient.product.price}
      </Button>
    </Link>
  )}
</div>
```

### Product Schema Addition

Add recipe/guide references to product schema:

```typescript
// In product.ts - Add new fields
defineField({
  name: 'relatedRecipes',
  title: 'Related Recipes',
  type: 'array',
  description: 'Recipes that use this product',
  of: [{ type: 'reference', to: [{ type: 'recipe' }] }],
}),
defineField({
  name: 'growingGuide',
  title: 'Growing Guide',
  type: 'reference',
  to: [{ type: 'growingGuide' }],
  description: 'For growing kits - link to the growing guide',
  hidden: ({ document }) => !document?.category?.name?.includes('Kit'),
}),
```

---

## 📅 Content Calendar

### Phase 1: Foundation (Week 1-2)

| Content | Type | Status |
|---------|------|--------|
| Mushroom Chicharon | Recipe | To Create |
| Garlic Butter Mushrooms | Recipe | To Create |
| Shiitake Growing Guide | Guide | To Create |
| Oyster Growing Guide | Guide | To Create |
| Mushroom Nutrition 101 | Blog | To Create |

### Phase 2: Expansion (Week 3-4)

| Content | Type | Status |
|---------|------|--------|
| Creamy Mushroom Pasta | Recipe | To Create |
| Mushroom Adobo | Recipe | To Create |
| Blue Oyster Growing Guide | Guide | To Create |
| Storage Tips | Blog | To Create |
| Mushroom Varieties Guide | Blog | To Create |

### Phase 3: Seasonal (Ongoing)

| Content | Type | Timing |
|---------|------|--------|
| Holiday Mushroom Recipes | Recipe | December |
| New Year Health Tips | Blog | January |
| Valentine's Romantic Dinners | Recipe | February |
| Summer Light Recipes | Recipe | March-May |

---

## 📝 Sample Content to Create

### Recipes (Priority Order)

1. **Mushroom Chicharon** - Popular Filipino snack
   - Product: Fresh Oyster Mushrooms
   - Difficulty: Easy
   - Time: 40 minutes
   
2. **Garlic Butter Shiitake** - Simple side dish
   - Product: Fresh Shiitake Mushrooms
   - Difficulty: Easy
   - Time: 15 minutes

3. **Creamy Mushroom Pasta** - Main dish
   - Product: Fresh Mixed Mushrooms
   - Difficulty: Medium
   - Time: 30 minutes

4. **Mushroom Sinigang** - Filipino soup
   - Product: Fresh Oyster + Shiitake
   - Difficulty: Medium
   - Time: 45 minutes

5. **Mushroom Sisig** - Pulutan/appetizer
   - Product: Fresh Oyster Mushrooms
   - Difficulty: Medium
   - Time: 35 minutes

### Growing Guides (Priority Order)

1. **Oyster Mushroom Kit Guide** - Most popular kit
2. **Shiitake Mushroom Kit Guide** - Second most popular
3. **Blue Oyster Mushroom Kit Guide** - Unique variety
4. **King Trumpet Kit Guide** - Gourmet variety
5. **Lion's Mane Kit Guide** - Health-focused

### Blog Posts (Priority Order)

1. **"5 Reasons to Add Mushrooms to Your Diet"** - Health benefits
2. **"How to Store Fresh Mushrooms"** - Practical tips
3. **"Mushroom Varieties: A Complete Guide"** - Educational
4. **"Behind the Scenes: How We Grow Our Mushrooms"** - Trust building
5. **"Common Mushroom Growing Mistakes (And How to Avoid Them)"** - Troubleshooting

---

## 🔧 Sanity Schema Updates

### Files to Create/Update

1. **Create:** `studio/src/schemaTypes/documents/recipe.ts`
2. **Create:** `studio/src/schemaTypes/documents/growingGuide.ts`
3. **Update:** `studio/src/schemaTypes/documents/post.ts` (add YouTube)
4. **Update:** `studio/src/schemaTypes/documents/product.ts` (add recipe links)
5. **Update:** `studio/src/schemaTypes/index.ts` (export new schemas)

### New Blog Categories to Add

```javascript
// Run in Sanity Studio or via script
[
  { name: "Video Tutorials", slug: "video-tutorials", icon: "video", color: "red" },
  { name: "Quick Tips", slug: "quick-tips", icon: "zap", color: "yellow" },
  { name: "Seasonal", slug: "seasonal", icon: "calendar", color: "orange" },
  { name: "Community", slug: "community", icon: "users", color: "teal" },
]
```

---

## ✅ Implementation Checklist

### Phase 1: Schema Updates (2-3 hours)

- [ ] Create `recipe.ts` schema with all fields
- [ ] Create `growingGuide.ts` schema with all fields
- [ ] Add YouTube video object type
- [ ] Update `post.ts` to include YouTube field
- [ ] Update `product.ts` to include recipe/guide references
- [ ] Update schema index exports
- [ ] Deploy schema changes to Sanity

### Phase 2: Sample Content (3-4 hours)

- [ ] Create 3 initial recipes in Sanity Studio
- [ ] Create 2 initial growing guides in Sanity Studio
- [ ] Add YouTube videos to content
- [ ] Link products to recipes/guides
- [ ] Upload images for all content

### Phase 3: Frontend Integration (4-6 hours)

- [ ] Create `YouTubeEmbed` component
- [ ] Create recipe detail page (`/recipes/[slug]`)
- [ ] Create growing guide page (`/guides/[slug]`)
- [ ] Add recipe/guide sections to product pages
- [ ] Create recipe listing page (`/recipes`)
- [ ] Create guides listing page (`/guides`)
- [ ] Update navigation to include new sections

### Phase 4: Testing & Polish (2 hours)

- [ ] Test all content displays correctly
- [ ] Test product links in recipes
- [ ] Test YouTube embeds on mobile
- [ ] SEO meta tags verification
- [ ] Performance testing

---

## 🎯 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Recipe page views | 500/month | Google Analytics |
| Guide page views | 300/month | Google Analytics |
| YouTube video plays | 100/month | YouTube Analytics |
| Product clicks from recipes | 50/month | Click tracking |
| Time on recipe pages | 3+ minutes | Google Analytics |
| Recipe shares | 20/month | Social tracking |

---

## 📚 Resources

### Recipe Inspiration

- [Panlasang Pinoy Mushroom Recipes](https://panlasangpinoy.com)
- [Tasty Philippines](https://www.facebook.com/tastyphilippines)
- [Filipino Recipe Book](https://www.filipinorecipebook.com)

### Growing Guide References

- [North Spore Mushroom Growing](https://northspore.com/pages/growing-guides)
- [Back to the Roots](https://www.backtotheroots.com)
- [Mushroom Mountain](https://www.mushroommountain.com)

### YouTube Content Ideas

- Unboxing growing kit
- Time-lapse mushroom growth
- Step-by-step recipe videos
- FAQ/troubleshooting videos
- Customer testimonials

---

**Document Status:** Ready for Implementation  
**Next Action:** Create Sanity schemas (recipe.ts, growingGuide.ts)  
**Estimated Total Time:** 12-15 hours
