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
    .filter((block) => block._type === "block")
    .map((block) => {
      if (block.children && Array.isArray(block.children)) {
        return block.children
          .filter((child: any) => child._type === "span")
          .map((child: any) => child.text || "")
          .join("");
      }
      return "";
    })
    .filter((text) => text.trim() !== "");
}

// Default team data (used as fallback if Sanity has no team members)
const DEFAULT_TEAM = [
  {
    name: "Jhon Keneth Ryan B. Namias",
    role: "Project Manager",
    bio: "Leading the MASH project with expertise in project management, full-stack development, and team coordination.",
  },
  {
    name: "Kevin A. Llanes",
    role: "Software Engineer",
    bio: "Developing robust software solutions for the MASH mushroom automation system.",
  },
  {
    name: "Irheil Mae S. Antang",
    role: "Software Engineer",
    bio: "Developing robust software solutions for the MASH mushroom automation system.",
  },
  {
    name: "Ma. Catherine H. Bae",
    role: "Front-end Developer",
    bio: "Crafting beautiful and responsive user interfaces for the MASH e-commerce platform.",
  },
  {
    name: "Jin Harold A. Failana",
    role: "Hardware Programmer",
    bio: "Programming IoT devices and sensors for mushroom cultivation automation.",
  },
  {
    name: "Emannuel L. Pabua",
    role: "Database Administrator",
    bio: "Managing and optimizing databases for efficient data storage and retrieval.",
  },
  {
    name: "Ronan Renz T. Valencia",
    role: "Full Stack Developer",
    bio: "Developing end-to-end solutions across the entire MASH technology stack.",
  },
];

// Default challenges (common issues in mushroom farming)
const DEFAULT_CHALLENGES = [
  "Manual monitoring of temperature and humidity is time-consuming and error-prone",
  "Inconsistent growing conditions lead to lower yields and quality",
  "Lack of real-time data makes it difficult to optimize growing parameters",
  "Limited access to markets and buyers for small-scale growers",
];

// Default solutions (MASH system benefits)
const DEFAULT_SOLUTIONS = [
  {
    id: "m",
    title: "M - Monitoring",
    description:
      "Real-time IoT sensors track temperature, humidity, and CO2 levels 24/7",
  },
  {
    id: "a",
    title: "A - Automation",
    description:
      "Smart controllers automatically adjust growing conditions for optimal yield",
  },
  {
    id: "s",
    title: "S - Sales",
    description: "E-commerce platform connects growers directly with buyers",
  },
  {
    id: "h",
    title: "H - Hub",
    description: "Central dashboard for managing multiple growing facilities",
  },
];

export default function AboutPage() {
  const { content, loading, error } = useSanityAboutPage();

  // Transform Sanity content to match CMSAboutSection props
  const hero = {
    isActive: true,
    title:
      content?.heroTitle || "Cultivating the Future of Philippine Agriculture",
    subtitle:
      content?.heroSubtitle ||
      "MASH combines IoT technology with sustainable farming practices to revolutionize mushroom cultivation in the Philippines.",
    backgroundImage: content?.heroImage?.url,
  };

  // Transform challenges - expects array of strings
  const challengeStrings = content?.challenges?.length
    ? content.challenges.map((c) => c.description || c.title)
    : DEFAULT_CHALLENGES;

  const challenges = {
    isActive: true,
    title: content?.challengesTitle || "The Challenge Facing Filipino Growers",
    subtitle:
      content?.challengesSubtitle ||
      "Small-scale mushroom farmers face numerous obstacles",
    challenges: challengeStrings,
  };

  // Transform solutions - expects array of { id, title, description }
  const solutionItems = content?.solutions?.length
    ? content.solutions.map((s) => ({
        id: s._key,
        title: s.title,
        description: s.description,
      }))
    : DEFAULT_SOLUTIONS;

  const solutions = {
    isActive: true,
    title: content?.solutionsTitle || "Our Solution: The M.A.S.H. System",
    subtitle:
      content?.solutionsSubtitle ||
      "A comprehensive platform for modern mushroom farming",
    solutions: solutionItems,
  };

  // Convert PortableText to plain strings for vision content
  const visionContentArray = portableTextToStrings(content?.visionContent);

  const vision = {
    isActive: true,
    title: content?.visionTitle || "Our Vision for a Greener Tomorrow",
    content:
      visionContentArray.length > 0
        ? visionContentArray
        : [
            "We envision a future where every Filipino mushroom grower has access to smart farming technology.",
            "Through innovation and community, we're building a sustainable agricultural ecosystem.",
          ],
    callToAction:
      content?.visionCTA || "Join us in growing the mushroom movement!",
  };

  const mentor = content?.mentor
    ? {
        isActive: true,
        title: content.mentorTitle || "Our Thesis Adviser",
        subtitle:
          content.mentorSubtitle ||
          "Guiding our team towards academic excellence",
        mentor: {
          name: content.mentor.fullName,
          title: content.mentor.role || "Thesis Adviser",
          avatar: content.mentor.picture?.url,
          bio: content.mentor.shortBio,
        },
      }
    : undefined;

  // Transform team members from Sanity format, fallback to default team
  const sanityTeam =
    content?.teamMembers?.map((member) => ({
      name: member.fullName,
      role: member.role || "Team Member",
      image: member.picture?.url,
      bio: member.shortBio,
      socialLinks: member.socialLinks,
    })) || [];

  // Use Sanity team if available, otherwise use default
  const teamData = sanityTeam.length > 0 ? sanityTeam : DEFAULT_TEAM;

  // Deduplicate by name (keep first occurrence)
  const team = teamData.filter(
    (member, index, self) =>
      index === self.findIndex((m) => m.name === member.name),
  );

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
