import { renderHook } from '@testing-library/react';
import { useReviewModeration } from '../useReviewModeration';

jest.mock('@/lib/firebase/reviews', () => ({
  FirebaseReviewService: {
    subscribeToAllReviews: jest.fn(() => jest.fn()),
    getAllReviews: jest.fn().mockResolvedValue([]),
    moderateReview: jest.fn().mockResolvedValue(undefined),
    addAdminResponse: jest.fn().mockResolvedValue(undefined),
    deleteReviewAsAdmin: jest.fn().mockResolvedValue(undefined),
    clearFlags: jest.fn().mockResolvedValue(undefined),
  }
}));
jest.mock('@/lib/reviews/sync', () => ({ syncReviewToSanity: jest.fn() }));
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

beforeEach(() => {
  (global as any).__mockAuthContext = { user: { id: 'u1', name: 'Admin' }, isAuthenticated: true };
});
afterEach(() => {
  (global as any).__mockAuthContext = { user: null, isAuthenticated: false };
  jest.clearAllMocks();
});

describe('useReviewModeration', () => {
  it('returns hook API with expected functions', () => {
    const { result } = renderHook(() => useReviewModeration());
    expect(result.current.reviews).toBeDefined();
    expect(typeof result.current.moderateReview).toBe('function');
    expect(typeof result.current.addAdminResponse).toBe('function');
    expect(typeof result.current.deleteReviewAsAdmin).toBe('function');
  });
});
