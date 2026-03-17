/**
 * useSellerProductSearch Hook
 * Fetches only the logged-in seller's products via the secure API route.
 * The API route reads the JWT cookie server-side to enforce sellerId filtering.
 */
'use client';

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import type { ProductFilters } from '@/types/product-filters';

export interface SellerProductSearchResult {
  _id: string;
  name: string;
  slug?: { current: string } | string;
  sku?: string;
  description?: string;
  price: number;
  originalPrice?: number;
  isOnPromo?: boolean;
  promoType?: string;
  promoPercentage?: number;
  promoPrice?: number;
  stockQuantity?: number;
  mainImage?: string;
  status?: string;
  stockStatus?: string;
  category?: { _id: string; name: string; slug: string };
  createdAt: string;
  updatedAt: string;
}

export interface SellerProductSearchResults {
  products: SellerProductSearchResult[];
  total: number;
  hasMore: boolean;
  page: number;
  pageSize: number;
}

async function fetchSellerProductsFromApi(
  filters: ProductFilters,
  page: number,
  pageSize: number
): Promise<SellerProductSearchResults> {
  const params = new URLSearchParams();

  if (filters.search) params.set('search', filters.search);
  if (filters.categories.length > 0) params.set('categories', filters.categories.join(','));
  if (filters.stockStatus && filters.stockStatus !== 'all') params.set('stockStatus', filters.stockStatus);
  if (filters.productStatus && filters.productStatus !== 'all') params.set('productStatus', filters.productStatus);
  if (filters.priceRange[0] > 0) params.set('priceMin', String(filters.priceRange[0]));
  if (filters.priceRange[1] < Infinity && isFinite(filters.priceRange[1])) {
    params.set('priceMax', String(filters.priceRange[1]));
  }
  if (filters.dateRange) {
    params.set('dateFrom', filters.dateRange.from.toISOString());
    params.set('dateTo', filters.dateRange.to.toISOString());
  }
  params.set('page', String(page));
  params.set('limit', String(pageSize));

  const res = await fetch(`/api/seller/products?${params.toString()}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Failed to load products');
  }

  const json = await res.json();

  // Map API shape { data, pagination } → ProductSearchResults shape
  const products: SellerProductSearchResult[] = (json.data || []).map((p: any) => ({
    _id: p.id,
    name: p.name,
    slug: p.slug ? { current: p.slug } : undefined,
    sku: p.sku,
    description: p.description,
    price: p.price,
    originalPrice: p.originalPrice,
    isOnPromo: p.isOnPromo,
    promoType: p.promoType,
    promoPercentage: p.promoPercentage,
    promoPrice: p.promoPrice,
    stockQuantity: p.stockQuantity ?? p.stock ?? 0,
    mainImage: p.image,
    status: p.status === 'Active' ? 'published' : p.status === 'Out of Stock' ? 'published' : 'draft',
    stockStatus: p.stockStatus,
    category: p.category ? { _id: '', name: p.category, slug: '' } : undefined,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }));

  const total = json.pagination?.total ?? products.length;
  const offset = (page - 1) * pageSize;

  return {
    products,
    total,
    hasMore: offset + products.length < total,
    page,
    pageSize,
  };
}

export function useSellerProductSearch(
  filters: ProductFilters,
  page: number = 1,
  pageSize: number = 50
): UseQueryResult<SellerProductSearchResults, Error> {
  return useQuery<SellerProductSearchResults, Error>({
    queryKey: ['seller-products', filters, page, pageSize],
    queryFn: () => fetchSellerProductsFromApi(filters, page, pageSize),
    staleTime: 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
}
