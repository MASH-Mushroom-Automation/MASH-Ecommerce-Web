import { render, screen } from '@testing-library/react';
import LalamoveTrackingTimeline from '../LalamoveTrackingTimeline';
jest.mock('@/components/ui/card', () => ({ Card: (p: any) => <div>{p.children}</div>, CardContent: (p: any) => <div>{p.children}</div>, CardHeader: (p: any) => <div>{p.children}</div>, CardTitle: (p: any) => <div>{p.children}</div> }));
jest.mock('@/components/ui/badge', () => ({ Badge: (p: any) => <span>{p.children}</span> }));
jest.mock('@/components/ui/button', () => ({ Button: (p: any) => <button {...p} /> }));
jest.mock('@/components/ui/separator', () => ({ Separator: () => <hr /> }));
jest.mock('lucide-react', () => ({ CheckCircle: () => <span>Check</span>, Clock: () => <span>Clock</span>, Loader2: () => <span>Loading</span>, Truck: () => <span>Truck</span>, Package: () => <span>Package</span>, MapPin: () => <span>MapPin</span>, Phone: () => <span>Phone</span>, ExternalLink: () => <span>Link</span>, User: () => <span>User</span>, RefreshCw: () => <span>Refresh</span> }));
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock('date-fns', () => ({ format: () => 'formatted-date' }));

describe('LalamoveTrackingTimeline', () => {
  it('renders timeline with status', () => {
    render(<LalamoveTrackingTimeline tracking={{ orderId: 'o1', quotationId: 'q1', status: 'ON_GOING', createdAt: new Date(), lastUpdated: new Date(), timeline: [{ status: 'ON_GOING', timestamp: new Date() }] }} />);
    expect(screen.getByText('Lalamove Delivery Tracking')).toBeInTheDocument();
  });
});
