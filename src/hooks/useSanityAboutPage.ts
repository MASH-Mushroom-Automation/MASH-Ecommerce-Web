/**
 * useSanityAboutPage Hook - Phase 8
 * 
 * Fetches the About page content from Sanity CMS singleton.
 * Includes hero section, challenges, solutions, vision, mentor, and team members.
 * 
 * @example
 * ```tsx
 * const { content, loading, error } = useSanityAboutPage();
 * 
 * if (loading) return <Loading />;
 * if (error) return <Error message={error.message} />;
 * 
 * return (
 *   <div>
 *     <h1>{content.heroTitle}</h1>
 *     <p>{content.heroSubtitle}</p>
 *     <TeamSection members={content.teamMembers} />
 *   </div>
 * );
 * ```
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { sanityClient } from '@/lib/sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'
import type { PortableTextBlock } from '@portabletext/types'

// ═══════════════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

interface SanityImage {
  _type: 'image'
  asset: {
    _ref: string
    _type: 'reference'
  }
  hotspot?: {
    x: number
    y: number
    width: number
    height: number
  }
  alt?: string
}

interface Challenge {
  _key: string
  title: string
  description: string
  icon?: string
}

interface Solution {
  _key: string
  title: string
  description: string
  icon?: string
  image?: SanityImage
}

interface SocialLinks {
  facebook?: string
  twitter?: string
  instagram?: string
  linkedin?: string
  github?: string
  tiktok?: string
}

interface TeamMember {
  _id: string
  firstName: string
  lastName: string
  fullName: string
  role?: string
  personType?: 'team' | 'mentor' | 'author' | 'partner'
  shortBio?: string
  bio?: PortableTextBlock[]
  email?: string
  phone?: string
  website?: string
  specializations?: string[]
  socialLinks?: SocialLinks
  picture: {
    url: string
    alt?: string
  }
  displayOrder?: number
  isFeatured?: boolean
}

interface Mentor extends TeamMember {
  // Mentor is just a specialized team member
}

export interface AboutPageContent {
  // Hero
  heroTitle: string
  heroSubtitle?: string
  heroImage?: {
    url: string
    alt?: string
  }

  // Challenges
  challengesTitle?: string
  challengesSubtitle?: string
  challenges: Challenge[]

  // Solutions
  solutionsTitle?: string
  solutionsSubtitle?: string
  solutionsAcronym?: string
  solutions: Solution[]

  // Vision
  visionTitle?: string
  visionContent?: PortableTextBlock[]
  visionCTA?: string
  visionImage?: {
    url: string
    alt?: string
  }

  // Mentor
  mentorTitle?: string
  mentorSubtitle?: string
  mentor?: Mentor

  // Team
  teamTitle?: string
  teamSubtitle?: string
  teamMembers: TeamMember[]
  autoFetchTeam?: boolean
}

// ═══════════════════════════════════════════════════════════════════════════════
// IMAGE URL BUILDER
// ═══════════════════════════════════════════════════════════════════════════════

const builder = imageUrlBuilder(sanityClient)

function urlFor(source: SanityImageSource | undefined) {
  if (!source) return null
  return builder.image(source)
}

// ═══════════════════════════════════════════════════════════════════════════════
// GROQ QUERIES
// ═══════════════════════════════════════════════════════════════════════════════

const ABOUT_PAGE_QUERY = `*[_type == "aboutPage"][0] {
  // Hero
  heroTitle,
  heroSubtitle,
  heroImage,
  
  // Challenges
  challengesTitle,
  challengesSubtitle,
  challenges[] {
    _key,
    title,
    description,
    icon
  },
  
  // Solutions
  solutionsTitle,
  solutionsSubtitle,
  solutionsAcronym,
  solutions[] {
    _key,
    title,
    description,
    icon,
    image
  },
  
  // Vision
  visionTitle,
  visionContent,
  visionCTA,
  visionImage,
  
  // Mentor
  mentorTitle,
  mentorSubtitle,
  mentor-> {
    _id,
    firstName,
    lastName,
    role,
    personType,
    shortBio,
    bio,
    email,
    phone,
    website,
    specializations,
    socialLinks,
    picture
  },
  
  // Team
  teamTitle,
  teamSubtitle,
  autoFetchTeam,
  teamMembers[]-> {
    _id,
    firstName,
    lastName,
    role,
    personType,
    shortBio,
    bio,
    email,
    phone,
    website,
    specializations,
    socialLinks,
    picture,
    displayOrder,
    isFeatured
  }
}`

// Fetch only team members (exclude mentors - they have their own section)
const TEAM_MEMBERS_QUERY = `*[_type == "person" && showOnAboutPage == true && isActive == true && personType != "mentor"] | order(displayOrder asc) {
  _id,
  firstName,
  lastName,
  role,
  personType,
  shortBio,
  bio,
  email,
  phone,
  website,
  specializations,
  socialLinks,
  picture,
  displayOrder,
  isFeatured
}`

// ═══════════════════════════════════════════════════════════════════════════════
// TRANSFORM FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

function transformTeamMember(member: any): TeamMember | null {
  if (!member) return null

  return {
    _id: member._id,
    firstName: member.firstName || '',
    lastName: member.lastName || '',
    fullName: `${member.firstName || ''} ${member.lastName || ''}`.trim(),
    role: member.role,
    personType: member.personType,
    shortBio: member.shortBio,
    bio: member.bio,
    email: member.email,
    phone: member.phone,
    website: member.website,
    specializations: member.specializations || [],
    socialLinks: member.socialLinks,
    picture: {
      url: member.picture ? urlFor(member.picture)?.width(400).height(400).fit('crop').url() || '/placeholder-avatar.jpg' : '/placeholder-avatar.jpg',
      alt: member.picture?.alt || `${member.firstName} ${member.lastName}`,
    },
    displayOrder: member.displayOrder || 50,
    isFeatured: member.isFeatured || false,
  }
}

function transformAboutPage(data: any, teamMembers: any[]): AboutPageContent {
  // Transform challenges
  const challenges: Challenge[] = (data?.challenges || []).map((c: any) => ({
    _key: c._key,
    title: c.title || '',
    description: c.description || '',
    icon: c.icon,
  }))

  // Transform solutions
  const solutions: Solution[] = (data?.solutions || []).map((s: any) => ({
    _key: s._key,
    title: s.title || '',
    description: s.description || '',
    icon: s.icon,
    image: s.image,
  }))

  // Transform mentor
  const mentor = transformTeamMember(data?.mentor)

  // Use provided team members or auto-fetched ones
  const useAutoFetch = data?.autoFetchTeam !== false
  const rawTeamMembers = useAutoFetch ? teamMembers : (data?.teamMembers || [])
  const transformedTeamMembers = rawTeamMembers
    .map(transformTeamMember)
    .filter((m): m is TeamMember => m !== null)
    .sort((a, b) => (a.displayOrder || 50) - (b.displayOrder || 50))

  return {
    // Hero
    heroTitle: data?.heroTitle || 'Cultivating the Future of Philippine Agriculture',
    heroSubtitle: data?.heroSubtitle,
    heroImage: data?.heroImage ? {
      url: urlFor(data.heroImage)?.width(1920).height(800).fit('crop').url() || '',
      alt: data.heroImage.alt || 'About MASH',
    } : undefined,

    // Challenges
    challengesTitle: data?.challengesTitle || 'The Challenge Facing Filipino Growers',
    challengesSubtitle: data?.challengesSubtitle,
    challenges,

    // Solutions
    solutionsTitle: data?.solutionsTitle || 'Our Solution: The M.A.S.H. System',
    solutionsSubtitle: data?.solutionsSubtitle,
    solutionsAcronym: data?.solutionsAcronym,
    solutions,

    // Vision
    visionTitle: data?.visionTitle || 'Our Vision for a Greener Tomorrow',
    visionContent: data?.visionContent,
    visionCTA: data?.visionCTA || 'Join us in growing the mushroom movement!',
    visionImage: data?.visionImage ? {
      url: urlFor(data.visionImage)?.width(800).height(600).fit('crop').url() || '',
      alt: data.visionImage.alt || 'Our Vision',
    } : undefined,

    // Mentor
    mentorTitle: data?.mentorTitle || 'Our Academic Adviser',
    mentorSubtitle: data?.mentorSubtitle,
    mentor: mentor || undefined,

    // Team
    teamTitle: data?.teamTitle || 'Meet the Team',
    teamSubtitle: data?.teamSubtitle,
    teamMembers: transformedTeamMembers,
    autoFetchTeam: useAutoFetch,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export function useSanityAboutPage() {
  const [content, setContent] = useState<AboutPageContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchAboutPage = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch About page singleton and auto-fetch team members in parallel
      const [aboutData, teamMembers] = await Promise.all([
        sanityClient.fetch(ABOUT_PAGE_QUERY),
        sanityClient.fetch(TEAM_MEMBERS_QUERY),
      ])

      const transformedContent = transformAboutPage(aboutData, teamMembers)
      setContent(transformedContent)
    } catch (err) {
      console.error('[useSanityAboutPage] Error fetching About page:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch About page content'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAboutPage()
  }, [fetchAboutPage])

  return {
    content,
    loading,
    error,
    refetch: fetchAboutPage,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Fetch only team members (useful for other pages that show team)
 */
