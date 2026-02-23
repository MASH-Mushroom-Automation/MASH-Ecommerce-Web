// CMS-based About Page Component - Enhanced Version
// src/components/cms/AboutSection.tsx

import React from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AboutHeroSection,
  ChallengesSection,
  SolutionsSection,
  VisionSection,
  MentorSection,
} from "@/hooks/useCMS";
import {
  Leaf,
  Truck,
  Heart,
  Shield,
  Users,
  Award,
  CheckCircle,
  Star,
  Cpu,
  Brain,
  ShoppingCart,
  Sparkles,
  Target,
  Lightbulb,
  Rocket,
  GraduationCap,
  Code,
  Database,
  Monitor,
  Wrench,
  Globe,
  Zap,
  AlertTriangle,
  Wifi,
  BarChart3,
  Linkedin,
  Github,
  Facebook,
  ExternalLink,
} from "lucide-react";

// Icon mapping for solution icons
const iconMap: Record<
  string,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  cpu: Cpu,
  brain: Brain,
  "shopping-cart": ShoppingCart,
  "bar-chart": BarChart3,
  wifi: Wifi,
  leaf: Leaf,
  truck: Truck,
  heart: Heart,
  shield: Shield,
  users: Users,
  award: Award,
  "check-circle": CheckCircle,
  star: Star,
  sparkles: Sparkles,
  target: Target,
  lightbulb: Lightbulb,
  rocket: Rocket,
};

// Role-specific icons for team members
const roleIcons: Record<
  string,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  "Project Manager": Target,
  "Software Engineer": Code,
  "Front-end Developer": Monitor,
  "Back-end Developer": Database,
  "Hardware Programmer": Wrench,
  "Database Administrator": Database,
  "Full Stack Developer": Globe,
  "Thesis Adviser": GraduationCap,
  "UI/UX Designer": Sparkles,
};

// Get initials from name
const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

// Solid colors for team member cards based on index
const gradientColors = [
  "bg-emerald-500",
  "bg-blue-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-cyan-500",
  "bg-rose-500",
  "bg-amber-500",
  "bg-lime-500",
];

interface TeamMember {
  name: string;
  role: string;
  image?: string;
  bio?: string;
  socialLinks?: {
    facebook?: string;
    linkedin?: string;
    github?: string;
    twitter?: string;
  };
}

