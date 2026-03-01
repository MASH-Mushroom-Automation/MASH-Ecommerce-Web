import { render, screen } from '@testing-library/react';
import PriorityDelivery from '../PriorityDelivery';
jest.mock('@/components/ui/button', () => ({ Button: (p: any) => <button {...p} /> }));
jest.mock('@/components/ui/card', () => ({ Card: (p: any) => <div>{p.children}</div>, CardContent: (p: any) => <div>{p.children}</div>, CardDescription: (p: any) => <div>{p.children}</div>, CardHeader: (p: any) => <div>{p.children}</div>, CardTitle: (p: any) => <div>{p.children}</div> }));
jest.mock('@/components/ui/radio-group', () => ({ RadioGroup: (p: any) => <div>{p.children}</div>, RadioGroupItem: (p: any) => <input type="radio" {...p} /> }));
jest.mock('@/components/ui/label', () => ({ Label: (p: any) => <label {...p} /> }));
jest.mock('@/components/ui/badge', () => ({ Badge: (p: any) => <span>{p.children}</span> }));
jest.mock('lucide-react', () => ({ Zap: () => <span>Zap</span>, Clock: () => <span>Clock</span>, Crown: () => <span>Crown</span> }));

describe('PriorityDelivery', () => {
  it('renders priority options', () => {
    render(<PriorityDelivery currentTotal={500} />);
    expect(screen.getByText('Standard')).toBeInTheDocument();
    expect(screen.getByText('Express (+₱50)')).toBeInTheDocument();
    expect(screen.getByText('Priority (+₱75)')).toBeInTheDocument();
    expect(screen.getByText('VIP (+₱100)')).toBeInTheDocument();
  });
});
