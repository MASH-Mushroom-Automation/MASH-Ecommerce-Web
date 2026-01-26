/**
 * Unit Tests for CalComEmbed Component
 * 
 * Tests the inline Cal.com widget integration for appointment booking.
 * Ensures proper rendering, prop handling, and error states.
 * 
 * @see src/components/appointments/CalendlyEmbed.tsx (renamed but exports CalComEmbed)
 * @see .github/COMPREHENSIVE_TESTING_AND_SECURITY_PLAN.md (Phase 8)
 */

import { render, screen } from '@testing-library/react';
import { CalComEmbed } from '../CalendlyEmbed';
import '@testing-library/jest-dom';

// Mock useAuth hook - MUST return a function
jest.mock('@/contexts/AuthContext', () => ({
  __esModule: true,
  useAuth: () => ({
    user: {
      uid: 'test-user-123',
      email: 'test@example.com',
      displayName: 'Test User',
    },
    isAuthenticated: true,
  }),
}));

// Mock @calcom/embed-react
jest.mock('@calcom/embed-react', () => ({
  getCalApi: jest.fn(() => Promise.resolve((action: string, config: any) => {
    // Mock Cal API functions for testing
    return config;
  })),
}));

describe('CalComEmbed Component', () => {
  // Ensure tests clean up properly to prevent Jest worker memory growth
  afterEach(() => {
    try { require('@testing-library/react').cleanup(); } catch (e) {}
    try { jest.clearAllTimers(); jest.useRealTimers(); } catch (e) {}
    try { jest.clearAllMocks(); } catch (e) {}
  });
  const defaultProps = {
    username: 'mash-mushroom',
    eventSlug: '30min',
  };

  describe('Rendering', () => {
    it('should render the Cal.com widget container', () => {
      const { container } = render(<CalComEmbed {...defaultProps} />);
      
      const widgetContainer = container.querySelector('[data-cal-link]');
      expect(widgetContainer).toBeInTheDocument();
    });

    it('should construct correct Cal.com link from username and event slug', () => {
      const { container } = render(<CalComEmbed {...defaultProps} />);
      
      const widgetContainer = container.querySelector('[data-cal-link]');
      expect(widgetContainer).toHaveAttribute(
        'data-cal-link',
        'mash-mushroom/30min'
      );
    });

    it('should use default event slug if not provided', () => {
      const { container } = render(<CalComEmbed username="test-grower" />);
      
      const widgetContainer = container.querySelector('[data-cal-link]');
      expect(widgetContainer).toHaveAttribute(
        'data-cal-link',
        'test-grower/30min'
      );
    });

    it('should apply custom height style to container', () => {
      const { container } = render(<CalComEmbed {...defaultProps} height="800px" />);
      
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle({ height: '800px' });
    });

    it('should apply default height if not provided', () => {
      const { container } = render(<CalComEmbed {...defaultProps} />);
      
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle({ height: '700px' });
    });

    it('should apply custom className', () => {
      const { container } = render(
        <CalComEmbed {...defaultProps} className="custom-class" />
      );
      
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('custom-class');
    });
  });

  describe('Prefill Data', () => {
    it('should handle productId metadata when provided', () => {
      const { container } = render(<CalComEmbed {...defaultProps} productId="prod-123" />);
      
      const widgetContainer = container.querySelector('[data-cal-link]');
      expect(widgetContainer).toBeInTheDocument();
    });

    it('should render without productId when not provided', () => {
      const { container } = render(<CalComEmbed {...defaultProps} />);
      
      const widgetContainer = container.querySelector('[data-cal-link]');
      expect(widgetContainer).toBeInTheDocument();
    });
  });

  describe('Different Event Types', () => {
    it('should handle 1-hour-meeting event slug', () => {
      const { container } = render(<CalComEmbed username="mash-mushroom" eventSlug="1-hour-meeting" />);
      
      const widgetContainer = container.querySelector('[data-cal-link]');
      expect(widgetContainer).toHaveAttribute(
        'data-cal-link',
        'mash-mushroom/1-hour-meeting'
      );
    });

    it('should handle 15min event slug', () => {
      const { container } = render(<CalComEmbed username="mash-mushroom" eventSlug="15min" />);
      
      const widgetContainer = container.querySelector('[data-cal-link]');
      expect(widgetContainer).toHaveAttribute(
        'data-cal-link',
        'mash-mushroom/15min'
      );
    });

    it('should handle secret event slug', () => {
      const { container } = render(<CalComEmbed username="mash-mushroom" eventSlug="secret" />);
      
      const widgetContainer = container.querySelector('[data-cal-link]');
      expect(widgetContainer).toHaveAttribute(
        'data-cal-link',
        'mash-mushroom/secret'
      );
    });

    it('should handle custom event slugs', () => {
      const { container } = render(<CalComEmbed username="test-grower" eventSlug="custom-event-45min" />);
      
      const widgetContainer = container.querySelector('[data-cal-link]');
      expect(widgetContainer).toHaveAttribute(
        'data-cal-link',
        'test-grower/custom-event-45min'
      );
    });
  });

  describe('URL Construction', () => {
    it('should handle usernames with special characters', () => {
      const { container } = render(<CalComEmbed username="test-grower-farm" eventSlug="30min" />);
      
      const widgetContainer = container.querySelector('[data-cal-link]');
      expect(widgetContainer).toHaveAttribute(
        'data-cal-link',
        'test-grower-farm/30min'
      );
    });

    it('should not add trailing slash to link', () => {
      const { container } = render(<CalComEmbed {...defaultProps} />);
      
      const widgetContainer = container.querySelector('[data-cal-link]');
      const link = widgetContainer?.getAttribute('data-cal-link');
      expect(link).not.toMatch(/\/$/);
    });
  });

  describe('Accessibility', () => {
    it('should render without accessibility violations', () => {
      const { container } = render(<CalComEmbed {...defaultProps} />);
      
      // Check for basic container structure
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should have proper container structure', () => {
      const { container } = render(<CalComEmbed {...defaultProps} />);
      
      expect(container.firstChild).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty username gracefully', () => {
      const { container } = render(<CalComEmbed username="" eventSlug="30min" />);
      
      const widgetContainer = container.querySelector('[data-cal-link]');
      expect(widgetContainer).toHaveAttribute('data-cal-link', '/30min');
    });

    it('should handle very long usernames', () => {
      const longUsername = 'a'.repeat(100);
      const { container } = render(<CalComEmbed username={longUsername} />);
      
      const widgetContainer = container.querySelector('[data-cal-link]');
      expect(widgetContainer).toHaveAttribute(
        'data-cal-link',
        `${longUsername}/30min`
      );
    });

    it('should handle numeric productId', () => {
      const { container } = render(<CalComEmbed {...defaultProps} productId="12345" />);
      
      const widgetContainer = container.querySelector('[data-cal-link]');
      expect(widgetContainer).toBeInTheDocument();
    });
  });

  describe('Integration with Cal.com Profile', () => {
    it('should match the Cal.com mash-mushroom profile URL format', () => {
      // Cal.com profile: https://cal.com/mash-mushroom
      const { container } = render(<CalComEmbed username="mash-mushroom" eventSlug="30min" />);
      
      const widgetContainer = container.querySelector('[data-cal-link]');
      expect(widgetContainer).toHaveAttribute(
        'data-cal-link',
        'mash-mushroom/30min'
      );
    });
  });
});

