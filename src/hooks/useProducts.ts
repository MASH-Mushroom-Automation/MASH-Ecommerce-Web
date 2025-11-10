// Custom hooks for product data fetching
import { useState, useEffect, useCallback } from "react";
import { ProductsApi } from "@/lib/api/products";
import {
  ProductApiResponse,
  ProductsListParams,
  ApiResponse,
} from "@/types/api";

export interface UseProductsState {
  products: ProductApiResponse[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
}

export interface UseProductsActions {
  refetch: () => void;
  setParams: (params: ProductsListParams) => void;
}

export function useProducts(
  initialParams: ProductsListParams = {}
): UseProductsState & UseProductsActions {
  const [state, setState] = useState<UseProductsState>({
    products: [],
    loading: true,
    error: null,
    pagination: null,
  });

  const [params, setParams] = useState<ProductsListParams>(initialParams);

  const fetchProducts = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      console.log('[useProducts] Fetching products with params:', params);
      const response: ApiResponse<ProductApiResponse[]> =
        await ProductsApi.getProducts(params);

      console.log('[useProducts] Response:', response);

      setState({
        products: response.data,
        loading: false,
        error: null,
        pagination: response.pagination || null,
      });
    } catch (error) {
      console.error('[useProducts] Error fetching products:', error);
      setState({
        products: [],
        loading: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch products",
        pagination: null,
      });
    }
  }, [params]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const refetch = useCallback(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    ...state,
    refetch,
    setParams,
  };
}

export function useProduct(id: string) {
  const [product, setProduct] = useState<ProductApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await ProductsApi.getProductById(id);
        setProduct(response.data);
        if (!response.success) {
          setError(response.message || "Product not found");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch product"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  return { product, loading, error };
}

export function useProductCategories() {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await ProductsApi.getCategories();
        setCategories(response.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch categories"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
}

export function useProductGrowers() {
  const [growers, setGrowers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGrowers = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await ProductsApi.getGrowers();
        setGrowers(response.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch growers"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchGrowers();
  }, []);

  return { growers, loading, error };
}

export function useProductSearch() {
  const [searchResults, setSearchResults] = useState<ProductApiResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string, limit: number = 10) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await ProductsApi.searchProducts(query, limit);
      setSearchResults(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { searchResults, loading, error, search };
}