export function useSanityTeamMembers() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchTeamMembers = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await sanityClient.fetch(TEAM_MEMBERS_QUERY)
      const transformedMembers = (data || [])
        .map(transformTeamMember)
        .filter((m): m is TeamMember => m !== null)
        .sort((a, b) => (a.displayOrder || 50) - (b.displayOrder || 50))

      setMembers(transformedMembers)
    } catch (err) {
      console.error('[useSanityTeamMembers] Error fetching team members:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch team members'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTeamMembers()
  }, [fetchTeamMembers])

  return {
    members,
    loading,
    error,
    refetch: fetchTeamMembers,
  }
}

/**
 * Fetch a single team member by ID
 */
export function useSanityTeamMember(memberId: string) {
  const [member, setMember] = useState<TeamMember | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchMember = useCallback(async () => {
    if (!memberId) {
      setMember(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await sanityClient.fetch(
        `*[_type == "person" && _id == $id][0] {
          _id,
          firstName,
          lastName,
          role,
          personType,
          shortBio,
          bio,
          email,
          phone,
          website,
          specializations,
          socialLinks,
          picture,
          displayOrder,
          isFeatured
        }`,
        { id: memberId }
      )

      setMember(transformTeamMember(data))
    } catch (err) {
      console.error('[useSanityTeamMember] Error fetching member:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch team member'))
    } finally {
      setLoading(false)
    }
  }, [memberId])

  useEffect(() => {
    fetchMember()
  }, [fetchMember])

  return {
    member,
    loading,
    error,
    refetch: fetchMember,
  }
}

export default useSanityAboutPage
