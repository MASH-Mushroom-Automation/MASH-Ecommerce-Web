import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Clock, ChevronRight, Navigation, Store as StoreIcon, Package, Handshake, Truck } from 'lucide-react';
import { fetchStores, TransformedStore } from '@/lib/sanity/stores';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Store Locations | MASH Mushroom Marketplace',
  description: 'Find MASH mushroom stores, pickup points, and partner locations near you. Fresh mushrooms available for in-store shopping, pickup, and same-day delivery.',
  openGraph: {
    title: 'Store Locations | MASH',
    description: 'Find MASH stores and pickup points near you',
  },
};

// Revalidate every 5 minutes
export const revalidate = 300;

/**
 * Store Type Badge Component
 */
function StoreTypeBadge({ storeType }: { storeType: string }) {
  const variants: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
    main: { label: 'Main Store', variant: 'default' },
    pickup: { label: 'Pickup Point', variant: 'secondary' },
    partner: { label: 'Partner Store', variant: 'outline' },
    distribution: { label: 'Distribution', variant: 'outline' },
  };
  
  const config = variants[storeType] || variants.main;
  
  return (
    <Badge variant={config.variant} className="text-xs">
      {config.label}
    </Badge>
  );
}

/**
 * Open Now Badge Component
 */
function OpenNowBadge({ isOpenNow, isOpen24Hours }: { isOpenNow?: boolean; isOpen24Hours?: boolean }) {
  if (isOpen24Hours) {
    return (
      <Badge variant="default" className="bg-primary text-primary-foreground text-xs">
        Open 24 Hours
      </Badge>
    );
  }
  
  if (isOpenNow) {
    return (
      <Badge variant="default" className="bg-primary text-primary-foreground text-xs">
        Open Now
      </Badge>
    );
  }
  
  return (
    <Badge variant="secondary" className="text-xs">
      Closed
    </Badge>
  );
}

/**
 * Store Card Component
 */
function StoreCard({ store }: { store: TransformedStore }) {
  return (
    <Card className="group hover:shadow-md transition-all duration-300 overflow-hidden border border-border">
      {/* Store Image */}
      {store.imageUrl && (
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={store.imageUrl}
            alt={store.imageAlt || store.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <StoreTypeBadge storeType={store.storeType} />
          </div>
          <div className="absolute top-3 right-3">
            <OpenNowBadge isOpenNow={store.isOpenNow} isOpen24Hours={store.isOpen24Hours} />
          </div>
        </div>
      )}
      
      <CardHeader className={!store.imageUrl ? 'pt-4' : ''}>
        {!store.imageUrl && (
          <div className="flex justify-between items-start mb-2">
            <StoreTypeBadge storeType={store.storeType} />
            <OpenNowBadge isOpenNow={store.isOpenNow} isOpen24Hours={store.isOpen24Hours} />
          </div>
        )}
        <CardTitle className="text-lg line-clamp-1">{store.name}</CardTitle>
        {store.description && (
          <CardDescription className="line-clamp-2">{store.description}</CardDescription>
        )}
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Address */}
        {store.address?.full && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
            <span className="line-clamp-2">{store.address.full}</span>
          </div>
        )}
        
        {/* Today's Hours */}
        {store.operatingHours?.today && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 shrink-0 text-primary" />
            <span>Today: {store.operatingHours.today}</span>
          </div>
        )}
        
        {/* Phone */}
        {store.phone && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-4 w-4 shrink-0 text-primary" />
            <a href={`tel:${store.phone}`} className="hover:text-primary transition-colors">
              {store.phone}
            </a>
          </div>
        )}
        
        {/* Services Preview */}
        {store.servicesFormatted && store.servicesFormatted.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-2">
            {store.servicesFormatted.slice(0, 3).map((service, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {service}
              </Badge>
            ))}
            {store.servicesFormatted.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{store.servicesFormatted.length - 3} more
              </Badge>
            )}
          </div>
        )}
        
        {/* Actions */}
        <div className="flex gap-2 pt-3">
          <Button asChild variant="default" size="sm" className="flex-1">
            <Link href={`/stores/${store.slug}`}>
              View Details
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
          {store.googleMapsUrl && (
            <Button asChild variant="outline" size="sm">
              <a href={store.googleMapsUrl} target="_blank" rel="noopener noreferrer">
                <Navigation className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Empty State Component
 */
function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="mx-auto w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
        <StoreIcon className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">No Stores Available</h3>
      <p className="text-muted-foreground max-w-md mx-auto">
        We&apos;re setting up our store locations. Check back soon for updates on where to find fresh MASH mushrooms.
      </p>
    </div>
  );
}

/**
 * Stores List Page
 */
export default async function StoresPage() {
  const stores = await fetchStores();
  
  // Separate stores by type
  const mainStores = stores.filter(s => s.storeType === 'main');
  const pickupPoints = stores.filter(s => s.storeType === 'pickup');
  const partnerStores = stores.filter(s => s.storeType === 'partner');
  
  if (stores.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/15 bg-primary/8 text-primary text-sm font-medium mb-4">
            Store Locations
          </div>
          <h1 className="text-4xl font-bold mb-4">Store Locations</h1>
          <div className="w-10 h-0.5 bg-primary mx-auto mb-4" />
          <p className="text-xl text-muted-foreground">
            Find MASH mushroom stores and pickup points near you
          </p>
        </div>
        <EmptyState />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Page Header */}
      <div className="max-w-3xl mx-auto text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/15 bg-primary/8 text-primary text-sm font-medium mb-4">
          Store Locations
        </div>
        <h1 className="text-4xl font-bold mb-4">Store Locations</h1>
        <div className="w-10 h-0.5 bg-primary mx-auto mb-4" />
        <p className="text-xl text-muted-foreground">
          Find MASH mushroom stores and pickup points near you. Fresh mushrooms, growing kits, and expert advice available at all locations.
        </p>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <Card className="text-center p-4">
          <div className="text-3xl font-bold text-primary">{stores.length}</div>
          <div className="text-sm text-muted-foreground">Total Locations</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-3xl font-bold text-primary">{mainStores.length}</div>
          <div className="text-sm text-muted-foreground">Main Stores</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-3xl font-bold text-primary">{pickupPoints.length}</div>
          <div className="text-sm text-muted-foreground">Pickup Points</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-3xl font-bold text-primary">{partnerStores.length}</div>
          <div className="text-sm text-muted-foreground">Partner Stores</div>
        </Card>
      </div>
      
      {/* Main Stores Section */}
      {mainStores.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <StoreIcon className="h-6 w-6 text-primary" /> Main Stores
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mainStores.map(store => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        </section>
      )}
      
      {/* Pickup Points Section */}
      {pickupPoints.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" /> Pickup Points
          </h2>
          <p className="text-muted-foreground mb-6">
            Convenient pickup locations for your online orders. Reserve online and pick up same-day!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pickupPoints.map(store => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        </section>
      )}
      
      {/* Partner Stores Section */}
      {partnerStores.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Handshake className="h-6 w-6 text-primary" /> Partner Stores
          </h2>
          <p className="text-muted-foreground mb-6">
            Find MASH products at these trusted partner locations.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partnerStores.map(store => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        </section>
      )}
      
      {/* Call to Action */}
      <section className="bg-muted/20 border border-border rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Can&apos;t Visit? We Deliver!</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Order online and get fresh mushrooms delivered to your door. Same-day delivery available in Metro Manila via Lalamove!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/shop">
              Shop Online
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-2 hover:bg-foreground hover:text-background hover:border-foreground transition-colors">
            <Link href="/contact">
              Contact Us
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
