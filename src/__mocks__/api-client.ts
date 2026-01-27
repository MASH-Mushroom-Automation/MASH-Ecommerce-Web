/**
 * Mock API Client
 * Provides mock implementation for backend API requests
 */

export const mockAPIRequest = jest.fn((endpoint: string, options?: any) => {
  // Default mock responses based on endpoint
  if (endpoint.includes('/auth/login')) {
    return Promise.resolve({
      data: {
        user: {
          id: '1',
          email: 'test@example.com',
          role: 'BUYER',
        },
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      },
    });
  }

  if (endpoint.includes('/auth/register')) {
    return Promise.resolve({
      data: {
        message: 'Registration successful. Please verify your email.',
      },
    });
  }

  if (endpoint.includes('/orders')) {
    return Promise.resolve({
      data: [],
    });
  }

  if (endpoint.includes('/products')) {
    return Promise.resolve({
      data: [],
    });
  }

  return Promise.resolve({ data: null });
});

// Export as default
export const apiRequest = mockAPIRequest;
export default { apiRequest: mockAPIRequest };
