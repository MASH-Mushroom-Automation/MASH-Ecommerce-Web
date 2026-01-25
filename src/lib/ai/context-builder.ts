/**
 * Context Builder for RAG System
 * 
 * Builds structured context from search results for AI chatbot.
 * Formats product data for embedding in chat responses.
 * 
 * @see .github/AI_CHATBOT_MASTER_PLAN.md - Phase 3, Task 3.3
 */

import type { RAGProduct } from './sanity-rag';
import type { SearchResult } from './search-engine';

/**
 * Product context for AI prompt injection
 */
export interface ProductContext {
  products: ProductCardData[];
  summary: string;
  totalProducts: number;
}

/**
 * Product card data structure
 * Contains ALL fields needed to render product cards in chatbot
 */
export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string;
  category: string;
  inStock: boolean;
  grower?: {
    name: string;
    id: string;
  };
  tags: string[];
  benefits?: string[];
  relevanceScore: number;
  matchedFields: string[];
}

/**
 * Converts RAGProduct to ProductCardData
 * 
 * @param product - RAG product data
 * @param score - Relevance score
 * @param matchedFields - Fields that matched search
 * @returns Product card data
 */
export function toProductCardData(
  product: RAGProduct,
  score: number = 0,
  matchedFields: string[] = []
): ProductCardData {
  return {
    id: product._id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price,
    image: product.image,
    category: product.category,
    inStock: product.inStock,
    grower: product.grower,
    tags: product.tags,
    benefits: product.benefits,
    relevanceScore: score,
    matchedFields,
  };
}

/**
 * Builds text context for AI prompt from search results
 * Creates a formatted text representation of products
 * 
 * @param results - Search results
 * @returns Formatted text context
 */
export function buildTextContext(results: SearchResult[]): string {
  if (results.length === 0) {
    return 'No products found matching your query.';
  }

  const lines = ['Here are the most relevant products:\n'];

  results.forEach((result, index) => {
    const { product } = result;
    lines.push(`${index + 1}. **${product.name}** (₱${product.price})`);
    lines.push(`   ${product.description}`);
    lines.push(`   Category: ${product.category}`);
    
    if (product.grower) {
      lines.push(`   Seller: ${product.grower.name}`);
    }
    
    if (product.inStock) {
      lines.push(`   ✅ In Stock`);
    } else {
      lines.push(`   ❌ Out of Stock`);
    }
    
    if (product.benefits && product.benefits.length > 0) {
      lines.push(`   Benefits: ${product.benefits.join(', ')}`);
    }
    
    lines.push(''); // Empty line between products
  });

  return lines.join('\n');
}

/**
 * Builds structured product context for AI
 * Returns both product cards data AND text context
 * 
 * @param results - Search results
 * @returns Complete product context
 */
export function buildProductContext(results: SearchResult[]): ProductContext {
  const products = results.map((result) =>
    toProductCardData(result.product, result.score, result.matchedFields)
  );

  const summary = buildTextContext(results);

  return {
    products,
    summary,
    totalProducts: products.length,
  };
}

/**
 * Generates markdown links for products
 * Creates clickable links to product pages
 * 
 * @param products - Product card data
 * @returns Array of markdown links
 */
export function generateProductLinks(products: ProductCardData[]): string[] {
  return products.map((product) => {
    const stockStatus = product.inStock ? '✅' : '❌';
    return `${stockStatus} [${product.name}](/products/${product.slug}) - ₱${product.price}`;
  });
}

/**
 * Creates a summary sentence for AI response
 * 
 * @param results - Search results
 * @param query - Original user query
 * @returns Summary sentence
 */
export function createSummary(results: SearchResult[], query: string): string {
  if (results.length === 0) {
    return `I couldn't find any products matching "${query}". Try searching for oyster mushrooms, shiitake, or enoki.`;
  }

  const inStockCount = results.filter((r) => r.product.inStock).length;
  const categories = [...new Set(results.map((r) => r.product.category))];

  if (results.length === 1) {
    const product = results[0].product;
    return `I found **${product.name}** (${product.category}) for ₱${product.price}. ${
      product.inStock ? 'It\'s in stock!' : 'Currently out of stock.'
    }`;
  }

  let summary = `I found ${results.length} products`;
  
  if (categories.length === 1) {
    summary += ` in the ${categories[0]} category`;
  } else {
    summary += ` across ${categories.length} categories`;
  }
  
  if (inStockCount > 0) {
    summary += `, with ${inStockCount} in stock`;
  }
  
  summary += '.';
  
  return summary;
}

