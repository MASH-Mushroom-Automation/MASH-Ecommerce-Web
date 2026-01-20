'use client';

/**
 * Chatbot - Main Component
 * 
 * Combines all chatbot UI components with state management.
 * This is the main entry point for the AI chatbot feature.
 * 
 * @see .github/AI_CHATBOT_MASTER_PLAN.md - Phase 4
 */

import React from 'react';
import { ChatButton } from './ChatButton';
import { ChatDialog } from './ChatDialog';
import { useChat } from '@/contexts/ChatContext';

export function Chatbot() {
  const {
    messages,
    productCardsByMessageId,
    loading,
    isOpen,
    sendMessage,
    clearHistory,
    setIsOpen,
  } = useChat();

  return (
    <>
      <ChatButton isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
      <ChatDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        messages={messages}
        productCardsByMessageId={productCardsByMessageId}
        onSendMessage={sendMessage}
        onClearHistory={clearHistory}
        loading={loading}
      />
    </>
  );
}
