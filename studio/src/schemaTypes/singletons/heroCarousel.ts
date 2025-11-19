import { defineField, defineType } from 'sanity'

export const heroCarousel = defineType({
  name: 'heroCarousel',
  title: 'Hero Carousel',
  type: 'document',
  fields: [
    defineField({
      name: 'slides',
      title: 'Hero Slides',
      type: 'array',
      description: 'Add 3-5 hero slides. Each slide can have title, subtitle, button, and optional background image.',
      validation: (Rule) => Rule.min(1).max(5),
      of: [
        {
          type: 'object',
          name: 'slide',
          title: 'Slide',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              description: 'Main headline (e.g., "Fresh Farm Mushrooms Delivered Daily")',
              validation: (Rule) => Rule.required().max(100),
            }),
            defineField({
              name: 'subtitle',
              title: 'Subtitle',
              type: 'text',
              description: 'Supporting text below title (e.g., "Premium quality from local organic farms")',
              validation: (Rule) => Rule.required().max(200),
              rows: 3,
            }),
            defineField({
              name: 'buttonText',
              title: 'Button Text',
              type: 'string',
              description: 'Call-to-action button text (e.g., "Shop Now")',
              validation: (Rule) => Rule.required().max(30),
            }),
            defineField({
              name: 'buttonLink',
              title: 'Button Link',
              type: 'string',
              description: 'Where the button links (e.g., /shop, /about, /contact)',
              validation: (Rule) => Rule.required(),
              placeholder: '/shop',
            }),
            defineField({
              name: 'buttonStyle',
              title: 'Button Style',
              type: 'string',
              description: 'Visual style of the button',
              options: {
                list: [
                  { title: 'Primary (Green)', value: 'primary' },
                  { title: 'Secondary (White)', value: 'secondary' },
                  { title: 'Ghost (Transparent)', value: 'ghost' },
                ],
                layout: 'radio',
              },
              initialValue: 'primary',
            }),
            defineField({
              name: 'image',
              title: 'Background Image (Optional)',
              type: 'image',
              description: 'Background image for the slide. Skip for gradient background.',
              options: {
                hotspot: true,
              },
            }),
            defineField({
              name: 'order',
              title: 'Order',
              type: 'number',
              description: 'Display order (1, 2, 3...). Lower numbers show first.',
              validation: (Rule) => Rule.required().min(1).max(5),
              initialValue: 1,
            }),
            defineField({
              name: 'isActive',
              title: 'Is Active',
              type: 'boolean',
              description: 'Show or hide this slide without deleting it',
              initialValue: true,
            }),
          ],
          preview: {
            select: {
              title: 'title',
              subtitle: 'subtitle',
              media: 'image',
              order: 'order',
              isActive: 'isActive',
            },
            prepare({ title, subtitle, media, order, isActive }) {
              return {
                title: `${order}. ${title}`,
                subtitle: isActive ? subtitle : '🚫 Inactive',
                media,
              }
            },
          },
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Hero Carousel',
      }
    },
  },
})
