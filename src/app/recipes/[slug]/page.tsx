import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Clock, ChefHat, Users, Printer, Share2, BookmarkPlus, ShoppingCart, ArrowLeft, Check, Lightbulb } from 'lucide-react';
import { sanityClient as client, urlFor } from '@/lib/sanity/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { YouTubeEmbed } from '@/components/content/YouTubeEmbed';

// GROQ query for single recipe with all details
const recipeQuery = `*[_type == "recipe" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  description,
  excerpt,
  mainImage,
  gallery,
  difficulty,
  cuisine,
  mealType,
  prepTime,
  cookTime,
  totalTime,
  servings,
  tags,
  youtubeVideo,
  additionalVideos,
  ingredientGroups[]{
    groupName,
    ingredients[]{
      quantity,
      name,
      preparation,
      isOptional,
      substitutes,
      product->{
        _id,
        name,
        slug,
        price,
        image
      }
    }
  },
  instructions[]{
    stepNumber,
    title,
    instruction,
    tip,
    image,
    duration
  },
  nutritionFacts,
  chefNotes,
  relatedProducts[]->{
    _id,
    name,
    slug,
    price,
    image
  },
  relatedRecipes[]->{
    _id,
    title,
    slug,
    mainImage,
    difficulty,
    totalTime
  },
  author->{
    name,
    image
  },
  publishedAt,
  seo
}`;

// Generate static params for all recipes
export async function generateStaticParams() {
  const slugs = await client.fetch<{ slug: { current: string } }[]>(
    `*[_type == "recipe" && isPublished == true]{ slug }`
  );
  return slugs.map((item) => ({ slug: item.slug.current }));
}

// Generate metadata
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const recipe = await client.fetch(recipeQuery, { slug });
  
  if (!recipe) return { title: 'Recipe Not Found | MASH' };
  
  return {
    title: `${recipe.title} | MASH Recipes`,
    description: recipe.excerpt || recipe.description,
    openGraph: {
      title: recipe.title,
      description: recipe.excerpt,
      images: recipe.mainImage ? [urlFor(recipe.mainImage).width(1200).height(630).url()] : [],
    },
  };
}

interface RecipePageProps {
  params: Promise<{ slug: string }>;
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { slug } = await params;
  const recipe = await client.fetch(recipeQuery, { slug }, { next: { revalidate: 300 } });
  
  if (!recipe) {
    notFound();
  }

  const totalTime = recipe.totalTime || (recipe.prepTime || 0) + (recipe.cookTime || 0);
  
  // Collect all products from ingredients for "Shop Ingredients" section
  const ingredientProducts = recipe.ingredientGroups?.flatMap(
    (group: any) => group.ingredients?.filter((ing: any) => ing.product).map((ing: any) => ing.product)
  ).filter(Boolean) || [];

