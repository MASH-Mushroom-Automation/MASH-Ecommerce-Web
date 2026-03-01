import { GET } from '../seller/products/[id]/route';
jest.mock('next/headers', () => ({ cookies: jest.fn().mockResolvedValue({ get: jest.fn().mockReturnValue({ value: 'token' }) }) }));
jest.mock('@/lib/sanity/products', () => ({ fetchProductById: jest.fn(), updateProduct: jest.fn() }));
jest.mock('@/lib/jwt', () => ({ getUserIdFromToken: jest.fn().mockReturnValue('seller1') }));
jest.mock('next/server', () => {
  class MockNextResponse {
    static json(data: any, opts?: any) { return { data, opts }; }
  }
  class MockNextRequest {}
  return { NextResponse: MockNextResponse, NextRequest: MockNextRequest };
});

describe('API Route: GET /api/seller/products/[id]', () => {
  it('returns 401 if no token', async () => {
    require('next/headers').cookies.mockResolvedValueOnce({ get: jest.fn().mockReturnValue(undefined) });
    const res = await GET({}, { params: Promise.resolve({ id: 'prod1' }) });
    expect(res.data.success).toBe(false);
    expect(res.data.error.code).toBe('UNAUTHORIZED');
  });
  it('returns product if authorized', async () => {
    require('next/headers').cookies.mockResolvedValueOnce({ get: jest.fn().mockReturnValue({ value: 'token' }) });
    require('@/lib/sanity/products').fetchProductById.mockResolvedValueOnce({ id: 'prod1', name: 'Product 1' });
    const res = await GET({}, { params: Promise.resolve({ id: 'prod1' }) });
    expect(res.data).toBeDefined();
  });
});
