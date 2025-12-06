const { createClient } = require('@sanity/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  projectId: 'gerattrr',
  dataset: 'production',
  apiVersion: '2024-11-26',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false
});

client.fetch('*[_type == "grower"] { name, slug, location }')
  .then(r => {
    console.log('Growers in Sanity:', r.length);
    r.forEach(g => console.log(`  - ${g.name} (${g.location})`));
  })
  .catch(e => console.error(e));
