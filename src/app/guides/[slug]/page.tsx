import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { 
  Clock, Leaf, Sprout, Thermometer, Droplets, Sun, Wind, 
  ArrowLeft, AlertTriangle, CheckCircle, ShoppingCart, BookOpen,
  Play, ChefHat, Lightbulb
} from 'lucide-react';
import { sanityClient as client, urlFor } from '@/lib/sanity/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { YouTubeEmbed } from '@/components/content/YouTubeEmbed';

// Force dynamic rendering (no static generation at build time)
export const dynamic = 'force-dynamic';

// GROQ query for single growing guide with all details
const guideQuery = `*[_type == "growingGuide" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  description,
  coverImage,
  gallery,
  mushroomType,
  difficulty,
  youtubeVideo,
  additionalVideos,
  introduction,
  timeToFirstHarvest,
  harvestWindow,
  expectedYield,
  idealConditions {
    temperature,
    humidity,
    light,
    airflow
  },
  suppliesNeeded,
  growingSteps[]{
    stepNumber,
    title,
    day,
    instruction,
    tip,
    image,
    videoTimestamp,
    duration
  },
  troubleshooting[]{
    problem,
    cause,
    solution,
    image
  },
  harvestGuide {
    signs,
    technique,
    storage
  },
  relatedProduct->{
    _id,
    name,
    slug,
    price,
    image,
    description
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
  tags,
  publishedAt,
  seo
}`;

// Don't generate static params - fully dynamic rendering
export const dynamicParams = true;

// Generate metadata
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = await client.fetch(guideQuery, { slug });
  
  if (!guide) return { title: 'Guide Not Found | MASH' };
  
  return {
    title: `${guide.title} | MASH Growing Guides`,
    description: guide.description,
    openGraph: {
      title: guide.title,
      description: guide.description,
      images: guide.coverImage ? [urlFor(guide.coverImage).width(1200).height(630).url()] : [],
    },
  };
}

interface GuidePageProps {
  params: Promise<{ slug: string }>;
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = await client.fetch(guideQuery, { slug }, { next: { revalidate: 300 } });
  
  if (!guide) {
    notFound();
  }

  const mushroomEmoji = getMushroomEmoji(guide.mushroomType);

