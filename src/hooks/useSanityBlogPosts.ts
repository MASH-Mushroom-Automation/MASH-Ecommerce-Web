"use client";

import { useEffect, useState, useCallback } from 'react';
import { sanityClient, listenSafe } from '@/lib/sanity/client';
import type { SanityPost } from '@/types/sanity';

/**
 * Transformed Blog Post Interface
 * Used for displaying blog posts on the website
 */
export interface TransformedBlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: unknown; // Portable Text (block content)
  mainImage: string;
  author: {
    name: string;
    image?: string;
    bio?: unknown;
  };
  categories: string[];
  publishedAt: string;
  readTime?: number; // Calculate based on content
  updatedAt: string;
}

/**
 * Blog Post Filter Options
 */
export interface BlogPostFilters {
  category?: string; // Filter by category name
  featured?: boolean; // Show only featured posts
  limit?: number; // Limit number of posts
  author?: string; // Filter by author name
}

/**
 * Transform Sanity blog post to app format
 */
function transformBlogPost(post: SanityPost): TransformedBlogPost {
  // Calculate read time (average 200 words per minute)
  const readTime = post.body 
    ? Math.ceil(JSON.stringify(post.body).length / 1000) 
    : 5;

  return {
    id: post._id,
    title: post.title,
    slug: post.slug.current,
    excerpt: post.excerpt || '',
    content: post.body || [],
    mainImage: post.mainImage || '/images/placeholder-blog.jpg',
    author: {
      name: post.author?.name || 'MASH Team',
      image: post.author?.image,
      bio: post.author?.bio || null,
    },
    categories: post.categories?.map((cat) => cat.name) || [],
    publishedAt: post.publishedAt,
    readTime,
    updatedAt: post._updatedAt,
  };
}

/**
 * Hook 1: Fetch all blog posts with real-time updates
 * 
 * Usage:
 * const { posts, loading, error, refetch } = useSanityBlogPosts({ 
 *   category: 'Health Benefits',
 *   limit: 10 
 * });
 */
export function useSanityBlogPosts(filters?: BlogPostFilters) {
  const [posts, setPosts] = useState<TransformedBlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Build GROQ query based on filters
  const buildQuery = useCallback(() => {
    let query = `*[_type == "post" && !(_id in path("drafts.**"))`;
    
    // Filter by published status (only show published posts)
    query += ` && publishedAt < now()`;
    
    // Filter by category
    if (filters?.category) {
      query += ` && "${filters.category}" in categories[]->name`;
    }
    
    // Filter by author
    if (filters?.author) {
      query += ` && author->name == "${filters.author}"`;
    }
    
    query += `] | order(publishedAt desc)`;
    
    // Apply limit
    if (filters?.limit) {
      query += ` [0...${filters.limit}]`;
    }
    
    // Select fields
    query += ` {
      _id,
      _createdAt,
      _updatedAt,
      title,
      slug,
      excerpt,
      body,
      publishedAt,
      "mainImage": mainImage.asset->url,
      author->{
        name,
        "image": image.asset->url,
        bio
      },
      categories[]->{
        name,
        "slug": slug.current
      }
    }`;
    
    return query;
  }, [filters?.category, filters?.author, filters?.limit]);

  // Fetch blog posts
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const query = buildQuery();
      console.log('📚 Fetching blog posts with query:', query);
      
      const data = await sanityClient.fetch<SanityPost[]>(query);
      
      // Transform posts for display
      const transformedPosts = data.map(transformBlogPost);
      
      setPosts(transformedPosts);
      console.log(`✅ Fetched ${transformedPosts.length} blog posts`);
    } catch (err) {
      console.error('❌ Error fetching blog posts:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [buildQuery]);

  useEffect(() => {
    // Initial fetch
    fetchPosts();

    // Set up real-time subscription
    const query = buildQuery();
    
    console.debug('🔌 Setting up blog posts real-time subscription');
    
    const subscription = listenSafe(query, {}, { includeResult: true })
      .subscribe((update) => {
        console.debug('📡 Blog posts mutation event received:', update.type);
        
        if (update.type === 'mutation' && update.result) {
          const data = update.result as unknown as SanityPost | SanityPost[];
          const postsArray = Array.isArray(data) ? data : [data];
          
          // Transform and update state
          const transformedPosts = postsArray.map(transformBlogPost);
          setPosts(transformedPosts);
          
          console.info(`🔄 Blog posts updated in real-time! Count: ${transformedPosts.length}`);
        }
      });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
      console.debug('🧹 Blog posts subscription cleaned up');
    };
  }, [fetchPosts, buildQuery]);

  return { 
    posts, 
    loading, 
    error, 
    refetch: fetchPosts 
  };
}

