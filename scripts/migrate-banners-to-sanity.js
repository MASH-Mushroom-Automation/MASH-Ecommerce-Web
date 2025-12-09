/**
 * Migrate Banners to Sanity CMS
 * Phase 7: Promotional Banners
 *
 * This script populates the Sanity CMS with sample promotional banners
 * for various positions across the site.
 *
 * Banner Colors Map to Theme Tokens:
 * - '#1E392A' (primary-dark) = --primary-dark from nature theme
 * - '#6A994E' (primary) = --primary from nature theme
 * - '#A7C957' (accent) = --accent from nature theme
 * - '#F5F5F5' (muted) = --muted from nature theme
 *
 * Text Colors:
 * - 'light' = white text for dark backgrounds
 * - 'dark' = forest text for light backgrounds
 *
 * Usage: node scripts/migrate-banners-to-sanity.js
 */

const { createClient } = require("@sanity/client");
require("dotenv").config({ path: ".env.local" });

// Initialize Sanity client
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "xyq5fhxs",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  token: process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_AUTH_TOKEN,
  apiVersion: "2024-11-26",
  useCdn: false,
});

// Get dates for scheduling
const now = new Date();
const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
const threeMonthsFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

// Sample banners data
const banners = [
  {
    _type: "banner",
    title: "Holiday Sale Banner",
    headline: "🎄 Holiday Season Sale!",
    subheadline: "Up to 25% OFF on Fresh Mushroom Bundles",
    description:
      "Celebrate the holidays with farm-fresh mushrooms. Perfect for your festive meals!",
    position: "homepage-top",
    size: "large",
    backgroundColor: "#1E392A",
    textColor: "light",
    buttonText: "Shop Holiday Deals",
    buttonLink: "/shop?promo=holiday",
    buttonStyle: "primary",
    promoCode: "HOLIDAY25",
    showPromoCode: true,
    startDate: now.toISOString(),
    endDate: oneMonthFromNow.toISOString(),
    priority: 100,
    isActive: true,
  },
  {
    _type: "banner",
    title: "Free Shipping Announcement",
    headline: "🚚 FREE Same-Day Delivery on Orders ₱1,500+",
    subheadline: "Metro Manila Only",
    position: "announcement",
    size: "small",
    backgroundColor: "#6A994E",
    textColor: "light",
    buttonText: "Learn More",
    buttonLink: "/about#delivery",
    buttonStyle: "ghost",
    priority: 90,
    isActive: true,
  },
  {
    _type: "banner",
    title: "New Grower Partnership",
    headline: "Meet Our New Grower Partner",
    subheadline:
      "Introducing Kalinga Mountain Farms - Premium Highland Mushrooms",
    description:
      "Discover unique mushroom varieties from the mountain regions. Organic and sustainably grown.",
    position: "homepage-middle",
    size: "medium",
    backgroundColor: "#F5F5F5",
    textColor: "dark",
    buttonText: "Explore Products",
    buttonLink: "/grower/kalinga-mountain-farms",
    buttonStyle: "secondary",
    startDate: now.toISOString(),
    endDate: threeMonthsFromNow.toISOString(),
    priority: 80,
    isActive: true,
  },
  {
    _type: "banner",
    title: "Growing Kit Promo",
    headline: "Start Growing Today! 🌱",
    subheadline: "Beginner Growing Kits - Perfect Gift for Plant Lovers",
    description:
      "Our easy-to-use growing kits make mushroom cultivation fun and rewarding. Harvest in just 2 weeks!",
    position: "shop-top",
    size: "medium",
    backgroundColor: "#A7C957",
    textColor: "dark",
    buttonText: "Shop Growing Kits",
    buttonLink: "/shop?category=growing-kits",
    buttonStyle: "secondary",
    promoCode: "GROWKIT15",
    showPromoCode: true,
    priority: 75,
    isActive: true,
  },
  {
    _type: "banner",
    title: "Newsletter Signup",
    headline: "Join Our Mushroom Community",
    subheadline: "Get 10% off your first order + weekly recipes",
    position: "homepage-bottom",
    size: "medium",
    backgroundColor: "#FFFFFF",
    textColor: "dark",
    buttonText: "Subscribe Now",
    buttonLink: "/newsletter",
    buttonStyle: "primary",
    promoCode: "WELCOME10",
    showPromoCode: true,
    priority: 60,
    isActive: true,
  },
  {
    _type: "banner",
    title: "Cart Upsell Banner",
    headline: "Add ₱300 more for FREE Delivery!",
    subheadline: "You're almost there!",
    position: "cart-top",
    size: "small",
    backgroundColor: "#FFF3CD",
    textColor: "dark",
    buttonText: "Continue Shopping",
    buttonLink: "/shop",
    buttonStyle: "secondary",
    priority: 85,
    isActive: true,
  },
];

async function migrateBanners() {
  console.log("🏁 Starting banner migration to Sanity...\n");
  console.log(`📋 Migrating ${banners.length} banners\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const banner of banners) {
    try {
      // Check if banner already exists by title
      const existingQuery = `*[_type == "banner" && title == $title][0]`;
      const existing = await client.fetch(existingQuery, {
        title: banner.title,
      });

      if (existing) {
        console.log(`⏭️  Skipping "${banner.title}" - already exists`);
        continue;
      }

      // Create banner document
      const result = await client.create(banner);
      console.log(`✅ Created banner: "${banner.title}" (${result._id})`);
      console.log(`   📍 Position: ${banner.position}`);
      successCount++;
    } catch (error) {
      console.error(
        `❌ Error creating banner "${banner.title}":`,
        error.message
      );
      errorCount++;
    }
  }

  console.log("\n📊 Migration Summary:");
  console.log(`   ✅ Successfully created: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(
    `   ⏭️  Skipped (existing): ${banners.length - successCount - errorCount}`
  );
  console.log("\n🎉 Banner migration complete!");
  console.log("\n📝 Banner Positions Created:");
  console.log("   - homepage-top: Holiday Sale");
  console.log("   - homepage-middle: New Grower Partnership");
  console.log("   - homepage-bottom: Newsletter Signup");
  console.log("   - shop-top: Growing Kit Promo");
  console.log("   - cart-top: Cart Upsell");
  console.log("   - announcement: Free Shipping");
}

// Run migration
migrateBanners().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
