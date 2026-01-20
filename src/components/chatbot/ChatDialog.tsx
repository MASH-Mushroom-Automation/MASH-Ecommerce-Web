'use client';

/**
 * ChatDialog Component
 * 
 * Main dialog container for the chatbot with message list and scrolling.
 * Includes intro message on first open.
 * 
 * @see .github/AI_CHATBOT_MASTER_PLAN.md - Phase 4, Task 4.2
 */

import React, { useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Message } from './Message';
import { ChatInput } from './ChatInput';
import { cn } from '@/lib/utils';
import type { Message as MessageType } from '@/types/chatbot';
import type { ProductCardData } from '@/lib/ai/context-builder';

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
}: ChatDialogProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        '[data-radix-scroll-area-viewport]'
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'h-[600px] max-h-[80vh] flex flex-col',
          'sm:max-w-[500px] md:max-w-[600px] lg:max-w-[700px]',
          className
        )}
        data-testid="chat-dialog"
      >
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3">
              <img 
                src="/logo.png" 
                alt="MASH" 
                className="h-8 w-auto"
              />
              <span className="font-semibold text-lg">MASH AI Assistant</span>
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClearHistory}
              disabled={messages.length === 0}
              title="Clear chat history"
              data-testid="clear-history-button"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Messages scroll area */}
        <ScrollArea
          className="flex-1 pr-4"
          ref={scrollAreaRef}
          data-testid="messages-scroll-area"
        >
          <div className="space-y-4 py-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p>No messages yet. Start by asking about mushrooms!</p>
              </div>
            ) : (
              messages.map((message) => (
                <Message
                  key={message.id}
                  message={message}
                  productCards={productCardsByMessageId[message.id]}
                  onAddToCart={onAddToCart}
                  conversationId={conversationId}
                />
              ))
            )}

            {/* Loading indicator */}
            {loading && (
              <div className="flex gap-3 mb-4" data-testid="loading-indicator">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
                <div className="bg-secondary rounded-lg px-4 py-2">
                  <p className="text-sm text-secondary-foreground">
                    Thinking...
                  </p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input area */}
        <div className="flex-shrink-0 border-t pt-4">
          <ChatInput
            onSend={onSendMessage}
            disabled={loading}
            loading={loading}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
