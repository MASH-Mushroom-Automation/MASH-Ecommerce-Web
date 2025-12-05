"use client";

import React, { use } from "react";
import { useSanityBlogPost } from "@/hooks/useSanityBlogPosts";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, User } from "lucide-react";
import { PortableText } from "@portabletext/react";

export default function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { post, loading, error } = useSanityBlogPost(slug);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
            <div className="h-96 bg-gray-300 rounded-lg mb-8"></div>
            <div className="h-12 bg-gray-300 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Blog Post Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            {error?.message || "The blog post you're looking for doesn't exist."}
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
          >
            <ArrowLeft size={20} />
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium mb-8"
        >
          <ArrowLeft size={20} />
          Back to Blog
        </Link>

        {/* Featured Image */}
        <div className="relative h-96 w-full rounded-lg overflow-hidden mb-8">
          <Image
            src={post.mainImage}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-4">
          {post.categories.map((category) => (
            <span
              key={category}
              className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
            >
              {category}
            </span>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          {post.title}
        </h1>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-8 pb-8 border-b">
          <div className="flex items-center gap-2">
            <User size={20} />
            <span className="font-medium">{post.author.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={20} />
            <span>{new Date(post.publishedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={20} />
            <span>{post.readTime} min read</span>
          </div>
        </div>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-xl text-gray-700 mb-8 font-medium leading-relaxed">
            {post.excerpt}
          </p>
        )}

        {/* Content (Portable Text) */}
        <div className="prose prose-lg max-w-none">
          <PortableText 
            value={post.content}
            components={{
              block: {
                h2: ({children}) => <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900">{children}</h2>,
                h3: ({children}) => <h3 className="text-2xl font-bold mt-8 mb-3 text-gray-900">{children}</h3>,
                h4: ({children}) => <h4 className="text-xl font-bold mt-6 mb-2 text-gray-900">{children}</h4>,
                normal: ({children}) => <p className="mb-4 text-gray-700 leading-relaxed">{children}</p>,
              },
              marks: {
                strong: ({children}) => <strong className="font-bold text-gray-900">{children}</strong>,
                em: ({children}) => <em className="italic">{children}</em>,
                link: ({children, value}) => (
                  <a href={value?.href} className="text-green-600 hover:text-green-700 underline" target="_blank" rel="noopener noreferrer">
                    {children}
                  </a>
                ),
              },
              list: {
                bullet: ({children}) => <ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>,
                number: ({children}) => <ol className="list-decimal list-inside mb-4 space-y-2">{children}</ol>,
              },
            }}
          />
        </div>

        {/* Author Bio */}
        {post.author.bio && (
          <div className="mt-12 p-6 bg-white rounded-lg shadow-md">
            <div className="flex items-start gap-4">
              {post.author.image && (
                <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={post.author.image}
                    alt={post.author.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  About {post.author.name}
                </h3>
                <div className="text-gray-600 prose">
                  <PortableText value={post.author.bio} />
                </div>
              </div>
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
