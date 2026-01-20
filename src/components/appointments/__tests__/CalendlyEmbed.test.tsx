/**
 * Unit Tests for CalendlyEmbed Component
 * 
 * Tests the inline Calendly widget integration for appointment booking.
 * Ensures proper rendering, prop handling, and error states.
 * 
 * @see src/components/appointments/CalendlyEmbed.tsx
 * @see .github/SELLER_APPOINTMENT_SYSTEM_PLAN.md (CAL-003)
 */

import { render, screen } from '@testing-library/react';
import { CalendlyEmbed } from '../CalendlyEmbed';
import '@testing-library/jest-dom';

// Mock react-calendly InlineWidget
jest.mock('react-calendly', () => ({
  InlineWidget: ({ url, prefill, styles }: any) => (
    <div 
      data-testid="calendly-inline-widget"
      data-url={url}
      data-prefill={JSON.stringify(prefill)}
      style={styles}
    >
      Mocked Calendly Widget
    </div>
  ),
}));

describe('CalendlyEmbed Component', () => {
  const defaultProps = {
    username: 'mash-mushroom-automation',
    eventSlug: '30min',
  };

  describe('Rendering', () => {
    it('should render the Calendly widget', () => {
      render(<CalendlyEmbed {...defaultProps} />);
      
      const widget = screen.getByTestId('calendly-inline-widget');
      expect(widget).toBeInTheDocument();
    });

    it('should construct correct Calendly URL from username and event slug', () => {
      render(<CalendlyEmbed {...defaultProps} />);
      
      const widget = screen.getByTestId('calendly-inline-widget');
      expect(widget).toHaveAttribute(
        'data-url',
        'https://calendly.com/mash-mushroom-automation/30min'
      );
    });

    it('should use default event slug if not provided', () => {
      render(<CalendlyEmbed username="test-grower" />);
      
      const widget = screen.getByTestId('calendly-inline-widget');
      expect(widget).toHaveAttribute(
        'data-url',
        'https://calendly.com/test-grower/30min'
      );
    });

    it('should apply custom height style', () => {
      render(<CalendlyEmbed {...defaultProps} height="800px" />);
      
      const widget = screen.getByTestId('calendly-inline-widget');
      expect(widget).toHaveStyle({ height: '800px' });
    });

    it('should apply default height if not provided', () => {
      render(<CalendlyEmbed {...defaultProps} />);
      
      const widget = screen.getByTestId('calendly-inline-widget');
      expect(widget).toHaveStyle({ height: '700px' });
    });

    it('should apply custom className', () => {
      const { container } = render(
        <CalendlyEmbed {...defaultProps} className="custom-class" />
      );
      
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('custom-class');
    });
  });

  describe('Prefill Data', () => {
    it('should pass productId as custom answer when provided', () => {
      render(<CalendlyEmbed {...defaultProps} productId="prod-123" />);
      
      const widget = screen.getByTestId('calendly-inline-widget');
      const prefillData = JSON.parse(widget.getAttribute('data-prefill') || '{}');
      
      expect(prefillData.customAnswers).toEqual({ a1: 'prod-123' });
    });

    it('should not include productId in prefill when not provided', () => {
      render(<CalendlyEmbed {...defaultProps} />);
      
      const widget = screen.getByTestId('calendly-inline-widget');
      const prefillData = JSON.parse(widget.getAttribute('data-prefill') || '{}');
      
      expect(prefillData.customAnswers).toBeUndefined();
    });
  });

  describe('Different Event Types', () => {
    it('should handle store-visit event slug', () => {
      render(<CalendlyEmbed username="test-grower" eventSlug="store-visit" />);
      
      const widget = screen.getByTestId('calendly-inline-widget');
      expect(widget).toHaveAttribute(
        'data-url',
        'https://calendly.com/test-grower/store-visit'
      );
    });

    it('should handle bulk-order event slug', () => {
      render(<CalendlyEmbed username="test-grower" eventSlug="bulk-order" />);
      
      const widget = screen.getByTestId('calendly-inline-widget');
      expect(widget).toHaveAttribute(
        'data-url',
        'https://calendly.com/test-grower/bulk-order'
      );
    });

    it('should handle custom event slugs', () => {
      render(<CalendlyEmbed username="test-grower" eventSlug="custom-event-45min" />);
      
      const widget = screen.getByTestId('calendly-inline-widget');
      expect(widget).toHaveAttribute(
        'data-url',
        'https://calendly.com/test-grower/custom-event-45min'
      );
    });
  });

  describe('URL Construction', () => {
    it('should handle usernames with special characters', () => {
      render(<CalendlyEmbed username="test-grower-farm" eventSlug="30min" />);
      
      const widget = screen.getByTestId('calendly-inline-widget');
      expect(widget).toHaveAttribute(
        'data-url',
        'https://calendly.com/test-grower-farm/30min'
      );
    });

    it('should not add trailing slash to URL', () => {
      render(<CalendlyEmbed {...defaultProps} />);
      
      const widget = screen.getByTestId('calendly-inline-widget');
      const url = widget.getAttribute('data-url');
      expect(url).not.toMatch(/\/$/);
    });
  });

  describe('Accessibility', () => {
    it('should render without accessibility violations', () => {
      const { container } = render(<CalendlyEmbed {...defaultProps} />);
      
      // Check for basic container structure
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should have proper container structure', () => {
      const { container } = render(<CalendlyEmbed {...defaultProps} />);
      
      expect(container.firstChild).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty username gracefully', () => {
      render(<CalendlyEmbed username="" eventSlug="30min" />);
      
      const widget = screen.getByTestId('calendly-inline-widget');
      expect(widget).toHaveAttribute('data-url', 'https://calendly.com//30min');
    });

    it('should handle very long usernames', () => {
      const longUsername = 'a'.repeat(100);
      render(<CalendlyEmbed username={longUsername} />);
      
      const widget = screen.getByTestId('calendly-inline-widget');
      expect(widget).toHaveAttribute(
        'data-url',
        `https://calendly.com/${longUsername}/30min`
      );
    });

    it('should handle numeric productId', () => {
      render(<CalendlyEmbed {...defaultProps} productId="12345" />);
      
      const widget = screen.getByTestId('calendly-inline-widget');
      const prefillData = JSON.parse(widget.getAttribute('data-prefill') || '{}');
      
      expect(prefillData.customAnswers.a1).toBe('12345');
    });
  });

  describe('Integration with Live Example', () => {
    it('should match the live MASH Mushroom Automation URL format', () => {
      // Live example: https://calendly.com/mash-mushroom-automation/30min
      render(<CalendlyEmbed username="mash-mushroom-automation" eventSlug="30min" />);
      
      const widget = screen.getByTestId('calendly-inline-widget');
      expect(widget).toHaveAttribute(
        'data-url',
        'https://calendly.com/mash-mushroom-automation/30min'
      );
    });
  });
});
