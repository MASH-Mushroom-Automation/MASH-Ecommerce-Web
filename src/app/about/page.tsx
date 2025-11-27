"use client";

import { CMSAboutSection } from "@/components/cms/AboutSection";
import { useSanityAboutPage } from "@/hooks/useSanityAboutPage";

/**
 * About Page - Phase 8
 * 
 * Now powered by Sanity CMS using the aboutPage singleton.
 * Content is managed in Sanity Studio under Settings → About Page.
 * 
 * Features:
 * - Hero section with title, subtitle, and background image
 * - Challenges section with problem statements
 * - Solutions section with MASH's approach
 * - Vision section for future goals
 * - Mentor section with thesis adviser info
 * - Team members section (fetched from person documents)
 */
export default function AboutPage() {
  const { content, loading, error } = useSanityAboutPage();

  // Transform Sanity content to match CMSAboutSection props
  const hero = content ? {
    title: content.heroTitle,
    subtitle: content.heroSubtitle,
    backgroundImage: content.heroImage,
  } : undefined;

  const challenges = content?.challenges ? {
    title: content.challengesTitle,
    subtitle: content.challengesSubtitle,
    items: content.challenges.map((c) => ({
      id: c._key,
      icon: c.icon || "AlertTriangle",
      title: c.title,
      description: c.description,
    })),
  } : undefined;

  const solutions = content?.solutions ? {
    title: content.solutionsTitle,
    subtitle: content.solutionsSubtitle,
    items: content.solutions.map((s) => ({
      id: s._key,
      icon: s.icon || "CheckCircle",
      title: s.title,
      description: s.description,
    })),
  } : undefined;

  const vision = content ? {
    title: content.visionTitle,
    subtitle: content.visionSubtitle,
    description: content.visionDescription,
    image: content.visionImage,
    goals: content.visionGoals || [],
  } : undefined;

  const mentor = content?.mentor ? {
    title: "Our Thesis Adviser",
    subtitle: content.mentorSubtitle,
    name: content.mentor.name,
    role: content.mentor.role,
    bio: content.mentor.bio,
    image: content.mentor.picture,
    credentials: content.mentor.specializations || [],
  } : undefined;

  // Transform team members from Sanity format
  const team = content?.teamMembers?.map((member) => ({
    name: member.name,
    role: member.role || "Team Member",
    image: member.picture,
    bio: member.shortBio,
    socialLinks: member.socialLinks,
  })) || [];

  return (
    <CMSAboutSection
      hero={hero}
      challenges={challenges}
      solutions={solutions}
      vision={vision}
      mentor={mentor}
      team={team}
      loading={loading}
      error={error?.message}
    />
  );
}

