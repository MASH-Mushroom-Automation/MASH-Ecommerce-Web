'use client';

/**
 * ChatDialog Component
 * 
 * Main chat panel anchored to the bottom-right corner.
 * Does NOT use a modal Dialog overlay - renders as an inline panel so
 * users can continue browsing while chatting.
 * 
 * View States:
 * - Minimized: Compact floating bar showing "MASH AI" label
 * - Normal:    Fixed-size panel (420px wide, 560px tall) at bottom-right
 * - Maximized: Near-fullscreen overlay with backdrop blur
 * 
 * @see .github/AI_CHATBOT_MASTER_PLAN.md - Phase 4, Task 4.2
 */

import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Trash2,
  Minimize2,
  Maximize2,
  Minimize,
  X,
  Sparkles,
} from 'lucide-react';
import Image from 'next/image';
import { Message } from './Message';
import { ChatInput } from './ChatInput';
import { cn } from '@/lib/utils';
import type { Message as MessageType } from '@/types/chatbot';
import type { ProductCardData } from '@/lib/ai/context-builder';
import type { ChatViewState } from '@/contexts/ChatContext';

interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  messages: MessageType[];
  productCardsByMessageId?: Record<string, ProductCardData[]>;
  onSendMessage: (message: string) => void;
  onClearHistory: () => void;
  onAddToCart?: (productId: string) => void;
  loading?: boolean;
  className?: string;
  conversationId?: string;
  viewState?: ChatViewState;
  onViewStateChange?: (state: ChatViewState) => void;
  onToggleMinimize?: () => void;
  onToggleMaximize?: () => void;
}

