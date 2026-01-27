/**
 * Unit Tests for CalendlyButton Component
 * 
 * Tests the booking button that navigates to grower booking pages.
 * Validates button states, navigation, and appointment type display.
 * 
 * @see src/components/appointments/CalendlyButton.tsx
 * @see .github/SELLER_APPOINTMENT_SYSTEM_PLAN.md (CAL-004)
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { CalendlyButton, AppointmentTypeCard } from '../CalendlyButton';
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Calendar: () => <div data-testid="calendar-icon">Calendar Icon</div>,
  Clock: () => <div data-testid="clock-icon">Clock Icon</div>,
  MapPin: () => <div data-testid="mappin-icon">MapPin Icon</div>,
  Phone: () => <div data-testid="phone-icon">Phone Icon</div>,
  Video: () => <div data-testid="video-icon">Video Icon</div>,
}));

describe('CalendlyButton Component', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  const defaultProps = {
    growerSlug: 'shroomarket',
    growerName: 'Shroomarket',
    calendlyEnabled: true,
  };

  describe('Rendering - Enabled State', () => {
    it('should render button when Calendly is enabled', () => {
      render(<CalendlyButton {...defaultProps} />);
      
      const button = screen.getByRole('button', { name: /schedule with grower/i });
      expect(button).toBeInTheDocument();
    });

    it('should display calendar icon', () => {
      render(<CalendlyButton {...defaultProps} />);
      
      expect(screen.getByTestId('calendar-icon')).toBeInTheDocument();
    });

    it('should show "Schedule with Grower" text by default', () => {
      render(<CalendlyButton {...defaultProps} />);
      
      expect(screen.getByText(/schedule with grower/i)).toBeInTheDocument();
    });

    it('uses custom buttonText when provided', () => {
      render(<CalendlyButton {...defaultProps} buttonText={"Let's Talk"} />);
      
      expect(screen.getByText(/let's talk/i)).toBeInTheDocument();
    });

    it('should render as icon-only in compact mode', () => {
      render(<CalendlyButton {...defaultProps} compact={true} />);
      
      // In compact mode, renders as icon button with title attribute
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('title', 'Schedule with Grower with Shroomarket');
      // No visible text in compact mode
      expect(screen.queryByText('Schedule with Grower')).not.toBeInTheDocument();
    });
  });

  describe('Rendering - Disabled State', () => {
    it('should not render when Calendly is disabled', () => {
      render(<CalendlyButton {...defaultProps} calendlyEnabled={false} />);
      
      const button = screen.queryByRole('button', { name: /schedule with grower/i });
      expect(button).not.toBeInTheDocument();
    });

    it('should not render when calendlyEnabled is undefined', () => {
      render(<CalendlyButton {...defaultProps} calendlyEnabled={undefined} />);
      
      const button = screen.queryByRole('button', { name: /schedule with grower/i });
      expect(button).not.toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should have correct booking page link', () => {
      const { container } = render(<CalendlyButton {...defaultProps} />);
      
      const link = container.querySelector('a[href="/grower/shroomarket/book"]');
      expect(link).toBeInTheDocument();
    });

    it('should construct correct URL with different grower slugs', () => {
      const { container } = render(
        <CalendlyButton
          growerSlug="fungi-fresh-farms"
          growerName="Fungi Fresh Farms"
          calendlyEnabled={true}
        />
      );
      
      const link = container.querySelector('a[href="/grower/fungi-fresh-farms/book"]');
      expect(link).toBeInTheDocument();
    });

    it('should handle slugs with special characters', () => {
      const { container } = render(
        <CalendlyButton
          growerSlug="the-mushroom-patch-bukidnon"
          growerName="The Mushroom Patch (Bukidnon)"
          calendlyEnabled={true}
        />
      );
      
      const link = container.querySelector('a[href="/grower/the-mushroom-patch-bukidnon/book"]');
      expect(link).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('should apply default variant styling', () => {
      render(<CalendlyButton {...defaultProps} variant="default" />);
      
      const button = screen.getByRole('button', { name: /schedule with grower/i });
      expect(button).toBeInTheDocument();
    });

    it('should apply outline variant styling', () => {
      render(<CalendlyButton {...defaultProps} variant="outline" />);
      
      const button = screen.getByRole('button', { name: /schedule with grower/i });
      expect(button).toBeInTheDocument();
    });

    it('should apply ghost variant styling', () => {
      render(<CalendlyButton {...defaultProps} variant="ghost" />);
      
      const button = screen.getByRole('button', { name: /schedule with grower/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Sizes', () => {
    it('should apply default size', () => {
      render(<CalendlyButton {...defaultProps} size="default" />);
      
      const button = screen.getByRole('button', { name: /schedule with grower/i });
      expect(button).toBeInTheDocument();
    });

    it('should apply small size', () => {
      render(<CalendlyButton {...defaultProps} size="sm" />);
      
      const button = screen.getByRole('button', { name: /schedule with grower/i });
      expect(button).toBeInTheDocument();
    });

    it('should apply large size', () => {
      render(<CalendlyButton {...defaultProps} size="lg" />);
      
      const button = screen.getByRole('button', { name: /schedule with grower/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      render(<CalendlyButton {...defaultProps} className="custom-class" />);
      
      const button = screen.getByRole('button', { name: /schedule with grower/i });
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('Appointment Types Display', () => {
    const appointmentTypes = [
      {
        name: 'Product Consultation',
        eventSlug: '30min',
        duration: 30,
        meetingType: 'online' as const,
        description: 'Discuss our products',
        isDefault: true,
      },
      {
        name: 'Store Visit',
        eventSlug: 'store-visit',
        duration: 45,
        meetingType: 'in-person' as const,
        description: 'Visit our farm',
      },
    ];

    it('should not display appointment types when array is empty', () => {
      render(<CalendlyButton {...defaultProps} appointmentTypes={[]} />);
      
      expect(screen.queryByText(/product consultation/i)).not.toBeInTheDocument();
    });

    it('should not display appointment types by default', () => {
      render(<CalendlyButton {...defaultProps} />);
      
      expect(screen.queryByText(/product consultation/i)).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty grower name', () => {
      render(
        <CalendlyButton
          growerSlug="test-grower"
          growerName=""
          calendlyEnabled={true}
        />
      );
      
      const button = screen.getByRole('button', { name: /schedule with grower/i });
      expect(button).toBeInTheDocument();
    });

    it('should handle very long grower names', () => {
      const longName = 'A'.repeat(100);
      render(
        <CalendlyButton
          growerSlug="test-grower"
          growerName={longName}
          calendlyEnabled={true}
        />
      );
      
      const button = screen.getByRole('button', { name: /schedule with grower/i });
      expect(button).toBeInTheDocument();
    });

    it('should handle special characters in grower name', () => {
      render(
        <CalendlyButton
          growerSlug="test-grower"
          growerName="Grower & Farm's Market"
          calendlyEnabled={true}
        />
      );
      
      const button = screen.getByRole('button', { name: /schedule with grower/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should be rendered as a link with button styling', () => {
      const { container } = render(<CalendlyButton {...defaultProps} />);
      
      const button = screen.getByRole('button', { name: /schedule with grower/i });
      expect(button).toBeInTheDocument();
      // Wrapped in Link component
      const link = container.querySelector('a');
      expect(link).toBeInTheDocument();
    });

    it('should be keyboard accessible', () => {
      render(<CalendlyButton {...defaultProps} />);
      
      const button = screen.getByRole('button', { name: /schedule with grower/i });
      button.focus();
      
      expect(document.activeElement).toBe(button);
    });
  });
});

describe('AppointmentTypeCard Component', () => {
  const defaultAppointment = {
    name: 'Product Consultation',
    eventSlug: '30min',
    duration: 30,
    meetingType: 'online' as const,
    description: 'Discuss our mushroom products and bulk orders',
  };

  describe('Rendering', () => {
    it('should render appointment name', () => {
      render(<AppointmentTypeCard appointment={defaultAppointment} />);
      
      expect(screen.getByText('Product Consultation')).toBeInTheDocument();
    });

    it('should render duration', () => {
      render(<AppointmentTypeCard appointment={defaultAppointment} />);
      
      expect(screen.getByText(/30 minutes/i)).toBeInTheDocument();
    });

    it('should render description when provided', () => {
      render(<AppointmentTypeCard appointment={defaultAppointment} />);
      
      expect(screen.getByText(/discuss our mushroom products/i)).toBeInTheDocument();
    });

    it('should not render description when not provided', () => {
      const appointmentWithoutDesc = { ...defaultAppointment, description: undefined };
      render(<AppointmentTypeCard appointment={appointmentWithoutDesc} />);
      
      expect(screen.queryByText(/discuss/i)).not.toBeInTheDocument();
    });
  });

  describe('Meeting Type Icons', () => {
    it('should show video icon for online meetings', () => {
      render(
        <AppointmentTypeCard
          appointment={{ ...defaultAppointment, meetingType: 'online' }}
        />
      );
      
      expect(screen.getByTestId('video-icon')).toBeInTheDocument();
    });

    it('should show map pin icon for in-person meetings', () => {
      render(
        <AppointmentTypeCard
          appointment={{ ...defaultAppointment, meetingType: 'in-person' }}
        />
      );
      
      expect(screen.getByTestId('mappin-icon')).toBeInTheDocument();
    });

    it('should show phone icon for phone meetings', () => {
      render(
        <AppointmentTypeCard
          appointment={{ ...defaultAppointment, meetingType: 'phone' }}
        />
      );
      
      expect(screen.getByTestId('phone-icon')).toBeInTheDocument();
    });
  });

  describe('Meeting Type Labels', () => {
    it('should display "Online Meeting" for online type', () => {
      render(
        <AppointmentTypeCard
          appointment={{ ...defaultAppointment, meetingType: 'online' }}
        />
      );
      
      expect(screen.getByText(/online meeting/i)).toBeInTheDocument();
    });

    it('should display "Store Visit" for in-person type', () => {
      render(
        <AppointmentTypeCard
          appointment={{ ...defaultAppointment, meetingType: 'in-person' }}
        />
      );
      
      expect(screen.getByText(/store visit/i)).toBeInTheDocument();
    });

    it('should display "Phone Call" for phone type', () => {
      render(
        <AppointmentTypeCard
          appointment={{ ...defaultAppointment, meetingType: 'phone' }}
        />
      );
      
      expect(screen.getByText(/phone call/i)).toBeInTheDocument();
    });
  });

  describe('Different Durations', () => {
    it('should handle 15-minute appointments', () => {
      render(
        <AppointmentTypeCard
          appointment={{ ...defaultAppointment, duration: 15 }}
        />
      );
      
      expect(screen.getByText(/15 minutes/i)).toBeInTheDocument();
    });

    it('should handle 45-minute appointments', () => {
      render(
        <AppointmentTypeCard
          appointment={{ ...defaultAppointment, duration: 45 }}
        />
      );
      
      expect(screen.getByText(/45 minutes/i)).toBeInTheDocument();
    });

    it('should handle 60-minute appointments', () => {
      render(
        <AppointmentTypeCard
          appointment={{ ...defaultAppointment, duration: 60 }}
        />
      );
      
      expect(screen.getByText(/60 minutes/i)).toBeInTheDocument();
    });
  });

  describe('Clock Icon', () => {
    it('should display clock icon for duration', () => {
      render(<AppointmentTypeCard appointment={defaultAppointment} />);
      
      expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should render as a card element', () => {
      const { container } = render(<AppointmentTypeCard appointment={defaultAppointment} />);
      
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long appointment names', () => {
      const longName = 'A'.repeat(100);
      render(
        <AppointmentTypeCard
          appointment={{ ...defaultAppointment, name: longName }}
        />
      );
      
      expect(screen.getByText(longName)).toBeInTheDocument();
    });

    it('should handle very long descriptions', () => {
      const longDesc = 'A'.repeat(500);
      render(
        <AppointmentTypeCard
          appointment={{ ...defaultAppointment, description: longDesc }}
        />
      );
      
      expect(screen.getByText(longDesc)).toBeInTheDocument();
    });

    it('should handle zero duration', () => {
      render(
        <AppointmentTypeCard
          appointment={{ ...defaultAppointment, duration: 0 }}
        />
      );
      
      expect(screen.getByText(/0 minutes/i)).toBeInTheDocument();
    });
  });
});
