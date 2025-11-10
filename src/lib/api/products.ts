// API functions for product-related operations
import {
  ProductApiResponse,
  ProductsListParams,
  ApiResponse,
} from "@/types/api";
import apiClient from './client';

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

// Backend response types
interface BackendProductResponse {
  id: string;
  name: string;
  slug: string;
  price: string; // Backend returns string
  stock: number;
  images: string[];
  description?: string;
  sku?: string;
  comparePrice?: string;
  costPrice?: string;
  minStock?: number;
  weight?: string;
}

interface BackendResponse<T> {
  success: boolean;
  statusCode: number;
  data: T;
  timestamp: string;
  path: string;
  correlationId: string;
}

interface ProductsData {
  data: BackendProductResponse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Convert backend product to frontend format
function convertBackendProduct(backendProduct: BackendProductResponse): ProductApiResponse {
  return {
    id: backendProduct.id,
    name: backendProduct.name,
    slug: backendProduct.slug,
    sku: backendProduct.sku,
    description: backendProduct.description,
    price: parseFloat(backendProduct.price),
    comparePrice: backendProduct.comparePrice ? parseFloat(backendProduct.comparePrice) : undefined,
    costPrice: backendProduct.costPrice ? parseFloat(backendProduct.costPrice) : undefined,
    stock: backendProduct.stock,
    minStock: backendProduct.minStock || 5,
    weight: backendProduct.weight,
    images: backendProduct.images,
    image: backendProduct.images[0] || '/placeholder.jpg',
    category: 'Fresh Mushroom', // Default category
    categories: [],
    tags: [],
    grower: undefined,
    growerId: undefined,
    inStock: backendProduct.stock > 0,
    isActive: true,
    isFeatured: false,
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

// For now, we'll use mock data but structure it for easy CMS integration
const MOCK_PRODUCTS: ProductApiResponse[] = [
  {
    id: "1",
    name: "Fresh White Oyster Mushrooms",
    slug: "fresh-white-oyster-mushrooms",
    sku: "FWO-250G",
    description:
      "Delicate, nutty flavor perfect for stir-fries and soups. Harvested daily for maximum freshness.",
    price: 120,
    comparePrice: 150,
    stock: 45,
    minStock: 10,
    weight: "250g",
    images: [
      "/white.jpg",
      "/white-2.jpg",
      "/white-3.jpg",
      "/white-4.jpg",
    ],
    image: "/white.jpg",
    category: "Fresh Mushroom",
    categories: ["Fresh Mushroom", "Oyster Mushrooms"],
    tag: "New",
    tags: ["New", "Fresh", "Popular"],
    grower: "FungiFreshFarms",
    growerId: "grower_001",
    inStock: true,
    isActive: true,
    isFeatured: true,
    isDeleted: false,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    name: "Mushroom Chips",
    slug: "mushroom-chips",
    sku: "MC-100G",
    description:
      "Beautiful pink caps with a meaty texture—great for sautés and vegan bacon.",
    price: 140,
    stock: 30,
    minStock: 5,
    weight: "250g",
    images: [
      "/Pink-Oyster-1.webp",
      "/Pink-Oyster-2.webp",
      "/Pink-Oyster-3.webp",
      "/Pink-Oyster-4.webp",
    ],
    image: "/Pink-Oyster-1.webp",
    category: "Fresh Mushroom",
    categories: ["Fresh Mushroom", "Snacks"],
    tags: ["Chips", "Snack"],
    grower: "FungiFreshFarms",
    growerId: "grower_001",
    inStock: true,
    isActive: true,
    isFeatured: false,
    isDeleted: false,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "3",
    name: "Blue Oyster Mushrooms",
    slug: "blue-oyster-mushrooms",
    sku: "BOY-200G",
    description:
      "Rich umami notes and dense texture—ideal for broths and roasts.",
    price: 150,
    stock: 25,
    minStock: 8,
    weight: "200g",
    images: [
      "/blue-oyster-mushrooms.jpg",
      "/blue-1.webp",
      "/blue-2.webp",
      "/blue-3.webp",
    ],
    image: "/blue-oyster-mushrooms.jpg",
    category: "Fresh Mushroom",
    categories: ["Fresh Mushroom", "Oyster Mushrooms", "Premium"],
    tags: ["Fresh", "Gourmet"],
    grower: "TheMushroomPatchBukidnon",
    growerId: "grower_002",
    inStock: true,
    isActive: true,
    isFeatured: true,
    isDeleted: false,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "4",
    name: "White Oyster Mushroom Growing Kit",
    slug: "white-oyster-mushroom-growing-kit",
    sku: "WOK-2KG",
    description:
      "Our best-selling oyster mushroom growing kit! Perfect for beginners with complete instructions and guaranteed results.",
    price: 350,
    comparePrice: 400,
    stock: 18,
    minStock: 5,
    weight: "2kg complete growing kit with white oyster spawn",
    images: [
      "/kit-1.jpg",
      "/kit-2.webp",
      "/kit.jpg",
      "/kit-4.jpg",
    ],
    image: "/kit-1.jpg",
    category: "Growing Kits",
    categories: ["Growing Kits", "Beginner Friendly"],
    tag: "Popular",
    tags: ["Popular", "Best Seller", "Beginner Friendly"],
    grower: "KingFarms",
    growerId: "grower_003",
    inStock: true,
    isActive: true,
    isFeatured: true,
    isDeleted: false,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "9",
    name: "Crispy Mushroom Chicharon",
    slug: "crispy-mushroom-chicharon",
    sku: "CMC-100G",
    description:
      "Crunchy, savory mushroom snack—perfect with dips or as topping.",
    price: 150,
    stock: 40,
    minStock: 10,
    weight: "100g pack",
    images: [
      "/chicharon-1.jpg",
      "/chicharon-2.webp",
      "/chicharon-3.jpg",
      "/chicharon-4.jpg",
    ],
    image: "/chicharon-1.jpg",
    category: "Mushroom Products",
    categories: ["Mushroom Products", "Snacks"],
    tags: ["Snack", "Crispy"],
    grower: "FungiFreshFarms",
    growerId: "grower_001",
    inStock: true,
    isActive: true,
    isFeatured: false,
    isDeleted: false,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "10",
    name: "Bagoong Mushroom",
    slug: "bagoong-mushroom",
    sku: "BM-200G",
    description:
      "A rich, vegan-friendly twist on classic Filipino bagoong made from savory oyster mushrooms, delivering deep umami flavor without the seafood.",
    price: 380,
    stock: 12,
    minStock: 3,
    weight: "2kg substrate bag with pink oyster spawn",
    images: [
      "/bagoong.webp",
      "/bagoong-2.png",
      "/bagoong-3.png",
      "/bagoong-4.png",
    ],
    image: "/bagoong.webp",
    category: "Preserved Foods",
    categories: ["Preserved Foods", "Filipino Products"],
    tag: "New",
    tags: ["New", "Vegan", "Filipino"],
    grower: "FungiFreshFarms",
    growerId: "grower_001",
    inStock: true,
    isActive: true,
    isFeatured: true,
    isDeleted: false,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "11",
    name: "Blue Oyster Mushroom Growing Kit",
    slug: "blue-oyster-mushroom-growing-kit",
    sku: "BOK-2KG",
    description:
      "Experience the joy of growing blue oyster mushrooms in your own home! Complete beginner-friendly kit.",
    price: 370,
    stock: 15,
    minStock: 5,
    weight: "2kg substrate bag with blue oyster spawn",
    images: [
      "/blue-kit1.avif",
      "/blue-kit2.jpg",
      "/blue-kit3.avif",
      "/blue-kit4.jpg",
    ],
    image: "/blue-kit1.avif",
    category: "Growing Kits",
    categories: ["Growing Kits", "Beginner Friendly"],
    tag: "Popular",
    tags: ["Popular", "Beginner Friendly"],
    grower: "TheMushroomPatchBukidnon",
    growerId: "grower_002",
    inStock: true,
    isActive: true,
    isFeatured: true,
    isDeleted: false,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "12",
    name: "Premium Golden Oyster Growing Kit",
    slug: "premium-golden-oyster-growing-kit",
    sku: "GOK-2KG-PREM",
    description:
      "Grow beautiful golden oyster mushrooms at home! This premium kit produces stunning clusters of bright yellow oyster mushrooms.",
    price: 450,
    comparePrice: 550,
    stock: 8,
    minStock: 3,
    weight: "2kg substrate bag with golden oyster spawn",
    images: [
      "/gold-kit1.webp",
      "/gold-kit2.jpg",
      "/gold-kit3.jpg",
      "/gold-kit4.jpg",
    ],
    image: "/gold-kit1.webp",
    category: "Growing Kits",
    categories: ["Growing Kits", "Premium"],
    tag: "Premium",
    tags: ["Premium", "Gourmet"],
    grower: "KingFarms",
    growerId: "grower_003",
    inStock: true,
    isActive: true,
    isFeatured: false,
    isDeleted: false,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "13",
    name: "King Oyster Mushroom Growing Kit",
    slug: "king-oyster-mushroom-growing-kit",
    sku: "KOK-2.5KG",
    description:
      "Grow delicious king oyster mushrooms at home! Known for their meaty texture and robust flavor, perfect for gourmet cooking.",
    price: 420,
    stock: 10,
    minStock: 4,
    weight: "2.5kg substrate bag with king oyster spawn",
    images: [
      "/king-kit1.avif",
      "/king-kit2.webp",
      "/king-kit3.jpg",
      "/king-kit4.avif",
    ],
    image: "/king-kit1.avif",
    category: "Growing Kits",
    categories: ["Growing Kits", "Beginner Friendly", "Gourmet"],
    tag: "Beginner Friendly",
    tags: ["Beginner Friendly", "Gourmet"],
    grower: "FungiFreshFarms",
    growerId: "grower_001",
    inStock: true,
    isActive: true,
    isFeatured: false,
    isDeleted: false,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];

// Simulate API delay for realistic behavior
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class ProductsApi {
  // Get all products with filtering and pagination
  static async getProducts(
    params: ProductsListParams = {}
  ): Promise<ApiResponse<ProductApiResponse[]>> {
    // If using mock data, return mock products
    if (USE_MOCK_DATA) {
      await delay(300);

      let filteredProducts = [...MOCK_PRODUCTS];

      // Apply filters
      if (params.category) {
        filteredProducts = filteredProducts.filter(
          (p) => p.category === params.category
        );
      }

      if (params.grower) {
        filteredProducts = filteredProducts.filter(
          (p) => p.grower === params.grower
        );
      }

      if (params.minPrice !== undefined) {
        filteredProducts = filteredProducts.filter(
          (p) => p.price >= params.minPrice!
        );
      }

      if (params.maxPrice !== undefined) {
        filteredProducts = filteredProducts.filter(
          (p) => p.price <= params.maxPrice!
        );
      }

      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredProducts = filteredProducts.filter(
          (p) =>
            p.name.toLowerCase().includes(searchLower) ||
            p.description?.toLowerCase().includes(searchLower)
        );
      }

      // Apply sorting
      if (params.sortBy) {
        filteredProducts.sort((a, b) => {
          if (params.sortBy === "price") {
            const priceA = a.price;
            const priceB = b.price;
            if (params.sortOrder === "desc") {
              return priceB - priceA;
            }
            return priceA - priceB;
          }

          // For other fields, compare as strings
          const aVal = String(a[params.sortBy!] || '');
          const bVal = String(b[params.sortBy!] || '');

          if (params.sortOrder === "desc") {
            return bVal.localeCompare(aVal);
          }
          return aVal.localeCompare(bVal);
        });
      }

      // Apply pagination
      const page = params.page || 1;
      const limit = params.limit || 12;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

      return {
        data: paginatedProducts,
        success: true,
        pagination: {
          page,
          limit,
          total: filteredProducts.length,
          totalPages: Math.ceil(filteredProducts.length / limit),
        },
      };
    }

    // Use real Railway backend API
    try {
      const response = await apiClient.get<BackendResponse<ProductsData>>('/products', {
        params: {
          page: params.page || 1,
          limit: params.limit || 12,
          search: params.search,
          category: params.category,
          minPrice: params.minPrice,
          maxPrice: params.maxPrice,
          sortBy: params.sortBy,
          sortOrder: params.sortOrder,
        },
      });

      const { data, meta } = response.data.data;

      return {
        data: data.map(convertBackendProduct),
        success: true,
        pagination: {
          page: meta.page,
          limit: meta.limit,
          total: meta.total,
          totalPages: meta.totalPages,
        },
      };
    } catch (error) {
      console.error('Failed to fetch products from backend:', error);
      // Fallback to empty array on error
      return {
        data: [],
        success: false,
        message: 'Failed to fetch products',
        pagination: {
          page: 1,
          limit: 12,
          total: 0,
          totalPages: 0,
        },
      };
    }
  }

  // Get single product by ID
  static async getProductById(
    id: string
  ): Promise<ApiResponse<ProductApiResponse | null>> {
    // If using mock data
    if (USE_MOCK_DATA) {
      await delay(200);
      const product = MOCK_PRODUCTS.find((p) => p.id === id);
      return {
        data: product || null,
        success: !!product,
        message: product ? undefined : "Product not found",
      };
    }

    // Use real Railway backend API
    try {
      const response = await apiClient.get<BackendResponse<{ data: BackendProductResponse }>>(`/products/${id}`);
      return {
        data: convertBackendProduct(response.data.data.data),
        success: true,
      };
    } catch (error) {
      console.error(`Failed to fetch product ${id}:`, error);
      return {
        data: null,
        success: false,
        message: "Product not found",
      };
    }
  }

  // Get product categories
  static async getCategories(): Promise<ApiResponse<string[]>> {
    await delay(100);

    const categories = Array.from(
      new Set(MOCK_PRODUCTS.map((p) => p.category))
    );

    return {
      data: categories,
      success: true,
    };
  }

  // Get growers
  static async getGrowers(): Promise<ApiResponse<string[]>> {
    await delay(100);

    const growers = Array.from(new Set(MOCK_PRODUCTS.map((p) => p.grower).filter((g): g is string => g !== undefined)));

    return {
      data: growers,
      success: true,
    };
  }

  // Search products
  static async searchProducts(
    query: string,
    limit: number = 10
  ): Promise<ApiResponse<ProductApiResponse[]>> {
    await delay(200);

    const searchLower = query.toLowerCase();
    const results = MOCK_PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower) ||
        p.category.toLowerCase().includes(searchLower)
    ).slice(0, limit);

    return {
      data: results,
      success: true,
    };
  }
}

// TODO: Replace with actual API calls when backend is ready
// Example of how to integrate with real API:
/*
export class ProductsApi {
  static async getProducts(params: ProductsListParams = {}): Promise<ApiResponse<ProductApiResponse[]>> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    
    const response = await fetch(`${API_BASE_URL}/products?${searchParams}`);
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    
    return response.json();
  }
  
  static async getProductById(id: string): Promise<ApiResponse<ProductApiResponse | null>> {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch product');
    }
    
    return response.json();
  }
}
*/
