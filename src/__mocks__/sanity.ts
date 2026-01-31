/**
 * Mock Sanity Client
 * Provides mock implementation for Sanity CMS queries
 */

export const mockSanityFetch = jest.fn((query: string) => {
  // Mock products query
  if (query.includes('*[_type == "product"]')) {
    return Promise.resolve([
      {
        _id: 'product-1',
        name: 'Test Product 1',
        slug: { current: 'test-product-1' },
        price: 99.99,
        image: 'https://example.com/product1.jpg',
      },
      {
        _id: 'product-2',
        name: 'Test Product 2',
        slug: { current: 'test-product-2' },
        price: 149.99,
        image: 'https://example.com/product2.jpg',
      },
    ]);
  }

  // Mock categories query
  if (query.includes('*[_type == "category"]')) {
    return Promise.resolve([
      {
        _id: 'category-1',
        name: 'Test Category',
        slug: { current: 'test-category' },
      },
    ]);
  }

  // Mock single product query
  if (query.includes('*[_type == "product" && slug.current')) {
    return Promise.resolve({
      _id: 'product-1',
      name: 'Test Product',
      slug: { current: 'test-product' },
      price: 99.99,
      description: 'Test description',
      image: 'https://example.com/product.jpg',
    });
  }

  return Promise.resolve(null);
});

export const sanityClient = {
  fetch: mockSanityFetch,
};

export default sanityClient;
