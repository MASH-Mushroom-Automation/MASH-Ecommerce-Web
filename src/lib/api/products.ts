// API functions for product-related operations
import {
  ProductApiResponse,
  ProductsListParams,
  ApiResponse,
} from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

// For now, we'll use mock data but structure it for easy CMS integration
const MOCK_PRODUCTS: ProductApiResponse[] = [
  {
    id: "1",
    name: "Fresh White Oyster Mushrooms",
    description:
      "Delicate, nutty flavor perfect for stir-fries and soups. Harvested daily for maximum freshness.",
    price: 120,
    weight: "250g",
    images: [
      "/placeholder.png",
      "/placeholder.png",
      "/placeholder.png",
      "/placeholder.png",
    ],
    image: "/placeholder.png",
    category: "Fresh Mushroom",
    grower: "FungiFreshFarms",
    tag: "New",
    inStock: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    name: "Vibrant Pink Oyster Mushrooms",
    description:
      "Beautiful pink caps with a meaty texture—great for sautés and vegan bacon.",
    price: 140,
    weight: "250g",
    images: [
      "/placeholder.png",
      "/placeholder.png",
      "/placeholder.png",
      "/placeholder.png",
    ],
    image: "/placeholder.png",
    category: "Fresh Mushroom",
    grower: "FungiFreshFarms",
    inStock: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "3",
    name: "Blue Oyster Mushrooms",
    description:
      "Rich umami notes and dense texture—ideal for broths and roasts.",
    price: 150,
    weight: "200g",
    images: [
      "/placeholder.png",
      "/placeholder.png",
      "/placeholder.png",
      "/placeholder.png",
    ],
    image: "/placeholder.png",
    category: "Fresh Mushroom",
    grower: "TheMushroomPatchBukidnon",
    inStock: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "4",
    name: "DIY Mushroom Growing Kit",
    description:
      "Everything you need to grow your own oyster mushrooms at home! Perfect for beginners.",
    price: 350,
    weight: "1 kit",
    images: [
      "/placeholder.png",
      "/placeholder.png",
      "/placeholder.png",
      "/placeholder.png",
    ],
    image: "/placeholder.png",
    category: "Growing Kits",
    grower: "KingFarms",
    tag: "Popular",
    inStock: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "9",
    name: "Crispy Mushroom Chicharon",
    description:
      "Crunchy, savory mushroom snack—perfect with dips or as topping.",
    price: 150,
    weight: "100g pack",
    images: [
      "/placeholder.png",
      "/placeholder.png",
      "/placeholder.png",
      "/placeholder.png",
    ],
    image: "/placeholder.png",
    category: "Mushroom Products",
    grower: "FungiFreshFarms",
    inStock: true,
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
    await delay(300); // Simulate network delay

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
          p.description.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    if (params.sortBy) {
      filteredProducts.sort((a, b) => {
        let aVal: any = a[params.sortBy!];
        let bVal: any = b[params.sortBy!];

        if (params.sortBy === "price") {
          aVal = a.price;
          bVal = b.price;
        }

        if (params.sortOrder === "desc") {
          return bVal > aVal ? 1 : -1;
        }
        return aVal > bVal ? 1 : -1;
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

  // Get single product by ID
  static async getProductById(
    id: string
  ): Promise<ApiResponse<ProductApiResponse | null>> {
    await delay(200);

    const product = MOCK_PRODUCTS.find((p) => p.id === id);

    return {
      data: product || null,
      success: !!product,
      message: product ? undefined : "Product not found",
    };
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

    const growers = Array.from(new Set(MOCK_PRODUCTS.map((p) => p.grower)));

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
        p.description.toLowerCase().includes(searchLower) ||
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
