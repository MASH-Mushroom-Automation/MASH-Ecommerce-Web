"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, Calendar, User, ChefHat, Leaf, BookOpen, Play, ArrowRight } from "lucide-react";
import { sanityClient, urlFor } from "@/lib/sanity/client";

// GROQ queries for all content types
const blogPostsQuery = `*[_type == "post"] | order(publishedAt desc) {
  _id,
  title,
  "slug": slug.current,
  excerpt,
  mainImage,
  "categories": categories[]->title,
  "author": author->{name, image},
  publishedAt,
  "readTime": round(length(pt::text(body)) / 5 / 200)
}`;

// Note: status == "published" is the correct way to check published status
const recipesQuery = `*[_type == "recipe" && status == "published"] | order(publishedAt desc) {
  _id,
  title,
  "slug": slug.current,
  excerpt,
  mainImage,
  difficulty,
  cuisine,
  totalTime,
  servings,
  "hasVideo": defined(youtubeVideo.videoId),
  publishedAt
}`;

// Note: status == "published" and using 'excerpt' field
const guidesQuery = `*[_type == "growingGuide" && status == "published"] | order(publishedAt desc) {
  _id,
  title,
  "slug": slug.current,
  excerpt,
  "coverImage": mainImage,
  mushroomType,
  difficulty,
  timeToFirstHarvest,
  expectedYield,
  "hasVideo": defined(youtubeVideo.videoId),
  publishedAt
}`;

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  mainImage: any;
  categories: string[];
  author: { name: string; image: any };
  publishedAt: string;
  readTime: number;
}

interface Recipe {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  mainImage: any;
  difficulty: string;
  cuisine: string;
  totalTime: number;
  servings: number;
  hasVideo: boolean;
  publishedAt: string;
}

interface Guide {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: any;
  mushroomType: string;
  difficulty: string;
  timeToFirstHarvest: string;
  expectedYield: string;
  hasVideo: boolean;
  publishedAt: string;
}

type ContentFilter = 'all' | 'recipes' | 'guides' | 'articles';

const difficultyColors: Record<string, string> = {
  beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
  advanced: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
};

