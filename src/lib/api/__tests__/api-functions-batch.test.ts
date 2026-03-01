// User API Functions Tests
// Location: src/lib/api/__tests__/api-functions-batch.test.ts

jest.mock('@/lib/api/user', () => jest.requireActual('@/lib/api/user'));
jest.mock('@/types/api', () => ({
  UserProfile: jest.fn(),
  UserOnboardingData: jest.fn(),
  ApiResponse: jest.fn(),
}));

global.fetch = jest.fn((input: string) => {
  // Return avatar URL for avatar upload endpoint
  if (typeof input === 'string' && input.includes('avatar')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: 'https://cdn.example.com/avatar.jpg' })
    });
  }
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ data: { id: '1', email: 'test@example.com', username: 'testuser', firstName: 'Test', lastName: 'User', role: 'USER', isActive: true, phoneNumber: '+1234567890', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), preferences: { interests: ['cooking'], cookingLevel: 'beginner', notifications: true } } })
  });
});

describe('UserApi', () => {
  const { UserApi } = require('../user');

  it('should get user profile (mock)', async () => {
    const res = await UserApi.getProfile({ skipCache: true });
    expect(res.success).toBe(true);
    expect(res.data).toHaveProperty('id');
  });

  it('should update user profile', async () => {
    const res = await UserApi.updateProfile({ firstName: 'Updated' });
    expect(res.success).toBe(true);
    expect(res.data.firstName).toBe('Updated');
  });

  it('should upload avatar', async () => {
    const file = new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' });
    const res = await UserApi.uploadAvatar(file);
    expect(res.success).toBe(true);
    expect(res.data).toContain('.jpg');
  });

  it('should get onboarding data', async () => {
    const res = await UserApi.getOnboardingData();
    expect(res.success).toBe(true);
    expect(res.data).toHaveProperty('interests');
  });

  it('should update onboarding data', async () => {
    const res = await UserApi.updateOnboardingData({ completed: true });
    expect(res.success).toBe(true);
    expect(res.data.completed).toBe(true);
  });

  it('should complete onboarding', async () => {
    const res = await UserApi.completeOnboarding();
    expect(res.success).toBe(true);
    expect(res.data).toBe(true);
  });

  it('should update preferences', async () => {
    const res = await UserApi.updatePreferences({ cookingLevel: 'advanced' });
    expect(res.success).toBe(true);
    expect(res.data.cookingLevel).toBe('advanced');
  });
});
