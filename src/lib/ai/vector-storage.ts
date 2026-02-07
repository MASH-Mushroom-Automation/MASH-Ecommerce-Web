/**
 * Vector Storage Service
 * 
 * Manages storage and retrieval of product embeddings in Firestore.
 * Schema: products/{productId}/embeddings/{version}
 * 
 * Part of AI Chatbot ML Enhancement Plan - Phase 2: Vector Embeddings
 * @see .github/AI_CHATBOT_ML_ENHANCEMENT_PLAN.md - Phase 2, Task 2
 */

import { db } from '@/lib/firebase/config';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  query,
  where,
  writeBatch,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import type { EmbeddingVector, ProductText } from './embeddings';
import { generateBatchEmbeddings } from './embeddings';

/**
 * Embedding document structure in Firestore
 */
export interface EmbeddingDocument {
  /** Product ID */
  productId: string;
  /** 384-dimensional embedding vector */
  embedding: number[];
  /** Model used to generate embedding */
  model: string;
  /** Model version for tracking */
  version: string;
  /** Vector dimensions (should be 384) */
  dimensions: number;
  /** Product text used for embedding */
  text: string;
  /** Timestamp when created */
  createdAt: Timestamp;
  /** Timestamp when last updated */
  updatedAt: Timestamp;
}

/**
 * Batch storage result
 */
export interface BatchStorageResult {
  /** Number of embeddings successfully stored */
  success: number;
  /** Number of embeddings that failed */
  failed: number;
  /** Product IDs that failed */
  failedIds: string[];
  /** Error messages for failed products */
  errors: Array<{ productId: string; error: string }>;
}

/**
 * Options for storing embeddings
 */
export interface StorageOptions {
  /** Model version (e.g., "v1", "v2") */
  version?: string;
  /** Whether to overwrite existing embeddings */
  overwrite?: boolean;
}

// Constants
const EMBEDDING_MODEL = 'sentence-transformers/all-MiniLM-L6-v2';
const DEFAULT_VERSION = 'v1';
const BATCH_SIZE = 500; // Firestore batch write limit

/**
 * Store a single product embedding in Firestore
 * 
 * @param productId - Unique product identifier
 * @param embedding - 384-dimensional embedding vector
 * @param text - Product text used to generate embedding
 * @param options - Storage options
 * @returns Promise that resolves when stored
 * 
 * @example
 * ```ts
 * await storeEmbedding('prod-123', embedding, 'Fresh button mushrooms', { version: 'v1' });
 * ```
 */
