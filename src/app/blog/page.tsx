"use client";

import React from "react";
import { useSanityBlogPosts } from "@/hooks/useSanityBlogPosts";
import Link from "next/link";
import Image from "next/image";
import { Clock, Calendar, User } from "lucide-react";

export default function BlogPage() {
  const { posts, loading, error } = useSanityBlogPosts({ limit: 20 });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">MASH Blog</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover the world of mushrooms through our expert guides, health
              insights, and sustainable farming practices.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Error Loading Blog Posts
          </h2>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!posts.length) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">MASH Blog</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover the world of mushrooms through our expert guides, health
              insights, and sustainable farming practices.
            </p>
          </div>

          <div className="text-center">
            <p className="text-lg text-gray-600">
              No blog posts available yet. Check back soon!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">MASH Blog</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the world of mushrooms through our expert guides, health
            insights, and sustainable farming practices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="relative h-48 w-full">
                <Image
                  src={post.mainImage}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="p-6">
                <div className="flex flex-wrap gap-2 mb-3">
                  {post.categories.slice(0, 2).map((category) => (
                    <span
                      key={category}
                      className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                    >
                      {category}
                    </span>
                  ))}
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors line-clamp-2">
                  {post.title}
                </h2>

                <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <User size={16} />
                    <span>{post.author.name}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      <span>{post.readTime} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      <span>
                        {new Date(post.publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
