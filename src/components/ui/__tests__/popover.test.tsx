import { render, screen } from '@testing-library/react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
} from '../popover';

describe('Popover', () => {
  it('should render trigger', () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
      </Popover>
    );
    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  it('should have data-slot on trigger', () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
      </Popover>
    );
    expect(screen.getByText('Open')).toHaveAttribute('data-slot', 'popover-trigger');
  });

  it('should render anchor', () => {
    render(
      <Popover>
        <PopoverAnchor data-testid="anchor" />
      </Popover>
    );
    expect(screen.getByTestId('anchor')).toHaveAttribute('data-slot', 'popover-anchor');
  });

  it('should render content when open', () => {
    render(
      <Popover open>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Content here</PopoverContent>
      </Popover>
    );
    expect(screen.getByText('Content here')).toBeInTheDocument();
  });
});
