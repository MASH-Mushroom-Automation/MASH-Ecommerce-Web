import { render, screen } from '@testing-library/react';
import { CMSHeroSection } from '../HeroSection';
jest.mock('next/image', () => ({ __esModule: true, default: (p: any) => <img {...p} /> }));
jest.mock('next/link', () => ({ __esModule: true, default: (p: any) => <a {...p}>{p.children}</a> }));
jest.mock('@/components/ui/button', () => ({ Button: (p: any) => <button {...p} /> }));
jest.mock('@/components/ui/carousel', () => ({ Carousel: (p: any) => <div>{p.children}</div>, CarouselContent: (p: any) => <div>{p.children}</div>, CarouselItem: (p: any) => <div>{p.children}</div>, CarouselNext: (p: any) => <button>Next</button>, CarouselPrevious: (p: any) => <button>Prev</button> }));

const mockData = {
  id: 'hero-1',
  title: 'Fresh Farm Products',
  subtitle: 'Straight from the farm to your table',
  backgroundImages: ['/img1.jpg', '/img2.jpg'],
  primaryButton: { text: 'Shop Now', url: '/shop', variant: 'primary' as const },
  secondaryButton: { text: 'Learn More', url: '/about', variant: 'outline' as const },
  isActive: true,
  displayOrder: 1,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

describe('CMSHeroSection', () => {
  it('renders hero title', () => {
    render(<CMSHeroSection data={mockData} />);
    expect(screen.getByText('Fresh Farm Products')).toBeInTheDocument();
  });
  it('renders buttons', () => {
    render(<CMSHeroSection data={mockData} />);
    expect(screen.getByText('Shop Now')).toBeInTheDocument();
    expect(screen.getByText('Learn More')).toBeInTheDocument();
  });
});
