// CMS-based Feature Section Component
// src/components/cms/FeatureSection.tsx

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FeatureSection as FeatureSectionType } from "@/hooks/useCMS";

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
};

interface CMSFeatureSectionProps {
  data: FeatureSectionType;
}

const FeatureItem: React.FC<{
  icon: string;
  headline: string;
  subheadline: string;
}> = ({ icon, headline, subheadline }) => {
  const IconComponent = iconMap[icon] || iconMap.Leaf; // Default to Leaf icon

  return (
    <Card className="text-center p-6 h-full">
      <CardContent className="pt-6">
        <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full mb-4 bg-muted text-primary">
          <IconComponent size={32} className="sm:w-8 sm:h-8" />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-foreground">{headline}</h3>
        <p className="text-muted-foreground font-['Roboto'] text-sm">{subheadline}</p>
      </CardContent>
    </Card>
  );
};

export const CMSFeatureSection: React.FC<CMSFeatureSectionProps> = ({ data }) => {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
            {data.title}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            {data.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {data.features
            .filter(feature => feature.isActive)
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((feature) => (
              <FeatureItem
                key={feature.id}
                icon={feature.icon}
                headline={feature.headline}
                subheadline={feature.subheadline}
              />
            ))}
        </div>
      </div>
    </section>
  );
};
