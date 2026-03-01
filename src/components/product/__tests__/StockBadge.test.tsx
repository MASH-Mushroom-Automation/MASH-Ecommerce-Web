import { render, screen } from '@testing-library/react';
import { StockBadge } from '../StockBadge';

const mockInventory = {
  trackInventory: true,
  stockStatus: 'in-stock',
  quantity: 10,
};
const mockUseProductInventory = jest.fn().mockReturnValue({ inventory: mockInventory, loading: false });
jest.mock('@/hooks/useSanityInventory', () => ({ useProductInventory: () => mockUseProductInventory() }));
jest.mock('@/components/ui/badge', () => ({ Badge: (p: any) => <div data-testid="badge">{p.children}</div> }));
jest.mock('lucide-react', () => ({ AlertCircle: () => <span>Alert</span>, CheckCircle: () => <span>Check</span>, XCircle: () => <span>X</span> }));

describe('StockBadge', () => {
  it('renders in-stock badge', () => {
    render(<StockBadge productId="prod1" />);
    expect(screen.getByTestId('badge')).toBeInTheDocument();
  });
  it('renders low-stock badge', () => {
    mockUseProductInventory.mockReturnValueOnce({ inventory: { ...mockInventory, stockStatus: 'low-stock' }, loading: false });
    render(<StockBadge productId="prod2" />);
    expect(screen.getByTestId('badge')).toBeInTheDocument();
  });
  it('renders out-of-stock badge', () => {
    mockUseProductInventory.mockReturnValueOnce({ inventory: { ...mockInventory, stockStatus: 'out-of-stock' }, loading: false });
    render(<StockBadge productId="prod3" />);
    expect(screen.getByTestId('badge')).toBeInTheDocument();
  });
  it('returns null if loading', () => {
    mockUseProductInventory.mockReturnValueOnce({ inventory: null, loading: true });
    const { container } = render(<StockBadge productId="prod4" />);
    expect(container.firstChild).toBeNull();
  });
});
