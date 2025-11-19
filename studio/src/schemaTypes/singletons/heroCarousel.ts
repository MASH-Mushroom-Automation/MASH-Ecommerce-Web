import { defineField, defineType } from 'sanity'

export const heroCarousel = defineType({
  name: 'heroCarousel',
  title: 'Hero Carousel',
  type: 'document',
  fields: [
    defineField({
      name: 'slides',
      title: 'Carousel Slides',
      type: 'array',
      validation: (Rule) => Rule.required().min(1).max(5),
      of: [
        {
          type: 'object',
          name: 'slide',
          title: 'Slide',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'text',
              description: 'Main title of the slide (use \\n for line breaks)',
              validation: (Rule) => Rule.required(),
              rows: 3,
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'text',
              description: 'Slide description (supports HTML tags like <b>)',
              validation: (Rule) => Rule.required(),
              rows: 2,
            }),
            defineField({
              name: 'image',
              title: 'Background Image',
              type: 'image',
              description: 'Background image for the slide',
              validation: (Rule) => Rule.required(),
              options: {
                hotspot: true,
              },
            }),
            defineField({
              name: 'buttonText',
              title: 'Button Text',
              type: 'string',
              description: 'Text displayed on the call-to-action button',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'buttonLink',
              title: 'Button Link',
              type: 'url',
              description: 'URL the button links to (can be external or internal)',
              validation: (Rule) => Rule.required().uri({
                allowRelative: true,
                scheme: ['http', 'https', 'mailto', 'tel'],
              }),
            }),
            defineField({
              name: 'eventBubbleIcon',
              title: 'Event Bubble Icon',
              type: 'image',
              description: 'Small icon displayed in the event bubble',
              options: {
                hotspot: true,
              },
            }),
            defineField({
              name: 'eventBubbleText',
              title: 'Event Bubble Text',
              type: 'string',
              description: 'Text displayed next to the event bubble icon',
            }),
          ],
          preview: {
            select: {
              title: 'title',
              media: 'image',
            },
            prepare({ title, media }) {
              return {
                title: title?.replace(/\n/g, ' '),
                media,
              }
            },
          },
        },
      ],
    }),
    defineField({
      name: 'settings',
      title: 'Carousel Settings',
      type: 'object',
      fields: [
        defineField({
          name: 'autoPlay',
          title: 'Auto Play',
          type: 'boolean',
          description: 'Automatically advance slides',
          initialValue: true,
        }),
        defineField({
          name: 'autoPlayInterval',
          title: 'Auto Play Interval (ms)',
          type: 'number',
          description: 'Time between slide transitions in milliseconds',
          validation: (Rule) => Rule.min(1000).max(10000),
          initialValue: 5000,
          hidden: ({ parent }) => !parent?.autoPlay,
        }),
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
