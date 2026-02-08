'use client';

/**
 * Message Component
 * 
 * Renders individual chat messages with distinct user/assistant styling.
 * - User messages: right-aligned, primary colour bubble
 * - Assistant messages: left-aligned with MASH logo avatar, light bubble
 * - Embedded ProductCard grid when AI recommends products
 * - Markdown-lite formatting (bold, links, bullets)
 * - Relative timestamps
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
  conversationId?: string;
}

/** Format timestamp to relative or short time string */
function formatTime(ts: number): string {
  const now = Date.now();
  const diff = now - ts;
  if (diff < 60_000) return 'Just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export function Message({
  message,
  productCards,
  onAddToCart,
  className,
  conversationId,
}: MessageProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  return (
    <div
      className={cn(
        'flex gap-2.5',
        isUser ? 'flex-row-reverse' : 'flex-row',
        className,
      )}
      data-testid={`message-${message.role}`}
      data-message-id={message.id}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center overflow-hidden mt-0.5',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-white dark:bg-zinc-800 border border-border/60',
        )}
      >
        {isUser ? (
          <User className="h-3.5 w-3.5" />
        ) : (
          <Image
            src="/logo.png"
            alt="MASH AI"
            width={20}
            height={20}
            className="object-contain"
          />
        )}
      </div>

      {/* Content column */}
      <div
        className={cn(
          'flex flex-col gap-1.5 max-w-[82%]',
          isUser && 'items-end',
        )}
      >
        {/* Bubble */}
        <div
          className={cn(
            'rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
            isUser
              ? 'bg-primary text-primary-foreground rounded-tr-sm'
              : 'bg-secondary/60 text-foreground rounded-tl-sm',
          )}
        >
          <div
            className="prose prose-sm max-w-none dark:prose-invert [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_li]:my-0.5 [&_p]:my-1.5 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mb-1 [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_strong]:font-semibold"
            dangerouslySetInnerHTML={{
              __html: message.content
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                .replace(
                  /\[([^\]]+)\]\(([^)]+)\)/g,
                  '<a href="$2" class="text-primary hover:underline">$1</a>',
                )
                .replace(/\n/g, '<br/>')
                .replace(
                  /[•]\s*/g,
                  '<span class="inline-flex w-4 justify-center text-muted-foreground">&#8226;</span>',
                ),
            }}
          />
        </div>

        {/* Timestamp */}
        {message.timestamp && (
          <span className="text-[10px] text-muted-foreground/70 px-1 select-none">
            {formatTime(message.timestamp)}
          </span>
        )}

        {/* Embedded product cards */}
        {isAssistant && productCards && productCards.length > 0 && (
          <div className="w-full mt-1">
            <div
              className={cn(
                'grid gap-2.5',
                productCards.length === 1 && 'grid-cols-1',
                productCards.length === 2 && 'grid-cols-1 sm:grid-cols-2',
                productCards.length >= 3 && 'grid-cols-1 sm:grid-cols-2',
              )}
              data-testid="product-cards-grid"
            >
              {productCards.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={onAddToCart}
                  conversationId={conversationId}
                  messageId={message.id}
                />
              ))}
            </div>
          </div>
        )}

        {/* Error badge */}
        {message.metadata?.error && (
          <div className="text-[11px] text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-lg px-2.5 py-1">
            Something went wrong. Please try again.
          </div>
        )}
      </div>
    </div>
  );
}
