/**
 * Unit Tests for ChatInput Component
 * 
 * Tests text input behavior and message sending.
 * 
 * @see .github/AI_CHATBOT_MASTER_PLAN.md - Phase 4, Task 4.8
 */

import React from 'react';
import { render, screen, fireEvent } from '@/test-utils';
import userEvent from '@testing-library/user-event';
import { ChatInput } from '../ChatInput';

describe('ChatInput', () => {
  it('should render input and send button', () => {
    render(<ChatInput onSend={() => {}} />);

    expect(screen.getByTestId('chat-input-textarea')).toBeInTheDocument();
    expect(screen.getByTestId('chat-input-send-button')).toBeInTheDocument();
  });

  it('should call onSend when send button clicked', async () => {
    const handleSend = jest.fn();
    const user = userEvent.setup();

    render(<ChatInput onSend={handleSend} />);

    const textarea = screen.getByTestId('chat-input-textarea');
    await user.type(textarea, 'Hello world');

    const sendButton = screen.getByTestId('chat-input-send-button');
    await user.click(sendButton);

    expect(handleSend).toHaveBeenCalledWith('Hello world');
  });

  it('should call onSend when Enter key pressed', async () => {
    const handleSend = jest.fn();
    const user = userEvent.setup();

    render(<ChatInput onSend={handleSend} />);

    const textarea = screen.getByTestId('chat-input-textarea');
    await user.type(textarea, 'Hello world{Enter}');

    expect(handleSend).toHaveBeenCalledWith('Hello world');
  });

  it('should not send when Shift+Enter pressed', async () => {
    const handleSend = jest.fn();
    const user = userEvent.setup();

    render(<ChatInput onSend={handleSend} />);

    const textarea = screen.getByTestId('chat-input-textarea');
    await user.type(textarea, 'Line 1{Shift>}{Enter}{/Shift}Line 2');

    expect(handleSend).not.toHaveBeenCalled();
  });

  it('should clear input after sending', async () => {
    const handleSend = jest.fn();
    const user = userEvent.setup();

    render(<ChatInput onSend={handleSend} />);

    const textarea = screen.getByTestId('chat-input-textarea') as HTMLTextAreaElement;
    await user.type(textarea, 'Test message{Enter}');

    expect(textarea.value).toBe('');
  });

  it('should trim whitespace before sending', async () => {
    const handleSend = jest.fn();
    const user = userEvent.setup();

    render(<ChatInput onSend={handleSend} />);

    const textarea = screen.getByTestId('chat-input-textarea');
    await user.type(textarea, '  Hello world  {Enter}');

    expect(handleSend).toHaveBeenCalledWith('Hello world');
  });

  it('should not send empty messages', async () => {
    const handleSend = jest.fn();
    const user = userEvent.setup();

    render(<ChatInput onSend={handleSend} />);

    const sendButton = screen.getByTestId('chat-input-send-button');
    await user.click(sendButton);

    expect(handleSend).not.toHaveBeenCalled();
  });

  it('should disable send button when message is empty', () => {
    render(<ChatInput onSend={() => {}} />);

    const sendButton = screen.getByTestId('chat-input-send-button');
    expect(sendButton).toBeDisabled();
  });

  it('should enable send button when message has content', async () => {
    const user = userEvent.setup();
    render(<ChatInput onSend={() => {}} />);

    const textarea = screen.getByTestId('chat-input-textarea');
    const sendButton = screen.getByTestId('chat-input-send-button');

    expect(sendButton).toBeDisabled();

    await user.type(textarea, 'Hello');

    expect(sendButton).not.toBeDisabled();
  });

  it('should disable input when loading', () => {
    render(<ChatInput onSend={() => {}} loading={true} />);

    const textarea = screen.getByTestId('chat-input-textarea');
    const sendButton = screen.getByTestId('chat-input-send-button');

    expect(textarea).toBeDisabled();
    expect(sendButton).toBeDisabled();
  });

  it('should show loading spinner when loading', () => {
    const { container } = render(<ChatInput onSend={() => {}} loading={true} />);

    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should disable input when disabled prop is true', () => {
    render(<ChatInput onSend={() => {}} disabled={true} />);

    const textarea = screen.getByTestId('chat-input-textarea');
    expect(textarea).toBeDisabled();
  });

  it('should display custom placeholder', () => {
    render(<ChatInput onSend={() => {}} placeholder="Type here..." />);

    const textarea = screen.getByTestId('chat-input-textarea');
    expect(textarea).toHaveAttribute('placeholder', 'Type here...');
  });
});
