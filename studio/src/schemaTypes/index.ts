import {person} from './documents/person'
import {page} from './documents/page'
import {post} from './documents/post'
import {category} from './documents/category'
import {product} from './documents/product'
import {review} from './documents/review'
import {productVariant} from './documents/productVariant'
import {productBundle} from './documents/productBundle'
import {order} from './documents/order'
import {coupon} from './documents/coupon'
import {promotion} from './documents/promotion'
import {emailCampaign} from './documents/emailCampaign'
import {analytics} from './documents/analytics'
import {grower} from './documents/grower' // Phase 1: Growers Schema
import {faqCategory} from './documents/faqCategory' // Phase 2: FAQ Categories
import {faqItem} from './documents/faqItem' // Phase 2: FAQ Items
import {featureSection} from './documents/featureSection' // Phase 4: Feature Sections
import {navigation} from './documents/navigation' // Phase 5: Navigation Menus
import {store} from './documents/store' // Phase 6: Store Locations
import {testimonial} from './documents/testimonial' // Phase 7: Testimonials
import {banner} from './documents/banner' // Phase 7: Promotional Banners
import {callToAction} from './objects/callToAction'
import {infoSection} from './objects/infoSection'
import {settings} from './singletons/settings'
import {siteSettings} from './singletons/siteSettings' // Phase 5: Site Settings
import {featuredProducts} from './singletons/featuredProducts'
import {heroCarousel} from './singletons/heroCarousel'
import {link} from './objects/link'
import {blockContent} from './objects/blockContent'

// Export an array of all the schema types.  This is used in the Sanity Studio configuration. https://www.sanity.io/docs/schema-types

export const schemaTypes = [
  // Singletons
  settings,
  siteSettings, // Phase 5: Comprehensive Site Settings
  featuredProducts,
  heroCarousel,
  // Documents
  page,
  post,
  person,
  grower, // Phase 1: Growers/Farms
  faqCategory, // Phase 2: FAQ Categories
  faqItem, // Phase 2: FAQ Items
  featureSection, // Phase 4: Feature Sections (Why MASH)
  navigation, // Phase 5: Navigation Menus
  store, // Phase 6: Store Locations
  testimonial, // Phase 7: Customer Testimonials
  banner, // Phase 7: Promotional Banners
  category,
  product,
  review,
  productVariant,
  productBundle,
  order,
  coupon,
  promotion,
  emailCampaign,
  analytics,
  // Objects
  blockContent,
  infoSection,
  callToAction,
  link,
]
