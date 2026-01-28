#!/usr/bin/env node
require('dotenv').config();
const fetch = global.fetch || require('node-fetch');

const PROJECT_ID = process.env.SANITY_STUDIO_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = process.env.SANITY_STUDIO_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const TOKEN = process.env.SANITY_API_WRITE_TOKEN;

if (!PROJECT_ID || !TOKEN) {
  console.error('Missing SANITY Project ID or SANITY_API_WRITE_TOKEN in environment');
  process.exit(1);
}

const slug = process.argv[2] || 'fungi-fresh-farms';
const embed = process.argv[3] || `https://www.google.com/maps?q=${encodeURIComponent('14.7583,121.0453')}&z=15&output=embed`;

(async function main(){
  try {
    // Find the grower doc
    const q = `*[_type == "grower" && slug.current == "${slug}"][0]{_id}`;
    const resp = await fetch(`https://${PROJECT_ID}.apicdn.sanity.io/v2024-11-26/data/query/${DATASET}?query=${encodeURIComponent(q)}&returnQuery=false`);
    const j = await resp.json();
    const id = j.result?._id;
    if (!id) {
      console.error('Grower not found:', slug);
      process.exit(1);
    }
    console.log('Found grower id:', id);

    const mutations = [
      { patch: { id, set: { googleMapsEmbedUrl: embed } } }
    ];

    const mutateResp = await fetch(`https://${PROJECT_ID}.api.sanity.io/v2024-11-26/data/mutate/${DATASET}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      },
      body: JSON.stringify({ mutations })
    });

    const mr = await mutateResp.json();
    console.log('Mutate result:', JSON.stringify(mr, null, 2));
  } catch (err) {
    console.error('Error patching grower:', err);
    process.exit(1);
  }
})();