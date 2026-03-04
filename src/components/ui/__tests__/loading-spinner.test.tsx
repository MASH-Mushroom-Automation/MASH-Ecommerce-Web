/**
 * Tests for UI loading spinner components
 * Covers: LoadingSpinner, LoadingSkeleton, ProductCardSkeleton, ProductGridSkeleton, ProductDetailSkeleton
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  LoadingSpinner,
  LoadingSkeleton,
  ProductCardSkeleton,
  ProductGridSkeleton,
  ProductDetailSkeleton,
} from '../loading-spinner';

describe('LoadingSpinner', () => {
  it('should render with default md size', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.firstChild as HTMLElement;
    expect(spinner).toBeInTheDocument();
    expect(spinner.classList.toString()).toContain('animate-spin');
  });

  it('should render sm size', () => {
    const { container } = render(<LoadingSpinner size="sm" />);
    const spinner = container.firstChild as HTMLElement;
    expect(spinner.classList.toString()).toMatch(/h-4/);
  });

  it('should render lg size', () => {
    const { container } = render(<LoadingSpinner size="lg" />);
    const spinner = container.firstChild as HTMLElement;
    expect(spinner.classList.toString()).toMatch(/h-8/);
  });

  it('should apply custom className', () => {
    const { container } = render(<LoadingSpinner className="text-red-500" />);
    const spinner = container.firstChild as HTMLElement;
    expect(spinner.classList.toString()).toContain('text-red-500');
  });
});

describe('LoadingSkeleton', () => {
  it('should render with custom className', () => {
    const { container } = render(<LoadingSkeleton className="h-10 w-20" />);
    const div = container.firstChild as HTMLElement;
    expect(div).toBeInTheDocument();
    expect(div.classList.toString()).toContain('animate-pulse');
  });
});

describe('ProductCardSkeleton', () => {
  it('should render skeleton card structure', () => {
    const { container } = render(<ProductCardSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
    // Should contain multiple skeleton elements
    const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});

describe('ProductGridSkeleton', () => {
  it('should render default 8 product card skeletons', () => {
    const { container } = render(<ProductGridSkeleton />);
    // Default count is 8
    const cards = container.querySelectorAll('[class*="rounded"]');
    expect(cards.length).toBeGreaterThanOrEqual(8);
  });

  it('should render custom count of skeletons', () => {
    const { container } = render(<ProductGridSkeleton count={4} />);
    expect(container.firstChild).toBeInTheDocument();
  });
});

describe('ProductDetailSkeleton', () => {
  it('should render full page skeleton', () => {
    const { container } = render(<ProductDetailSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
    // Should contain image gallery skeleton and details skeleton
    const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
