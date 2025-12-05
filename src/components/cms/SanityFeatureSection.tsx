/**
 * Sanity Feature Section Component
 * Phase 4: Renders feature sections from Sanity CMS
 * 
 * Supports the "Why MASH" section on the homepage with dynamic icons,
 * customizable columns, and background styles.
 */

"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { TransformedFeatureSection } from "@/hooks/useSanityFeatures";
import {
  Leaf,
  Truck,
  Shield,
  Heart,
  Star,
  Award,
  CheckCircle,
  Sprout,
  Users,
  Clock,
  DollarSign,
  Package,
  Globe,
  Lock,
  MessageCircle,
  LucideIcon,
} from "lucide-react";

// Icon mapping from string to Lucide component
const iconMap: Record<string, LucideIcon> = {
  Leaf,
  Truck,
  Shield,
  Heart,
  Star,
  Award,
  CheckCircle,
  Sprout,
  Users,
  Clock,
  DollarSign,
  Package,
  Globe,
  Lock,
  MessageCircle,
};

interface SanityFeatureSectionProps {
  data: TransformedFeatureSection;
}

interface FeatureItemProps {
  icon: string;
  headline: string;
  subheadline: string;
  link?: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({
  icon,
  headline,
  subheadline,
  link,
}) => {
  const IconComponent = iconMap[icon] || Leaf; // Default to Leaf icon

  const content = (
    <Card className="text-center p-6 h-full hover:shadow-lg transition-shadow duration-300">
      <CardContent className="pt-6">
        <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full mb-4 bg-primary/10 text-primary">
          <IconComponent size={32} className="sm:w-8 sm:h-8" />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-foreground">{headline}</h3>
        <p className="text-muted-foreground font-['Roboto'] text-sm">
          {subheadline}
        </p>
      </CardContent>
    </Card>
  );

  // Wrap in link if provided
  if (link) {
    return (
      <a href={link} className="block h-full" target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return content;
};

// Background style classes
const backgroundStyles: Record<string, string> = {
  light: "bg-background",
  muted: "bg-muted/30",
  dark: "bg-slate-900 text-white",
  gradient: "bg-gradient-to-br from-primary/5 via-background to-secondary/5",
};

// Column grid classes
const columnStyles: Record<number, string> = {
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-3",
  4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
};

export const SanityFeatureSection: React.FC<SanityFeatureSectionProps> = ({ data }) => {
  const bgClass = backgroundStyles[data.backgroundColor] || backgroundStyles.light;
  const gridClass = columnStyles[data.columns] || columnStyles[3];

  // Filter active features and sort by display order
  const activeFeatures = data.features
    .filter((feature) => feature.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  if (activeFeatures.length === 0) {
    return null;
  }

  return (
    <section className={`py-12 sm:py-16 lg:py-20 ${bgClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
            {data.title}
          </h2>
          {data.subtitle && (
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              {data.subtitle}
            </p>
          )}
        </div>

        {/* Feature Grid */}
        <div className={`grid ${gridClass} gap-6 sm:gap-8`}>
          {activeFeatures.map((feature) => (
            <FeatureItem
              key={feature.id}
              icon={feature.icon}
              headline={feature.headline}
              subheadline={feature.subheadline}
              link={feature.link}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SanityFeatureSection;