export default function BlogPage() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<ContentFilter>('all');

  useEffect(() => {
    async function fetchContent() {
      try {
        const [postsData, recipesData, guidesData] = await Promise.all([
          sanityClient.fetch(blogPostsQuery),
          sanityClient.fetch(recipesQuery),
          sanityClient.fetch(guidesQuery),
        ]);
        setBlogPosts(postsData || []);
        setRecipes(recipesData || []);
        setGuides(guidesData || []);
      } catch (error) {
        console.error('Error fetching content:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchContent();
  }, []);

  const getImageUrl = (image: any) => {
    if (!image) return '/placeholder-blog.jpg';
    try {
      return urlFor(image).width(600).height(400).url();
    } catch {
      return '/placeholder-blog.jpg';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              🍄 MASH Content Hub
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover recipes, growing guides, and expert insights about mushrooms
            </p>
          </div>
          
          {/* Loading Skeletons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse bg-card rounded-xl overflow-hidden shadow-lg">
                <div className="bg-muted h-48"></div>
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalContent = blogPosts.length + recipes.length + guides.length;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            🍄 MASH Content Hub
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Discover delicious recipes, step-by-step growing guides, and expert insights about mushrooms
          </p>
          
          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
              <ChefHat className="w-5 h-5 text-orange-600" />
              <span className="font-medium text-orange-800 dark:text-orange-200">{recipes.length} Recipes</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full">
              <Leaf className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800 dark:text-green-200">{guides.length} Growing Guides</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-800 dark:text-blue-200">{blogPosts.length} Articles</span>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { key: 'all', label: 'All Content', count: totalContent },
              { key: 'recipes', label: '🍳 Recipes', count: recipes.length },
              { key: 'guides', label: '🌱 Growing Guides', count: guides.length },
              { key: 'articles', label: '📖 Articles', count: blogPosts.length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key as ContentFilter)}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  activeFilter === tab.key
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Recipes Section */}
        {(activeFilter === 'all' || activeFilter === 'recipes') && recipes.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <ChefHat className="w-6 h-6 text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">🍳 Mushroom Recipes</h2>
              </div>
              <Link 
                href="/recipes" 
                className="flex items-center gap-1 text-primary hover:underline font-medium"
              >
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map((recipe, index) => (
                <Link
                  key={recipe._id || `recipe-${index}`}
                  href={`/recipes/${recipe.slug}`}
                  className="group bg-card rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-border hover:border-primary/50"
                >
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={getImageUrl(recipe.mainImage)}
                      alt={recipe.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {recipe.hasVideo && (
                      <div className="absolute top-3 right-3 bg-red-600 text-white px-2 py-1 rounded-full flex items-center gap-1 text-xs font-medium">
                        <Play className="w-3 h-3" fill="white" /> Video
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                        Recipe
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      {recipe.difficulty && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[recipe.difficulty] || 'bg-gray-100 text-gray-800'}`}>
                          {recipe.difficulty === 'beginner' ? '🟢 Easy' : recipe.difficulty === 'intermediate' ? '🟡 Medium' : '🔴 Advanced'}
                        </span>
                      )}
                      {recipe.cuisine && (
                        <span className="text-xs text-muted-foreground">{recipe.cuisine}</span>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                      {recipe.title}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {recipe.excerpt || 'Delicious mushroom recipe with step-by-step instructions.'}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{recipe.totalTime || 30} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{recipe.servings || 4} servings</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Growing Guides Section */}
        {(activeFilter === 'all' || activeFilter === 'guides') && guides.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Leaf className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">🌱 Growing Guides</h2>
              </div>
              <Link 
                href="/guides" 
                className="flex items-center gap-1 text-primary hover:underline font-medium"
              >
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {guides.map((guide, index) => (
                <Link
                  key={guide._id || `guide-${index}`}
                  href={`/guides/${guide.slug}`}
                  className="group bg-card rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-border hover:border-primary/50"
                >
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={getImageUrl(guide.coverImage)}
                      alt={guide.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {guide.hasVideo && (
                      <div className="absolute top-3 right-3 bg-red-600 text-white px-2 py-1 rounded-full flex items-center gap-1 text-xs font-medium">
                        <Play className="w-3 h-3" fill="white" /> Video
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                        Growing Guide
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      {guide.difficulty && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[guide.difficulty] || 'bg-gray-100 text-gray-800'}`}>
                          {guide.difficulty === 'beginner' ? '🟢 Beginner' : guide.difficulty === 'intermediate' ? '🟡 Intermediate' : '🔴 Advanced'}
                        </span>
                      )}
                      {guide.mushroomType && (
                        <span className="text-xs text-muted-foreground capitalize">{guide.mushroomType}</span>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                      {guide.title}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {guide.excerpt || 'Complete step-by-step growing guide with expert tips.'}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{guide.timeToFirstHarvest || '2-3 weeks'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Leaf className="w-4 h-4" />
                        <span>{guide.expectedYield || '300-500g'}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Blog Articles Section */}
        {(activeFilter === 'all' || activeFilter === 'articles') && blogPosts.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">📖 Blog Articles</h2>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.map((post, index) => (
                <Link
                  key={post._id || `post-${index}`}
                  href={`/blog/${post.slug}`}
                  className="group bg-card rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-border hover:border-primary/50"
                >
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={getImageUrl(post.mainImage)}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                        Article
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {post.categories?.slice(0, 2).map((category, catIndex) => (
                        <span
                          key={category || `cat-${catIndex}`}
                          className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                    
                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                      {post.title}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {post.excerpt || 'Read our latest article about mushrooms.'}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{post.author?.name || 'MASH Team'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{post.readTime || 5} min read</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Recent'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {totalContent === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🍄</div>
            <h2 className="text-2xl font-bold text-foreground mb-2">No Content Yet</h2>
            <p className="text-muted-foreground mb-6">
              Check back soon for delicious recipes and growing guides!
            </p>
            <Link 
              href="/shop" 
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition"
            >
              Browse Products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* CTA Section */}
        {totalContent > 0 && (
          <section className="mt-16 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Ready to Start Your Mushroom Journey?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
              Get fresh mushrooms and growing kits delivered to your door. Perfect for trying out our recipes!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                href="/shop" 
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition"
              >
                Shop Fresh Mushrooms <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                href="/recipes" 
                className="inline-flex items-center gap-2 bg-card text-foreground border border-border px-6 py-3 rounded-lg font-medium hover:bg-muted transition"
              >
                <ChefHat className="w-4 h-4" /> Browse All Recipes
              </Link>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
