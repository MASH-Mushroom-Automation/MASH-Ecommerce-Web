'use client';

/**
 * ChatButton Component
 * 
 * Floating action button that opens the AI chatbot dialog.
 * Positioned at bottom-right corner of the screen.
 * Includes subtle pulsing animation when closed to draw attention.
 * 
 * @see .github/AI_CHATBOT_MASTER_PLAN.md - Phase 4, Task 4.1
 */

import React from 'react';
import { MessageCircle, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChatButtonProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
  hasUnread?: boolean;
}

export function ChatButton({ isOpen, onClick, className, hasUnread = false }: ChatButtonProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Pulse ring animation when closed */}
      {!isOpen && (
        <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
      )}
      <Button
        onClick={onClick}
        className={cn(
          'relative h-14 w-14 rounded-full shadow-lg',
          'bg-primary hover:bg-primary/90',
          'transition-all duration-300 ease-out',
          'hover:scale-110 active:scale-95',
          'hover:shadow-xl',
          isOpen && 'rotate-0',
          !isOpen && 'animate-subtle-bounce',
          className
        )}
        aria-label={isOpen ? 'Close chatbot' : 'Open MASH AI Assistant'}
        data-open={isOpen}
        data-testid="chat-button"
      >
        {isOpen ? (
          <X className="h-6 w-6 transition-transform duration-200" />
        ) : (
          <div className="relative">
            <MessageCircle className="h-6 w-6" />
            <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-yellow-300" />
          </div>
        )}
      </Button>
      
      {/* Tooltip when closed */}
      {!isOpen && (
        <div className="absolute bottom-full right-0 mb-2 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
          <div className="bg-foreground text-background text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
            Ask MASH AI
          </div>
        </div>
      )}
    </div>
  );
}