  return (
    <main className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <Link href="/recipes" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Recipes
        </Link>
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pb-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image */}
          <div className="relative aspect-video lg:aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
            {recipe.mainImage ? (
              <Image
                src={urlFor(recipe.mainImage).width(800).height(600).url()}
                alt={recipe.title}
                fill
                priority
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <ChefHat className="w-20 h-20 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center">
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className={getDifficultyColor(recipe.difficulty)}>
                {getDifficultyLabel(recipe.difficulty)}
              </Badge>
              {recipe.cuisine && (
                <Badge variant="outline">{recipe.cuisine}</Badge>
              )}
              {recipe.mealType?.map((type: string) => (
                <Badge key={type} variant="secondary">{type}</Badge>
              ))}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-4">{recipe.title}</h1>
            
            {recipe.excerpt && (
              <p className="text-muted-foreground text-lg mb-6">{recipe.excerpt}</p>
            )}

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-6 mb-6">
              {recipe.prepTime && (
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Prep Time</p>
                    <p className="font-semibold">{recipe.prepTime} min</p>
                  </div>
                </div>
              )}
              {recipe.cookTime && (
                <div className="flex items-center gap-2">
                  <ChefHat className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Cook Time</p>
                    <p className="font-semibold">{recipe.cookTime} min</p>
                  </div>
                </div>
              )}
              {recipe.servings && (
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Servings</p>
                    <p className="font-semibold">{recipe.servings}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm">
                <Printer className="w-4 h-4 mr-2" />
                Print Recipe
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <BookmarkPlus className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* YouTube Video */}
      {recipe.youtubeVideo?.videoId && recipe.youtubeVideo?.showOnRecipePage !== false && (
        <section className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-6">
              <YouTubeEmbed
                videoId={recipe.youtubeVideo.videoId}
                title={recipe.youtubeVideo.title || `How to Make ${recipe.title}`}
                startTime={recipe.youtubeVideo.startTime}
                className="max-w-4xl mx-auto"
              />
            </CardContent>
          </Card>
        </section>
      )}

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Ingredients Column */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Ingredients
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recipe.ingredientGroups?.map((group: any, groupIndex: number) => (
                  <div key={groupIndex} className="mb-6 last:mb-0">
                    {group.groupName && (
                      <h4 className="font-semibold text-primary mb-3">{group.groupName}</h4>
                    )}
                    <ul className="space-y-3">
                      {group.ingredients?.map((ing: any, ingIndex: number) => (
                        <li key={ingIndex} className="flex items-start gap-3">
                          <Check className="w-4 h-4 mt-1 text-primary flex-shrink-0" />
                          <div className="flex-1">
                            <span className={ing.isOptional ? 'text-muted-foreground' : ''}>
                              {ing.quantity && <strong>{ing.quantity}</strong>} {ing.name}
                              {ing.preparation && <span className="text-muted-foreground">, {ing.preparation}</span>}
                              {ing.isOptional && <span className="text-sm italic"> (optional)</span>}
                            </span>
                            {ing.product && (
                              <Link 
                                href={`/product/${ing.product.slug.current}`}
                                className="block mt-1"
                              >
                                <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-white transition-colors">
                                  Buy: ₱{ing.product.price}
                                </Badge>
                              </Link>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                {/* Shop All Ingredients Button */}
                {ingredientProducts.length > 0 && (
                  <div className="mt-6 pt-6 border-t">
                    <Link href="/shop">
                      <Button className="w-full">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Shop All Ingredients
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Instructions Column */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-8">
                  {recipe.instructions?.map((step: any, index: number) => (
                    <li key={index} className="flex gap-4">
                      {/* Step Number */}
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        {step.stepNumber || index + 1}
                      </div>
                      
                      <div className="flex-1 space-y-3">
                        {step.title && (
                          <h4 className="font-semibold text-lg">{step.title}</h4>
                        )}
                        <p className="text-foreground leading-relaxed">{step.instruction}</p>
                        
                        {/* Duration */}
                        {step.duration && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{step.duration} minutes</span>
                          </div>
                        )}

                        {/* Pro Tip */}
                        {step.tip && (
                          <div className="flex gap-3 p-4 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
                            <Lightbulb className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium text-yellow-800 dark:text-yellow-200 text-sm">Pro Tip</p>
                              <p className="text-yellow-700 dark:text-yellow-300 text-sm">{step.tip}</p>
                            </div>
                          </div>
                        )}

                        {/* Step Image */}
                        {step.image && (
                          <div className="relative aspect-video rounded-lg overflow-hidden mt-4">
                            <Image
                              src={urlFor(step.image).width(600).height(400).url()}
                              alt={step.title || `Step ${step.stepNumber || index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>

                {/* Chef Notes */}
                {recipe.chefNotes && (
                  <div className="mt-8 pt-8 border-t">
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <ChefHat className="w-5 h-5" />
                      Chef&apos;s Notes
                    </h3>
                    <p className="text-muted-foreground">{recipe.chefNotes}</p>
                  </div>
                )}

                {/* Nutrition Facts */}
                {recipe.nutritionFacts && (
                  <div className="mt-8 pt-8 border-t">
                    <h3 className="font-semibold text-lg mb-4">Nutrition Facts (per serving)</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                      {recipe.nutritionFacts.calories && (
                        <NutritionCard label="Calories" value={recipe.nutritionFacts.calories} unit="kcal" />
                      )}
                      {recipe.nutritionFacts.protein && (
                        <NutritionCard label="Protein" value={recipe.nutritionFacts.protein} unit="g" />
                      )}
                      {recipe.nutritionFacts.carbs && (
                        <NutritionCard label="Carbs" value={recipe.nutritionFacts.carbs} unit="g" />
                      )}
                      {recipe.nutritionFacts.fat && (
                        <NutritionCard label="Fat" value={recipe.nutritionFacts.fat} unit="g" />
                      )}
                      {recipe.nutritionFacts.fiber && (
                        <NutritionCard label="Fiber" value={recipe.nutritionFacts.fiber} unit="g" />
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {recipe.relatedProducts && recipe.relatedProducts.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold mb-6">Products Used in This Recipe</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recipe.relatedProducts.map((product: any) => (
              <Link key={product._id} href={`/product/${product.slug.current}`}>
                <Card className="hover:shadow-lg transition-shadow">
                  <div className="relative aspect-square">
                    {product.image && (
                      <Image
                        src={urlFor(product.image).width(300).height(300).url()}
                        alt={product.name}
                        fill
                        className="object-cover rounded-t-lg"
                      />
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h4 className="font-semibold line-clamp-2">{product.name}</h4>
                    <p className="text-primary font-bold mt-1">₱{product.price}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Related Recipes */}
      {recipe.relatedRecipes && recipe.relatedRecipes.length > 0 && (
        <section className="container mx-auto px-4 py-12 bg-muted/30">
          <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recipe.relatedRecipes.map((related: any) => (
              <Link key={related._id} href={`/recipes/${related.slug.current}`}>
                <Card className="hover:shadow-lg transition-shadow overflow-hidden">
                  <div className="relative aspect-video">
                    {related.mainImage && (
                      <Image
                        src={urlFor(related.mainImage).width(400).height(300).url()}
                        alt={related.title}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h4 className="font-semibold line-clamp-2">{related.title}</h4>
                    <div className="flex gap-3 mt-2 text-sm text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {getDifficultyLabel(related.difficulty)}
                      </Badge>
                      {related.totalTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {related.totalTime} min
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function NutritionCard({ label, value, unit }: { label: string; value: number | string; unit: string }) {
  return (
    <div className="text-center p-3 bg-muted rounded-lg">
      <p className="text-2xl font-bold text-primary">{value}</p>
      <p className="text-xs text-muted-foreground">{unit}</p>
      <p className="text-sm font-medium mt-1">{label}</p>
    </div>
  );
}

function getDifficultyColor(difficulty: string) {
  const colors: Record<string, string> = {
    beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    advanced: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
  };
  return colors[difficulty] || colors.beginner;
}

function getDifficultyLabel(difficulty: string) {
  const labels: Record<string, string> = {
    beginner: '🟢 Easy',
    intermediate: '🟡 Medium',
    advanced: '🔴 Advanced',
  };
  return labels[difficulty] || labels.beginner;
}
