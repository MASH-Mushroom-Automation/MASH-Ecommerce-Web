/**
 * useSanityContactPage Hook - Phase 8
 * 
 * Fetches the Contact page content from Sanity CMS singleton.
 * Includes contact methods, business hours, social links, location, and form settings.
 * 
 * @example
 * ```tsx
 * const { content, loading, error } = useSanityContactPage();
 * 
 * if (loading) return <Loading />;
 * if (error) return <Error message={error.message} />;
 * 
 * return (
 *   <div>
 *     <h1>{content.title}</h1>
 *     <p>{content.subtitle}</p>
 *     <ContactMethodsList methods={content.contactMethods} />
 *     <BusinessHours hours={content.businessHours} />
 *   </div>
 * );
 * ```
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { sanityClient } from '@/lib/sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'

// ═══════════════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

export type ContactType = 'phone' | 'email' | 'address' | 'whatsapp' | 'viber' | 'telegram' | 'messenger'

export type SocialPlatform = 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'youtube' | 'tiktok' | 'github'

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

export interface ContactMethod {
  _key: string
  type: ContactType
  label?: string
  value: string
  description?: string
  link?: string
  displayOrder: number
  icon: string // Lucide icon name
}

export interface BusinessHour {
  _key: string
  day: DayOfWeek
  dayLabel: string // Formatted: "Monday"
  openTime?: string
  closeTime?: string
  isClosed: boolean
  note?: string
  displayTime: string // Formatted: "9:00 AM - 6:00 PM" or "Closed"
}

export interface SocialLink {
  _key: string
  platform: SocialPlatform
  url: string
  handle?: string
  displayOrder: number
  icon: string // Lucide icon name
}

export interface Address {
  street?: string
  barangay?: string
  city?: string
  province?: string
  zipCode?: string
  country: string
  formatted: string // Full formatted address
}

export interface Coordinates {
  latitude?: number
  longitude?: number
}

export interface ContactPageContent {
  // Header
  title: string
  subtitle?: string
  headerImage?: {
    url: string
    alt?: string
  }

  // Contact Methods
  contactMethods: ContactMethod[]

  // Business Hours
  businessHoursTitle: string
  businessHours: BusinessHour[]
  holidayNote?: string
  timezone: string

  // Social Media
  socialMediaTitle: string
  socialLinks: SocialLink[]

  // Location
  locationTitle: string
  address?: Address
  coordinates?: Coordinates
  mapEmbedUrl?: string
  directionsLink?: string
  locationImage?: {
    url: string
    alt?: string
  }
  nearbyLandmarks?: string

  // Contact Form
  formTitle: string
  formSubtitle?: string
  formRecipientEmail?: string
  formSuccessMessage: string
  showContactForm: boolean
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
// ICON MAPPING
// ═══════════════════════════════════════════════════════════════════════════════

const CONTACT_TYPE_ICONS: Record<ContactType, string> = {
  phone: 'phone',
  email: 'mail',
  address: 'map-pin',
  whatsapp: 'message-circle',
  viber: 'phone',
  telegram: 'send',
  messenger: 'message-square',
}

const SOCIAL_PLATFORM_ICONS: Record<SocialPlatform, string> = {
  facebook: 'facebook',
  instagram: 'instagram',
  twitter: 'twitter',
  linkedin: 'linkedin',
  youtube: 'youtube',
  tiktok: 'music',
  github: 'github',
}

// ═══════════════════════════════════════════════════════════════════════════════
// GROQ QUERIES
// ═══════════════════════════════════════════════════════════════════════════════

const CONTACT_PAGE_QUERY = `*[_type == "contactPage"][0] {
  // Header
  title,
  subtitle,
  headerImage,
  
  // Contact Methods
  contactMethods[] {
    _key,
    type,
    label,
    value,
    description,
    link,
    displayOrder
  },
  
  // Business Hours
  businessHoursTitle,
  businessHours[] {
    _key,
    day,
    openTime,
    closeTime,
    isClosed,
    note
  },
  holidayNote,
  timezone,
  
  // Social Media
  socialMediaTitle,
  socialLinks[] {
    _key,
    platform,
    url,
    handle,
    displayOrder
  },
  
  // Location
  locationTitle,
  address,
  coordinates,
  mapEmbedUrl,
  directionsLink,
  locationImage,
  nearbyLandmarks,
  
  // Contact Form
  formTitle,
  formSubtitle,
  formRecipientEmail,
  formSuccessMessage,
  showContactForm
}`

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

function formatDayLabel(day: DayOfWeek): string {
  return day.charAt(0).toUpperCase() + day.slice(1)
}

function formatDisplayTime(openTime?: string, closeTime?: string, isClosed?: boolean): string {
  if (isClosed) return 'Closed'
  if (!openTime || !closeTime) return 'Hours not set'
  return `${openTime} - ${closeTime}`
}

function formatAddress(addr: any): string {
  if (!addr) return ''
  const parts = [
    addr.street,
    addr.barangay,
    addr.city,
    addr.province,
    addr.zipCode,
    addr.country,
  ].filter(Boolean)
  return parts.join(', ')
}

// ═══════════════════════════════════════════════════════════════════════════════
// TRANSFORM FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

function transformContactPage(data: any): ContactPageContent {
  // Transform contact methods
  const contactMethods: ContactMethod[] = (data?.contactMethods || [])
    .map((c: any) => ({
      _key: c._key || Math.random().toString(36).slice(2),
      type: c.type,
      label: c.label,
      value: c.value || '',
      description: c.description,
      link: c.link,
      displayOrder: c.displayOrder || 50,
      icon: CONTACT_TYPE_ICONS[c.type as ContactType] || 'circle',
    }))
    .sort((a: ContactMethod, b: ContactMethod) => a.displayOrder - b.displayOrder)

  // Transform business hours
  const businessHours: BusinessHour[] = (data?.businessHours || [])
    .map((h: any) => ({
      _key: h._key || Math.random().toString(36).slice(2),
      day: h.day,
      dayLabel: formatDayLabel(h.day),
      openTime: h.openTime,
      closeTime: h.closeTime,
      isClosed: h.isClosed || false,
      note: h.note,
      displayTime: formatDisplayTime(h.openTime, h.closeTime, h.isClosed),
    }))

  // Sort business hours by day of week
  const dayOrder: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  businessHours.sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day))

  // Transform social links
  const socialLinks: SocialLink[] = (data?.socialLinks || [])
    .map((s: any) => ({
      _key: s._key || Math.random().toString(36).slice(2),
      platform: s.platform,
      url: s.url || '',
      handle: s.handle,
      displayOrder: s.displayOrder || 50,
      icon: SOCIAL_PLATFORM_ICONS[s.platform as SocialPlatform] || 'link',
    }))
    .sort((a: SocialLink, b: SocialLink) => a.displayOrder - b.displayOrder)

  // Transform address
  const address: Address | undefined = data?.address ? {
    street: data.address.street,
    barangay: data.address.barangay,
    city: data.address.city,
    province: data.address.province,
    zipCode: data.address.zipCode,
    country: data.address.country || 'Philippines',
    formatted: formatAddress(data.address),
  } : undefined

  // Transform coordinates
  const coordinates: Coordinates | undefined = data?.coordinates ? {
    latitude: data.coordinates.latitude,
    longitude: data.coordinates.longitude,
  } : undefined

  return {
    // Header
    title: data?.title || 'Get in Touch',
    subtitle: data?.subtitle,
    headerImage: data?.headerImage ? {
      url: urlFor(data.headerImage)?.width(1920).height(400).fit('crop').url() || '',
      alt: data.headerImage.alt || 'Contact Us',
    } : undefined,

    // Contact Methods
    contactMethods,

    // Business Hours
    businessHoursTitle: data?.businessHoursTitle || 'Business Hours',
    businessHours,
    holidayNote: data?.holidayNote,
    timezone: data?.timezone || 'Philippine Time (GMT+8)',

    // Social Media
    socialMediaTitle: data?.socialMediaTitle || 'Follow Us',
    socialLinks,

    // Location
    locationTitle: data?.locationTitle || 'Visit Us',
    address,
    coordinates,
    mapEmbedUrl: data?.mapEmbedUrl,
    directionsLink: data?.directionsLink,
    locationImage: data?.locationImage ? {
      url: urlFor(data.locationImage)?.width(800).height(500).fit('crop').url() || '',
      alt: data.locationImage.alt || 'Our Location',
    } : undefined,
    nearbyLandmarks: data?.nearbyLandmarks,

    // Contact Form
    formTitle: data?.formTitle || 'Send Us a Message',
    formSubtitle: data?.formSubtitle,
    formRecipientEmail: data?.formRecipientEmail,
    formSuccessMessage: data?.formSuccessMessage || "Thank you for your message! We'll respond within 24 hours.",
    showContactForm: data?.showContactForm !== false,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export function useSanityContactPage() {
  const [content, setContent] = useState<ContactPageContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchContactPage = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await sanityClient.fetch(CONTACT_PAGE_QUERY)
      const transformedContent = transformContactPage(data)
      setContent(transformedContent)
    } catch (err) {
      console.error('[useSanityContactPage] Error fetching Contact page:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch Contact page content'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchContactPage()
  }, [fetchContactPage])

  return {
    content,
    loading,
    error,
    refetch: fetchContactPage,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Fetch only business hours (useful for footer or other pages)
 */