export function ChatDialog({
  open,
  onOpenChange,
  messages,
  productCardsByMessageId = {},
  onSendMessage,
  onClearHistory,
  onAddToCart,
  loading = false,
  className,
  conversationId,
  viewState = 'normal',
  onToggleMinimize,
  onToggleMaximize,
}: ChatDialogProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isMinimized = viewState === 'minimized';
  const isMaximized = viewState === 'maximized';

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current && !isMinimized) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        '[data-radix-scroll-area-viewport]'
      );
      if (scrollContainer) {
        setTimeout(() => {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }, 50);
      }
    }
  }, [messages, loading, isMinimized]);

  if (!open) return null;

  /* ------------------------------------------------------------------ */
  /*  MINIMIZED VIEW - compact floating bar                              */
  /* ------------------------------------------------------------------ */
  if (isMinimized) {
    return (
      <div
        className="fixed bottom-[88px] right-6 z-50 animate-in slide-in-from-bottom-2 fade-in duration-200"
        data-testid="chat-minimized"
      >
        <div
          className={cn(
            'flex items-center gap-2.5 px-4 py-2.5',
            'bg-white dark:bg-zinc-900',
            'border border-border/60 rounded-full shadow-lg',
            'cursor-pointer hover:shadow-xl transition-shadow',
          )}
          onClick={onToggleMinimize}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onToggleMinimize?.()}
          aria-label="Restore chat window"
        >
          <Image src="/logo.png" alt="MASH" width={24} height={24} className="rounded-full" />
          <span className="text-sm font-medium select-none">MASH AI</span>
          {loading && (
            <span className="flex gap-0.5" aria-label="Thinking">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 ml-1 rounded-full"
            onClick={(e) => { e.stopPropagation(); onOpenChange(false); }}
            aria-label="Close chat"
            data-testid="close-minimized-button"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  /*  MAXIMIZED BACKDROP                                                 */
  /* ------------------------------------------------------------------ */
  const maximizedBackdrop = isMaximized && (
    <div
      className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onToggleMaximize}
      aria-hidden="true"
      data-testid="maximized-backdrop"
    />
  );

  /* ------------------------------------------------------------------ */
  /*  MAIN PANEL                                                         */
  /* ------------------------------------------------------------------ */
  return (
    <>
      {maximizedBackdrop}

      <div
        className={cn(
          'fixed z-50 flex flex-col',
          'bg-white dark:bg-zinc-950',
          'border border-border/50',
          'shadow-2xl',
          'animate-in slide-in-from-bottom-4 fade-in duration-300',
          // Normal: fixed-size bottom-right panel
          !isMaximized && 'bottom-[88px] right-6 w-[400px] max-w-[calc(100vw-3rem)] h-[560px] max-h-[calc(100vh-120px)] rounded-2xl',
          // Maximized: near-fullscreen
          isMaximized && 'inset-4 sm:inset-8 rounded-2xl',
          className
        )}
        data-testid="chat-dialog"
        data-view-state={viewState}
        role="dialog"
        aria-label="MASH AI Assistant chat"
      >
        {/* ---- HEADER ---- */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-border/50 flex-shrink-0">
          <Image
            src="/logo.png"
            alt="MASH"
            width={36}
            height={36}
            className="rounded-full flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold leading-tight truncate">MASH AI Assistant</h2>
            <p className="text-[11px] text-muted-foreground leading-tight flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-500 flex-shrink-0" />
              <span>Powered by ML &mdash; Here to help you shop</span>
            </p>
          </div>

          {/* Window controls */}
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
              onClick={onToggleMinimize}
              aria-label="Minimize"
              data-testid="minimize-button"
            >
              <Minimize2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
              onClick={onToggleMaximize}
              aria-label={isMaximized ? 'Restore size' : 'Maximize'}
              data-testid="maximize-button"
            >
              {isMaximized ? <Minimize className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
              onClick={onClearHistory}
              disabled={messages.length === 0}
              aria-label="Clear chat history"
              data-testid="clear-history-button"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
              onClick={() => onOpenChange(false)}
              aria-label="Close chat"
              data-testid="close-button"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </header>

        {/* ---- MESSAGES ---- */}
        <ScrollArea
          className="flex-1 overflow-y-auto"
          ref={scrollAreaRef}
          data-testid="messages-scroll-area"
        >
          <div className="px-4 py-4 space-y-4">
            {/* Empty / welcome state */}
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center" data-testid="empty-state">
                <Image
                  src="/logo.png"
                  alt="MASH AI"
                  width={56}
                  height={56}
                  className="rounded-full mb-4 opacity-80"
                />
                <h3 className="text-base font-semibold mb-1">Welcome to MASH AI</h3>
                <p className="text-sm text-muted-foreground mb-5 max-w-xs">
                  I can help you find mushrooms, share recipes, and answer questions about our products.
                </p>
                {/* Quick-action suggestion chips */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {[
                    'Show me oyster mushrooms',
                    'Best for stir-fry?',
                    'Cooking tips',
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => onSendMessage(suggestion)}
                      className={cn(
                        'px-3 py-1.5 text-xs font-medium rounded-full',
                        'border border-border bg-secondary/50 hover:bg-secondary',
                        'transition-colors',
                      )}
                      data-testid="suggestion-chip"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Rendered messages */}
            {messages.map((message) => (
              <Message
                key={message.id}
                message={message}
                productCards={productCardsByMessageId[message.id]}
                onAddToCart={onAddToCart}
                conversationId={conversationId}
              />
            ))}

            {/* Typing / loading indicator */}
            {loading && (
              <div className="flex gap-2.5 items-start" data-testid="loading-indicator">
                <div className="flex-shrink-0 h-7 w-7 rounded-full bg-white dark:bg-zinc-800 border border-border/60 flex items-center justify-center overflow-hidden">
                  <Image src="/logo.png" alt="MASH" width={20} height={20} className="object-contain" />
                </div>
                <div className="bg-secondary/60 rounded-2xl rounded-tl-sm px-4 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                    <span className="text-xs text-muted-foreground ml-1.5">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* ---- INPUT ---- */}
        <div className="flex-shrink-0 border-t border-border/50 p-3">
          <ChatInput
            onSend={onSendMessage}
            disabled={loading}
            loading={loading}
          />
        </div>
      </div>
    </>
  );
}
