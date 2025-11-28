/**
 * Grower / Farm Schema
 * 
 * This schema represents mushroom farms and growers that supply products to MASH.
 * It replaces the hardcoded MOCK_GROWERS data in src/lib/api/main.ts
 * 
 * Usage:
 * - Display on "Meet Our Growers" section on homepage
 * - Full growers list page (/grower)
 * - Individual grower detail pages (/grower/[slug])
 * 
 * Created: Phase 1 of SANITY_CMS_MASTER_PLAN.md
 */

import {UsersIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const grower = defineType({
  name: 'grower',
  title: 'Grower / Farm',
  type: 'document',
  icon: UsersIcon,
  groups: [
    {name: 'basic', title: 'Basic Info', default: true},
    {name: 'contact', title: 'Contact Details'},
    {name: 'location', title: 'Location & Map'},
    {name: 'products', title: 'Products'},
    {name: 'social', title: 'Social & Links'},
    {name: 'settings', title: 'Settings'},
  ],
  fields: [
    // ===== BASIC INFO =====
    defineField({
      name: 'name',
      title: 'Farm/Grower Name',
      type: 'string',
      group: 'basic',
      description: 'The name of the mushroom farm or grower',
      validation: (Rule) => Rule.required().min(2).max(100),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'basic',
      description: 'URL-friendly identifier (auto-generated from name)',
      options: {
        source: 'name',
        maxLength: 96,
        slugify: (input) =>
          input
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]+/g, '')
            .slice(0, 96),
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'logo',
      title: 'Logo/Photo',
      type: 'image',
      group: 'basic',
      description: 'Farm logo or grower photo (square format recommended)',
      options: {
        hotspot: true,
        accept: 'image/*',
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
          description: 'Describes the image for accessibility and SEO',
        },
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover/Banner Image',
      type: 'image',
      group: 'basic',
      description: 'Banner image displayed at top of grower card and profile page (landscape format recommended, 16:9 ratio)',
      options: {
        hotspot: true,
        accept: 'image/*',
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
          description: 'Describes the image for accessibility and SEO',
        },
      ],
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      group: 'basic',
      description: 'Short slogan or description (e.g., "Urban-grown gourmet mushrooms")',
      validation: (Rule) => Rule.max(150),
    }),
    defineField({
      name: 'description',
      title: 'Full Description',
      type: 'text',
      group: 'basic',
      rows: 4,
      description: 'Detailed description of the farm and their mushroom growing practices',
    }),
    defineField({
      name: 'story',
      title: 'Grower Story',
      type: 'array',
      group: 'basic',
      of: [{type: 'block'}],
      description: 'Rich text story about the grower (for detail page)',
    }),

    // ===== CONTACT DETAILS =====
    defineField({
      name: 'phone',
      title: 'Phone Number',
      type: 'string',
      group: 'contact',
      description: 'Primary contact number (e.g., +63 956 955 2808)',
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      group: 'contact',
      validation: (Rule) =>
        Rule.regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
          name: 'email',
          invert: false,
        }).warning('Please enter a valid email address'),
    }),
    defineField({
      name: 'operatingHours',
      title: 'Operating Hours',
      type: 'string',
      group: 'contact',
      description: 'e.g., "7AM - 9PM, Mon-Fri"',
    }),

    // ===== LOCATION & MAP =====
    defineField({
      name: 'location',
      title: 'Location (Short)',
      type: 'string',
      group: 'location',
      description: 'Short location name (e.g., "Caloocan City, Metro Manila")',
    }),
    defineField({
      name: 'address',
      title: 'Full Address',
      type: 'text',
      group: 'location',
      rows: 2,
      description: 'Complete street address for deliveries',
    }),
    defineField({
      name: 'coordinates',
      title: 'Map Coordinates',
      type: 'object',
      group: 'location',
      description: 'GPS coordinates for map display',
      fields: [
        {
          name: 'lat',
          title: 'Latitude',
          type: 'number',
          validation: (Rule) => Rule.min(-90).max(90),
        },
        {
          name: 'lng',
          title: 'Longitude',
          type: 'number',
          validation: (Rule) => Rule.min(-180).max(180),
        },
      ],
    }),
    defineField({
      name: 'deliveryZones',
      title: 'Delivery Zones',
      type: 'array',
      group: 'location',
      of: [{type: 'string'}],
      description: 'Areas where this grower delivers',
      options: {
        layout: 'tags',
      },
    }),

    // ===== PRODUCTS =====
    defineField({
      name: 'featuredProducts',
      title: 'Featured Products',
      type: 'array',
      group: 'products',
      of: [{type: 'reference', to: [{type: 'product'}]}],
      description: 'Products from this grower to showcase',
      validation: (Rule) => Rule.max(8),
    }),
    defineField({
      name: 'suppliesTo',
      title: 'Supplies To (Stores)',
      type: 'array',
      group: 'products',
      of: [{type: 'reference', to: [{type: 'store'}]}],
      description: 'Store locations this grower supplies mushrooms to',
      validation: (Rule) => Rule.max(10),
    }),
    defineField({
      name: 'specialties',
      title: 'Mushroom Specialties',
      type: 'array',
      group: 'products',
      of: [{type: 'string'}],
      description: 'Types of mushrooms this grower specializes in',
      options: {
        list: [
          {title: 'Oyster Mushrooms', value: 'oyster'},
          {title: 'Shiitake', value: 'shiitake'},
          {title: "Lion's Mane", value: 'lions-mane'},
          {title: 'King Trumpet', value: 'king-trumpet'},
          {title: 'Enoki', value: 'enoki'},
          {title: 'Maitake', value: 'maitake'},
          {title: 'Reishi', value: 'reishi'},
          {title: 'Chanterelle', value: 'chanterelle'},
          {title: 'Portobello', value: 'portobello'},
          {title: 'White Button', value: 'white-button'},
        ],
      },
    }),

    // ===== CERTIFICATIONS =====
    defineField({
      name: 'certifications',
      title: 'Certifications',
      type: 'array',
      group: 'products',
      of: [{type: 'string'}],
      description: 'Quality and safety certifications',
      options: {
        list: [
          {title: 'Organic Certified', value: 'organic'},
          {title: 'GAP Certified (Good Agricultural Practices)', value: 'gap'},
          {title: 'HACCP', value: 'haccp'},
          {title: 'FDA Registered', value: 'fda'},
          {title: 'ISO Certified', value: 'iso'},
          {title: 'BFAD Approved', value: 'bfad'},
        ],
      },
    }),

    // ===== SOCIAL & LINKS =====
    defineField({
      name: 'socialLinks',
      title: 'Social Media',
      type: 'object',
      group: 'social',
      fields: [
        {
          name: 'facebook',
          title: 'Facebook',
          type: 'url',
          validation: (Rule) =>
            Rule.uri({scheme: ['http', 'https']}).warning('Please enter a valid URL'),
        },
        {
          name: 'instagram',
          title: 'Instagram',
          type: 'url',
          validation: (Rule) =>
            Rule.uri({scheme: ['http', 'https']}).warning('Please enter a valid URL'),
        },
        {
          name: 'tiktok',
          title: 'TikTok',
          type: 'url',
          validation: (Rule) =>
            Rule.uri({scheme: ['http', 'https']}).warning('Please enter a valid URL'),
        },
        {
          name: 'website',
          title: 'Website',
          type: 'url',
          validation: (Rule) =>
            Rule.uri({scheme: ['http', 'https']}).warning('Please enter a valid URL'),
        },
      ],
    }),

    // ===== SETTINGS =====
    defineField({
      name: 'isFeatured',
      title: 'Featured Grower',
      type: 'boolean',
      group: 'settings',
      description: 'Show on homepage "Meet Our Growers" section',
      initialValue: false,
    }),
    defineField({
      name: 'isActive',
      title: 'Is Active',
      type: 'boolean',
      group: 'settings',
      description: 'Only active growers are displayed on the website',
      initialValue: true,
    }),
    defineField({
      name: 'isVerified',
      title: 'Verified Seller',
      type: 'boolean',
      group: 'settings',
      description: 'Indicates this is a verified and trusted seller',
      initialValue: false,
    }),
    defineField({
      name: 'sortOrder',
      title: 'Sort Order',
      type: 'number',
      group: 'settings',
      description: 'Lower numbers appear first (0 = highest priority)',
      initialValue: 0,
    }),
    defineField({
      name: 'joinedDate',
      title: 'Joined Date',
      type: 'date',
      group: 'settings',
      description: 'When this grower joined MASH',
      options: {
        dateFormat: 'MMMM D, YYYY',
      },
    }),
  ],

  // Preview configuration for Sanity Studio
  preview: {
    select: {
      title: 'name',
      subtitle: 'location',
      media: 'logo',
      isFeatured: 'isFeatured',
      isActive: 'isActive',
    },
    prepare({title, subtitle, media, isFeatured, isActive}) {
      const badges = []
      if (isFeatured) badges.push('⭐ Featured')
      if (!isActive) badges.push('🔴 Inactive')

      return {
        title,
        subtitle: badges.length > 0 ? `${subtitle} • ${badges.join(' ')}` : subtitle,
        media,
      }
    },
  },

  // Default ordering in Sanity Studio
  orderings: [
    {
      title: 'Sort Order',
      name: 'sortOrderAsc',
      by: [{field: 'sortOrder', direction: 'asc'}],
    },
    {
      title: 'Name A-Z',
      name: 'nameAsc',
      by: [{field: 'name', direction: 'asc'}],
    },
    {
      title: 'Newest First',
      name: 'joinedDateDesc',
      by: [{field: 'joinedDate', direction: 'desc'}],
    },
  ],
})
