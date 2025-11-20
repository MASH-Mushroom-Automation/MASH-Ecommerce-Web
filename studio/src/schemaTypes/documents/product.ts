import {PackageIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const product = defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  icon: PackageIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Product Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Product Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{type: 'category'}],
      validation: (rule) => rule.required(),
      description: 'Select the most specific category (subcategory if available)',
    }),
    defineField({
      name: 'price',
      title: 'Regular Price',
      type: 'number',
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: 'isOnPromo',
      title: 'On Promotion',
      type: 'boolean',
      initialValue: false,
      description: 'Enable this to put the product on promotion',
    }),
    defineField({
      name: 'promoType',
      title: 'Promotion Type',
      type: 'string',
      options: {
        list: [
          {title: 'Percentage Discount', value: 'percentage'},
          {title: 'Fixed Price', value: 'fixed'},
        ],
        layout: 'radio',
      },
      hidden: ({document}) => !document?.isOnPromo,
      validation: (rule) =>
        rule.custom((promoType, context) => {
          const {document} = context as {document: any}
          if (document?.isOnPromo && !promoType) {
            return 'Please select a promotion type'
          }
          return true
        }),
    }),
    defineField({
      name: 'promoPercentage',
      title: 'Discount Percentage',
      type: 'number',
      description: 'Enter discount percentage (e.g., 20 for 20% off)',
      hidden: ({document}) => document?.promoType !== 'percentage',
      validation: (rule) =>
        rule.custom((promoPercentage, context) => {
          const {document} = context as {document: any}
          if (document?.isOnPromo && document?.promoType === 'percentage') {
            if (!promoPercentage) return 'Discount percentage is required'
            if (promoPercentage <= 0 || promoPercentage >= 100) {
              return 'Percentage must be between 1 and 99'
            }
          }
          return true
        }),
    }),
    defineField({
      name: 'promoPrice',
      title: 'Promotional Price',
      type: 'number',
      description: 'Enter the promotional price',
      hidden: ({document}) => document?.promoType !== 'fixed',
      validation: (rule) =>
        rule.custom((promoPrice, context) => {
          const {document} = context as {document: any}
          if (document?.isOnPromo && document?.promoType === 'fixed') {
            if (!promoPrice) return 'Promotional price is required'
            if (promoPrice <= 0) return 'Price must be greater than 0'
            if (promoPrice >= document?.price) {
              return 'Promotional price must be less than regular price'
            }
          }
          return true
        }),
    }),
    defineField({
      name: 'quantity',
      title: 'Quantity in Stock',
      type: 'number',
      validation: (rule) => rule.required().min(0).integer(),
    }),
    defineField({
      name: 'inventory',
      title: 'Inventory Management',
      type: 'object',
      fields: [
        {
          name: 'quantityInStock',
          title: 'Quantity in Stock',
          type: 'number',
          validation: (rule) => rule.min(0).integer(),
          description: 'Current stock quantity',
        },
        {
          name: 'lowStockThreshold',
          title: 'Low Stock Threshold',
          type: 'number',
          validation: (rule) => rule.min(0).integer(),
          initialValue: 10,
          description: 'Alert when stock falls below this number',
        },
        {
          name: 'trackInventory',
          title: 'Track Inventory',
          type: 'boolean',
          initialValue: true,
          description: 'Enable/disable inventory tracking for this product',
        },
        {
          name: 'allowBackorders',
          title: 'Allow Backorders',
          type: 'boolean',
          initialValue: false,
          description: 'Allow orders when out of stock',
        },
        {
          name: 'stockHistory',
          title: 'Stock History',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                {
                  name: 'date',
                  type: 'datetime',
                  title: 'Date',
                },
                {
                  name: 'quantity',
                  type: 'number',
                  title: 'Quantity Changed',
                },
                {
                  name: 'newTotal',
                  type: 'number',
                  title: 'New Total Stock',
                },
                {
                  name: 'reason',
                  type: 'string',
                  title: 'Reason',
                  options: {
                    list: [
                      {title: 'Restock', value: 'restock'},
                      {title: 'Sale', value: 'sale'},
                      {title: 'Adjustment', value: 'adjustment'},
                      {title: 'Return', value: 'return'},
                      {title: 'Damaged', value: 'damaged'},
                    ],
                  },
                },
                {
                  name: 'notes',
                  type: 'text',
                  title: 'Notes',
                },
              ],
              preview: {
                select: {
                  date: 'date',
                  quantity: 'quantity',
                  reason: 'reason',
                },
                prepare({date, quantity, reason}) {
                  return {
                    title: `${quantity > 0 ? '+' : ''}${quantity} - ${reason}`,
                    subtitle: new Date(date).toLocaleDateString(),
                  }
                },
              },
            },
          ],
          readOnly: true,
          description: 'Automatically tracked stock changes',
        },
      ],
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 5,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'sku',
      title: 'SKU',
      type: 'string',
      description: 'Stock Keeping Unit - unique product identifier',
    }),
    defineField({
      name: 'isAvailable',
      title: 'Available for Purchase',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'images',
      title: 'Additional Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
          },
        },
      ],
      description: 'Upload multiple product images (gallery)',
    }),
    defineField({
      name: 'weight',
      title: 'Weight',
      type: 'number',
      description: 'Product weight in grams',
    }),
    defineField({
      name: 'unit',
      title: 'Unit of Measurement',
      type: 'string',
      options: {
        list: [
          {title: 'Grams (g)', value: 'g'},
          {title: 'Kilograms (kg)', value: 'kg'},
          {title: 'Pieces (pcs)', value: 'pcs'},
          {title: 'Pack', value: 'pack'},
          {title: 'Box', value: 'box'},
        ],
      },
      initialValue: 'g',
    }),
    defineField({
      name: 'isFeatured',
      title: 'Featured Product',
      type: 'boolean',
      initialValue: false,
      description: 'Display in featured products section',
    }),
    defineField({
      name: 'compareAtPrice',
      title: 'Compare at Price',
      type: 'number',
      description: 'Original price before discount (for display purposes)',
    }),
    defineField({
      name: 'promoEndDate',
      title: 'Promotion End Date',
      type: 'datetime',
      description: 'When should the promotion end?',
      hidden: ({document}) => !document?.isOnPromo,
    }),
    
    // Product Variants (Phase 9)
    defineField({
      name: 'hasVariants',
      title: 'Has Variants',
      type: 'boolean',
      initialValue: false,
      description: 'Does this product have size/color/weight variants?',
    }),
    defineField({
      name: 'variants',
      title: 'Product Variants',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'productVariant'}]}],
      description: 'Add product variants (size, color, weight options)',
      hidden: ({document}) => !document?.hasVariants,
    }),
    
    // Related Products & Bundles (Phase 9)
    defineField({
      name: 'relatedProducts',
      title: 'Related Products',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'product'}]}],
      description: 'Products that customers might also be interested in',
      validation: (Rule) => Rule.max(8),
    }),
    defineField({
      name: 'relatedBundles',
      title: 'Related Bundles',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'productBundle'}]}],
      description: 'Bundles that include this product or similar products',
      validation: (Rule) => Rule.max(4),
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'category.name',
      media: 'image',
      price: 'price',
      quantity: 'quantity',
      isOnPromo: 'isOnPromo',
      promoType: 'promoType',
      promoPercentage: 'promoPercentage',
      promoPrice: 'promoPrice',
    },
    prepare({title, subtitle, media, price, quantity, isOnPromo, promoType, promoPercentage, promoPrice}) {
      let priceDisplay = `₱${price}`
      
      if (isOnPromo) {
        const finalPrice = promoType === 'percentage' 
          ? price - (price * (promoPercentage / 100))
          : promoPrice
        priceDisplay = `₱${finalPrice.toFixed(2)} (was ₱${price}) 🏷️`
      }
      
      return {
        title,
        subtitle: `${subtitle || 'No category'} - ${priceDisplay} (Stock: ${quantity})`,
        media,
      }
    },
  },
})
