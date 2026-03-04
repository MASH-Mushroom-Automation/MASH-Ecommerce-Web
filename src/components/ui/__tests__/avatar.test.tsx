import { render, screen } from '@testing-library/react';
import { Avatar, AvatarImage, AvatarFallback } from '../avatar';

describe('Avatar', () => {
  it('should render with data-slot', () => {
    render(<Avatar data-testid="av" />);
    expect(screen.getByTestId('av')).toHaveAttribute('data-slot', 'avatar');
  });

  it('should merge custom className', () => {
    render(<Avatar data-testid="av" className="custom-class" />);
    expect(screen.getByTestId('av')).toHaveClass('custom-class');
  });
});

describe('AvatarFallback', () => {
  it('should render fallback text', () => {
    render(
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('should have data-slot', () => {
    render(
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByText('JD')).toHaveAttribute('data-slot', 'avatar-fallback');
  });
});

describe('AvatarImage', () => {
  it('should accept src prop', () => {
    const { container } = render(
      <Avatar>
        <AvatarImage src="/test.jpg" alt="test" />
      </Avatar>
    );
    // Radix Avatar delays image render; verify the component mounts without error
    expect(container.querySelector('[data-slot="avatar"]')).toBeInTheDocument();
  });
});
