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

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

describe('ChatButton', () => {
  it('should render with MASH logo when closed', () => {
    render(<ChatButton isOpen={false} onClick={() => {}} />);
    
    const button = screen.getByTestId('chat-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Open MASH AI Assistant');
  });

  it('should render with X icon when open', () => {
    render(<ChatButton isOpen={true} onClick={() => {}} />);
    
    const button = screen.getByTestId('chat-button');
    expect(button).toHaveAttribute('aria-label', 'Close MASH AI Assistant');
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

  it('should have fixed positioning on wrapper', () => {
    const { container } = render(<ChatButton isOpen={false} onClick={() => {}} />);
    
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('fixed', 'bottom-24', 'right-6');
  });

  it('should show unread badge when hasUnread is true and not open', () => {
    render(<ChatButton isOpen={false} onClick={() => {}} hasUnread={true} />);
    
    expect(screen.getByTestId('unread-badge')).toBeInTheDocument();
  });

  it('should not show unread badge when open', () => {
    render(<ChatButton isOpen={true} onClick={() => {}} hasUnread={true} />);
    
    expect(screen.queryByTestId('unread-badge')).not.toBeInTheDocument();
  });

  it('should not show unread badge when hasUnread is false', () => {
    render(<ChatButton isOpen={false} onClick={() => {}} hasUnread={false} />);
    
    expect(screen.queryByTestId('unread-badge')).not.toBeInTheDocument();
  });

  it('should show MASH logo image when closed', () => {
    render(<ChatButton isOpen={false} onClick={() => {}} />);
    
    const img = screen.getByAltText('MASH AI');
    expect(img).toBeInTheDocument();
  });

  it('should not show MASH logo image when open', () => {
    render(<ChatButton isOpen={true} onClick={() => {}} />);
    
    expect(screen.queryByAltText('MASH AI')).not.toBeInTheDocument();
  });

  it('should show pulse animation when closed', () => {
    const { container } = render(<ChatButton isOpen={false} onClick={() => {}} />);
    
    const pulse = container.querySelector('.animate-ping');
    expect(pulse).toBeInTheDocument();
  });

  it('should not show pulse animation when open', () => {
    const { container } = render(<ChatButton isOpen={true} onClick={() => {}} />);
    
    const pulse = container.querySelector('.animate-ping');
    expect(pulse).not.toBeInTheDocument();
  });

  it('should have data-open attribute', () => {
    render(<ChatButton isOpen={true} onClick={() => {}} />);
    
    const button = screen.getByTestId('chat-button');
    expect(button).toHaveAttribute('data-open', 'true');
  });
});
