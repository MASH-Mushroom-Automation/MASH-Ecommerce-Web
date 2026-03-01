import { render, screen } from '@testing-library/react';
import { BackupCodesDisplay } from '../BackupCodesDisplay';
jest.mock('@/components/ui/button', () => ({ Button: (p: any) => <button {...p} /> }));
jest.mock('@/components/ui/card', () => ({ Card: (p: any) => <div>{p.children}</div>, CardContent: (p: any) => <div>{p.children}</div>, CardHeader: (p: any) => <div>{p.children}</div>, CardTitle: (p: any) => <div>{p.children}</div> }));
jest.mock('@/components/ui/alert', () => ({ Alert: (p: any) => <div>{p.children}</div>, AlertDescription: (p: any) => <div>{p.children}</div> }));
jest.mock('lucide-react', () => ({ Copy: () => <span>Copy</span>, Download: () => <span>Download</span>, Check: () => <span>Check</span>, AlertTriangle: () => <span>Alert</span>, ShieldCheck: () => <span>Shield</span> }));
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock('@/lib/utils', () => ({ cn: (...args: any[]) => args.join(' ') }));
jest.mock('@/lib/security/backup-codes', () => ({ formatBackupCode: (code: string) => `XXXX-XXXX` }));

describe('BackupCodesDisplay', () => {
  it('renders backup codes', () => {
    render(<BackupCodesDisplay codes={['12345678', '87654321']} onDone={jest.fn()} />);
    expect(screen.getAllByText('XXXX-XXXX').length).toBe(2);
  });
});
