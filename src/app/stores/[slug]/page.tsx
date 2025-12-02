import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  MapPin, Phone, Mail, Clock, ChevronLeft, Navigation, 
  MessageCircle, CheckCircle, AlertCircle, ExternalLink,
  Calendar, Package, Leaf, Star, Users
} from 'lucide-react';
// Use server-side store functions (not "use client" hooks) for generateStaticParams & generateMetadata
import { fetchStoreBySlug, fetchStores, type TransformedStore } from '@/lib/sanity/stores';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Generate static params for all stores
export async function generateStaticParams() {
  const stores = await fetchStores();
  return stores.map((store) => ({
    slug: store.slug,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params;
  const store = await fetchStoreBySlug(slug);
  
  if (!store) {
    return {
      title: 'Store Not Found | MASH',
    };
  }
  
  return {
    title: `${store.name} | MASH Store Locations`,
    description: store.description || `Visit ${store.name} for fresh mushrooms, growing kits, and expert advice. ${store.address?.full || ''}`,
    openGraph: {
      title: store.name,
      description: store.description || `Visit ${store.name}`,
      images: store.imageUrl ? [store.imageUrl] : undefined,
    },
  };
}

// Revalidate every 5 minutes
export const revalidate = 300;

/**
 * Store Type Badge
 */
function StoreTypeBadge({ storeType }: { storeType: string }) {
  const variants: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
    main: { label: '🏪 Main Store', variant: 'default' },
    pickup: { label: '📦 Pickup Point', variant: 'secondary' },
    partner: { label: '🤝 Partner Store', variant: 'outline' },
    distribution: { label: '🚚 Distribution Center', variant: 'outline' },
  };
  
  const config = variants[storeType] || variants.main;
  
  return (
    <Badge variant={config.variant} className="text-sm">
      {config.label}
    </Badge>
  );
}

/**
 * Open Status Badge
 */
function OpenStatusBadge({ isOpenNow, isOpen24Hours }: { isOpenNow?: boolean; isOpen24Hours?: boolean }) {
  if (isOpen24Hours) {
    return (
      <Badge variant="default" className="bg-green-600 text-sm">
        <CheckCircle className="h-3 w-3 mr-1" />
        Open 24 Hours
      </Badge>
    );
  }
  
  if (isOpenNow) {
    return (
      <Badge variant="default" className="bg-green-600 text-sm">
        <CheckCircle className="h-3 w-3 mr-1" />
        Open Now
      </Badge>
    );
  }
  
  return (
    <Badge variant="secondary" className="text-sm">
      <AlertCircle className="h-3 w-3 mr-1" />
      Closed
    </Badge>
  );
}

/**
 * Operating Hours Card
 */
function OperatingHoursCard({ hours, hoursNote, isOpen24Hours }: { 
  hours?: Record<string, string | undefined>; 
  hoursNote?: string;
  isOpen24Hours?: boolean;
}) {
  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ];
  
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  
  if (isOpen24Hours) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Operating Hours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="text-2xl font-bold text-green-600">Open 24 Hours</div>
            <p className="text-muted-foreground mt-2">7 Days a Week</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!hours) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Operating Hours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Hours not available. Please call for information.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Operating Hours
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {days.map(({ key, label }) => {
          const isToday = key === today;
          const dayHours = hours[key as keyof typeof hours];
          
          return (
            <div 
              key={key} 
              className={`flex justify-between items-center py-1.5 px-2 rounded ${
                isToday ? 'bg-primary/10 font-medium' : ''
              }`}
            >
              <span className="flex items-center gap-2">
                {isToday && <Calendar className="h-4 w-4 text-primary" />}
                {label}
              </span>
              <span className={dayHours?.toLowerCase() === 'closed' ? 'text-muted-foreground' : ''}>
                {dayHours || 'Closed'}
              </span>
            </div>
          );
        })}
        
        {hoursNote && (
          <>
            <Separator className="my-4" />
            <p className="text-sm text-muted-foreground italic">{hoursNote}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Services Card
 */
function ServicesCard({ services, pickupInstructions }: { 
  services?: string[]; 
  pickupInstructions?: string;
}) {
  if (!services || services.length === 0) return null;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Available Services
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {services.map((service, index) => (
            <Badge key={index} variant="outline" className="text-sm py-1.5 px-3">
              <CheckCircle className="h-3 w-3 mr-1.5 text-green-600" />
              {service}
            </Badge>
          ))}
        </div>
        
        {pickupInstructions && (
          <>
            <Separator />
            <div>
              <h4 className="font-medium mb-2">Pickup Instructions</h4>
              <p className="text-sm text-muted-foreground">{pickupInstructions}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Contact Card
 */
function ContactCard({ store }: { store: TransformedStore }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Contact Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Phone */}
        {store.phone && (
          <a 
            href={`tel:${store.phone}`}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Phone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="font-medium">{store.phone}</div>
              <div className="text-sm text-muted-foreground">Call us</div>
            </div>
          </a>
        )}
        
        {/* Email */}
        {store.email && (
          <a 
            href={`mailto:${store.email}`}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="font-medium">{store.email}</div>
              <div className="text-sm text-muted-foreground">Email us</div>
            </div>
          </a>
        )}
        
        {/* WhatsApp */}
        {store.whatsappUrl && (
          <a 
            href={store.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="font-medium">WhatsApp</div>
              <div className="text-sm text-muted-foreground">Chat with us</div>
            </div>
            <ExternalLink className="h-4 w-4 ml-auto text-muted-foreground" />
          </a>
        )}
        
        {/* Messenger */}
        {store.messenger && (
          <a 
            href={store.messenger}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="font-medium">Messenger</div>
              <div className="text-sm text-muted-foreground">Chat on Facebook</div>
            </div>
            <ExternalLink className="h-4 w-4 ml-auto text-muted-foreground" />
          </a>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Location Card with Map
 */
function LocationCard({ store }: { store: TransformedStore }) {
  const hasCoordinates = store.coordinates?.lat && store.coordinates?.lng;
  
  // Static Google Maps image URL
  const mapImageUrl = hasCoordinates
    ? `https://maps.googleapis.com/maps/api/staticmap?center=${store.coordinates!.lat},${store.coordinates!.lng}&zoom=15&size=600x300&maptype=roadmap&markers=color:red%7C${store.coordinates!.lat},${store.coordinates!.lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    : null;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Location
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Address */}
        {store.address && (
          <div className="space-y-1">
            {store.address.street && (
              <p className="font-medium">{store.address.street}</p>
            )}
            <p className="text-muted-foreground">
              {[store.address.city, store.address.state, store.address.zipCode]
                .filter(Boolean)
                .join(', ')}
            </p>
            {store.address.country && (
              <p className="text-muted-foreground">{store.address.country}</p>
            )}
            {store.address.landmark && (
              <p className="text-sm text-primary italic mt-2">
                📍 {store.address.landmark}
              </p>
            )}
          </div>
        )}
        
        {/* Map Preview */}
        {mapImageUrl && (
          <div className="relative h-48 w-full rounded-lg overflow-hidden mt-4">
            <Image
              src={mapImageUrl}
              alt={`Map showing ${store.name} location`}
              fill
              className="object-cover"
            />
          </div>
        )}
        
        {/* Directions Button */}
        <div className="flex gap-2 pt-2">
          {store.googleMapsUrl && (
            <Button asChild className="flex-1">
              <a href={store.googleMapsUrl} target="_blank" rel="noopener noreferrer">
                <Navigation className="h-4 w-4 mr-2" />
                Get Directions
              </a>
            </Button>
          )}
          {store.directionsUrl && store.directionsUrl !== store.googleMapsUrl && (
            <Button asChild variant="outline">
              <a href={store.directionsUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Image Gallery Component
 */
function ImageGallery({ images }: { images: Array<{ url: string; alt?: string; caption?: string }> }) {
  if (!images || images.length === 0) return null;
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {images.map((image, index) => (
        <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
          <Image
            src={image.url}
            alt={image.alt || `Store image ${index + 1}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {image.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
              <p className="text-white text-sm">{image.caption}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Store Detail Page
 */
export default async function StoreDetailPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  const store = await fetchStoreBySlug(slug);
  
  if (!store) {
    notFound();
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Link */}
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link href="/stores">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to All Stores
          </Link>
        </Button>
      </div>
      
      {/* Header */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Store Image */}
        <div className="relative aspect-video lg:aspect-square rounded-2xl overflow-hidden bg-muted">
          {store.imageUrl ? (
            <Image
              src={store.imageUrl}
              alt={store.imageAlt || store.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <MapPin className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
        </div>
        
        {/* Store Info */}
        <div className="flex flex-col justify-center">
          <div className="flex flex-wrap gap-2 mb-4">
            <StoreTypeBadge storeType={store.storeType} />
            <OpenStatusBadge isOpenNow={store.isOpenNow} isOpen24Hours={store.isOpen24Hours} />
            {store.isFeatured && (
              <Badge variant="default" className="bg-yellow-500">
                ⭐ Featured
              </Badge>
            )}
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{store.name}</h1>
          
          {store.description && (
            <p className="text-lg text-muted-foreground mb-6">{store.description}</p>
          )}
          
          {/* Quick Contact */}
          <div className="flex flex-wrap gap-4">
            {store.phone && (
              <Button asChild>
                <a href={`tel:${store.phone}`}>
                  <Phone className="h-4 w-4 mr-2" />
                  Call Now
                </a>
              </Button>
            )}
            {store.googleMapsUrl && (
              <Button asChild variant="outline">
                <a href={store.googleMapsUrl} target="_blank" rel="noopener noreferrer">
                  <Navigation className="h-4 w-4 mr-2" />
                  Directions
                </a>
              </Button>
            )}
            {store.whatsappUrl && (
              <Button asChild variant="outline">
                <a href={store.whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Hours & Services */}
        <div className="lg:col-span-2 space-y-8">
          <OperatingHoursCard 
            hours={store.operatingHours as Record<string, string | undefined>}
            hoursNote={store.hoursNote}
            isOpen24Hours={store.isOpen24Hours}
          />
          
          <ServicesCard 
            services={store.servicesFormatted}
            pickupInstructions={store.pickupInstructions}
          />
          
          {/* Delivery Zones */}
          {store.deliveryZones && store.deliveryZones.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5" />
                  Delivery Zones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Same-day delivery available via Lalamove to these areas:
                </p>
                <div className="flex flex-wrap gap-2">
                  {store.deliveryZones.map((zone, index) => (
                    <Badge key={index} variant="outline">
                      {zone}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Gallery */}
          {store.gallery && store.gallery.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Photo Gallery</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageGallery images={store.gallery} />
              </CardContent>
            </Card>
          )}
          
          {/* Meet Our Growers Section */}
          {store.growers && store.growers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-green-600" />
                  Meet Our Growers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Fresh mushrooms at this location are supplied by these trusted local growers:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {store.growers.map((grower) => (
                    <Link 
                      key={grower.id}
                      href={`/grower/${grower.slug}`}
                      className="group flex items-center gap-4 p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors"
                    >
                      {/* Grower Image */}
                      <div className="relative w-16 h-16 rounded-full overflow-hidden bg-muted flex-shrink-0">
                        {grower.imageUrl ? (
                          <Image
                            src={grower.imageUrl}
                            alt={grower.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Users className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      
                      {/* Grower Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium group-hover:text-primary transition-colors truncate">
                          {grower.name}
                        </h4>
                        {grower.tagline && (
                          <p className="text-sm text-muted-foreground truncate">
                            {grower.tagline}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          {grower.isVerified && (
                            <Badge variant="secondary" className="text-xs py-0">
                              <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                              Verified
                            </Badge>
                          )}
                          {grower.rating && grower.rating > 0 && (
                            <span className="flex items-center text-xs text-muted-foreground">
                              <Star className="h-3 w-3 mr-0.5 fill-yellow-400 text-yellow-400" />
                              {grower.rating.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Right Column - Contact & Location */}
        <div className="space-y-8">
          <ContactCard store={store} />
          <LocationCard store={store} />
        </div>
      </div>
      
      {/* CTA Section */}
      <section className="mt-16 bg-muted rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to Shop?</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Visit our store for fresh mushrooms, growing kits, and expert advice. 
          Or shop online and get your order delivered!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/shop">
              Shop Online
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/stores">
              View All Stores
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
