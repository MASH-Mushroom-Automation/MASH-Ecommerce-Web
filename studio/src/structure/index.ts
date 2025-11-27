import {CogIcon, SparklesIcon, ImagesIcon, UsersIcon, PackageIcon, TagIcon, HelpCircleIcon} from '@sanity/icons'
import type {StructureBuilder, StructureResolver} from 'sanity/structure'
import pluralize from 'pluralize-esm'

/**
 * Structure builder is useful whenever you want to control how documents are grouped and
 * listed in the studio or for adding additional in-studio previews or content to documents.
 * Learn more: https://www.sanity.io/docs/structure-builder-introduction
 */

const DISABLED_TYPES = ['settings', 'featuredProducts', 'heroCarousel', 'grower', 'product', 'category', 'faqCategory', 'faqItem', 'assist.instruction.context']

export const structure: StructureResolver = (S: StructureBuilder) =>
  S.list()
    .title('Website Content')
    .items([
      // ===== E-COMMERCE SECTION =====
      S.listItem()
        .title('🛒 E-Commerce')
        .icon(PackageIcon)
        .child(
          S.list()
            .title('E-Commerce')
            .items([
              // Products
              S.listItem()
                .title('Products')
                .icon(PackageIcon)
                .child(
                  S.documentTypeList('product')
                    .title('Products')
                ),
              // Categories
              S.listItem()
                .title('Categories')
                .icon(TagIcon)
                .child(
                  S.documentTypeList('category')
                    .title('Categories')
                ),
              // Growers/Farms (Phase 1)
              S.listItem()
                .title('Growers / Farms')
                .icon(UsersIcon)
                .child(
                  S.documentTypeList('grower')
                    .title('Growers / Farms')
                ),
              // Featured Products Singleton
              S.listItem()
                .title('Featured Products')
                .child(S.document().schemaType('featuredProducts').documentId('featuredProducts'))
                .icon(SparklesIcon),
            ])
        ),
      // Divider
      S.divider(),
      // ===== HOMEPAGE SECTION =====
      S.listItem()
        .title('🏠 Homepage')
        .icon(ImagesIcon)
        .child(
          S.list()
            .title('Homepage Content')
            .items([
              // Hero Carousel Singleton
              S.listItem()
                .title('Hero Carousel')
                .child(S.document().schemaType('heroCarousel').documentId('heroCarousel'))
                .icon(ImagesIcon),
              // Featured Products
              S.listItem()
                .title('Featured Products')
                .child(S.document().schemaType('featuredProducts').documentId('featuredProducts'))
                .icon(SparklesIcon),
            ])
        ),
      // Divider
      S.divider(),
      // ===== FAQ SECTION ===== (Phase 2)
      S.listItem()
        .title('❓ FAQ')
        .icon(HelpCircleIcon)
        .child(
          S.list()
            .title('FAQ Management')
            .items([
              // FAQ Categories
              S.listItem()
                .title('FAQ Categories')
                .icon(TagIcon)
                .child(
                  S.documentTypeList('faqCategory')
                    .title('FAQ Categories')
                    .defaultOrdering([{ field: 'displayOrder', direction: 'asc' }])
                ),
              // FAQ Items
              S.listItem()
                .title('FAQ Questions')
                .icon(HelpCircleIcon)
                .child(
                  S.documentTypeList('faqItem')
                    .title('FAQ Questions')
                    .defaultOrdering([{ field: 'displayOrder', direction: 'asc' }])
                ),
            ])
        ),
      // Divider
      S.divider(),
      // ===== OTHER DOCUMENT TYPES =====
      ...S.documentTypeListItems()
        // Filter out managed types
        .filter((listItem: any) => !DISABLED_TYPES.includes(listItem.getId()))
        // Pluralize the title
        .map((listItem) => {
          return listItem.title(pluralize(listItem.getTitle() as string))
        }),
      // Divider
      S.divider(),
      // ===== SETTINGS =====
      S.listItem()
        .title('⚙️ Site Settings')
        .child(S.document().schemaType('settings').documentId('siteSettings'))
        .icon(CogIcon),
    ])
