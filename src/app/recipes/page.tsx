import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, ChefHat, Users, Search } from 'lucide-react';
import { sanityClient as client, urlFor } from '@/lib/sanity/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Mushroom Recipes | MASH',
  description: 'Discover delicious Filipino mushroom recipes with step-by-step instructions, YouTube video tutorials, and product links.',
  openGraph: {
    title: 'Mushroom Recipes | MASH',
    description: 'Discover delicious Filipino mushroom recipes',
    images: ['/og-recipes.jpg'],
  },
};

// GROQ query to fetch all published recipes
const recipesQuery = `*[_type == "recipe" && status == "published"] | order(publishedAt desc) {
  _id,
  title,
  slug,
  excerpt,
  mainImage,
  difficulty,
  cuisine,
  category,
  prepTime,
  cookTime,
  totalTime,
  servings,
  tags,
  youtubeVideo,
  "ingredientCount": count(ingredientGroups[].ingredients[]),
  "hasVideo": defined(youtubeVideo.videoId),
  publishedAt
}`;

interface Recipe {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt?: string;
  mainImage?: any;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  cuisine?: string;
  category?: string;
  prepTime?: number;
  cookTime?: number;
  totalTime?: number;
  servings?: number;
  tags?: string[];
  youtubeVideo?: { videoId: string; title: string };
  ingredientCount?: number;
  hasVideo?: boolean;
  publishedAt?: string;
}

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
  advanced: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
};

const difficultyLabels = {
  beginner: '🟢 Easy',
  intermediate: '🟡 Medium',
  advanced: '🔴 Advanced',
};

export default async function RecipesPage() {
  let recipes: Recipe[] = [];
  
  try {
    recipes = await client.fetch(recipesQuery, {}, { 
      next: { revalidate: 300 } // Cache for 5 minutes
    });
  } catch (error) {
    console.error('Error fetching recipes:', error);
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-dark to-primary py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              🍄 Mushroom Recipes
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-8">
              Discover delicious ways to cook with fresh mushrooms. 
              From crispy chicharon to creamy pasta - we&apos;ve got you covered!
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                type="search"
                placeholder="Search recipes..."
                className="pl-12 h-12 bg-white/95 text-foreground border-0 shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Filter Pills */}
      <section className="py-6 border-b bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-white transition-colors">
              All Recipes
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-white transition-colors">
              🍳 Quick & Easy
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-white transition-colors">
              🎬 With Video
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-white transition-colors">
              🇵🇭 Filipino
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-white transition-colors">
              🥗 Vegetarian
            </Badge>
          </div>
        </div>
      </section>

      {/* Recipes Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {recipes.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🍳</div>
              <h2 className="text-2xl font-bold mb-2">No Recipes Yet</h2>
              <p className="text-muted-foreground mb-6">
                We&apos;re cooking up some delicious recipes. Check back soon!
              </p>
              <Link href="/shop">
                <Button>Browse Products</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe._id} recipe={recipe} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to Cook?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Get fresh mushrooms delivered to your door. Same-day delivery available in Metro Manila!
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/shop">
              <Button size="lg">Shop Fresh Mushrooms</Button>
            </Link>
            <Link href="/guides">
              <Button size="lg" variant="outline">Growing Guides</Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function RecipeCard({ recipe }: { recipe: Recipe }) {
  const totalTime = recipe.totalTime || (recipe.prepTime || 0) + (recipe.cookTime || 0);
  
  return (
    <Link href={`/recipes/${recipe.slug.current}`}>
      <Card className="group h-full hover:shadow-lg transition-all duration-300 overflow-hidden">
        {/* Image */}
        <div className="relative aspect-video overflow-hidden">
          {recipe.mainImage ? (
            <Image
              src={urlFor(recipe.mainImage).width(600).height(400).url()}
              alt={recipe.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <ChefHat className="w-12 h-12 text-muted-foreground" />
            </div>
          )}
          
          {/* Video Badge */}
          {recipe.hasVideo && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-red-600 text-white">
                🎬 Video
              </Badge>
            </div>
          )}
          
          {/* Difficulty Badge */}
          <div className="absolute top-3 right-3">
            <Badge className={difficultyColors[recipe.difficulty]}>
              {difficultyLabels[recipe.difficulty]}
            </Badge>
          </div>
        </div>
        
        <CardHeader className="pb-2">
          <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
            {recipe.title}
          </CardTitle>
          {recipe.excerpt && (
            <CardDescription className="line-clamp-2">
              {recipe.excerpt}
            </CardDescription>
          )}
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Meta Info */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {totalTime > 0 && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{totalTime} min</span>
              </div>
            )}
            {recipe.servings && (
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{recipe.servings} servings</span>
              </div>
            )}
            {recipe.cuisine && (
              <Badge variant="outline" className="text-xs">
                {recipe.cuisine}
              </Badge>
            )}
          </div>
          
          {/* Tags */}
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {recipe.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {recipe.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{recipe.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
