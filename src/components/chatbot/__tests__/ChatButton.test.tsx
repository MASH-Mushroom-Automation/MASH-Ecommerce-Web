/**
 * Unit Tests for ChatButton Component
 * 
 * Tests floating action button behavior and rendering.
 * 
 * @see .github/AI_CHATBOT_MASTER_PLAN.md - Phase 4, Task 4.8
 */

import React from 'react';
import { render, screen, fireEvent } from '@/test-utils';
import { ChatButton } from '../ChatButton';

describe('ChatButton', () => {
  it('should render with MessageCircle icon when closed', () => {
    render(<ChatButton isOpen={false} onClick={() => {}} />);
    
    const button = screen.getByTestId('chat-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Open chatbot');
  });

  it('should render with X icon when open', () => {
    render(<ChatButton isOpen={true} onClick={() => {}} />);
    
    const button = screen.getByTestId('chat-button');
    expect(button).toHaveAttribute('aria-label', 'Close chatbot');
  });

  it('should call onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<ChatButton isOpen={false} onClick={handleClick} />);
    
    const button = screen.getByTestId('chat-button');
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should apply custom className', () => {
    render(<ChatButton isOpen={false} onClick={() => {}} className="custom-class" />);
    
    const button = screen.getByTestId('chat-button');
    expect(button).toHaveClass('custom-class');
  });

  it('should have fixed positioning styles', () => {
    const { container } = render(<ChatButton isOpen={false} onClick={() => {}} />);
    
    const button = container.querySelector('button');
    expect(button).toHaveClass('fixed', 'bottom-6', 'right-6');
  });
});
