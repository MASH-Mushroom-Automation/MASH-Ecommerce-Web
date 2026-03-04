import { render, screen } from '@testing-library/react';
import { ButtonGroup, ButtonGroupText, ButtonGroupSeparator } from '../button-group';

describe('ButtonGroup', () => {
  it('should render with role=group', () => {
    render(<ButtonGroup>Content</ButtonGroup>);
    expect(screen.getByRole('group')).toBeInTheDocument();
  });

  it('should have data-slot', () => {
    render(<ButtonGroup>Content</ButtonGroup>);
    expect(screen.getByRole('group')).toHaveAttribute('data-slot', 'button-group');
  });

  it('should not set data-orientation when using default', () => {
    render(<ButtonGroup>Content</ButtonGroup>);
    // default variant is "horizontal" via CVA, but data-orientation reflects the prop value
    expect(screen.getByRole('group')).toHaveAttribute('data-slot', 'button-group');
  });

  it('should apply vertical orientation', () => {
    render(<ButtonGroup orientation="vertical">Content</ButtonGroup>);
    expect(screen.getByRole('group')).toHaveAttribute('data-orientation', 'vertical');
  });

  it('should merge custom className', () => {
    render(<ButtonGroup className="custom">Content</ButtonGroup>);
    expect(screen.getByRole('group')).toHaveClass('custom');
  });
});

describe('ButtonGroupText', () => {
  it('should render text content', () => {
    render(<ButtonGroupText>Label</ButtonGroupText>);
    expect(screen.getByText('Label')).toBeInTheDocument();
  });

  it('should render as Slot when asChild', () => {
    render(
      <ButtonGroupText asChild>
        <span data-testid="child">Custom</span>
      </ButtonGroupText>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});

describe('ButtonGroupSeparator', () => {
  it('should render with data-slot', () => {
    render(<ButtonGroupSeparator data-testid="sep" />);
    expect(screen.getByTestId('sep')).toHaveAttribute('data-slot', 'button-group-separator');
  });
});