  return (
    <main className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <Link href="/guides" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Growing Guides
        </Link>
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pb-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image */}
          <div className="relative aspect-video lg:aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
            {guide.coverImage ? (
              <Image
                src={urlFor(guide.coverImage).width(800).height(600).url()}
                alt={guide.title}
                fill
                priority
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-green-100 to-green-300 flex items-center justify-center">
                <Sprout className="w-20 h-20 text-green-600" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center">
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className={getDifficultyColor(guide.difficulty)}>
                {getDifficultyLabel(guide.difficulty)}
              </Badge>
              <Badge variant="outline">
                {mushroomEmoji} {guide.mushroomType.replace('-', ' ')}
              </Badge>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-4">{guide.title}</h1>
            
            {guide.description && (
              <p className="text-muted-foreground text-lg mb-6">{guide.description}</p>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {guide.timeToFirstHarvest && (
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">First Harvest</p>
                    <p className="font-semibold">{guide.timeToFirstHarvest}</p>
                  </div>
                </div>
              )}
              {guide.expectedYield && (
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Leaf className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Expected Yield</p>
                    <p className="font-semibold">{guide.expectedYield}</p>
                  </div>
                </div>
              )}
              {guide.harvestWindow && (
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Sprout className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Harvest Window</p>
                    <p className="font-semibold">{guide.harvestWindow}</p>
                  </div>
                </div>
              )}
              {guide.growingSteps?.length && (
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Total Steps</p>
                    <p className="font-semibold">{guide.growingSteps.length} steps</p>
                  </div>
                </div>
              )}
            </div>

            {/* Buy Kit Button */}
            {guide.relatedProduct && (
              <Link href={`/product/${guide.relatedProduct.slug.current}`}>
                <Button size="lg" className="w-full md:w-auto">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Buy Growing Kit - ₱{guide.relatedProduct.price}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* YouTube Video */}
      {guide.youtubeVideo?.videoId && guide.youtubeVideo?.showOnGuidePage !== false && (
        <section className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-6">
              <YouTubeEmbed
                videoId={guide.youtubeVideo.videoId}
                title={guide.youtubeVideo.title || `How to Grow ${guide.mushroomType} Mushrooms`}
                startTime={guide.youtubeVideo.startTime}
                className="max-w-4xl mx-auto"
              />
            </CardContent>
          </Card>
        </section>
      )}

      {/* Ideal Conditions */}
      {guide.idealConditions && (
        <section className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Thermometer className="w-5 h-5" />
                Ideal Growing Conditions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {guide.idealConditions.temperature && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                    <Thermometer className="w-6 h-6 text-red-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Temperature</p>
                      <p className="font-semibold">{guide.idealConditions.temperature}</p>
                    </div>
                  </div>
                )}
                {guide.idealConditions.humidity && (
                  <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <Droplets className="w-6 h-6 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Humidity</p>
                      <p className="font-semibold">{guide.idealConditions.humidity}</p>
                    </div>
                  </div>
                )}
                {guide.idealConditions.light && (
                  <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                    <Sun className="w-6 h-6 text-yellow-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Light</p>
                      <p className="font-semibold">{guide.idealConditions.light}</p>
                    </div>
                  </div>
                )}
                {guide.idealConditions.airflow && (
                  <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <Wind className="w-6 h-6 text-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Airflow</p>
                      <p className="font-semibold">{guide.idealConditions.airflow}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Supplies Needed */}
      {guide.suppliesNeeded && guide.suppliesNeeded.length > 0 && (
        <section className="container mx-auto px-4 py-4">
          <Card>
            <CardHeader>
              <CardTitle>What You&apos;ll Need</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {guide.suppliesNeeded.map((supply: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-sm py-1.5 px-3">
                    <CheckCircle className="w-4 h-4 mr-1.5 text-green-500" />
                    {supply}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Growing Steps */}
      {guide.growingSteps && guide.growingSteps.length > 0 && (
        <section className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sprout className="w-5 h-5" />
                Step-by-Step Growing Guide
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {guide.growingSteps.map((step: any, index: number) => (
                  <div key={index} className="flex gap-6">
                    {/* Step Number */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                        {step.stepNumber || index + 1}
                      </div>
                      {/* Timeline line */}
                      {index < guide.growingSteps.length - 1 && (
                        <div className="w-0.5 h-full bg-primary/20 mx-auto mt-2" />
                      )}
                    </div>
                    
                    <div className="flex-1 pb-8">
                      {/* Day/Timeline */}
                      {step.day && (
                        <Badge variant="outline" className="mb-2">
                          <Clock className="w-3 h-3 mr-1" />
                          {step.day}
                        </Badge>
                      )}
                      
                      <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                      <p className="text-foreground leading-relaxed mb-4">{step.instruction}</p>
                      
                      {/* Duration */}
                      {step.duration && (
                        <p className="text-sm text-muted-foreground mb-3">
                          ⏱️ Duration: {step.duration}
                        </p>
                      )}

                      {/* Pro Tip */}
                      {step.tip && (
                        <div className="flex gap-3 p-4 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border border-yellow-200 dark:border-yellow-800 mb-4">
                          <Lightbulb className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-yellow-800 dark:text-yellow-200 text-sm">Pro Tip</p>
                            <p className="text-yellow-700 dark:text-yellow-300 text-sm">{step.tip}</p>
                          </div>
                        </div>
                      )}

                      {/* Jump to Video */}
                      {step.videoTimestamp && guide.youtubeVideo?.videoId && (
                        <Button variant="outline" size="sm" className="mb-4">
                          <Play className="w-4 h-4 mr-2" />
                          Watch this step ({formatTimestamp(step.videoTimestamp)})
                        </Button>
                      )}

                      {/* Step Image */}
                      {step.image && (
                        <div className="relative aspect-video max-w-lg rounded-lg overflow-hidden">
                          <Image
                            src={urlFor(step.image).width(600).height(400).url()}
                            alt={step.title || `Step ${step.stepNumber || index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Harvest Guide */}
      {guide.harvestGuide && (
        <section className="container mx-auto px-4 py-8">
          <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                <CheckCircle className="w-5 h-5" />
                Harvest Guide
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {guide.harvestGuide.signs && guide.harvestGuide.signs.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Signs They&apos;re Ready:</h4>
                  <ul className="space-y-2">
                    {guide.harvestGuide.signs.map((sign: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{sign}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {guide.harvestGuide.technique && (
                <div>
                  <h4 className="font-semibold mb-2">How to Harvest:</h4>
                  <p className="text-muted-foreground">{guide.harvestGuide.technique}</p>
                </div>
              )}
              
              {guide.harvestGuide.storage && (
                <div>
                  <h4 className="font-semibold mb-2">Storage Tips:</h4>
                  <p className="text-muted-foreground">{guide.harvestGuide.storage}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      )}

      {/* Troubleshooting */}
      {guide.troubleshooting && guide.troubleshooting.length > 0 && (
        <section className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                Troubleshooting
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {guide.troubleshooting.map((issue: any, index: number) => (
                  <AccordionItem key={index} value={`issue-${index}`}>
                    <AccordionTrigger className="text-left">
                      <span className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                        {issue.problem}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-3 pl-6">
                      {issue.cause && (
                        <div>
                          <p className="font-medium text-sm">Cause:</p>
                          <p className="text-muted-foreground">{issue.cause}</p>
                        </div>
                      )}
                      {issue.solution && (
                        <div>
                          <p className="font-medium text-sm text-green-600">Solution:</p>
                          <p className="text-muted-foreground">{issue.solution}</p>
                        </div>
                      )}
                      {issue.image && (
                        <div className="relative aspect-video max-w-sm rounded-lg overflow-hidden mt-3">
                          <Image
                            src={urlFor(issue.image).width(400).height(300).url()}
                            alt={issue.problem}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Related Product */}
      {guide.relatedProduct && (
        <section className="container mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold mb-6">Get Started with This Kit</h2>
          <Card className="overflow-hidden">
            <div className="grid md:grid-cols-2">
              <div className="relative aspect-square md:aspect-auto">
                {guide.relatedProduct.image && (
                  <Image
                    src={urlFor(guide.relatedProduct.image).width(500).height(500).url()}
                    alt={guide.relatedProduct.name}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <div className="p-6 flex flex-col justify-center">
                <h3 className="text-2xl font-bold mb-2">{guide.relatedProduct.name}</h3>
                {guide.relatedProduct.description && (
                  <p className="text-muted-foreground mb-4">{guide.relatedProduct.description}</p>
                )}
                <p className="text-3xl font-bold text-primary mb-6">₱{guide.relatedProduct.price}</p>
                <Link href={`/product/${guide.relatedProduct.slug.current}`}>
                  <Button size="lg" className="w-full md:w-auto">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </section>
      )}

      {/* Related Recipes */}
      {guide.relatedRecipes && guide.relatedRecipes.length > 0 && (
        <section className="container mx-auto px-4 py-12 bg-muted/30">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <ChefHat className="w-6 h-6" />
            Recipes Using {guide.mushroomType.replace('-', ' ')} Mushrooms
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {guide.relatedRecipes.map((recipe: any) => (
              <Link key={recipe._id} href={`/recipes/${recipe.slug.current}`}>
                <Card className="hover:shadow-lg transition-shadow overflow-hidden">
                  <div className="relative aspect-video">
                    {recipe.mainImage && (
                      <Image
                        src={urlFor(recipe.mainImage).width(400).height(300).url()}
                        alt={recipe.title}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h4 className="font-semibold line-clamp-2">{recipe.title}</h4>
                    <div className="flex gap-3 mt-2 text-sm text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {getDifficultyLabel(recipe.difficulty)}
                      </Badge>
                      {recipe.totalTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {recipe.totalTime} min
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
    beginner: '🟢 Beginner',
    intermediate: '🟡 Intermediate',
    advanced: '🔴 Advanced',
  };
  return labels[difficulty] || labels.beginner;
}

function getMushroomEmoji(type: string) {
  const emojis: Record<string, string> = {
    shiitake: '🍄',
    oyster: '🦪',
    'lions-mane': '🦁',
    'king-oyster': '👑',
    'pink-oyster': '🌸',
    'blue-oyster': '💙',
    'golden-oyster': '🟡',
    general: '🌿',
  };
  return emojis[type] || '🍄';
}

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
