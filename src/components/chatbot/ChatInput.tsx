'use client';

/**
 * ChatInput Component
 * 
 * Text input with send button for chatbot messages.
 * Supports Enter key to send, with Shift+Enter for new lines.
 * 
 * @see .github/AI_CHATBOT_MASTER_PLAN.md - Phase 4, Task 4.5
 */

import React, { useState, KeyboardEvent } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

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
  placeholder = 'Ask me about mushrooms...',
  className,
}: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    const trimmed = message.trim();
    if (trimmed && !disabled && !loading) {
      onSend(trimmed);
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter without Shift sends the message
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className={cn('flex gap-2 items-end', className)}
      data-testid="chat-input"
    >
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled || loading}
        rows={2}
        className="resize-none flex-1 min-h-[60px] max-h-[120px]"
        data-testid="chat-input-textarea"
      />
      <Button
        onClick={handleSend}
        disabled={disabled || loading || !message.trim()}
        size="icon"
        className="h-[60px] w-[60px] flex-shrink-0"
        data-testid="chat-input-send-button"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Send className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
}