/**
 * Formats price for display
 * 
 * @param price - Price in PHP
 * @returns Formatted price string
 */
export function formatPrice(price: number): string {
  return `₱${price.toLocaleString('en-PH')}`;
}

/**
 * Generates recipe suggestions based on products
 * 
 * @param products - Product card data
 * @returns Recipe suggestion text
 */
export function generateRecipeSuggestions(products: ProductCardData[]): string {
  if (products.length === 0) return '';

  const productNames = products.map((p) => p.name.toLowerCase());
  
  const suggestions: string[] = [];

  if (productNames.some((n) => n.includes('oyster'))) {
    suggestions.push('Try making **Oyster Mushroom Sisig** or **Mushroom Stir-Fry**');
  }

  if (productNames.some((n) => n.includes('shiitake'))) {
    suggestions.push('Perfect for **Miso Soup** or **Asian Noodle Bowls**');
  }

  if (productNames.some((n) => n.includes('king'))) {
    suggestions.push('Great for **Grilled Mushroom Steaks** or **BBQ Skewers**');
  }

  if (suggestions.length === 0) {
    return 'These mushrooms are versatile and perfect for soups, stir-fries, and grilling!';
  }

  return suggestions.join('. ');
}

/**
 * Creates grower recommendation text
 * 
 * @param products - Product card data
 * @returns Grower recommendation
 */
export function generateGrowerRecommendation(products: ProductCardData[]): string {
  const growers = products
    .filter((p) => p.grower)
    .map((p) => p.grower!.name);
  
  const uniqueGrowers = [...new Set(growers)];
  
  if (uniqueGrowers.length === 0) {
    return '';
  }
  
  if (uniqueGrowers.length === 1) {
    return `All products are from **${uniqueGrowers[0]}**, a trusted local grower.`;
  }
  
  return `Products available from ${uniqueGrowers.length} local growers: ${uniqueGrowers.join(', ')}.`;
}

/**
 * Builds enhanced context with recommendations
 * Includes product context + recipe suggestions + grower info
 * 
 * @param results - Search results
 * @param query - User query
 * @returns Enhanced context object
 */
export function buildEnhancedContext(
  results: SearchResult[],
  query: string
): {
  productContext: ProductContext;
  summary: string;
  recipeSuggestions: string;
  growerInfo: string;
  links: string[];
} {
  const productContext = buildProductContext(results);
  const summary = createSummary(results, query);
  const recipeSuggestions = generateRecipeSuggestions(productContext.products);
  const growerInfo = generateGrowerRecommendation(productContext.products);
  const links = generateProductLinks(productContext.products);

  return {
    productContext,
    summary,
    recipeSuggestions,
    growerInfo,
    links,
  };
}

/**
 * Formats context for AI prompt injection
 * Creates the text that will be added to the system prompt
 * 
 * @param context - Enhanced context
 * @returns Formatted prompt context
 */
export function formatContextForPrompt(context: {
  productContext: ProductContext;
  summary: string;
  recipeSuggestions: string;
  growerInfo: string;
  links: string[];
}): string {
  const lines: string[] = [];

  lines.push('=== RELEVANT PRODUCTS ===');
  lines.push('');
  lines.push(context.productContext.summary);
  lines.push('');
  
  if (context.recipeSuggestions) {
    lines.push('=== RECIPE IDEAS ===');
    lines.push(context.recipeSuggestions);
    lines.push('');
  }
  
  if (context.growerInfo) {
    lines.push('=== SELLER INFO ===');
    lines.push(context.growerInfo);
    lines.push('');
  }

  lines.push('=== QUICK LINKS ===');
  lines.push(context.links.join('\n'));
  
  return lines.join('\n');
}
