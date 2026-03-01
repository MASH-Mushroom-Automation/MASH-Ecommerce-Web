import { render, screen } from '@testing-library/react';
import { NewsletterSignup } from '../NewsletterSignup';
jest.mock('sonner', () => ({ toast: { error: jest.fn(), success: jest.fn() } }));
jest.mock('lucide-react', () => ({ Mail: () => <span>Mail</span> }));
jest.mock('@/components/ui/button', () => ({ Button: (p: any) => <button {...p} /> }));

describe('NewsletterSignup', () => {
  it('renders input and subscribe button', () => {
    render(<NewsletterSignup />);
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByText('Subscribe')).toBeInTheDocument();
  });
  it('renders newsletter heading', () => {
    render(<NewsletterSignup />);
    expect(screen.getByText(/Fresh Deals/i)).toBeInTheDocument();
  });
  it('renders unsubscribe note', () => {
    render(<NewsletterSignup />);
    expect(screen.getByText(/No spam/i)).toBeInTheDocument();
  });
});
