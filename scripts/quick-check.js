// Quick check for product suggestions
const { createClient } = require('@sanity/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: 'production',
  token: process.env.SANITY_API_WRITE_TOKEN,
  apiVersion: '2024-11-26',
  useCdn: false
});

async function check() {
  const products = await client.fetch(`*[_type == "product"][0..3]{
    name,
    "suggestedCount": count(suggestedProducts),
    "complementaryCount": count(complementaryProducts),
    suggestedProducts[]->{ name },
    complementaryProducts[]->{ name }
  }`);
  console.log(JSON.stringify(products, null, 2));
}

check();