interface CMSAboutSectionProps {
  hero?: AboutHeroSection;
  challenges?: ChallengesSection;
  solutions?: SolutionsSection;
  vision?: VisionSection;
  mentor?: MentorSection;
  team?: TeamMember[];
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
  error,
}) => {
  if (loading) {
    return (
      <div className="bg-background min-h-screen">
        {/* Hero Section Skeleton */}
        <section className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground py-24 px-4 md:px-8 lg:px-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)] pointer-events-none" />
          <div className="relative max-w-6xl mx-auto text-center">
            <div className="animate-pulse">
              <div className="h-14 bg-primary-foreground/20 rounded-lg w-3/4 mx-auto mb-6"></div>
              <div className="h-6 bg-primary-foreground/15 rounded w-2/3 mx-auto"></div>
            </div>
          </div>
        </section>

        {/* Content Skeletons */}
        <div className="animate-pulse py-16 px-4 md:px-8 lg:px-16">
          <div className="max-w-7xl mx-auto">
            <div className="h-10 bg-muted rounded w-64 mx-auto mb-8"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-muted rounded-xl h-64"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-card rounded-xl shadow-lg border max-w-md mx-4">
          <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">
            Something went wrong
          </h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      {/* Hero Section - Enhanced with animated gradient */}
      {hero?.isActive && (
        <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-emerald-700 text-primary-foreground py-24 md:py-32 px-4 md:px-8 lg:px-16">
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            <div
              className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-300 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse"
              style={{ animationDelay: "1s" }}
            />
          </div>
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-repeat opacity-5" />

          <div className="relative max-w-5xl mx-auto text-center">
            <Badge className="mb-6 bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/30 transition-colors">
              University of Caloocan City Thesis Project
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {hero.title}
            </h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed text-primary-foreground/90">
              {hero.subtitle}
            </p>

            {/* Decorative elements */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
              <div className="flex  items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                <Cpu className="w-5 h-5" />
                <span className="text-sm font-medium">IoT Enabled</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                <Brain className="w-5 h-5" />
                <span className="text-sm font-medium">AI Powered</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                <ShoppingCart className="w-5 h-5" />
                <span className="text-sm font-medium">E-Commerce</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Challenge & Solution Section - Side by Side */}
      {(challenges?.isActive || solutions?.isActive) && (
        <section className="py-16 md:py-20 px-4 md:px-8 lg:px-16 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Challenge Card */}
              {challenges?.isActive && (
                <div className="group bg-card rounded-2xl overflow-hidden shadow-xs border border-border">
                  <div className="h-2 bg-primary" />
                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                      </div>
                      <h2 className="text-xl md:text-2xl font-bold text-foreground">
                        {challenges.title}
                      </h2>
                    </div>
                    <p className="text-muted-foreground mb-8 leading-relaxed text-lg">
                      {challenges.subtitle}
                    </p>
                    <div className="space-y-4">
                      {challenges.challenges.map((challenge, index) => {
                        // Handle both string and object formats
                        const isString = typeof challenge === "string";
                        const title = isString
                          ? `Challenge ${index + 1}`
                          : challenge.title;
                        const description = isString
                          ? challenge
                          : challenge.description;

                        return (
                          <div
                            key={index}
                            className="flex items-start gap-4 p-4 bg-red-500/5 rounded-xl border border-red-500/10"
                          >
                            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                              <span className="text-red-500 text-xs font-bold">
                                {index + 1}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              {!isString && title && (
                                <h3 className="font-bold text-foreground mb-1">
                                  {title}
                                </h3>
                              )}
                              <p className="text-foreground/80 text-sm leading-relaxed break-words text-justify">
                                {description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Solution Card */}
              {solutions?.isActive && (
                <div className="group bg-card rounded-2xl overflow-hidden shadow-xs border border-border">
                  <div className="h-2 bg-primary" />
                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <Lightbulb className="w-6 h-6 text-emerald-500" />
                      </div>
                      <h2 className="text-xl md:text-2xl font-bold text-foreground">
                        {solutions.title}
                      </h2>
                    </div>
                    <p className="text-muted-foreground mb-8 leading-relaxed text-lg">
                      {solutions.subtitle}
                    </p>
                    <div className="space-y-4">
                      {solutions.solutions.map((solution, index) => {
                        const IconComponent = iconMap[solution.id] || Zap;
                        return (
                          <div
                            key={solution.id}
                            className="flex items-start gap-4 p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10"
                          >
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                              <IconComponent className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                              <h3 className="font-bold text-foreground mb-1">
                                {solution.title}
                              </h3>
                              <p className="text-muted-foreground text-sm leading-relaxed text-justify">
                                {solution.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Mentor Section - Enhanced */}
      {mentor?.isActive && (
        <section className="py-10 md:py-12 px-4 md:px-8 lg:px-16 bg-muted/40">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <Badge className="mb-4 bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20">
                <GraduationCap className="w-3 h-3 mr-1" />
                Academic Guidance
              </Badge>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4">
                {mentor.title}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {mentor.subtitle}
              </p>
            </div>

            <div className="bg-card rounded-2xl shadow-sm overflow-hidden border border-border">
              <div className="h-2 bg-primary" />
              <div className="p-8 md:p-10 flex flex-col md:flex-row items-center gap-8">
                {/* Mentor Image */}
                <div className="relative">
                  <div className="w-36 h-36 md:w-44 md:h-44 rounded-2xl overflow-hidden shadow-sm ring-4 ring-amber-500/20">
                    {mentor.mentor.avatar ? (
                      <Image
                        src={mentor.mentor.avatar}
                        alt={mentor.mentor.name}
                        fill
                        className="object-cover"
                        sizes="176px"
                      />
                    ) : (
                      <div className="w-full h-full bg-amber-500 flex items-center justify-center">
                        <span className="text-white text-4xl font-bold">
                          {getInitials(mentor.mentor.name)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Mentor Info */}
                <div className="text-center md:text-left flex-1">
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                    {mentor.mentor.name}
                  </h3>
                  <p className="text-lg text-primary font-medium mb-4">
                    {mentor.mentor.title}
                  </p>
                  {mentor.mentor.bio && (
                    <p className="text-muted-foreground leading-relaxed text-justify">
                      {mentor.mentor.bio}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Team Section - Enhanced with proper images */}
      {team && team.length > 0 && (
        <section className="py-20 md:py-28 px-4 md:px-8 lg:px-16 bg-muted/10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                <Users className="w-3 h-3 mr-1" />
                Our Team
              </Badge>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                Meet the Innovators
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                M.A.S.H. is the culmination of a thesis project by a passionate
                team of{" "}
                <span className="text-primary font-semibold">
                  7 Computer Science students
                </span>{" "}
                from the University of Caloocan City.
              </p>
            </div>

            {/* Project Manager - Featured Card */}
            {team.length > 0 && (
              <div className="mb-12">
                <div className="max-w-2xl mx-auto">
                  {(() => {
                    const leader =
                      team.find((m) =>
                        m.role?.toLowerCase().includes("project manager"),
                      ) || team[0];
                    const LeaderIcon = roleIcons[leader.role] || Target;
                    return (
                      <div className="group relative bg-card rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border-2 border-primary/20 hover:border-primary/40">
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary" />
                        <div className="p-8 md:p-10 flex flex-col md:flex-row items-center gap-8">
                          {/* Leader Image */}
                          <div className="relative flex-shrink-0">
                            <div className="w-40 h-40 md:w-48 md:h-48 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-primary/30 group-hover:ring-primary/50 transition-all">
                              {leader.image ? (
                                <Image
                                  src={leader.image}
                                  alt={leader.name}
                                  fill
                                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                                  sizes="192px"
                                />
                              ) : (
                                <div className="w-full h-full bg-primary flex items-center justify-center">
                                  <span className="text-white text-5xl font-bold">
                                    {getInitials(leader.name)}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="absolute -bottom-3 -right-3 w-14 h-14 bg-primary rounded-xl flex items-center justify-center shadow-sm">
                              <LeaderIcon className="w-7 h-7 text-white" />
                            </div>
                          </div>

                          {/* Leader Info */}
                          <div className="text-center md:text-left flex-1">
                            <Badge className="mb-3 bg-primary/20 text-primary border-primary/30">
                              <Star className="w-3 h-3 mr-1" />
                              Team Lead
                            </Badge>
                            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                              {leader.name}
                            </h3>
                            <p className="text-lg text-primary font-semibold mb-4">
                              {leader.role}
                            </p>
                            {leader.bio ? (
                              <p className="text-muted-foreground leading-relaxed">
                                {leader.bio}
                              </p>
                            ) : (
                              <p className="text-muted-foreground leading-relaxed">
                                Leading the MASH project with expertise in
                                project management, team coordination, and
                                strategic planning.
                              </p>
                            )}

                            {/* Social Links for Leader */}
                            {leader.socialLinks &&
                              Object.values(leader.socialLinks).some(
                                Boolean,
                              ) && (
                                <div className="flex gap-3 mt-5 justify-center md:justify-start">
                                  {leader.socialLinks.linkedin && (
                                    <a
                                      href={leader.socialLinks.linkedin}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors"
                                    >
                                      <Linkedin className="w-5 h-5 text-primary" />
                                    </a>
                                  )}
                                  {leader.socialLinks.github && (
                                    <a
                                      href={leader.socialLinks.github}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors"
                                    >
                                      <Github className="w-5 h-5 text-primary" />
                                    </a>
                                  )}
                                  {leader.socialLinks.facebook && (
                                    <a
                                      href={leader.socialLinks.facebook}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors"
                                    >
                                      <Facebook className="w-5 h-5 text-primary" />
                                    </a>
                                  )}
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Other Team Members - Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {team
                .filter(
                  (m) => !m.role?.toLowerCase().includes("project manager"),
                )
                .map((member, index) => {
                  const RoleIcon = roleIcons[member.role] || Code;
                  const gradientClass =
                    gradientColors[(index + 1) % gradientColors.length];

                  return (
                    <div
                      key={index}
                      className="group relative bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500 border border-border hover:border-primary/40 hover:-translate-y-1"
                    >
                      {/* Top gradient accent */}
                      <div className="h-1.5 bg-primary" />

                      {/* Image Container */}
                      <div className="relative h-52 overflow-hidden">
                        {member.image ? (
                          <>
                            <Image
                              src={member.image}
                              alt={member.name}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-110"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                            <div className="absolute inset-0 bg-black/40" />
                          </>
                        ) : (
                          /* Fallback gradient with initials */
                          <div
                            className={`w-full h-full ${gradientClass} flex items-center justify-center relative`}
                          >
                            <span className="text-white text-6xl font-bold opacity-90 group-hover:scale-110 transition-transform duration-300">
                              {getInitials(member.name)}
                            </span>
                            <div className="absolute inset-0 bg-black/20" />
                          </div>
                        )}

                        {/* Role icon floating */}
                        <div className="absolute top-4 right-4 w-10 h-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <RoleIcon className="w-5 h-5 text-primary" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-secondary text-primary">
                            {member.role}
                          </span>
                        </div>
                        <h3 className="font-bold text-lg text-foreground mb-2">
                          {member.name}
                        </h3>
                        {member.bio ? (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {member.bio}
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            Contributing to MASH with expertise in{" "}
                            {member.role.toLowerCase()}.
                          </p>
                        )}

                        {/* Social Links */}
                        {member.socialLinks &&
                          Object.values(member.socialLinks).some(Boolean) && (
                            <div className="flex gap-2 pt-4 mt-4 border-t border-border">
                              {member.socialLinks.linkedin && (
                                <a
                                  href={member.socialLinks.linkedin}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 rounded-lg bg-muted hover:bg-primary/10 transition-colors"
                                >
                                  <Linkedin className="w-4 h-4 text-muted-foreground hover:text-primary" />
                                </a>
                              )}
                              {member.socialLinks.github && (
                                <a
                                  href={member.socialLinks.github}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 rounded-lg bg-muted hover:bg-primary/10 transition-colors"
                                >
                                  <Github className="w-4 h-4 text-muted-foreground hover:text-primary" />
                                </a>
                              )}
                              {member.socialLinks.facebook && (
                                <a
                                  href={member.socialLinks.facebook}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 rounded-lg bg-muted hover:bg-primary/10 transition-colors"
                                >
                                  <Facebook className="w-4 h-4 text-muted-foreground hover:text-primary" />
                                </a>
                              )}
                            </div>
                          )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </section>
      )}

      {/* Vision Section - Enhanced */}
      {vision?.isActive && (
        <section className="relative py-20 md:py-28 px-4 md:px-8 lg:px-16 overflow-hidden">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-primary" />

          {/* Decorative elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse" />
            <div
              className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-300 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: "1s" }}
            />
          </div>

          <div className="relative max-w-5xl mx-auto text-center text-primary-foreground">
            <Badge className="mb-6 bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/30 transition-colors">
              <Target className="w-3 h-3 mr-1" />
              Our Vision
            </Badge>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8 text-primary-foreground">
              {vision.title}
            </h2>

            <div className="space-y-6 text-lg md:text-xl leading-relaxed text-primary-foreground/90">
              {vision.content.map((paragraph, index) => (
                <p key={index} className="max-w-3xl mx-auto">
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="mt-12 pt-8 border-t border-primary-foreground/20">
              <div className="inline-flex items-center gap-3 bg-primary-foreground/10 backdrop-blur-sm px-8 py-4 rounded-2xl">
                <p className="text-xl md:text-2xl font-bold text-primary-foreground">
                  {vision.callToAction}
                </p>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-6 mt-16 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary-foreground mb-2">
                  7
                </div>
                <div className="text-base md:text-lg font-medium text-primary-foreground/90">
                  Team Members
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary-foreground mb-2">
                  3
                </div>
                <div className="text-base md:text-lg font-medium text-primary-foreground/90">
                  Core Systems
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary-foreground mb-2">
                  1
                </div>
                <div className="text-base md:text-lg font-medium text-primary-foreground/90">
                  Unified Platform
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
