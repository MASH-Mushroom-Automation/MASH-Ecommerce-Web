#!/usr/bin/env node
/*
  Sanity non-destructive backfill script
  - Adds `suggestedProductsEnabled: true` to products if missing
  - Copies `calendlyUsername` -> `calcomUsername` and `calendlyDefaultEvent` -> `defaultEventSlug` for growers if alias missing
  - Sets default `rating: 0` and `isHighlyRatedBadgeThreshold: 4.5` for growers if missing

  Usage: SANITY_API_WRITE_TOKEN=<token> node scripts/migrate-deprecate-bundles-variants.js
*/

require('dotenv').config();
const fetch = global.fetch || require('node-fetch');

const PROJECT_ID = process.env.SANITY_STUDIO_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = process.env.SANITY_STUDIO_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const TOKEN = process.env.SANITY_API_WRITE_TOKEN;

if (!PROJECT_ID) {
  console.error('SANITY project ID not configured. Set SANITY_STUDIO_PROJECT_ID or NEXT_PUBLIC_SANITY_PROJECT_ID.');
  process.exit(1);
}
const DRY_RUN = process.argv.includes('--dry-run');
if (!TOKEN && !DRY_RUN) {
  console.error('SANITY_API_WRITE_TOKEN not set. Cannot run migrations without write access.');
  process.exit(1);
}

const API_BASE = `https://${PROJECT_ID}.api.sanity.io/v2024-11-26`;

async function query(groq) {
  const url = `${API_BASE}/data/query/${DATASET}?query=${encodeURIComponent(groq)}`;
  const res = await fetch(url);
  return res.json();
}

async function mutate(mutations) {
  const url = `${API_BASE}/data/mutate/${DATASET}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({mutations}),
  });
  return res.json();
}

(async function main() {
  try {
    console.log('[migrate] Fetching products...');
    const productsResp = await query(`*[_type == "product"]{_id, _rev, suggestedProductsEnabled}`);
    const products = productsResp.result || [];

    const productMutations = [];
    for (const p of products) {
      if (p.suggestedProductsEnabled === undefined) {
        productMutations.push({
          patch: {
            id: p._id,
            set: { suggestedProductsEnabled: true },
          }
        });
      }
    }

    console.log(`[migrate] Products to patch: ${productMutations.length}`);

    console.log('[migrate] Fetching growers...');
    const growersResp = await query(`*[_type == "grower"]{_id, calendlyUsername, calendlyDefaultEvent, calcomUsername, defaultEventSlug, rating, isHighlyRatedBadgeThreshold}`);
    const growers = growersResp.result || [];

    const growerMutations = [];
    for (const g of growers) {
      const set = {};
      if (!g.calcomUsername && g.calendlyUsername) set.calcomUsername = g.calendlyUsername;
      if (!g.defaultEventSlug && g.calendlyDefaultEvent) set.defaultEventSlug = g.calendlyDefaultEvent;
      // Set default CTA text for growers if missing
      if (!g.calcomButtonText) set.calcomButtonText = 'Schedule with Grower';
      if (g.rating === undefined || g.rating === null) set.rating = 0;
      if (g.isHighlyRatedBadgeThreshold === undefined || g.isHighlyRatedBadgeThreshold === null) set.isHighlyRatedBadgeThreshold = 4.5;
      if (Object.keys(set).length > 0) {
        growerMutations.push({ patch: { id: g._id, set } });
      }
    }

    console.log(`[migrate] Growers to patch: ${growerMutations.length}`);

    const allMutations = [...productMutations, ...growerMutations];
    if (allMutations.length === 0) {
      console.log('[migrate] Nothing to do. All docs up-to-date.');
      return;
    }

    console.log(`[migrate] Prepared ${allMutations.length} mutations.`);

    const DRY_RUN = process.argv.includes('--dry-run');
    if (DRY_RUN) {
      console.log('[migrate] Dry run mode - not sending mutations. Sample mutations below:');
      console.log(JSON.stringify(allMutations.slice(0, 10), null, 2));
      console.log('[migrate] (Use --dry-run to preview; omit to apply changes)');
      return;
    }

    console.log(`[migrate] Sending ${allMutations.length} mutations...`);
    const result = await mutate(allMutations);
    console.log('[migrate] Result:', JSON.stringify(result, null, 2));
    console.log('[migrate] Done.');
  } catch (err) {
    console.error('[migrate] Error:', err);
    process.exit(1);
  }
})();
