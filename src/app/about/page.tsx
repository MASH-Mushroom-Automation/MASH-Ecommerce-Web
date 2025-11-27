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

// Helper to convert PortableText blocks to plain strings
function portableTextToStrings(blocks: any[] | undefined): string[] {
  if (!blocks || !Array.isArray(blocks)) return [];
  
  return blocks
    .filter(block => block._type === 'block')
    .map(block => {
      if (block.children && Array.isArray(block.children)) {
        return block.children
          .filter((child: any) => child._type === 'span')
          .map((child: any) => child.text || '')
          .join('');
      }
      return '';
    })
    .filter(text => text.trim() !== '');
}

export default function AboutPage() {
  const { content, loading, error } = useSanityAboutPage();

  // Transform Sanity content to match CMSAboutSection props
  const hero = content ? {
    isActive: true,
    title: content.heroTitle,
    subtitle: content.heroSubtitle,
    backgroundImage: content.heroImage?.url,
  } : undefined;

  const challenges = content?.challenges?.length ? {
    isActive: true,
    title: content.challengesTitle || "The Challenge Facing Filipino Growers",
    subtitle: content.challengesSubtitle,
    items: content.challenges.map((c) => ({
      id: c._key,
      icon: c.icon || "AlertTriangle",
      title: c.title,
      description: c.description,
    })),
  } : undefined;

  const solutions = content?.solutions?.length ? {
    isActive: true,
    title: content.solutionsTitle || "Our Solution: The M.A.S.H. System",
    subtitle: content.solutionsSubtitle,
    solutions: content.solutions.map((s) => ({
      id: s._key,
      icon: s.icon || "CheckCircle",
      title: s.title,
      description: s.description,
    })),
  } : undefined;

  // Convert PortableText to plain strings for vision content
  const visionContentArray = portableTextToStrings(content?.visionContent);

  const vision = content?.visionTitle ? {
    isActive: true,
    title: content.visionTitle,
    content: visionContentArray.length > 0 ? visionContentArray : ["Building a sustainable future for Philippine mushroom cultivation through innovation and technology."],
    callToAction: content.visionCTA || "Join us in growing the mushroom movement!",
  } : undefined;

  const mentor = content?.mentor ? {
    isActive: true,
    title: content.mentorTitle || "Our Thesis Adviser",
    subtitle: content.mentorSubtitle || "Guiding our team towards academic excellence",
    mentor: {
      name: content.mentor.fullName,
      title: content.mentor.role || "Thesis Adviser",
      avatar: content.mentor.picture?.url,
      bio: content.mentor.shortBio,
    },
  } : undefined;

  // Transform team members from Sanity format
  const team = content?.teamMembers?.map((member) => ({
    name: member.fullName,
    role: member.role || "Team Member",
    image: member.picture?.url,
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

