require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'gerattrr',
  dataset: 'production',
  apiVersion: '2024-11-26',
  useCdn: false,
});

async function checkSlugs() {
  const stores = await client.fetch('*[_type == "store"]{name, "slug": slug.current}');
  console.log('Stores:', JSON.stringify(stores, null, 2));
}

checkSlugs();
