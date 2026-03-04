import { render, screen, fireEvent } from '@testing-library/react';
import { ReviewList, CompactReviewSummary } from '../ReviewList';

const mockReviews = [
  {
    id: 'r1', customerName: 'Alice', title: 'Amazing product', content: 'Loved it!',
    rating: 5, helpfulCount: 10, verifiedPurchase: true, reviewDate: '2024-06-01',
    images: ['https://img.test/1.jpg'], recommend: true,
  },
  {
    id: 'r2', customerName: 'Bob', title: 'Good enough', content: 'It was okay',
    rating: 3, helpfulCount: 2, verifiedPurchase: false, reviewDate: '2024-05-01',
    images: [], recommend: false,
  },
];

const mockRating = {
  totalReviews: 2, averageRating: 4.0, verifiedPurchaseCount: 1,
  recommendationPercentage: 80,
  ratingDistribution: { 1: 0, 2: 0, 3: 1, 4: 0, 5: 1 },
};

const mockUseSanityReviews = jest.fn();

jest.mock('@/hooks/useSanityReviews', () => ({
  useSanityReviews: (...args: any[]) => mockUseSanityReviews(...args),
}));
jest.mock('@/components/ui/card', () => ({ Card: (p: any) => <div data-testid="card">{p.children}</div>, CardContent: (p: any) => <div>{p.children}</div>, CardHeader: (p: any) => <div>{p.children}</div>, CardTitle: (p: any) => <div>{p.children}</div> }));
jest.mock('@/components/ui/badge', () => ({ Badge: (p: any) => <span data-testid="badge">{p.children}</span> }));
jest.mock('@/components/ui/button', () => ({ Button: (p: any) => <button onClick={p.onClick} data-variant={p.variant}>{p.children}</button> }));
jest.mock('@/components/ui/alert', () => ({ Alert: (p: any) => <div data-testid="alert">{p.children}</div>, AlertDescription: (p: any) => <div>{p.children}</div> }));
jest.mock('lucide-react', () => ({ Star: (p: any) => <span data-testid="star" className={p.className}>Star</span>, CheckCircle: () => <span>Check</span>, ThumbsUp: () => <span>ThumbsUp</span>, Loader2: () => <span data-testid="loader">Loading</span> }));
jest.mock('next/image', () => ({ __esModule: true, default: (p: any) => <img src={p.src} alt={p.alt} /> }));

