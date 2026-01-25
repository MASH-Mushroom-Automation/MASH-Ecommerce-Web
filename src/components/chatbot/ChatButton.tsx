'use client';

/**
 * ChatButton Component
 * 
 * Floating action button that opens the AI chatbot dialog.
 * Positioned at bottom-right corner of the screen.
 * 
 * @see .github/AI_CHATBOT_MASTER_PLAN.md - Phase 4, Task 4.1
 */

import React from 'react';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChatButtonProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}

export function ChatButton({ isOpen, onClick, className }: ChatButtonProps) {
  return (
    <Button
      onClick={onClick}
      className={cn(
        'fixed bottom-6 right-6 z-50',
        'h-14 w-14 rounded-full shadow-lg',
        'bg-primary hover:bg-primary/90',
        'transition-all duration-200',
        'hover:scale-110 active:scale-95',
        className
      )}
      aria-label={isOpen ? 'Close chatbot' : 'Open chatbot'}
      data-testid="chat-button"
    >
      {isOpen ? (
        <X className="h-6 w-6" />
      ) : (
        <MessageCircle className="h-6 w-6" />
      )}
    </Button>
  );
}