export function useSanityBusinessHours() {
  const [hours, setHours] = useState<BusinessHour[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchHours = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await sanityClient.fetch(`*[_type == "contactPage"][0].businessHours`)

      const businessHours: BusinessHour[] = (data || [])
        .map((h: any) => ({
          _key: h._key || Math.random().toString(36).slice(2),
          day: h.day,
          dayLabel: formatDayLabel(h.day),
          openTime: h.openTime,
          closeTime: h.closeTime,
          isClosed: h.isClosed || false,
          note: h.note,
          displayTime: formatDisplayTime(h.openTime, h.closeTime, h.isClosed),
        }))

      // Sort by day of week
      const dayOrder: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      businessHours.sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day))

      setHours(businessHours)
    } catch (err) {
      console.error('[useSanityBusinessHours] Error fetching hours:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch business hours'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHours()
  }, [fetchHours])

  return {
    hours,
    loading,
    error,
    refetch: fetchHours,
  }
}

/**
 * Fetch only contact methods (useful for footer or header)
 */
export function useSanityContactMethods() {
  const [methods, setMethods] = useState<ContactMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchMethods = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await sanityClient.fetch(`*[_type == "contactPage"][0].contactMethods`)

      const contactMethods: ContactMethod[] = (data || [])
        .map((c: any) => ({
          _key: c._key || Math.random().toString(36).slice(2),
          type: c.type,
          label: c.label,
          value: c.value || '',
          description: c.description,
          link: c.link,
          displayOrder: c.displayOrder || 50,
          icon: CONTACT_TYPE_ICONS[c.type as ContactType] || 'circle',
        }))
        .sort((a: ContactMethod, b: ContactMethod) => a.displayOrder - b.displayOrder)

      setMethods(contactMethods)
    } catch (err) {
      console.error('[useSanityContactMethods] Error fetching methods:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch contact methods'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMethods()
  }, [fetchMethods])

  return {
    methods,
    loading,
    error,
    refetch: fetchMethods,
  }
}

export default useSanityContactPage
