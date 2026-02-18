/**
 * Review Schema
 *
 * Unified review document supporting both product and grower reviews.
 * Connected to Firebase Firestore for real-time user reviews and also
 * available in Sanity CMS for admin moderation and content management.
 *
 * Supports: Products, Growers/Farms
 * Features: Star ratings, images, moderation, verified purchase badges,
 *           helpful votes, admin response, and review flagging.
 */

import {StarIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const review = defineType({
  name: 'review',
  title: 'Review',
  type: 'document',
  icon: StarIcon,
  groups: [
    {name: 'content', title: 'Review Content', default: true},
    {name: 'target', title: 'Reviewed Entity'},
    {name: 'moderation', title: 'Moderation'},
    {name: 'metadata', title: 'Metadata'},
  ],
  fields: [
    // ===== TARGET ENTITY =====
    defineField({
      name: 'targetType',
      title: 'Review Type',
      type: 'string',
      group: 'target',
      options: {
        list: [
          {title: 'Product Review', value: 'product'},
          {title: 'Grower/Farm Review', value: 'grower'},
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
      description: 'What is being reviewed - a product or a grower/farm',
    }),
    defineField({
      name: 'product',
      title: 'Product',
      type: 'reference',
      to: [{type: 'product'}],
      group: 'target',
      hidden: ({document}) => document?.targetType !== 'product',
      validation: (rule) =>
        rule.custom((value, context) => {
          const doc = context.document
          if (doc?.targetType === 'product' && !value) {
            return 'Product is required for product reviews'
          }
          return true
        }),
      description: 'The product being reviewed',
    }),
    defineField({
      name: 'grower',
      title: 'Grower / Farm',
      type: 'reference',
      to: [{type: 'grower'}],
      group: 'target',
      hidden: ({document}) => document?.targetType !== 'grower',
      validation: (rule) =>
        rule.custom((value, context) => {
          const doc = context.document
          if (doc?.targetType === 'grower' && !value) {
            return 'Grower is required for grower reviews'
          }
          return true
        }),
      description: 'The grower/farm being reviewed',
    }),
    defineField({
      name: 'targetId',
      title: 'Target ID (Firebase)',
      type: 'string',
      group: 'target',
      description: 'Firebase targetId for syncing with Firestore reviews. Auto-populated from the referenced entity.',
      readOnly: true,
    }),

    // ===== REVIEW CONTENT =====
    defineField({
      name: 'customerName',
      title: 'Customer Name',
      type: 'string',
      group: 'content',
      validation: (rule) => rule.required().min(2).max(100),
    }),
    defineField({
      name: 'customerEmail',
      title: 'Customer Email',
      type: 'email',
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'customerPhotoURL',
      title: 'Customer Photo URL',
      type: 'url',
      group: 'content',
      description: 'Profile photo URL from Firebase Auth',
    }),
    defineField({
      name: 'firebaseUserId',
      title: 'Firebase User ID',
      type: 'string',
      group: 'content',
      description: 'Firebase Auth UID of the reviewer',
      readOnly: true,
    }),
    defineField({
      name: 'rating',
      title: 'Rating',
      type: 'number',
      group: 'content',
      validation: (rule) => rule.required().min(1).max(5).integer(),
      description: '1-5 stars',
    }),
    defineField({
      name: 'title',
      title: 'Review Title',
      type: 'string',
      group: 'content',
      validation: (rule) => rule.required().min(3).max(100),
      description: 'Short summary of the review',
    }),
    defineField({
      name: 'content',
      title: 'Review Content',
      type: 'text',
      rows: 5,
      group: 'content',
      validation: (rule) => rule.required().min(10).max(2000),
      description: 'Detailed review text',
    }),
    defineField({
      name: 'images',
      title: 'Review Images',
      type: 'array',
      group: 'content',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
          },
        },
      ],
      description: 'Customer photos (product or farm visit)',
      options: {
        layout: 'grid',
      },
      validation: (rule) => rule.max(5),
    }),
    defineField({
      name: 'verifiedPurchase',
      title: 'Verified Purchase',
      type: 'boolean',
      group: 'content',
      initialValue: false,
      description: 'Customer actually purchased this product or visited this farm',
    }),

    // ===== MODERATION =====
    defineField({
      name: 'status',
      title: 'Review Status',
      type: 'string',
      group: 'moderation',
      options: {
        list: [
          {title: 'Pending Review', value: 'pending'},
          {title: 'Approved', value: 'approved'},
          {title: 'Rejected', value: 'rejected'},
          {title: 'Flagged', value: 'flagged'},
        ],
        layout: 'radio',
      },
      initialValue: 'approved',
      description: 'Moderation status. Firebase reviews auto-approve; Sanity reviews can be moderated.',
    }),
    defineField({
      name: 'rejectionReason',
      title: 'Rejection Reason',
      type: 'text',
      rows: 3,
      group: 'moderation',
      hidden: ({document}) => document?.status !== 'rejected',
      description: 'Why was this review rejected?',
    }),
    defineField({
      name: 'adminResponse',
      title: 'Admin/Seller Response',
      type: 'text',
      rows: 4,
      group: 'moderation',
      description: 'Official response from the seller or admin to this review',
    }),
    defineField({
      name: 'adminResponseDate',
      title: 'Response Date',
      type: 'datetime',
      group: 'moderation',
      hidden: ({document}) => !document?.adminResponse,
      readOnly: true,
    }),
    defineField({
      name: 'flagCount',
      title: 'Flag Count',
      type: 'number',
      group: 'moderation',
      initialValue: 0,
      validation: (rule) => rule.min(0).integer(),
      description: 'Number of times this review has been flagged by users',
    }),
    defineField({
      name: 'flagReasons',
      title: 'Flag Reasons',
      type: 'array',
      group: 'moderation',
      of: [{type: 'string'}],
      hidden: ({document}) => !document?.flagCount || (document?.flagCount as number) === 0,
      description: 'Reasons users have flagged this review',
    }),

    // ===== METADATA =====
    defineField({
      name: 'helpfulCount',
      title: 'Helpful Votes',
      type: 'number',
      group: 'metadata',
      initialValue: 0,
      validation: (rule) => rule.min(0).integer(),
      description: 'Number of people who found this review helpful',
    }),
    defineField({
      name: 'reviewDate',
      title: 'Review Date',
      type: 'datetime',
      group: 'metadata',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'firebaseReviewId',
      title: 'Firebase Review ID',
      type: 'string',
      group: 'metadata',
      description: 'Corresponding Firestore document ID for synced reviews',
      readOnly: true,
    }),
    defineField({
      name: 'moderatedBy',
      title: 'Moderated By',
      type: 'string',
      group: 'metadata',
      description: 'Admin who moderated this review',
      readOnly: true,
    }),
    defineField({
      name: 'moderatedAt',
      title: 'Moderated At',
      type: 'datetime',
      group: 'metadata',
      description: 'When the review was moderated',
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      rating: 'rating',
      customer: 'customerName',
      status: 'status',
      targetType: 'targetType',
      productName: 'product.name',
      growerName: 'grower.name',
      verifiedPurchase: 'verifiedPurchase',
    },
    prepare({title, rating, customer, status, targetType, productName, growerName, verifiedPurchase}) {
      const stars = rating ? '★'.repeat(rating) + '☆'.repeat(5 - rating) : '☆☆☆☆☆'
      const verified = verifiedPurchase ? ' [Verified]' : ''
      const statusLabel =
        status === 'approved'
          ? '[OK]'
          : status === 'rejected'
            ? '[REJ]'
            : status === 'flagged'
              ? '[FLAG]'
              : '[PEND]'
      const entityName = targetType === 'grower' ? growerName : productName
      const typeLabel = targetType === 'grower' ? 'Grower' : 'Product'

      return {
        title: `${stars} ${title || 'Untitled Review'}`,
        subtitle: `${customer || 'Unknown'}${verified} | ${typeLabel}: ${entityName || 'N/A'} ${statusLabel}`,
      }
    },
  },
  orderings: [
    {
      title: 'Newest First',
      name: 'newestFirst',
      by: [{field: 'reviewDate', direction: 'desc'}],
    },
    {
      title: 'Highest Rated',
      name: 'highestRated',
      by: [{field: 'rating', direction: 'desc'}],
    },
    {
      title: 'Lowest Rated',
      name: 'lowestRated',
      by: [{field: 'rating', direction: 'asc'}],
    },
    {
      title: 'Most Helpful',
      name: 'mostHelpful',
      by: [{field: 'helpfulCount', direction: 'desc'}],
    },
    {
      title: 'Most Flagged',
      name: 'mostFlagged',
      by: [{field: 'flagCount', direction: 'desc'}],
    },
  ],
})
