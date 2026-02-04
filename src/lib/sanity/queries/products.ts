/**
 * Sanity GROQ Queries for Product Search & Filtering
 * Optimized for seller product listing page
 */

import type { ProductFilters } from '@/types/product-filters';

/**
 * Build dynamic GROQ query for product search with filters
 * @param filters - Filter criteria
 * @param limit - Number of results to return
 * @param offset - Number of results to skip
 * @returns GROQ query string
 */
export function buildProductSearchQuery(
  filters: ProductFilters,
  limit: number = 50,
  offset: number = 0
): string {
  // Handle undefined or null filters - use defaults
  if (!filters) {
    return `
      *[_type == "product"] | order(_updatedAt desc) [${offset}...${offset + limit}] {
        _id,
        _createdAt,
        _updatedAt,
        name,
        slug,
        sku,
        description,
        price,
        stockQuantity,
        "mainImage": coalesce(mainImage.asset->url, image.asset->url),
        category-> { _id, name, slug },
        grower-> { _id, name, businessName },
        tags,
        featured,
        archived,
        "status": select(
          _id in path("drafts.**") => "draft",
          archived == true => "archived",
          "published"
        ),
        "stockStatus": select(
          stockQuantity > 10 => "in-stock",
          stockQuantity > 0 && stockQuantity <= 10 => "low-stock",
          "out-of-stock"
        )
      }
    `.trim();
  }

  const conditions: string[] = [];

  // Search text filter (name, SKU, description)
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    conditions.push(
      `(
        lower(name) match "${searchTerm}*" || 
        lower(sku) match "${searchTerm}*" || 
        lower(description) match "${searchTerm}*"
      )`
    );
  }

  // Category filter
  if (filters.categories.length > 0) {
    const categoryConditions = filters.categories.map(cat => 
      `category._ref == "${cat}" || category->slug.current == "${cat}"`
    ).join(' || ');
    conditions.push(`(${categoryConditions})`);
  }

  // Price range filter
  if (filters.priceRange[0] > 0 || filters.priceRange[1] < Infinity) {
    const [min, max] = filters.priceRange;
    if (max < Infinity) {
      conditions.push(`price >= ${min} && price <= ${max}`);
    } else {
      conditions.push(`price >= ${min}`);
    }
  }

  // Stock status filter
  if (filters.stockStatus !== 'all') {
    switch (filters.stockStatus) {
      case 'in-stock':
        conditions.push('stockQuantity > 10');
        break;
      case 'low-stock':
        conditions.push('stockQuantity > 0 && stockQuantity <= 10');
        break;
      case 'out-of-stock':
        conditions.push('stockQuantity <= 0 || !defined(stockQuantity)');
        break;
    }
  }

  // Product status filter
  if (filters.productStatus !== 'all') {
    switch (filters.productStatus) {
      case 'published':
        conditions.push('!(_id in path("drafts.**"))');
        break;
      case 'draft':
        conditions.push('_id in path("drafts.**")');
        break;
      case 'archived':
        conditions.push('archived == true');
        break;
    }
  }

  // Date range filter
  if (filters.dateRange) {
    const fromDate = filters.dateRange.from.toISOString();
    const toDate = filters.dateRange.to.toISOString();
    conditions.push(`_updatedAt >= "${fromDate}" && _updatedAt <= "${toDate}"`);
  }

  // Combine all conditions
  const whereClause = conditions.length > 0 
    ? `[${conditions.join(' && ')}]`
    : '';

  // Build complete query
  return `
    *[_type == "product" ${whereClause ? `&& ${conditions.join(' && ')}` : ''}] | order(_updatedAt desc) [${offset}...${offset + limit}] {
      _id,
      _createdAt,
      _updatedAt,
      name,
      slug,
      sku,
      description,
      price,
      "originalPrice": select(
        isOnPromo == true && promoType == "percentage" => price / (1 - promoPercentage / 100),
        isOnPromo == true && promoType == "fixed" => price + promoPrice,
        price
      ),
      isOnPromo,
      promoType,
      promoPercentage,
      promoPrice,
      stockQuantity,
      "mainImage": coalesce(mainImage.asset->url, image.asset->url),
      category-> {
        _id,
        name,
        slug
      },
      grower-> {
        _id,
        name,
        businessName
      },
      tags,
      featured,
      archived,
      "status": select(
        _id in path("drafts.**") => "draft",
        archived == true => "archived",
        "published"
      ),
      "stockStatus": select(
        stockQuantity > 10 => "in-stock",
        stockQuantity > 0 && stockQuantity <= 10 => "low-stock",
        "out-of-stock"
      )
    }
  `.trim();
}

/**
 * Query to get available filter options (categories, price ranges, etc.)
 * @returns GROQ query string
 */
export function getProductFiltersQuery(): string {
  // Note: Sanity GROQ doesn't support min/max on arrays directly
  // Use order + [0] pattern to get min/max values
  return `
    {
      "categories": *[_type == "category"] {
        "id": _id,
        name,
        "slug": slug.current,
        "productCount": count(*[_type == "product" && references(^._id)])
      } | order(productCount desc),
      "priceRange": {
        "min": coalesce(
          *[_type == "product" && !(_id in path("drafts.**")) && defined(price)] | order(price asc) [0].price,
          0
        ),
        "max": coalesce(
          *[_type == "product" && !(_id in path("drafts.**")) && defined(price)] | order(price desc) [0].price,
          10000
        )
      },
      "stockCounts": {
        "inStock": count(*[_type == "product" && stockQuantity > 10]),
        "lowStock": count(*[_type == "product" && stockQuantity > 0 && stockQuantity <= 10]),
        "outOfStock": count(*[_type == "product" && (stockQuantity <= 0 || !defined(stockQuantity))])
      },
      "statusCounts": {
        "published": count(*[_type == "product" && !(_id in path("drafts.**")) && archived != true]),
        "draft": count(*[_type == "product" && _id in path("drafts.**")]),
        "archived": count(*[_type == "product" && archived == true])
      }
    }
  `.trim();
}

/**
 * Query to count total products matching filters
 * @param filters - Filter criteria
 * @returns GROQ query string
 */
export function countProductsQuery(filters: ProductFilters): string {
  const query = buildProductSearchQuery(filters, 0, 0);
  // Extract the filter conditions from the query
  const match = query.match(/\*\[_type == "product"(.*?)\]/);
  const conditions = match ? match[1] : '';
  
  return `count(*[_type == "product" ${conditions}])`;
}

/**
 * Query to get product by ID or slug
 * @param idOrSlug - Product ID or slug
 * @returns GROQ query string
 */
export function getProductByIdOrSlugQuery(idOrSlug: string): string {
  return `
    *[_type == "product" && (_id == "${idOrSlug}" || slug.current == "${idOrSlug}")][0] {
      _id,
      _createdAt,
      _updatedAt,
      name,
      slug,
      sku,
      description,
      price,
      isOnPromo,
      promoType,
      promoPercentage,
      promoPrice,
      stockQuantity,
      "mainImage": coalesce(mainImage.asset->url, image.asset->url),
      "images": images[].asset->url,
      category-> {
        _id,
        name,
        slug
      },
      grower-> {
        _id,
        name,
        businessName
      },
      tags,
      featured,
      archived
    }
  `.trim();
}
