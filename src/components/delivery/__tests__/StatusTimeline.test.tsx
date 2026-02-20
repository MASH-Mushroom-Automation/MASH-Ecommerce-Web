/**
 * StatusTimeline Component Unit Tests
 * Tests delivery progress stages, status rendering, and canceled state
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import StatusTimeline from '../StatusTimeline';

// Stage labels in order
const STAGE_LABELS = ['Order Placed', 'Driver Assigned', 'Picked Up', 'Delivered'];
const STAGE_DESCRIPTIONS = [
  'Finding nearby driver',
  'Driver on the way to pickup',
  'Driver heading to delivery',
  'Package delivered successfully',
];

describe('StatusTimeline', () => {
  describe('stage rendering', () => {
    it('renders all 4 stages with labels and descriptions', () => {
      render(<StatusTimeline currentStatus="ASSIGNING_DRIVER" />);

      for (const label of STAGE_LABELS) {
        expect(screen.getAllByText(label).length).toBeGreaterThanOrEqual(1);
      }
      for (const desc of STAGE_DESCRIPTIONS) {
        expect(screen.getAllByText(desc).length).toBeGreaterThanOrEqual(1);
      }
    });

    it('renders both desktop (horizontal) and mobile (vertical) layouts', () => {
      const { container } = render(<StatusTimeline currentStatus="ON_GOING" />);
      // Desktop layout has hidden md:flex
      const desktopTimeline = container.querySelector('.hidden.md\\:flex');
      expect(desktopTimeline).toBeInTheDocument();
      // Mobile layout has md:hidden
      const mobileTimeline = container.querySelector('.md\\:hidden');
      expect(mobileTimeline).toBeInTheDocument();
    });
  });

  describe('ASSIGNING_DRIVER status', () => {
    it('shows first stage as current (blue, animated)', () => {
      const { container } = render(<StatusTimeline currentStatus="ASSIGNING_DRIVER" />);
      // First stage icon should have animate-pulse (current)
      const animatedIcons = container.querySelectorAll('.animate-pulse');
      expect(animatedIcons.length).toBeGreaterThanOrEqual(1);
    });

    it('shows remaining stages as pending (gray)', () => {
      render(<StatusTimeline currentStatus="ASSIGNING_DRIVER" />);
      // "Driver Assigned", "Picked Up", "Delivered" should be pending (gray text)
      const driverAssigned = screen.getAllByText('Driver Assigned');
      // At least one should have gray color (pending)
      const hasPendingColor = driverAssigned.some(
        (el) => el.className.includes('text-gray-400')
      );
      expect(hasPendingColor).toBe(true);
    });
  });

  describe('ON_GOING status', () => {
    it('shows first stage as completed (green check)', () => {
      const { container } = render(<StatusTimeline currentStatus="ON_GOING" />);
      // Should have completed stage icons (CheckCircle2 SVGs)
      const greenCircles = container.querySelectorAll('.text-green-600');
      expect(greenCircles.length).toBeGreaterThanOrEqual(1);
    });

    it('shows second stage as current', () => {
      const { container } = render(<StatusTimeline currentStatus="ON_GOING" />);
      // Should have blue (current) stage
      const blueCircles = container.querySelectorAll('.text-blue-600');
      expect(blueCircles.length).toBeGreaterThanOrEqual(1);
    });

    it('Order Placed label is not gray (completed)', () => {
      render(<StatusTimeline currentStatus="ON_GOING" />);
      const orderPlaced = screen.getAllByText('Order Placed');
      const hasActiveColor = orderPlaced.some(
        (el) => el.className.includes('text-gray-900')
      );
      expect(hasActiveColor).toBe(true);
    });
  });

  describe('PICKED_UP status', () => {
    it('shows first two stages as completed', () => {
      const { container } = render(<StatusTimeline currentStatus="PICKED_UP" />);
      const greenCircles = container.querySelectorAll('.text-green-600');
      // Desktop + mobile = at least 4 completed circles (2 stages x 2 layouts)
      expect(greenCircles.length).toBeGreaterThanOrEqual(4);
    });

    it('shows third stage as current (blue)', () => {
      const { container } = render(<StatusTimeline currentStatus="PICKED_UP" />);
      const blueCircles = container.querySelectorAll('.text-blue-600');
      expect(blueCircles.length).toBeGreaterThanOrEqual(1);
    });

    it('shows Delivered as still pending', () => {
      render(<StatusTimeline currentStatus="PICKED_UP" />);
      const delivered = screen.getAllByText('Delivered');
      const hasPendingColor = delivered.some(
        (el) => el.className.includes('text-gray-400')
      );
      expect(hasPendingColor).toBe(true);
    });
  });

  describe('COMPLETED status', () => {
    it('shows first 3 stages as completed and last as current', () => {
      const { container } = render(<StatusTimeline currentStatus="COMPLETED" />);
      const greenCircles = container.querySelectorAll('.text-green-600');
      // First 3 stages completed x 2 layouts = 6 green
      expect(greenCircles.length).toBeGreaterThanOrEqual(6);
      // Last stage (Delivered) is "current" (blue) since index === currentIndex
      const blueCircles = container.querySelectorAll('.text-blue-600');
      expect(blueCircles.length).toBeGreaterThanOrEqual(2);
    });

    it('no stage has pending gray color on labels', () => {
      render(<StatusTimeline currentStatus="COMPLETED" />);
      for (const label of STAGE_LABELS) {
        const elements = screen.getAllByText(label);
        const allActive = elements.every(
          (el) => !el.className.includes('text-gray-400')
        );
        expect(allActive).toBe(true);
      }
    });

    it('does not show canceled alert', () => {
      render(<StatusTimeline currentStatus="COMPLETED" />);
      expect(screen.queryByText('Order Canceled')).not.toBeInTheDocument();
    });
  });

  describe('CANCELED status', () => {
    it('shows canceled alert box', () => {
      render(<StatusTimeline currentStatus="CANCELED" />);
      expect(screen.getByText('Order Canceled')).toBeInTheDocument();
      expect(
        screen.getByText(/This delivery was canceled/)
      ).toBeInTheDocument();
    });

    it('alert box has red styling', () => {
      render(<StatusTimeline currentStatus="CANCELED" />);
      const alertText = screen.getByText('Order Canceled');
      expect(alertText.className).toContain('text-red-800');
    });

    it('only first stage shows as completed', () => {
      const { container } = render(<StatusTimeline currentStatus="CANCELED" />);
      // In CANCELED state: first stage = completed, rest = pending
      // Green circles should be limited (only stage 0 in both layouts = ~2)
      const greenCircles = container.querySelectorAll('.text-green-600');
      expect(greenCircles.length).toBeGreaterThanOrEqual(2);
      // But should not have 8 (not all completed)
      expect(greenCircles.length).toBeLessThan(8);
    });

    it('remaining stages are gray/pending', () => {
      render(<StatusTimeline currentStatus="CANCELED" />);
      const delivered = screen.getAllByText('Delivered');
      const hasPendingColor = delivered.some(
        (el) => el.className.includes('text-gray-400')
      );
      expect(hasPendingColor).toBe(true);
    });
  });

  describe('connecting lines', () => {
    it('renders connecting lines between stages', () => {
      const { container } = render(<StatusTimeline currentStatus="ON_GOING" />);
      // Desktop: 3 connecting lines between 4 stages
      // Mobile: 3 connecting lines as vertical bars
      const allLines = container.querySelectorAll('[style*="z-index"]');
      // At least the desktop lines exist
      expect(allLines.length).toBeGreaterThanOrEqual(3);
    });

    it('completed lines are green for ON_GOING', () => {
      const { container } = render(<StatusTimeline currentStatus="ON_GOING" />);
      const greenLines = container.querySelectorAll('.bg-green-600');
      // At least 1 green connecting line (from ASSIGNING_DRIVER to ON_GOING)
      expect(greenLines.length).toBeGreaterThanOrEqual(1);
    });
  });
});
