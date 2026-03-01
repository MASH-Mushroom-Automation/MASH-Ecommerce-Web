import { render, screen } from '@testing-library/react';
import { AddressSelector } from '../AddressSelector';
jest.mock('@/hooks/useFirebaseAddresses', () => ({ useFirebaseAddresses: () => ({ addresses: [{ id: 'a1', label: 'Home' }], defaultAddress: { id: 'a1', label: 'Home' }, loading: false, addAddress: jest.fn(), mutating: false }) }));
jest.mock('@/components/ui/button', () => ({ Button: (p: any) => <button {...p} /> }));
jest.mock('@/components/ui/dialog', () => ({ Dialog: (p: any) => <div>{p.children}</div>, DialogContent: (p: any) => <div>{p.children}</div>, DialogTitle: (p: any) => <div>{p.children}</div> }));
jest.mock('@/components/ui/input', () => ({ Input: (p: any) => <input {...p} /> }));
jest.mock('@/components/ui/label', () => ({ Label: (p: any) => <label {...p} /> }));
jest.mock('lucide-react', () => ({ MapPin: () => <span>MapPin</span>, Plus: () => <span>Plus</span>, Star: () => <span>Star</span>, Map: () => <span>Map</span>, Loader2: () => <span>Loading</span> }));
jest.mock('../AddressPicker', () => ({ AddressPicker: (p: any) => <div>AddressPicker</div> }));
jest.mock('@/lib/utils', () => ({ cn: (...args: any[]) => args.join(' ') }));

describe('AddressSelector', () => {
  it('renders address list', () => {
    render(<AddressSelector onAddressSelect={jest.fn()} />);
    expect(screen.getByText('Home')).toBeInTheDocument();
  });
});
