import { render, screen } from '@testing-library/react';
import SecurityEventsList from '../SecurityEventsList';
jest.mock('@/lib/firebase/security-events', () => ({ getSecurityEvents: jest.fn().mockResolvedValue([{ id: 'e1', eventType: 'PHONE_VERIFIED', success: true, createdAt: new Date('2024-01-15') }]) }));
jest.mock('lucide-react', () => ({ Shield: () => <span>Shield</span>, ShieldAlert: () => <span>Alert</span>, ShieldCheck: () => <span>Check</span>, Phone: () => <span>Phone</span>, Key: () => <span>Key</span>, RefreshCw: () => <span>Refresh</span> }));
jest.mock('@/components/ui/button', () => ({ Button: (p: any) => <button {...p} /> }));
jest.mock('@/lib/utils', () => ({ cn: (...args: any[]) => args.filter(Boolean).join(' ') }));

describe('SecurityEventsList', () => {
  beforeEach(() => {
    (global as any).__mockAuthContext = { user: { id: 'u1', name: 'Test' }, isAuthenticated: true };
  });
  afterEach(() => {
    (global as any).__mockAuthContext = undefined;
  });
  it('renders security events', async () => {
    render(<SecurityEventsList />);
    expect(await screen.findByText('Phone Verified')).toBeInTheDocument();
  });
});
