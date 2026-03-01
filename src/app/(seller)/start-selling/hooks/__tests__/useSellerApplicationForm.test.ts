import { renderHook, act } from '@testing-library/react';
import { useSellerApplicationForm } from '../useSellerApplicationForm';
jest.mock('@/hooks/useSellerApplication', () => ({ useSellerApplicationMutation: () => ({ mutateAsync: jest.fn().mockResolvedValue({}) }), useDocumentUploadMutation: () => ({ mutateAsync: jest.fn().mockResolvedValue({}) }) }));
jest.mock('sonner', () => ({ toast: { loading: jest.fn(), success: jest.fn(), error: jest.fn() } }));
jest.mock('../../schema', () => {
  const z = require('zod');
  const schema = z.object({
    businessName: z.string(),
    businessType: z.string(),
    taxId: z.string().optional(),
    fullName: z.string(),
    email: z.string(),
    phone: z.string(),
    address: z.string(),
    city: z.string(),
  });
  return { sellerApplicationSchema: schema, SellerApplicationForm: {} };
});

describe('useSellerApplicationForm', () => {
  it('returns form instance and handlers', () => {
    const { result } = renderHook(() => useSellerApplicationForm());
    expect(result.current.form).toBeDefined();
    expect(typeof result.current.onSubmit).toBe('function');
  });
  it('handles submit', async () => {
    const { result } = renderHook(() => useSellerApplicationForm());
    await act(async () => {
      await result.current.onSubmit({ businessName: 'Test', businessType: 'individual', validIdFile: {}, birCertificateFile: {}, businessCertificateFile: {} });
    });
    expect(require('sonner').toast.loading).toHaveBeenCalled();
  });
});
