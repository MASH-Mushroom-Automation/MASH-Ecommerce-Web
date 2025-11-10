// CMS-based About Page Component
// src/components/cms/AboutSection.tsx

import React from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AboutHeroSection, ChallengesSection, SolutionsSection, VisionSection, MentorSection } from "@/hooks/useCMS";

// Icon mapping for Lucide icons
const iconMap: Record<string, React.ComponentType<any>> = {
  Leaf: ({ size = 32, className = "" }: { size?: number; className?: string }) =>
    React.createElement(require('lucide-react').Leaf, { size, className }),
  Truck: ({ size = 32, className = "" }: { size?: number; className?: string }) =>
    React.createElement(require('lucide-react').Truck, { size, className }),
  Heart: ({ size = 32, className = "" }: { size?: number; className?: string }) =>
    React.createElement(require('lucide-react').Heart, { size, className }),
  Shield: ({ size = 32, className = "" }: { size?: number; className?: string }) =>
    React.createElement(require('lucide-react').Shield, { size, className }),
  Users: ({ size = 32, className = "" }: { size?: number; className?: string }) =>
    React.createElement(require('lucide-react').Users, { size, className }),
  Award: ({ size = 32, className = "" }: { size?: number; className?: string }) =>
    React.createElement(require('lucide-react').Award, { size, className }),
  CheckCircle: ({ size = 32, className = "" }: { size?: number; className?: string }) =>
    React.createElement(require('lucide-react').CheckCircle, { size, className }),
  Star: ({ size = 32, className = "" }: { size?: number; className?: string }) =>
    React.createElement(require('lucide-react').Star, { size, className }),
  Cpu: ({ size = 32, className = "" }: { size?: number; className?: string }) =>
    React.createElement(require('lucide-react').Cpu, { size, className }),
  Brain: ({ size = 32, className = "" }: { size?: number; className?: string }) =>
    React.createElement(require('lucide-react').Brain, { size, className }),
  ShoppingCart: ({ size = 32, className = "" }: { size?: number; className?: string }) =>
    React.createElement(require('lucide-react').ShoppingCart, { size, className }),
};

interface CMSAboutSectionProps {
  hero?: AboutHeroSection;
  challenges?: ChallengesSection;
  solutions?: SolutionsSection;
  vision?: VisionSection;
  mentor?: MentorSection;
  team?: any[]; // Team member data
  loading?: boolean;
  error?: string | null;
}

export const CMSAboutSection: React.FC<CMSAboutSectionProps> = ({
  hero,
  challenges,
  solutions,
  vision,
  mentor,
  team,
  loading,
  error
}) => {
  if (loading) {
    return (
      <div className="bg-background">
        {/* Hero Section Skeleton */}
        <section className="relative bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-20 px-4 md:px-8 lg:px-16">
          <div className="relative max-w-6xl mx-auto text-center">
            <div className="animate-pulse">
              <div className="h-12 bg-primary-foreground/20 rounded w-96 mx-auto mb-6"></div>
              <div className="h-6 bg-primary-foreground/20 rounded w-full mx-auto"></div>
            </div>
          </div>
        </section>

        {/* Content Skeletons */}
        <div className="animate-pulse">
          <section className="py-16 px-4 md:px-8 lg:px-16 bg-muted/30">
            <div className="max-w-7xl mx-auto">
              <div className="h-8 bg-muted rounded w-80 mx-auto mb-8"></div>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="h-64 bg-muted rounded"></div>
                <div className="h-64 bg-muted rounded"></div>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-background min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center">
            <p className="text-destructive mb-4">Error: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      {/* Hero Section */}
      {hero?.isActive && (
        <section className="relative bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-20 px-4 md:px-8 lg:px-16">
          <div className="absolute inset-0 bg-[url('/placeholder.png')] bg-cover bg-center opacity-10" />
          <div className="relative max-w-6xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              {hero.title}
            </h1>
            <p className="text-lg md:text-xl max-w-4xl mx-auto leading-relaxed font-light">
              {hero.subtitle}
            </p>
          </div>
        </section>
      )}

      {/* Challenge & Solution Section */}
      {(challenges?.isActive || solutions?.isActive) && (
        <section className="py-16 px-4 md:px-8 lg:px-16 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              {/* Challenge */}
              {challenges?.isActive && (
                <div className="bg-card rounded-xl shadow-lg p-8 border-t-4 border-destructive">
                  <h2 className="text-3xl font-bold text-primary mb-6">
                    {challenges.title}
                  </h2>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {challenges.subtitle}
                  </p>
                  <ul className="space-y-3">
                    {challenges.challenges.map((challenge, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="text-destructive mt-1 flex-shrink-0">●</span>
                        <span className="text-muted-foreground">{challenge}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Solution */}
              {solutions?.isActive && (
                <div className="bg-card rounded-xl shadow-lg p-8 border-t-4 border-primary">
                  <h2 className="text-3xl font-bold text-primary mb-6">
                    {solutions.title}
                  </h2>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {solutions.subtitle}
                  </p>
                  <div className="space-y-4">
                    {solutions.solutions.map((solution) => (
                      <div key={solution.id} className="bg-primary/5 rounded-lg p-4">
                        <h3 className="font-bold text-primary mb-2">
                          {solution.title}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {solution.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Team Section */}
      {team && team.length > 0 && (
        <section className="py-16 px-4 md:px-8 lg:px-16 bg-background">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
                Meet the Innovators
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                M.A.S.H. is the culmination of a thesis project by a passionate
                team of Computer Science students from the University of Caloocan
                City.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
              {team.map((member, index) => (
                <div
                  key={index}
                  className="bg-muted/30 rounded-xl p-6 text-center hover:shadow-xl transition-shadow duration-300 border border-border hover:border-primary"
                >
                  <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground text-3xl font-bold">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                  <h3 className="font-bold text-primary mb-1">{member.name}</h3>
                  <p className="text-sm text-primary/80 font-medium">
                    {member.role}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Mentor Section */}
      {mentor?.isActive && (
        <section className="py-12 px-4 md:px-8 lg:px-16 bg-muted/30">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">
              {mentor.title}
            </h2>
            <p className="text-muted-foreground mb-6">
              {mentor.subtitle}
            </p>
            <div className="inline-block bg-card rounded-xl shadow-lg p-8 border-l-4 border-primary">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                <span className="text-primary-foreground text-2xl font-bold">
                  {mentor.mentor.name.charAt(0)}
                </span>
              </div>
              <h3 className="text-xl font-bold text-primary">
                {mentor.mentor.name}
              </h3>
              <p className="text-primary/80 font-medium">{mentor.mentor.title}</p>
            </div>
          </div>
        </section>
      )}

      {/* Vision Section */}
      {vision?.isActive && (
        <section className="py-16 px-4 md:px-8 lg:px-16 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {vision.title}
            </h2>
            <div className="space-y-4 text-lg leading-relaxed font-light">
              {vision.content.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
            <div className="mt-10 pt-8 border-t border-primary-foreground/20">
              <p className="text-accent font-bold text-xl">
                {vision.callToAction}
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
