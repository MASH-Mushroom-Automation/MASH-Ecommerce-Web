'use client';

/**
 * ChatInput Component
 * 
 * Polished input area with auto-resizing textarea and send button.
 * - Enter sends, Shift+Enter for newlines
 * - Auto-grows up to 4 lines
 * - Disabled state with loading spinner
 * - Character count when approaching limit
 * 
 * @see .github/AI_CHATBOT_MASTER_PLAN.md - Phase 4, Task 4.5
 */

import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const MAX_CHARS = 500;

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  loading?: boolean;
  placeholder?: string;
  className?: string;
}

export function ChatInput({
  onSend,
  disabled = false,
  loading = false,
  placeholder = 'Ask about mushrooms, recipes, cooking tips...',
  className,
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea to fit content
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`; // max ~4 lines
  }, [message]);

  const canSend = message.trim().length > 0 && !disabled && !loading && message.length <= MAX_CHARS;

  const handleSend = () => {
    if (!canSend) return;
    onSend(message.trim());
    setMessage('');
    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const nearLimit = message.length > MAX_CHARS * 0.8;

  return (
    <div
      className={cn(
        'flex items-end gap-2 rounded-xl bg-secondary/30 border border-border/50 px-3 py-2',
        'focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20',
        'transition-colors',
        className,
      )}
      data-testid="chat-input"
    >
      <textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled || loading}
        rows={1}
        className={cn(
          'flex-1 resize-none bg-transparent text-sm leading-relaxed',
          'placeholder:text-muted-foreground/60',
          'focus:outline-none',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'min-h-[24px] max-h-[120px] py-1',
        )}
        data-testid="chat-input-textarea"
        aria-label="Type your message"
        maxLength={MAX_CHARS}
      />

      <div className="flex items-center gap-1.5 flex-shrink-0 pb-0.5">
        {/* Character count near limit */}
        {nearLimit && (
          <span
            className={cn(
              'text-[10px] tabular-nums',
              message.length > MAX_CHARS ? 'text-red-500' : 'text-muted-foreground',
            )}
            data-testid="char-count"
          >
            {message.length}/{MAX_CHARS}
          </span>
        )}

        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          className={cn(
            'h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0',
            'transition-colors duration-150',
            canSend
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'bg-muted text-muted-foreground cursor-not-allowed',
          )}
          data-testid="chat-input-send-button"
          aria-label="Send message"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
