import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: 'gerattrr',
  dataset: 'production',
  apiVersion: '2024-11-26',
  token: process.env.SANITY_API_READ_TOKEN,
  useCdn: false
});

const result = await client.fetch(`*[_type == "featuredProducts"][0]{ _id }`);
console.log('Existing featuredProducts:', result ? result._id : 'None');
