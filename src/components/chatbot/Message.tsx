'use client';

/**
 * Message Component
 * 
 * CRITICAL: This component renders chat messages with EMBEDDED PRODUCT CARDS.
 * When AI response includes productCards[], they are rendered as actual ProductCard components.
 * 
 * @see .github/AI_CHATBOT_MASTER_PLAN.md - Phase 4, Task 4.3
 */

import React from 'react';
import { User } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ProductCard } from './ProductCard';
import type { Message as MessageType } from '@/types/chatbot';
import type { ProductCardData } from '@/lib/ai/context-builder';

interface MessageProps {
  message: MessageType;
  productCards?: ProductCardData[];
  onAddToCart?: (productId: string) => void;
  className?: string;
}

export function Message({
  message,
  productCards,
  onAddToCart,
  className,
}: MessageProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  return (
    <div
      className={cn(
        'flex gap-3 mb-4',
        isUser && 'flex-row-reverse',
        className
      )}
      data-testid={`message-${message.role}`}
      data-message-id={message.id}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center overflow-hidden',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-white border-2 border-secondary'
        )}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Image
            src="/logo.png"
            alt="MASH AI"
            width={32}
            height={32}
            className="object-contain"
          />
        )}
      </div>

      {/* Message content */}
      <div
        className={cn(
          'flex flex-col max-w-[85%] gap-2',
          isUser && 'items-end'
        )}
      >
        {/* Message bubble */}
        <div
          className={cn(
            'rounded-lg px-4 py-3',
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground'
          )}
        >
          <div 
            className="text-sm leading-relaxed prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ 
              __html: message.content
                .replace(/\n/g, '<br/>')
                .replace(/•/g, '<span class="inline-block w-4">•</span>')
            }}
          />

          {/* Timestamp */}
          {message.timestamp && (
            <p className="text-xs opacity-70 mt-1">
              {new Date(message.timestamp).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          )}
        </div>

        {/* CRITICAL: Embedded Product Cards */}
        {isAssistant && productCards && productCards.length > 0 && (
          <div className="w-full">
            <div
              className={cn(
                'grid gap-3',
                productCards.length === 1 && 'grid-cols-1',
                productCards.length === 2 && 'grid-cols-1 sm:grid-cols-2',
                productCards.length >= 3 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              )}
              data-testid="product-cards-grid"
            >
              {productCards.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
          </div>
        )}

        {/* Error indicator */}
        {message.metadata?.error && (
          <div className="text-xs text-destructive bg-destructive/10 rounded px-2 py-1">
            Error: {message.metadata.error}
          </div>
        )}
      </div>
    </div>
  );
}
