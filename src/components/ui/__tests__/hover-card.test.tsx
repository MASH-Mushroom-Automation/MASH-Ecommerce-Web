import { render, screen } from '@testing-library/react';
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from '../hover-card';

describe('HoverCard', () => {
  it('should render trigger', () => {
    render(
      <HoverCard>
        <HoverCardTrigger>Hover me</HoverCardTrigger>
      </HoverCard>
    );
    expect(screen.getByText('Hover me')).toBeInTheDocument();
  });

  it('should have data-slot on trigger', () => {
    render(
      <HoverCard>
        <HoverCardTrigger>Hover me</HoverCardTrigger>
      </HoverCard>
    );
    expect(screen.getByText('Hover me')).toHaveAttribute('data-slot', 'hover-card-trigger');
  });

  it('should render content when open', () => {
    render(
      <HoverCard open>
        <HoverCardTrigger>Hover me</HoverCardTrigger>
        <HoverCardContent>Card content</HoverCardContent>
      </HoverCard>
    );
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });
});
