'use client';

import { useEffect, useState, useCallback } from 'react';
import { sanityClient } from '@/lib/sanity/client';

// ========== TYPES ==========

export interface SanityFAQCategory {
  _id: string;
  name: string;
  slug: { current: string };
  description?: string;
  icon?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface SanityFAQItem {
  _id: string;
  question: string;
  answer: string;
  richAnswer?: unknown[]; // Portable Text blocks
  category: SanityFAQCategory;
  displayOrder: number;
  isActive: boolean;
  isFeatured: boolean;
  tags?: string[];
  relatedFAQs?: SanityFAQItem[];
  helpfulCount: number;
  notHelpfulCount: number;
  _createdAt: string;
  _updatedAt: string;
}

// Group structure for backwards compatibility with existing component
export interface SanityFAQGroup {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  displayOrder: number;
  isActive: boolean;
  questions: SanityFAQQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface SanityFAQQuestion {
  id: string;
  categoryId: string;
  question: string;
  answer: string;
  richAnswer?: unknown[];
  displayOrder: number;
  isActive: boolean;
  isFeatured: boolean;
  tags?: string[];
  helpfulCount: number;
  notHelpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

// ========== GROQ QUERIES ==========

const FAQ_CATEGORY_FIELDS = `
  _id,
  name,
  slug,
  description,
  icon,
  displayOrder,
  isActive
`;

const FAQ_ITEM_FIELDS = `
  _id,
  question,
  answer,
  richAnswer,
  category->{${FAQ_CATEGORY_FIELDS}},
  displayOrder,
  isActive,
  isFeatured,
  tags,
  helpfulCount,
  notHelpfulCount,
  _createdAt,
  _updatedAt
`;

// Get all active FAQ items grouped by category
const FAQS_GROUPED_QUERY = `
  *[_type == "faqCategory" && isActive == true] | order(displayOrder asc) {
    ${FAQ_CATEGORY_FIELDS},
    "questions": *[_type == "faqItem" && isActive == true && references(^._id)] | order(displayOrder asc) {
      ${FAQ_ITEM_FIELDS}
    }
  }
`;

// Get all FAQ categories
const FAQ_CATEGORIES_QUERY = `
  *[_type == "faqCategory" && isActive == true] | order(displayOrder asc) {
    ${FAQ_CATEGORY_FIELDS}
  }
`;

// Get all FAQ items (flat list)
const FAQ_ITEMS_QUERY = `
  *[_type == "faqItem" && isActive == true] | order(displayOrder asc) {
    ${FAQ_ITEM_FIELDS}
  }
`;

// Get featured FAQs
const FEATURED_FAQS_QUERY = `
  *[_type == "faqItem" && isActive == true && isFeatured == true] | order(helpfulCount desc) [0...10] {
    ${FAQ_ITEM_FIELDS}
  }
`;

// Get FAQs by category slug
const FAQS_BY_CATEGORY_QUERY = `
  *[_type == "faqItem" && isActive == true && category->slug.current == $categorySlug] | order(displayOrder asc) {
    ${FAQ_ITEM_FIELDS}
  }
`;

// Search FAQs by keyword
const SEARCH_FAQS_QUERY = `
  *[_type == "faqItem" && isActive == true && (
    question match $searchTerm ||
    answer match $searchTerm ||
    $searchTerm in tags
  )] | order(helpfulCount desc) [0...20] {
    ${FAQ_ITEM_FIELDS}
  }
`;

// ========== TRANSFORMER ==========

// Transform Sanity FAQ data to match existing FAQGroup interface
function transformToFAQGroups(data: any[]): SanityFAQGroup[] {
  return data
    .filter(category => category.questions && category.questions.length > 0)
    .map(category => ({
      id: category._id,
      name: category.name,
      slug: category.slug?.current || '',
      description: category.description,
      icon: category.icon,
      displayOrder: category.displayOrder || 0,
      isActive: category.isActive !== false,
      questions: (category.questions || []).map((q: any) => ({
        id: q._id,
        categoryId: category._id,
        question: q.question,
        answer: q.answer,
        richAnswer: q.richAnswer,
        displayOrder: q.displayOrder || 0,
        isActive: q.isActive !== false,
        isFeatured: q.isFeatured || false,
        tags: q.tags || [],
        helpfulCount: q.helpfulCount || 0,
        notHelpfulCount: q.notHelpfulCount || 0,
        createdAt: q._createdAt,
        updatedAt: q._updatedAt,
      })),
      createdAt: category._createdAt || new Date().toISOString(),
      updatedAt: category._updatedAt || new Date().toISOString(),
    }));
}

// ========== HOOKS ==========

/**
 * Fetch all FAQs grouped by category from Sanity
 * Returns data compatible with existing CMSFAQSection component
 */
export function useSanityFAQs() {
  const [faqs, setFaqs] = useState<SanityFAQGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFAQs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await sanityClient.fetch(FAQS_GROUPED_QUERY);
      const transformedData = transformToFAQGroups(data);
      setFaqs(transformedData);
    } catch (err) {
      console.error('Error fetching FAQs from Sanity:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch FAQs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFAQs();
  }, [fetchFAQs]);

  return {
    faqs,
    loading,
    error,
    refetch: fetchFAQs,
  };
}

/**
 * Fetch all FAQ categories from Sanity
 */
export function useSanityFAQCategories() {
  const [categories, setCategories] = useState<SanityFAQCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await sanityClient.fetch(FAQ_CATEGORIES_QUERY);
      setCategories(data);
    } catch (err) {
      console.error('Error fetching FAQ categories from Sanity:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  };
}

/**
 * Fetch featured FAQs from Sanity
 */
export function useSanityFeaturedFAQs() {
  const [faqs, setFaqs] = useState<SanityFAQQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeaturedFAQs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await sanityClient.fetch(FEATURED_FAQS_QUERY);
      const transformed = data.map((q: any) => ({
        id: q._id,
        categoryId: q.category?._id || '',
        question: q.question,
        answer: q.answer,
        richAnswer: q.richAnswer,
        displayOrder: q.displayOrder || 0,
        isActive: q.isActive !== false,
        isFeatured: q.isFeatured || false,
        tags: q.tags || [],
        helpfulCount: q.helpfulCount || 0,
        notHelpfulCount: q.notHelpfulCount || 0,
        createdAt: q._createdAt,
        updatedAt: q._updatedAt,
      }));
      setFaqs(transformed);
    } catch (err) {
      console.error('Error fetching featured FAQs from Sanity:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch featured FAQs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeaturedFAQs();
  }, [fetchFeaturedFAQs]);

  return {
    faqs,
    loading,
    error,
    refetch: fetchFeaturedFAQs,
  };
}

/**
 * Fetch FAQs by category slug from Sanity
 */
export function useSanityFAQsByCategory(categorySlug: string) {
  const [faqs, setFaqs] = useState<SanityFAQQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFAQs = useCallback(async () => {
    if (!categorySlug) {
      setFaqs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await sanityClient.fetch(FAQS_BY_CATEGORY_QUERY, { categorySlug });
      const transformed = data.map((q: any) => ({
        id: q._id,
        categoryId: q.category?._id || '',
        question: q.question,
        answer: q.answer,
        richAnswer: q.richAnswer,
        displayOrder: q.displayOrder || 0,
        isActive: q.isActive !== false,
        isFeatured: q.isFeatured || false,
        tags: q.tags || [],
        helpfulCount: q.helpfulCount || 0,
        notHelpfulCount: q.notHelpfulCount || 0,
        createdAt: q._createdAt,
        updatedAt: q._updatedAt,
      }));
      setFaqs(transformed);
    } catch (err) {
      console.error('Error fetching FAQs by category from Sanity:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch FAQs');
    } finally {
      setLoading(false);
    }
  }, [categorySlug]);

  useEffect(() => {
    fetchFAQs();
  }, [fetchFAQs]);

  return {
    faqs,
    loading,
    error,
    refetch: fetchFAQs,
  };
}

/**
 * Search FAQs by keyword from Sanity
 */
export function useSanitySearchFAQs(searchTerm: string) {
  const [faqs, setFaqs] = useState<SanityFAQQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchFAQs = useCallback(async (term: string) => {
    if (!term || term.length < 2) {
      setFaqs([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Add wildcards for partial matching
      const data = await sanityClient.fetch(SEARCH_FAQS_QUERY, { 
        searchTerm: `*${term}*` 
      });
      const transformed = data.map((q: any) => ({
        id: q._id,
        categoryId: q.category?._id || '',
        question: q.question,
        answer: q.answer,
        richAnswer: q.richAnswer,
        displayOrder: q.displayOrder || 0,
        isActive: q.isActive !== false,
        isFeatured: q.isFeatured || false,
        tags: q.tags || [],
        helpfulCount: q.helpfulCount || 0,
        notHelpfulCount: q.notHelpfulCount || 0,
        createdAt: q._createdAt,
        updatedAt: q._updatedAt,
      }));
      setFaqs(transformed);
    } catch (err) {
      console.error('Error searching FAQs from Sanity:', err);
      setError(err instanceof Error ? err.message : 'Failed to search FAQs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchFAQs(searchTerm);
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchTerm, searchFAQs]);

  return {
    faqs,
    loading,
    error,
    search: searchFAQs,
  };
}

// ========== API FUNCTIONS ==========

/**
 * Fetch all FAQs grouped by category (for server components)
 */
export async function getSanityFAQs(): Promise<SanityFAQGroup[]> {
  try {
    const data = await sanityClient.fetch(FAQS_GROUPED_QUERY);
    return transformToFAQGroups(data);
  } catch (err) {
    console.error('Error fetching FAQs from Sanity:', err);
    return [];
  }
}

/**
 * Fetch all FAQ categories (for server components)
 */
export async function getSanityFAQCategories(): Promise<SanityFAQCategory[]> {
  try {
    return await sanityClient.fetch(FAQ_CATEGORIES_QUERY);
  } catch (err) {
    console.error('Error fetching FAQ categories from Sanity:', err);
    return [];
  }
}

/**
 * Fetch featured FAQs (for server components)
 */
export async function getSanityFeaturedFAQs(): Promise<SanityFAQQuestion[]> {
  try {
    const data = await sanityClient.fetch(FEATURED_FAQS_QUERY);
    return data.map((q: any) => ({
      id: q._id,
      categoryId: q.category?._id || '',
      question: q.question,
      answer: q.answer,
      richAnswer: q.richAnswer,
      displayOrder: q.displayOrder || 0,
      isActive: q.isActive !== false,
      isFeatured: q.isFeatured || false,
      tags: q.tags || [],
      helpfulCount: q.helpfulCount || 0,
      notHelpfulCount: q.notHelpfulCount || 0,
      createdAt: q._createdAt,
      updatedAt: q._updatedAt,
    }));
  } catch (err) {
    console.error('Error fetching featured FAQs from Sanity:', err);
    return [];
  }
}
