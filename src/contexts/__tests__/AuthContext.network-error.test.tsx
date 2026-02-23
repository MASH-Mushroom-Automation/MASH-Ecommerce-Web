import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Unmock AuthContext to use the real implementation for testing
jest.unmock('@/contexts/AuthContext');

import { AuthProvider } from '../AuthContext';
import { mockUser as fbUserMock } from '@/__mocks__/firebase';
import * as firebaseAuth from '@/lib/firebase/auth';

jest.mock('@/lib/firebase/auth');
jest.mock('@/lib/firebase/users');
jest.mock('@/lib/auth');
jest.mock('@/lib/token-refresh');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
  }),
}));

import { useAuth } from '../AuthContext';

function TestComponent() {
  const auth = useAuth();
  React.useEffect(() => {
    (window as any).__auth = auth;
    return () => { (window as any).__auth = undefined; };
  }, [auth]);

  return (
    <div>
      <button data-testid="google-signin" onClick={() => void (window as any).__auth.signInWithGoogle().catch(() => {})}>
        Google Sign In
      </button>
    </div>
  );
}

describe('AuthContext - network failure handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock Firebase sign-in to return a user object
    (firebaseAuth.signInWithGoogle as jest.Mock).mockResolvedValue({
      ...fbUserMock,
      getIdToken: jest.fn().mockResolvedValue('fake-id-token'),
    });
  });

  test('network error during syncFirebaseUserToBackend does not throw and allows Firebase-only login', async () => {
    // Make global fetch reject as network error
    (global as any).fetch = jest.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Call syncFirebaseUserToBackend directly with a minimal mock firebase user
    const mockFbUser = {
      uid: 'mock-uid',
      email: 'mock@example.com',
      displayName: 'Mock User',
      getIdToken: jest.fn().mockResolvedValue('fake-id-token'),
    } as any;

    // Expose and call the sync function
    expect((window as any).__auth.syncFirebaseUserToBackend).toBeDefined();
    await (window as any).__auth.syncFirebaseUserToBackend(mockFbUser);

    // The fetch rejection should not crash the flow; no unhandled rejection
    // Assert our fetch was called
    expect((global as any).fetch).toHaveBeenCalled();
  });
});