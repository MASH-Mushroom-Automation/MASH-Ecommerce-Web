import { render, screen } from '@testing-library/react';
import { StockBadge, CompactStockBadge } from '../StockBadge';

const mockInventory = {
  trackInventory: true,
  stockStatus: 'in-stock',
  quantityInStock: 10,
  allowBackorders: false,
};
const mockUseProductInventory = jest.fn().mockReturnValue({ inventory: mockInventory, loading: false });
jest.mock('@/hooks/useSanityInventory', () => ({ useProductInventory: (...a: any[]) => mockUseProductInventory(...a) }));
jest.mock('@/components/ui/badge', () => ({ Badge: (p: any) => <div data-testid="badge" data-variant={p.variant} className={p.className}>{p.children}</div> }));
jest.mock('lucide-react', () => ({ AlertCircle: (p: any) => <span data-testid="icon-alert" className={p.className}>Alert</span>, CheckCircle: (p: any) => <span data-testid="icon-check" className={p.className}>Check</span>, XCircle: (p: any) => <span data-testid="icon-x" className={p.className}>X</span> }));

describe('StockBadge', () => {
  beforeEach(() => { jest.clearAllMocks(); mockUseProductInventory.mockReturnValue({ inventory: mockInventory, loading: false }); });

  // Early return branches
  it('returns null if loading', () => {
    mockUseProductInventory.mockReturnValueOnce({ inventory: null, loading: true });
    const { container } = render(<StockBadge productId="prod1" />);
    expect(container.firstChild).toBeNull();
  });
  it('returns null if inventory is null', () => {
    mockUseProductInventory.mockReturnValueOnce({ inventory: null, loading: false });
    const { container } = render(<StockBadge productId="prod1" />);
    expect(container.firstChild).toBeNull();
  });
  it('returns null if trackInventory is false', () => {
    mockUseProductInventory.mockReturnValueOnce({ inventory: { ...mockInventory, trackInventory: false }, loading: false });
    const { container } = render(<StockBadge productId="prod1" />);
    expect(container.firstChild).toBeNull();
  });

  // getVariant branches
  it('uses default variant for in-stock', () => {
    render(<StockBadge productId="prod1" />);
    expect(screen.getByTestId('badge')).toHaveAttribute('data-variant', 'default');
  });
  it('uses secondary variant for low-stock', () => {
    mockUseProductInventory.mockReturnValueOnce({ inventory: { ...mockInventory, stockStatus: 'low-stock', quantityInStock: 3 }, loading: false });
    render(<StockBadge productId="prod1" />);
    expect(screen.getByTestId('badge')).toHaveAttribute('data-variant', 'secondary');
  });
  it('uses destructive variant for out-of-stock', () => {
    mockUseProductInventory.mockReturnValueOnce({ inventory: { ...mockInventory, stockStatus: 'out-of-stock', quantityInStock: 0 }, loading: false });
    render(<StockBadge productId="prod1" />);
    expect(screen.getByTestId('badge')).toHaveAttribute('data-variant', 'destructive');
  });

  // getLabel with showQuantity=true (default)
  it('shows quantity label for in-stock', () => {
    render(<StockBadge productId="prod1" />);
    expect(screen.getByText('10 in stock')).toBeInTheDocument();
  });
  it('shows quantity label for low-stock', () => {
    mockUseProductInventory.mockReturnValueOnce({ inventory: { ...mockInventory, stockStatus: 'low-stock', quantityInStock: 3 }, loading: false });
    render(<StockBadge productId="prod1" />);
    expect(screen.getByText('Only 3 left!')).toBeInTheDocument();
  });
  it('shows out of stock label without backorders', () => {
    mockUseProductInventory.mockReturnValueOnce({ inventory: { ...mockInventory, stockStatus: 'out-of-stock', quantityInStock: 0, allowBackorders: false }, loading: false });
    render(<StockBadge productId="prod1" />);
    expect(screen.getByText('Out of stock')).toBeInTheDocument();
  });
  it('shows backorder label with allowBackorders', () => {
    mockUseProductInventory.mockReturnValueOnce({ inventory: { ...mockInventory, stockStatus: 'out-of-stock', quantityInStock: 0, allowBackorders: true }, loading: false });
    render(<StockBadge productId="prod1" />);
    expect(screen.getByText('Backorder available')).toBeInTheDocument();
  });

  // getLabel with showQuantity=false
  it('shows "In Stock" without quantity', () => {
    render(<StockBadge productId="prod1" showQuantity={false} />);
    expect(screen.getByText('In Stock')).toBeInTheDocument();
  });
  it('shows "Low Stock" without quantity', () => {
    mockUseProductInventory.mockReturnValueOnce({ inventory: { ...mockInventory, stockStatus: 'low-stock', quantityInStock: 3 }, loading: false });
    render(<StockBadge productId="prod1" showQuantity={false} />);
    expect(screen.getByText('Low Stock')).toBeInTheDocument();
  });
  it('shows "Out of Stock" without quantity and no backorders', () => {
    mockUseProductInventory.mockReturnValueOnce({ inventory: { ...mockInventory, stockStatus: 'out-of-stock', quantityInStock: 0, allowBackorders: false }, loading: false });
    render(<StockBadge productId="prod1" showQuantity={false} />);
    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
  });
  it('shows "Backorder" without quantity and with backorders', () => {
    mockUseProductInventory.mockReturnValueOnce({ inventory: { ...mockInventory, stockStatus: 'out-of-stock', quantityInStock: 0, allowBackorders: true }, loading: false });
    render(<StockBadge productId="prod1" showQuantity={false} />);
    expect(screen.getByText('Backorder')).toBeInTheDocument();
  });

  // getIcon branches
  it('shows check icon for in-stock', () => {
    render(<StockBadge productId="prod1" />);
    expect(screen.getByTestId('icon-check')).toBeInTheDocument();
  });
  it('shows alert icon for low-stock', () => {
    mockUseProductInventory.mockReturnValueOnce({ inventory: { ...mockInventory, stockStatus: 'low-stock' }, loading: false });
    render(<StockBadge productId="prod1" />);
    expect(screen.getByTestId('icon-alert')).toBeInTheDocument();
  });
  it('shows x icon for out-of-stock', () => {
    mockUseProductInventory.mockReturnValueOnce({ inventory: { ...mockInventory, stockStatus: 'out-of-stock' }, loading: false });
    render(<StockBadge productId="prod1" />);
    expect(screen.getByTestId('icon-x')).toBeInTheDocument();
  });
  it('hides icon when showIcon=false', () => {
    render(<StockBadge productId="prod1" showIcon={false} />);
    expect(screen.queryByTestId('icon-check')).not.toBeInTheDocument();
  });

  // Icon size varies by variant
  it('uses small icon class for variant=sm', () => {
    render(<StockBadge productId="prod1" variant="sm" />);
    expect(screen.getByTestId('icon-check')).toHaveClass('w-3');
  });
  it('uses default icon class for variant=default', () => {
    render(<StockBadge productId="prod1" variant="default" />);
    expect(screen.getByTestId('icon-check')).toHaveClass('w-4');
  });

  // getSizeClass branches
  it('applies sm size class', () => {
    render(<StockBadge productId="prod1" variant="sm" />);
    expect(screen.getByTestId('badge').className).toContain('text-xs');
  });
  it('applies lg size class', () => {
    render(<StockBadge productId="prod1" variant="lg" />);
    expect(screen.getByTestId('badge').className).toContain('text-base');
  });
  it('applies default size class', () => {
    render(<StockBadge productId="prod1" variant="default" />);
    expect(screen.getByTestId('badge').className).toContain('text-sm');
  });

  // Unknown stockStatus (default branch)
  it('shows Unknown for unrecognized status without quantity', () => {
    mockUseProductInventory.mockReturnValueOnce({ inventory: { ...mockInventory, stockStatus: 'discontinued' }, loading: false });
    render(<StockBadge productId="prod1" showQuantity={false} />);
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });
  it('shows Unknown for unrecognized status with quantity', () => {
    mockUseProductInventory.mockReturnValueOnce({ inventory: { ...mockInventory, stockStatus: 'discontinued' }, loading: false });
    render(<StockBadge productId="prod1" showQuantity={true} />);
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });
});

describe('CompactStockBadge', () => {
  beforeEach(() => { jest.clearAllMocks(); mockUseProductInventory.mockReturnValue({ inventory: mockInventory, loading: false }); });

  it('renders with compact props', () => {
    render(<CompactStockBadge productId="prod1" />);
    expect(screen.getByTestId('badge')).toBeInTheDocument();
    expect(screen.getByText('In Stock')).toBeInTheDocument();
  });
  it('uses sm variant size', () => {
    render(<CompactStockBadge productId="prod1" />);
    expect(screen.getByTestId('badge').className).toContain('text-xs');
  });
});
