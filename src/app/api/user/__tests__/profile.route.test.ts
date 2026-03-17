import { GET } from '../profile/route';

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

jest.mock('@/lib/firebase', () => ({
  FirebaseUserService: {
    getProfile: jest.fn(),
  },
}));

const { cookies } = require('next/headers');
const { FirebaseUserService } = require('@/lib/firebase');

function makeMockRequest() {
  return {
    headers: new Headers({ 'Content-Type': 'application/json' }),
    json: async () => ({}),
  } as any;
}

describe('GET /api/user/profile', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return Firestore profile when firebase-uid cookie present', async () => {
    // Mock cookies to return firebase-auth cookie (used by the route)
    cookies.mockResolvedValue({
      get: (name: string) => (name === 'firebase-auth' ? { value: 'fb-uid-123' } : undefined),
    });

    const mockProfile = { id: 'fb-uid-123', email: 'test@example.com', firstName: 'Test' };
    (FirebaseUserService.getProfile as jest.Mock).mockResolvedValue(mockProfile);

    const response: any = await GET(makeMockRequest());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.id).toBe('fb-uid-123');
  });

  it('should return 404 when profile not found in Firestore', async () => {
    cookies.mockResolvedValue({
      get: (name: string) => (name === 'firebase-auth' ? { value: 'fb-uid-404' } : undefined),
    });

    (FirebaseUserService.getProfile as jest.Mock).mockResolvedValue(null);

    const response: any = await GET(makeMockRequest());
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBeDefined();
    expect(data.error.code).toBe('NOT_FOUND');
  });
});
