'use client';

/**
 * ChatButton Component
 * 
 * Floating MASH-branded action button that opens the AI chatbot.
 * - Uses MASH logo for brand consistency
 * - Bottom-right position, non-obstructive to main content
 * - Subtle pulse animation to draw attention without being annoying
 * - Unread badge indicator for new assistant messages
 * - Smooth transitions between open/closed states
 * 
 * @see .github/AI_CHATBOT_MASTER_PLAN.md - Phase 4, Task 4.1
 */

import React from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ChatButtonProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
  hasUnread?: boolean;
}

export function ChatButton({ isOpen, onClick, className, hasUnread = false }: ChatButtonProps) {
  return (
    <div
      className="fixed bottom-24 sm:bottom-6 right-6 z-50"
      data-testid="chat-button-wrapper"
    >
      {/* Subtle pulse ring when closed - draws attention without being obtrusive */}
      {!isOpen && (
        <span
          className="absolute inset-0 rounded-full bg-primary/20 animate-ping pointer-events-none"
          aria-hidden="true"
        />
      )}

      <button
        type="button"
        onClick={onClick}
        className={cn(
          'relative flex items-center justify-center',
          'h-14 w-14 rounded-full',
          'bg-white dark:bg-zinc-900',
          'border-2 border-primary/20 dark:border-primary/30',
          'shadow-lg hover:shadow-xl',
          'transition-all duration-300 ease-out',
          'hover:scale-110 active:scale-95',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          !isOpen && 'animate-subtle-bounce',
          className
        )}
        aria-label={isOpen ? 'Close MASH AI Assistant' : 'Open MASH AI Assistant'}
        data-open={isOpen}
        data-testid="chat-button"
      >
        {isOpen ? (
          <X className="h-5 w-5 text-muted-foreground transition-transform duration-200" />
        ) : (
          <Image
            src="/logo.png"
            alt="MASH AI"
            width={32}
            height={32}
            className="rounded-full object-contain"
            style={{ width: 'auto', height: 'auto' }}
            priority
          />
        )}

        {/* Unread message indicator */}
        {!isOpen && hasUnread && (
          <span
            className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-red-500 border-2 border-white dark:border-zinc-900"
            aria-label="New messages"
            data-testid="unread-badge"
          />
        )}
      </button>

      {/* Hover tooltip */}
      {!isOpen && (
        <div
          className="absolute bottom-full right-0 mb-3 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200"
          aria-hidden="true"
        >
          <div className="bg-zinc-800 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
            Ask MASH AI
            <span className="absolute bottom-0 right-5 translate-y-1/2 rotate-45 h-2 w-2 bg-zinc-800" />
          </div>
        </div>
      )}
    </div>
  );
}
