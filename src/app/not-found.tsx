import Link from 'next/link';
import { Search, ShoppingBag, Users, Mail } from 'lucide-react';

export default function NotFound() {
  const popularLinks = [
    { href: '/shop', label: 'All Products', icon: ShoppingBag, description: 'Browse our mushroom selection' },
    { href: '/grower', label: 'Growers', icon: Users, description: 'Meet our local growers' },
    { href: '/faq', label: 'Help Center', icon: Search, description: 'Find answers to common questions' },
    { href: '/contact', label: 'Contact Us', icon: Mail, description: 'Get in touch with our team' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted py-12 px-4">
      <div className="max-w-4xl w-full">
        {/* Error Message */}
        <div className="text-center mb-12">
          <h1 className="text-8xl font-bold text-accent mb-4">404</h1>
          <h2 className="text-3xl font-semibold text-foreground mb-2">Page Not Found</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-md mx-auto">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved or deleted.
          </p>
          
          {/* Primary Actions */}
          <div className="flex gap-4 justify-center mb-12">
            <Link 
              href="/" 
              className="px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors font-medium"
            >
              Go Home
            </Link>
            <Link 
              href="/shop" 
              className="px-6 py-3 bg-background text-accent border-2 border-accent rounded-lg hover:bg-accent/10 transition-colors font-medium"
            >
              Browse Products
            </Link>
          </div>
        </div>

        {/* Popular Links Section */}
        <div className="bg-background rounded-xl shadow-lg p-8">
          <h3 className="text-xl font-semibold text-foreground mb-6 text-center">
            Popular Pages
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {popularLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-start gap-4 p-4 rounded-lg border-2 border-border hover:border-accent hover:bg-accent/10 transition-all group"
                >
                  <div className="p-2 bg-muted rounded-lg group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                    <Icon size={24} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">{link.label}</h4>
                    <p className="text-sm text-muted-foreground">{link.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Additional Help */}
        <div className="text-center mt-8 text-muted-foreground">
          <p className="mb-2">Still need help?</p>
          <Link 
            href="/contact" 
            className="text-accent hover:underline font-medium"
          >
            Contact our support team →
          </Link>
        </div>
      </div>
    </div>
  );
}