export async function storeEmbedding(
  productId: string,
  embedding: EmbeddingVector,
  text: string,
  options: StorageOptions = {}
): Promise<void> {
  const { version = DEFAULT_VERSION, overwrite = true } = options;

  if (!productId || productId.trim().length === 0) {
    throw new Error('Product ID cannot be empty');
  }

  if (!embedding || embedding.length !== 384) {
    throw new Error(`Invalid embedding dimensions: ${embedding?.length || 0}, expected 384`);
  }

  // Check if embedding already exists
  if (!overwrite) {
    const existing = await getEmbedding(productId, version);
    if (existing) {
      console.warn(`[VectorStorage] Embedding already exists for ${productId}, skipping`);
      return;
    }
  }

  const embeddingDoc: EmbeddingDocument = {
    productId,
    embedding,
    model: EMBEDDING_MODEL,
    version,
    dimensions: embedding.length,
    text,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  // Store in: products/{productId}/embeddings/{version}
  const embeddingRef = doc(db, 'products', productId, 'embeddings', version);
  
  try {
    await setDoc(embeddingRef, embeddingDoc);
    console.log(`[VectorStorage] Stored embedding for product ${productId} (version: ${version})`);
  } catch (error) {
    console.error(`[VectorStorage] Failed to store embedding for ${productId}:`, error);
    throw error;
  }
}

/**
 * Retrieve a product embedding from Firestore
 * 
 * @param productId - Product identifier
 * @param version - Model version (defaults to v1)
 * @returns Embedding document or null if not found
 * 
 * @example
 * ```ts
 * const embedding = await getEmbedding('prod-123');
 * if (embedding) {
 *   console.log('Vector:', embedding.embedding);
 * }
 * ```
 */
export async function getEmbedding(
  productId: string,
  version: string = DEFAULT_VERSION
): Promise<EmbeddingDocument | null> {
  if (!productId || productId.trim().length === 0) {
    throw new Error('Product ID cannot be empty');
  }

  const embeddingRef = doc(db, 'products', productId, 'embeddings', version);
  
  try {
    const snapshot = await getDoc(embeddingRef);
    
    if (!snapshot.exists()) {
      return null;
    }

    return snapshot.data() as EmbeddingDocument;
  } catch (error) {
    console.error(`[VectorStorage] Failed to retrieve embedding for ${productId}:`, error);
    throw error;
  }
}

/**
 * Store multiple product embeddings in batch
 * Uses Firestore batch writes for efficiency (max 500 per batch)
 * 
 * @param products - Array of products with IDs and text
 * @param options - Storage options
 * @returns Batch storage result with success/failure counts
 * 
 * @example
 * ```ts
 * const products = [
 *   { id: 'prod-1', text: 'Fresh button mushrooms' },
 *   { id: 'prod-2', text: 'Shiitake mushrooms dried' }
 * ];
 * const result = await storeEmbeddingsBatch(products);
 * console.log(`Stored: ${result.success}, Failed: ${result.failed}`);
 * ```
 */
export async function storeEmbeddingsBatch(
  products: ProductText[],
  options: StorageOptions = {}
): Promise<BatchStorageResult> {
  const { version = DEFAULT_VERSION, overwrite = true } = options;

  if (!products || products.length === 0) {
    return { success: 0, failed: 0, failedIds: [], errors: [] };
  }

  console.log(`[VectorStorage] Starting batch storage for ${products.length} products`);

  const result: BatchStorageResult = {
    success: 0,
    failed: 0,
    failedIds: [],
    errors: [],
  };

  try {
    // Step 1: Generate embeddings in batch
    console.log('[VectorStorage] Generating embeddings...');
    const embeddingResults = await generateBatchEmbeddings(products);
    
    // Step 2: Store in Firestore using batched writes
    console.log('[VectorStorage] Storing embeddings in Firestore...');
    
    // Split into chunks of BATCH_SIZE for Firestore batch writes
    for (let i = 0; i < embeddingResults.length; i += BATCH_SIZE) {
      const chunk = embeddingResults.slice(i, i + BATCH_SIZE);
      const batch = writeBatch(db);

      for (const embeddingResult of chunk) {
        const product = products.find(p => p.id === embeddingResult.id);
        if (!product) {
          result.failed++;
          result.failedIds.push(embeddingResult.id);
          result.errors.push({
            productId: embeddingResult.id,
            error: 'Product not found in input array',
          });
          continue;
        }

        const embeddingDoc: EmbeddingDocument = {
          productId: embeddingResult.id,
          embedding: embeddingResult.embedding,
          model: EMBEDDING_MODEL,
          version,
          dimensions: embeddingResult.dimensions,
          text: product.text,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        };

        const embeddingRef = doc(db, 'products', embeddingResult.id, 'embeddings', version);
        batch.set(embeddingRef, embeddingDoc);
      }

      // Commit batch
      await batch.commit();
      result.success += chunk.length;
      
      console.log(
        `[VectorStorage] Batch ${Math.floor(i / BATCH_SIZE) + 1}: ` +
        `Stored ${chunk.length} embeddings (Total: ${result.success}/${embeddingResults.length})`
      );
    }

    console.log(
      `[VectorStorage] Batch storage complete: ` +
      `${result.success} success, ${result.failed} failed`
    );

    return result;
  } catch (error) {
    console.error('[VectorStorage] Batch storage failed:', error);
    throw error;
  }
}

/**
 * Retrieve all embeddings for a specific version
 * 
 * @param version - Model version (defaults to v1)
 * @param limit - Maximum number of embeddings to retrieve
 * @returns Array of embedding documents
 * 
 * @example
 * ```ts
 * const embeddings = await getAllEmbeddings('v1', 100);
 * console.log(`Found ${embeddings.length} embeddings`);
 * ```
 */
export async function getAllEmbeddings(
  version: string = DEFAULT_VERSION,
  limit?: number
): Promise<EmbeddingDocument[]> {
  const embeddings: EmbeddingDocument[] = [];

  try {
    console.log(`[VectorStorage] Retrieving all embeddings (version: ${version})`);

    // Query all products
    const productsRef = collection(db, 'products');
    const productsSnapshot = await getDocs(productsRef);

    // For each product, get its embedding subcollection
    for (const productDoc of productsSnapshot.docs) {
      const embeddingRef = doc(db, 'products', productDoc.id, 'embeddings', version);
      const embeddingSnapshot = await getDoc(embeddingRef);

      if (embeddingSnapshot.exists()) {
        embeddings.push(embeddingSnapshot.data() as EmbeddingDocument);
        
        if (limit && embeddings.length >= limit) {
          break;
        }
      }
    }

    console.log(`[VectorStorage] Retrieved ${embeddings.length} embeddings`);
    return embeddings;
  } catch (error) {
    console.error('[VectorStorage] Failed to retrieve all embeddings:', error);
    throw error;
  }
}

/**
 * Delete an embedding for a product
 * 
 * @param productId - Product identifier
 * @param version - Model version
 * @returns Promise that resolves when deleted
 * 
 * @example
 * ```ts
 * await deleteEmbedding('prod-123', 'v1');
 * ```
 */
export async function deleteEmbedding(
  productId: string,
  version: string = DEFAULT_VERSION
): Promise<void> {
  if (!productId || productId.trim().length === 0) {
    throw new Error('Product ID cannot be empty');
  }

  const embeddingRef = doc(db, 'products', productId, 'embeddings', version);
  
  try {
    await setDoc(embeddingRef, { deleted: true }, { merge: true });
    console.log(`[VectorStorage] Deleted embedding for product ${productId}`);
  } catch (error) {
    console.error(`[VectorStorage] Failed to delete embedding for ${productId}:`, error);
    throw error;
  }
}

/**
 * Check if an embedding exists for a product
 * 
 * @param productId - Product identifier
 * @param version - Model version
 * @returns True if embedding exists, false otherwise
 * 
 * @example
 * ```ts
 * const exists = await embeddingExists('prod-123');
 * if (!exists) {
 *   await generateAndStoreEmbedding(product);
 * }
 * ```
 */
export async function embeddingExists(
  productId: string,
  version: string = DEFAULT_VERSION
): Promise<boolean> {
  const embedding = await getEmbedding(productId, version);
  return embedding !== null;
}

/**
 * Get storage statistics
 * 
 * @param version - Model version
 * @returns Storage statistics
 * 
 * @example
 * ```ts
 * const stats = await getStorageStats('v1');
 * console.log(`Total embeddings: ${stats.totalEmbeddings}`);
 * ```
 */
export async function getStorageStats(
  version: string = DEFAULT_VERSION
): Promise<{
  totalEmbeddings: number;
  version: string;
  model: string;
}> {
  const embeddings = await getAllEmbeddings(version);
  
  return {
    totalEmbeddings: embeddings.length,
    version,
    model: EMBEDDING_MODEL,
  };
}
