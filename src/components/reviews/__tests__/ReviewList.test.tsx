import { render, screen } from '@testing-library/react';
import { ReviewList } from '../ReviewList';
jest.mock('@/hooks/useSanityReviews', () => ({ useSanityReviews: () => ({ reviews: [{ id: 'r1', author: 'A', content: 'Great!', rating: 5 }], rating: { totalReviews: 1, averageRating: 5, ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 1 } }, loading: false }) }));
jest.mock('@/components/ui/card', () => ({ Card: (p: any) => <div>{p.children}</div>, CardContent: (p: any) => <div>{p.children}</div>, CardHeader: (p: any) => <div>{p.children}</div>, CardTitle: (p: any) => <div>{p.children}</div> }));
jest.mock('@/components/ui/badge', () => ({ Badge: (p: any) => <span>{p.children}</span> }));
jest.mock('@/components/ui/button', () => ({ Button: (p: any) => <button {...p} /> }));
jest.mock('@/components/ui/alert', () => ({ Alert: (p: any) => <div>{p.children}</div>, AlertDescription: (p: any) => <div>{p.children}</div> }));
jest.mock('lucide-react', () => ({ Star: () => <span>Star</span>, CheckCircle: () => <span>Check</span>, ThumbsUp: () => <span>ThumbsUp</span>, Loader2: () => <span>Loading</span> }));
jest.mock('next/image', () => ({ __esModule: true, default: (p: any) => <img {...p} /> }));

describe('ReviewList', () => {
  it('renders review list', () => {
    render(<ReviewList productId="prod1" />);
    expect(screen.getByText('Great!')).toBeInTheDocument();
  });
  it('shows loading state', () => {
    jest.spyOn(require('@/hooks/useSanityReviews'), 'useSanityReviews').mockReturnValueOnce({ reviews: [], rating: null, loading: true });
    render(<ReviewList productId="prod2" />);
    expect(screen.getByText('Loading')).toBeInTheDocument();
  });
  it('shows empty state', () => {
    jest.spyOn(require('@/hooks/useSanityReviews'), 'useSanityReviews').mockReturnValueOnce({ reviews: [], rating: { totalReviews: 0, averageRating: 0, ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }, loading: false });
    render(<ReviewList productId="prod3" />);
    expect(screen.getByText('No Reviews Yet')).toBeInTheDocument();
  });
});
