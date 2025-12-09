import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Leaf, Sprout, Search, Play } from 'lucide-react';
import { sanityClient as client, urlFor } from '@/lib/sanity/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Growing Guides | MASH',
  description: 'Learn how to grow mushrooms at home with our step-by-step growing guides, video tutorials, and expert tips.',
  openGraph: {
    title: 'Mushroom Growing Guides | MASH',
    description: 'Learn how to grow mushrooms at home with our step-by-step guides',
    images: ['/og-guides.jpg'],
  },
};

// GROQ query to fetch all published growing guides
const guidesQuery = `*[_type == "growingGuide" && status == "published"] | order(publishedAt desc) {
  _id,
  title,
  slug,
  excerpt,
  "coverImage": mainImage,
  mushroomType,
  difficulty,
  timeToFirstHarvest,
  expectedYield,
  youtubeVideo,
  "hasVideo": defined(youtubeVideo.videoId),
  "stepCount": count(growingSteps),
  growingKit->{
    _id,
    name,
    slug,
    price,
    image
  },
  seoKeywords,
  publishedAt
}`;

interface GrowingGuide {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt?: string;
  coverImage?: any;
  mushroomType: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeToFirstHarvest?: string;
  expectedYield?: string;
  youtubeVideo?: { videoId: string; title: string };
  hasVideo?: boolean;
  stepCount?: number;
  growingKit?: {
    _id: string;
    name: string;
    slug: { current: string };
    price: number;
    image?: any;
  };
  seoKeywords?: string[];
  publishedAt?: string;
}

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
  advanced: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
};

const difficultyLabels = {
  beginner: '🟢 Beginner',
  intermediate: '🟡 Intermediate',
  advanced: '🔴 Advanced',
};

const mushroomEmojis: Record<string, string> = {
  shiitake: '🍄',
  oyster: '🦪',
  'lions-mane': '🦁',
  'king-oyster': '👑',
  'pink-oyster': '🌸',
  'blue-oyster': '💙',
  'golden-oyster': '🟡',
  general: '🌿',
};

export default async function GuidesPage() {
  let guides: GrowingGuide[] = [];
  
  try {
    guides = await client.fetch(guidesQuery, {}, { 
      next: { revalidate: 300 } // Cache for 5 minutes
    });
  } catch (error) {
    console.error('Error fetching growing guides:', error);
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-800 to-green-600 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              🌱 Growing Guides
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-8">
              Grow your own fresh mushrooms at home! Step-by-step guides with 
              video tutorials, tips, and troubleshooting.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                type="search"
                placeholder="Search guides..."
                className="pl-12 h-12 bg-white/95 text-foreground border-0 shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Filter by Mushroom Type */}
      <section className="py-6 border-b bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-white transition-colors">
              All Mushrooms
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-white transition-colors">
              🍄 Shiitake
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-white transition-colors">
              🦪 Oyster
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-white transition-colors">
              🦁 Lion&apos;s Mane
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-white transition-colors">
              👑 King Oyster
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-white transition-colors">
              🎬 With Video
            </Badge>
          </div>
        </div>
      </section>

      {/* Guides Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {guides.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🌱</div>
              <h2 className="text-2xl font-bold mb-2">No Guides Yet</h2>
              <p className="text-muted-foreground mb-6">
                We&apos;re growing some helpful guides. Check back soon!
              </p>
              <Link href="/shop">
                <Button>Browse Growing Kits</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {guides.map((guide) => (
                <GuideCard key={guide._id} guide={guide} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Grow Your Own Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            Why Grow Your Own Mushrooms?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sprout className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Fresh & Organic</h3>
              <p className="text-muted-foreground text-sm">
                Harvest mushrooms just minutes before cooking for peak freshness and flavor.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Easy & Fun</h3>
              <p className="text-muted-foreground text-sm">
                No garden needed! Grow indoors on your kitchen counter in just 2 weeks.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Multiple Harvests</h3>
              <p className="text-muted-foreground text-sm">
                Get 3-4 flushes from each kit. That&apos;s up to 2kg of fresh mushrooms!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary-dark to-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to Start Growing?
          </h2>
          <p className="opacity-90 mb-6 max-w-2xl mx-auto">
            Get everything you need to grow fresh mushrooms at home. 
            Our kits include substrate, instructions, and customer support.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/category/growing-kits">
              <Button size="lg" variant="secondary">
                Shop Growing Kits
              </Button>
            </Link>
            <Link href="/recipes">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                Browse Recipes
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function GuideCard({ guide }: { guide: GrowingGuide }) {
  const emoji = mushroomEmojis[guide.mushroomType] || '🍄';
  
  return (
    <Link href={`/guides/${guide.slug.current}`}>
      <Card className="group h-full hover:shadow-lg transition-all duration-300 overflow-hidden">
        {/* Image */}
        <div className="relative aspect-video overflow-hidden">
          {guide.coverImage ? (
            <Image
              src={urlFor(guide.coverImage).width(600).height(400).url()}
              alt={guide.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
              <Sprout className="w-12 h-12 text-green-600" />
            </div>
          )}
          
          {/* Video Badge */}
          {guide.hasVideo && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-red-600 text-white flex items-center gap-1">
                <Play className="w-3 h-3" />
                Video
              </Badge>
            </div>
          )}
          
          {/* Difficulty Badge */}
          <div className="absolute top-3 right-3">
            <Badge className={difficultyColors[guide.difficulty]}>
              {difficultyLabels[guide.difficulty]}
            </Badge>
          </div>

          {/* Mushroom Type Badge */}
          <div className="absolute bottom-3 left-3">
            <Badge variant="secondary" className="bg-white/90 text-foreground">
              {emoji} {guide.mushroomType.replace('-', ' ')}
            </Badge>
          </div>
        </div>
        
        <CardHeader className="pb-2">
          <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
            {guide.title}
          </CardTitle>
          {guide.excerpt && (
            <CardDescription className="line-clamp-2">
              {guide.excerpt}
            </CardDescription>
          )}
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Quick Stats */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
            {guide.timeToFirstHarvest && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{guide.timeToFirstHarvest}</span>
              </div>
            )}
            {guide.expectedYield && (
              <div className="flex items-center gap-1">
                <Leaf className="w-4 h-4" />
                <span>{guide.expectedYield}</span>
              </div>
            )}
          </div>

          {/* Related Product */}
          {guide.growingKit && (
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Related Kit:</span>
                <Badge variant="outline" className="text-xs">
                  ₱{guide.growingKit.price}
                </Badge>
              </div>
              <p className="text-sm font-medium truncate mt-1">
                {guide.growingKit.name}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