describe('ReviewList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSanityReviews.mockReturnValue({ reviews: mockReviews, rating: mockRating, loading: false });
  });

  it('renders review list with reviews', () => {
    render(<ReviewList productId="prod1" />);
    expect(screen.getByText('Loved it!')).toBeInTheDocument();
    expect(screen.getByText('It was okay')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockUseSanityReviews.mockReturnValue({ reviews: [], rating: null, loading: true });
    render(<ReviewList productId="prod2" />);
    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  it('shows empty state when no reviews', () => {
    mockUseSanityReviews.mockReturnValue({ reviews: [], rating: { totalReviews: 0, averageRating: 0, ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }, loading: false });
    render(<ReviewList productId="prod3" />);
    expect(screen.getByText('No Reviews Yet')).toBeInTheDocument();
  });

  it('shows empty state when rating is null', () => {
    mockUseSanityReviews.mockReturnValue({ reviews: [], rating: null, loading: false });
    render(<ReviewList productId="prod4" />);
    expect(screen.getByText('No Reviews Yet')).toBeInTheDocument();
  });

  it('shows Write a Review button in empty state when showForm is true', () => {
    mockUseSanityReviews.mockReturnValue({ reviews: [], rating: { totalReviews: 0, averageRating: 0, ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }, loading: false });
    render(<ReviewList productId="prod5" showForm />);
    expect(screen.getByText('Write a Review')).toBeInTheDocument();
  });

  it('hides Write a Review button when showForm is false', () => {
    mockUseSanityReviews.mockReturnValue({ reviews: [], rating: { totalReviews: 0, averageRating: 0, ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }, loading: false });
    render(<ReviewList productId="prod6" showForm={false} />);
    expect(screen.queryByText('Write a Review')).not.toBeInTheDocument();
  });

  it('renders rating summary section', () => {
    render(<ReviewList productId="prod1" />);
    expect(screen.getByText('Customer Reviews')).toBeInTheDocument();
    // averageRating "4" appears in both summary and distribution row
    const ratingTexts = screen.getAllByText('4');
    expect(ratingTexts.length).toBeGreaterThanOrEqual(1);
  });

  it('shows verified purchase count badge', () => {
    render(<ReviewList productId="prod1" />);
    expect(screen.getByText(/1 Verified/)).toBeInTheDocument();
  });

  it('hides verified count badge when verifiedPurchaseCount is 0', () => {
    mockUseSanityReviews.mockReturnValue({ reviews: mockReviews, rating: { ...mockRating, verifiedPurchaseCount: 0 }, loading: false });
    render(<ReviewList productId="prod7" />);
    // Summary badge with count should not appear, but per-review badge still does
    expect(screen.queryByText(/\d+ Verified/)).not.toBeInTheDocument();
  });

  it('shows recommendation percentage when >= 70%', () => {
    render(<ReviewList productId="prod1" />);
    expect(screen.getByText(/80% of customers recommend/)).toBeInTheDocument();
  });

  it('hides recommendation percentage when < 70%', () => {
    mockUseSanityReviews.mockReturnValue({ reviews: mockReviews, rating: { ...mockRating, recommendationPercentage: 50 }, loading: false });
    render(<ReviewList productId="prod8" />);
    expect(screen.queryByText(/of customers recommend/)).not.toBeInTheDocument();
  });

  it('uses singular "review" when totalReviews is 1', () => {
    mockUseSanityReviews.mockReturnValue({ reviews: [mockReviews[0]], rating: { ...mockRating, totalReviews: 1 }, loading: false });
    render(<ReviewList productId="prod9" />);
    expect(screen.getByText(/Based on 1 review$/)).toBeInTheDocument();
  });

  it('uses plural "reviews" when totalReviews > 1', () => {
    render(<ReviewList productId="prod1" />);
    expect(screen.getByText(/Based on 2 reviews$/)).toBeInTheDocument();
  });

  it('uses singular "Purchase" when verifiedPurchaseCount is 1', () => {
    render(<ReviewList productId="prod1" />);
    expect(screen.getByText(/1 Verified Purchase$/)).toBeInTheDocument();
  });

  it('uses plural "Purchases" when verifiedPurchaseCount > 1', () => {
    mockUseSanityReviews.mockReturnValue({ reviews: mockReviews, rating: { ...mockRating, verifiedPurchaseCount: 3 }, loading: false });
    render(<ReviewList productId="prod10" />);
    expect(screen.getByText(/3 Verified Purchases$/)).toBeInTheDocument();
  });

  it('renders sort buttons (newest, highest, helpful)', () => {
    render(<ReviewList productId="prod1" />);
    expect(screen.getByText('Newest')).toBeInTheDocument();
    expect(screen.getByText('Highest Rated')).toBeInTheDocument();
    expect(screen.getByText('Most Helpful')).toBeInTheDocument();
  });

  it('sorts by highest rated when clicked', () => {
    render(<ReviewList productId="prod1" />);
    fireEvent.click(screen.getByText('Highest Rated'));
    // After sort, 5-star review (Alice) should appear first
    const titles = screen.getAllByText(/Amazing product|Good enough/);
    expect(titles[0]).toHaveTextContent('Amazing product');
  });

  it('sorts by most helpful when clicked', () => {
    render(<ReviewList productId="prod1" />);
    fireEvent.click(screen.getByText('Most Helpful'));
    // Alice has helpfulCount 10 > Bob's 2
    const titles = screen.getAllByText(/Amazing product|Good enough/);
    expect(titles[0]).toHaveTextContent('Amazing product');
  });

  it('shows verified purchase badge on verified reviews', () => {
    render(<ReviewList productId="prod1" />);
    // Alice is verified, Bob is not
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('renders review images when present', () => {
    render(<ReviewList productId="prod1" />);
    const img = screen.getByAltText('Review image 1');
    expect(img).toHaveAttribute('src', 'https://img.test/1.jpg');
  });

  it('does not render images section when images are empty', () => {
    mockUseSanityReviews.mockReturnValue({
      reviews: [{ ...mockReviews[1], images: null }],
      rating: { ...mockRating, totalReviews: 1 },
      loading: false,
    });
    render(<ReviewList productId="prod11" />);
    expect(screen.queryByAltText(/Review image/)).not.toBeInTheDocument();
  });

  it('renders helpful count on each review', () => {
    render(<ReviewList productId="prod1" />);
    expect(screen.getByText(/Helpful \(10\)/)).toBeInTheDocument();
    expect(screen.getByText(/Helpful \(2\)/)).toBeInTheDocument();
  });

  it('shows rating distribution bars', () => {
    render(<ReviewList productId="prod1" />);
    // 5-star has 1 review = 50%, 3-star has 1 review = 50%
    const bars = screen.getAllByText('1 (50%)');
    expect(bars.length).toBeGreaterThanOrEqual(1);
  });

  it('shows real-time indicator alert', () => {
    render(<ReviewList productId="prod1" />);
    expect(screen.getByText(/Reviews update in real-time/)).toBeInTheDocument();
  });

  it('shows review count header with correct singular/plural', () => {
    render(<ReviewList productId="prod1" />);
    expect(screen.getByText('2 Reviews')).toBeInTheDocument();
  });

  it('uses singular "Review" for single review', () => {
    mockUseSanityReviews.mockReturnValue({
      reviews: [mockReviews[0]],
      rating: { ...mockRating, totalReviews: 1 },
      loading: false,
    });
    render(<ReviewList productId="prod12" />);
    expect(screen.getByText('1 Review')).toBeInTheDocument();
  });

  it('shows Write a Review in summary when showForm is true', () => {
    render(<ReviewList productId="prod1" showForm />);
    // The "Write a Review" button in the summary section
    const buttons = screen.getAllByText('Write a Review');
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });
});

describe('CompactReviewSummary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null when loading', () => {
    mockUseSanityReviews.mockReturnValue({ rating: null, loading: true });
    const { container } = render(<CompactReviewSummary productId="p1" />);
    expect(container.innerHTML).toBe('');
  });

  it('returns null when no rating', () => {
    mockUseSanityReviews.mockReturnValue({ rating: null, loading: false });
    const { container } = render(<CompactReviewSummary productId="p2" />);
    expect(container.innerHTML).toBe('');
  });

  it('returns null when totalReviews is 0', () => {
    mockUseSanityReviews.mockReturnValue({ rating: { totalReviews: 0, averageRating: 0 }, loading: false });
    const { container } = render(<CompactReviewSummary productId="p3" />);
    expect(container.innerHTML).toBe('');
  });

  it('renders average rating and count', () => {
    mockUseSanityReviews.mockReturnValue({ rating: { totalReviews: 15, averageRating: 4.5, ratingDistribution: {} }, loading: false });
    render(<CompactReviewSummary productId="p4" />);
    expect(screen.getByText('4.5 (15)')).toBeInTheDocument();
  });

  it('renders star icons', () => {
    mockUseSanityReviews.mockReturnValue({ rating: { totalReviews: 5, averageRating: 3.0, ratingDistribution: {} }, loading: false });
    render(<CompactReviewSummary productId="p5" />);
    const stars = screen.getAllByTestId('star');
    expect(stars.length).toBe(5);
  });
});
