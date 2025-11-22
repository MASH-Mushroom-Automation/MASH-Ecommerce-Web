/**
 * Sanity Client Library
 * Reusable Sanity client for all import/export scripts
 */

require('dotenv').config({ path: '.env.local' });
const {createClient} = require('@sanity/client');

// Validate environment variables
function validateEnv() {
  const required = [
    'NEXT_PUBLIC_SANITY_PROJECT_ID',
    'NEXT_PUBLIC_SANITY_DATASET',
    'SANITY_API_WRITE_TOKEN',
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach((key) => console.error(`   - ${key}`));
    console.error('\n💡 Make sure .env.local is configured correctly');
    process.exit(1);
  }
}

// Run validation
validateEnv();

// Create Sanity client
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_WRITE_TOKEN,
  apiVersion: '2024-11-22',
  useCdn: false, // Important: Disable CDN for write operations
});

/**
 * Test connection to Sanity
 */
async function testConnection() {
  try {
    const result = await client.fetch('*[_type == "product"][0...1]');
    console.log('✅ Connected to Sanity successfully');
    console.log(`   Project: ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}`);
    console.log(`   Dataset: ${process.env.NEXT_PUBLIC_SANITY_DATASET}`);
    console.log(`   Products found: ${result.length}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to Sanity:', error.message);
    return false;
  }
}

/**
 * Create a single document
 * @param {Object} doc - Document to create
 * @returns {Promise<Object>} Created document
 */
async function createDocument(doc) {
  try {
    const result = await client.create(doc);
    return result;
  } catch (error) {
    throw new Error(`Failed to create document: ${error.message}`);
  }
}

/**
 * Create multiple documents in a transaction
 * @param {Array} docs - Array of documents to create
 * @returns {Promise<Object>} Transaction result
 */
async function createDocuments(docs) {
  try {
    const transaction = client.transaction();
    
    docs.forEach((doc) => {
      transaction.create(doc);
    });
    
    const result = await transaction.commit();
    return result;
  } catch (error) {
    throw new Error(`Failed to create documents: ${error.message}`);
  }
}

/**
 * Update a document by ID
 * @param {string} id - Document ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated document
 */
async function updateDocument(id, updates) {
  try {
    const result = await client
      .patch(id)
      .set(updates)
      .commit();
    return result;
  } catch (error) {
    throw new Error(`Failed to update document ${id}: ${error.message}`);
  }
}

/**
 * Delete a document by ID
 * @param {string} id - Document ID
 * @returns {Promise<Object>} Deletion result
 */
async function deleteDocument(id) {
  try {
    const result = await client.delete(id);
    return result;
  } catch (error) {
    throw new Error(`Failed to delete document ${id}: ${error.message}`);
  }
}

/**
 * Delete multiple documents matching a GROQ query
 * @param {string} query - GROQ query (e.g., "*[_type == 'product']")
 * @returns {Promise<number>} Number of documents deleted
 */
async function deleteDocuments(query) {
  try {
    const docs = await client.fetch(`${query} { _id }`);
    
    if (docs.length === 0) {
      return 0;
    }
    
    const transaction = client.transaction();
    docs.forEach((doc) => {
      transaction.delete(doc._id);
    });
    
    await transaction.commit();
    return docs.length;
  } catch (error) {
    throw new Error(`Failed to delete documents: ${error.message}`);
  }
}

/**
 * Fetch documents with a GROQ query
 * @param {string} query - GROQ query
 * @returns {Promise<Array>} Array of documents
 */
async function fetchDocuments(query) {
  try {
    const result = await client.fetch(query);
    return result;
  } catch (error) {
    throw new Error(`Failed to fetch documents: ${error.message}`);
  }
}

/**
 * Upload an image asset
 * @param {Buffer} buffer - Image buffer
 * @param {string} filename - Image filename
 * @returns {Promise<Object>} Image asset reference
 */
async function uploadImage(buffer, filename) {
  try {
    const asset = await client.assets.upload('image', buffer, {
      filename: filename,
    });
    
    return {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: asset._id,
      },
    };
  } catch (error) {
    throw new Error(`Failed to upload image ${filename}: ${error.message}`);
  }
}

/**
 * Count documents of a specific type
 * @param {string} type - Document type (e.g., 'product', 'category')
 * @returns {Promise<number>} Document count
 */
async function countDocuments(type) {
  try {
    const result = await client.fetch(`count(*[_type == "${type}"])`);
    return result;
  } catch (error) {
    throw new Error(`Failed to count ${type} documents: ${error.message}`);
  }
}

// Export client and utility functions
module.exports = {
  client,
  testConnection,
  createDocument,
  createDocuments,
  updateDocument,
  deleteDocument,
  deleteDocuments,
  fetchDocuments,
  uploadImage,
  countDocuments,
};