/**
 * Hook 2: Fetch single blog post by slug with real-time updates
 * 
 * Usage:
 * const { post, loading, error, refetch } = useSanityBlogPost('mushroom-health-benefits');
 */
export function useSanityBlogPost(slug: string) {
  const [post, setPost] = useState<TransformedBlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch single blog post
  const fetchPost = useCallback(async () => {
    if (!slug) {
      setPost(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const query = `*[_type == "post" && slug.current == $slug && !(_id in path("drafts.**"))][0] {
        _id,
        _createdAt,
        _updatedAt,
        title,
        slug,
        excerpt,
        body,
        publishedAt,
        "mainImage": mainImage.asset->url,
        author->{
          name,
          "image": image.asset->url,
          bio
        },
        categories[]->{
          name,
          "slug": slug.current
        }
      }`;
      
      console.log(`📄 Fetching blog post: ${slug}`);
      
      const data = await sanityClient.fetch<SanityPost>(query, { slug });
      
      if (data) {
        const transformedPost = transformBlogPost(data);
        setPost(transformedPost);
        console.log(`✅ Fetched blog post: ${transformedPost.title}`);
      } else {
        setPost(null);
        console.warn(`⚠️ Blog post not found: ${slug}`);
      }
    } catch (err) {
      console.error(`❌ Error fetching blog post ${slug}:`, err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (!slug) return;

    // Initial fetch
    fetchPost();

    // Set up real-time subscription for single post
    const query = `*[_type == "post" && slug.current == $slug && !(_id in path("drafts.**"))][0]`;
    
    console.log(`🔌 Setting up real-time subscription for blog post: ${slug}`);
    
    const subscription = listenSafe(query, { slug }, { includeResult: true })
      .subscribe((update) => {
        console.log(`📡 Blog post "${slug}" mutation event:`, update.type);
        
        if (update.type === 'mutation' && update.result) {
          const data = update.result as unknown as SanityPost;
          const transformedPost = transformBlogPost(data);
          setPost(transformedPost);
          
          console.log(`🔄 Blog post "${slug}" updated in real-time!`);
        }
      });

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
      console.log(`🧹 Blog post "${slug}" subscription cleaned up`);
    };
  }, [slug, fetchPost]);

  return { 
    post, 
    loading, 
    error, 
    refetch: fetchPost 
  };
}

/**
 * Hook 3: Fetch featured blog posts with real-time updates
 * 
 * Usage:
 * const { posts, loading, error } = useSanityFeaturedBlogPosts(3);
 */
export function useSanityFeaturedBlogPosts(limit: number = 3) {
  const [posts, setPosts] = useState<TransformedBlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchFeaturedPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Query for featured posts (most recent)
      const query = `*[_type == "post" && !(_id in path("drafts.**")) && publishedAt < now()] 
        | order(publishedAt desc) [0...${limit}] {
        _id,
        _createdAt,
        _updatedAt,
        title,
        slug,
        excerpt,
        body,
        publishedAt,
        "mainImage": mainImage.asset->url,
        author->{
          name,
          "image": image.asset->url,
          bio
        },
        categories[]->{
          name,
          "slug": slug.current
        }
      }`;
      
      console.log(`⭐ Fetching ${limit} featured blog posts`);
      
      const data = await sanityClient.fetch<SanityPost[]>(query);
      const transformedPosts = data.map(transformBlogPost);
      
      setPosts(transformedPosts);
      console.log(`✅ Fetched ${transformedPosts.length} featured blog posts`);
    } catch (err) {
      console.error('❌ Error fetching featured blog posts:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    // Initial fetch
    fetchFeaturedPosts();

    // Real-time subscription
    const featuredQuery = `*[_type == "post" && !(_id in path("drafts.**")) && publishedAt < now()] 
      | order(publishedAt desc) [0...${limit}]`;
    
    console.log('🔌 Setting up featured blog posts real-time subscription');
    
    const subscription = listenSafe(featuredQuery, {}, { includeResult: true })
      .subscribe((update) => {
        console.log('📡 Featured blog posts mutation event:', update.type);
        
        if (update.type === 'mutation' && update.result) {
          const data = update.result as unknown as SanityPost[];
          const transformedPosts = data.map(transformBlogPost);
          setPosts(transformedPosts);
          
          console.log(`🔄 Featured blog posts updated in real-time! Count: ${transformedPosts.length}`);
        }
      });

    return () => {
      subscription.unsubscribe();
      console.log('🧹 Featured blog posts subscription cleaned up');
    };
  }, [limit, fetchFeaturedPosts]);

  return { 
    posts, 
    loading, 
    error, 
    refetch: fetchFeaturedPosts 
  };
}
