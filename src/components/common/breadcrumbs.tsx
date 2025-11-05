'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  customItems?: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ customItems, className = '' }: BreadcrumbsProps) {
  const pathname = usePathname();

  // If custom items provided, use those
  if (customItems) {
    return (
      <nav className={`flex items-center space-x-2 text-sm ${className}`} aria-label="Breadcrumb">
        <Link 
          href="/" 
          className="text-gray-500 hover:text-[#6A994E] transition-colors"
          aria-label="Home"
        >
          <Home size={16} />
        </Link>
        {customItems.map((item, index) => (
          <div key={item.href} className="flex items-center space-x-2">
            <ChevronRight size={16} className="text-gray-400" />
            {index === customItems.length - 1 ? (
              <span className="text-gray-900 font-medium">{item.label}</span>
            ) : (
              <Link 
                href={item.href}
                className="text-gray-500 hover:text-[#6A994E] transition-colors"
              >
                {item.label}
              </Link>
            )}
          </div>
        ))}
      </nav>
    );
  }

  // Auto-generate from pathname
  const pathSegments = pathname.split('/').filter(Boolean);
  
  // Don't show breadcrumbs on homepage
  if (pathSegments.length === 0) return null;

  // Route name mappings
  const routeNames: Record<string, string> = {
    catalog: 'Products',
    product: 'Product',
    grower: 'Growers',
    about: 'About Us',
    contact: 'Contact',
    faq: 'FAQs',
    blog: 'Blog',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    'shipping-info': 'Shipping Info',
    'returns-policy': 'Return Policy',
    'start-selling': 'Become a Seller',
    profile: 'My Profile',
    'my-information': 'My Information',
    'order-history': 'Order History',
    wishlist: 'Wishlist',
    checkout: 'Checkout',
    seller: 'Seller Dashboard',
    dashboard: 'Dashboard',
    products: 'Products',
    orders: 'Orders',
    settings: 'Settings',
  };

  const breadcrumbItems: BreadcrumbItem[] = [];
  let currentPath = '';

  pathSegments.forEach((segment) => {
    currentPath += `/${segment}`;
    
    // Skip route groups like (auth), (shop), (user), (seller)
    if (segment.startsWith('(') && segment.endsWith(')')) return;
    
    // Skip dynamic segments (IDs)
    if (segment.match(/^[0-9a-f]{8}-/)) return;
    
    const label = routeNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    
    breadcrumbItems.push({
      label,
      href: currentPath,
    });
  });

  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`} aria-label="Breadcrumb">
      <Link 
        href="/" 
        className="text-gray-500 hover:text-[#6A994E] transition-colors"
        aria-label="Home"
      >
        <Home size={16} />
      </Link>
      {breadcrumbItems.map((item, index) => (
        <div key={item.href} className="flex items-center space-x-2">
          <ChevronRight size={16} className="text-gray-400" />
          {index === breadcrumbItems.length - 1 ? (
            <span className="text-gray-900 font-medium">{item.label}</span>
          ) : (
            <Link 
              href={item.href}
              className="text-gray-500 hover:text-[#6A994E] transition-colors"
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
