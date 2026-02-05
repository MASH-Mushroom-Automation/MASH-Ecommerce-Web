# MASH E-Commerce Platform - Complete File Map

**Purpose:** Comprehensive documentation of all files

---

## 📁 Root Directory Structure

```
MASH-Ecommerce-Web/
├── .github/              # GitHub-specific files and documentation
├── .clerk/               # Clerk authentication cache (legacy)
├── data/                 # Sample/test data in JSON format
├── docs/                 # Additional documentation
├── functions/            # Firebase Cloud Functions
├── public/               # Static assets (images, HTML)
├── scripts/              # Utility scripts for data migration and testing
├── src/                  # Main application source code
├── studio/               # Sanity CMS Studio configuration
└── Configuration Files   # Root-level configs (package.json, etc.)
```

---

## 🔧 Configuration Files (Root Level)

| File                      | Purpose                            | Path                       |
| ------------------------- | ---------------------------------- | -------------------------- |
| `package.json`            | Frontend dependencies and scripts  | `/package.json`            |
| `package-lock.json`       | Locked dependency versions         | `/package-lock.json`       |
| `tsconfig.json`           | TypeScript configuration           | `/tsconfig.json`           |
| `next.config.ts`          | Next.js 16 configuration           | `/next.config.ts`          |
| `next-env.d.ts`           | Next.js TypeScript definitions     | `/next-env.d.ts`           |
| `eslint.config.mjs`       | ESLint linting rules               | `/eslint.config.mjs`       |
| `postcss.config.mjs`      | PostCSS configuration              | `/postcss.config.mjs`      |
| `components.json`         | Shadcn UI components config        | `/components.json`         |
| `firebase.json`           | Firebase hosting/functions config  | `/firebase.json`           |
| `firestore.rules`         | Firestore security rules           | `/firestore.rules`         |
| `firestore.indexes.json`  | Firestore database indexes         | `/firestore.indexes.json`  |
| `database.rules.json`     | Realtime Database rules            | `/database.rules.json`     |
| `railway.toml`            | Railway deployment config          | `/railway.toml`            |
| `nixpacks.toml`           | Railway build config               | `/nixpacks.toml`           |
| `vercel.json`             | Vercel deployment config           | `/vercel.json`             |
| `jest.setup.js`           | Jest testing setup                 | `/jest.setup.js`           |
| `jest.calendly.config.js` | Calendly integration tests         | `/jest.calendly.config.js` |
| `.env`                    | Environment variables (production) | `/.env`                    |

---

## 📂 Source Code (`/src`)

### Core Application Files

| File       | Purpose                                  | Path            |
| ---------- | ---------------------------------------- | --------------- |
| `proxy.ts` | Route protection middleware (Next.js 16) | `/src/proxy.ts` |

### Application Routes (`/src/app`)

#### Root-Level Pages

| File                | Purpose                    | Path                         |
| ------------------- | -------------------------- | ---------------------------- |
| `layout.tsx`        | Root application layout    | `/src/app/layout.tsx`        |
| `page.tsx`          | Homepage                   | `/src/app/page.tsx`          |
| `client-layout.tsx` | Client-side layout wrapper | `/src/app/client-layout.tsx` |
| `not-found.tsx`     | 404 error page             | `/src/app/not-found.tsx`     |
| `globals.css`       | Global CSS styles          | `/src/app/globals.css`       |
| `sitemap.ts`        | SEO sitemap generator      | `/src/app/sitemap.ts`        |
| `robots.ts`         | SEO robots.txt generator   | `/src/app/robots.ts`         |

#### Public Pages (No Auth Required)

| File             | Purpose                    | Path                               |
| ---------------- | -------------------------- | ---------------------------------- |
| About Page       | Company information        | `/src/app/about/page.tsx`          |
| Contact Page     | Contact form               | `/src/app/contact/page.tsx`        |
| FAQ Page         | Frequently asked questions | `/src/app/faq/page.tsx`            |
| Privacy Policy   | Privacy policy             | `/src/app/privacy/page.tsx`        |
| Terms of Service | Terms and conditions       | `/src/app/terms/page.tsx`          |
| Returns Policy   | Return/refund policy       | `/src/app/returns-policy/page.tsx` |
| Shipping Info    | Shipping information       | `/src/app/shipping-info/page.tsx`  |
| Stores Page      | Store locator              | `/src/app/stores/page.tsx`         |
| Store Details    | Individual store page      | `/src/app/stores/[slug]/page.tsx`  |

#### Blog & Content

| File           | Purpose              | Path                               |
| -------------- | -------------------- | ---------------------------------- |
| Blog Index     | All blog posts       | `/src/app/blog/page.tsx`           |
| Blog Post      | Individual blog post | `/src/app/blog/[slug]/page.tsx`    |
| Recipes Index  | All recipes          | `/src/app/recipes/page.tsx`        |
| Recipe Details | Individual recipe    | `/src/app/recipes/[slug]/page.tsx` |
| Guides Index   | Growing guides list  | `/src/app/guides/page.tsx`         |
| Guide Details  | Individual guide     | `/src/app/guides/[slug]/page.tsx`  |

#### Product & Shopping Pages

| File          | Purpose              | Path                                |
| ------------- | -------------------- | ----------------------------------- |
| Category Page | Products by category | `/src/app/category/[slug]/page.tsx` |

#### Grower Pages

| File             | Purpose                   | Path                                 |
| ---------------- | ------------------------- | ------------------------------------ |
| Grower Index     | All growers               | `/src/app/grower/page.tsx`           |
| Grower Profile   | Individual grower details | `/src/app/grower/[id]/page.tsx`      |
| Book Appointment | Calendly booking page     | `/src/app/grower/[id]/book/page.tsx` |

#### Order Tracking

| File           | Purpose                | Path                                       |
| -------------- | ---------------------- | ------------------------------------------ |
| Order Tracking | Live delivery tracking | `/src/app/orders/[orderId]/track/page.tsx` |

#### Testing Pages

| File          | Purpose                   | Path                              |
| ------------- | ------------------------- | --------------------------------- |
| API Test      | Backend API testing       | `/src/app/api-test/page.tsx`      |
| Auth Test     | Authentication testing    | `/src/app/auth-test/page.tsx`     |
| Auth Debug    | Auth debugging panel      | `/src/app/auth-debug/page.tsx`    |
| Lalamove Test | Delivery integration test | `/src/app/lalamove-test/page.tsx` |
| Dashboard     | Admin dashboard           | `/src/app/dashboard/page.tsx`     |

### Route Groups (Invisible in URLs)

#### (auth) - Authentication Routes

| File             | Purpose                     | Path                                        |
| ---------------- | --------------------------- | ------------------------------------------- |
| Auth Layout      | Auth pages layout           | `/src/app/(auth)/layout.tsx`                |
| Loading State    | Auth loading UI             | `/src/app/(auth)/loading.tsx`               |
| Error Boundary   | Auth error handler          | `/src/app/(auth)/error.tsx`                 |
| Login            | Email/password login        | `/src/app/(auth)/login/page.tsx`            |
| Email Link Login | Passwordless login          | `/src/app/(auth)/login/email-link/page.tsx` |
| Signup           | User registration           | `/src/app/(auth)/signup/page.tsx`           |
| Welcome          | Post-signup welcome         | `/src/app/(auth)/welcome/page.tsx`          |
| Forgot Password  | Password reset request      | `/src/app/(auth)/forgot-password/page.tsx`  |
| Reset Password   | Password reset form         | `/src/app/(auth)/reset-password/page.tsx`   |
| Reset Success    | Password reset confirmation | `/src/app/(auth)/reset-success/page.tsx`    |
| Verify OTP       | OTP verification            | `/src/app/(auth)/verify-otp/page.tsx`       |

#### (shop) - Shopping Routes

| File     | Purpose                        | Path                                |
| -------- | ------------------------------ | ----------------------------------- |
| Wishlist | User wishlist (guest-friendly) | `/src/app/(shop)/wishlist/page.tsx` |

#### (user) - User Profile Routes

| File                 | Purpose                 | Path                                                      |
| -------------------- | ----------------------- | --------------------------------------------------------- |
| User Layout          | Profile section wrapper | `/src/app/(user)/layout.tsx`                              |
| Loading State        | User pages loading      | `/src/app/(user)/loading.tsx`                             |
| Error Boundary       | User error handler      | `/src/app/(user)/error.tsx`                               |
| Profile Dashboard    | User profile home       | `/src/app/(user)/profile/page.tsx`                        |
| My Information       | Profile details         | `/src/app/(user)/profile/my-information/page.tsx`         |
| Address Management   | Saved addresses         | `/src/app/(user)/profile/addresses/page.tsx`              |
| Add Address          | New address form        | `/src/app/(user)/profile/addresses/add/page.tsx`          |
| Edit Address         | Edit address form       | `/src/app/(user)/profile/addresses/[id]/page.tsx`         |
| Order History        | Past orders             | `/src/app/(user)/profile/order-history/page.tsx`          |
| Order Details        | Individual order        | `/src/app/(user)/profile/orders/[orderId]/page.tsx`       |
| Order Tracking       | Live tracking           | `/src/app/(user)/profile/orders/[orderId]/track/page.tsx` |
| Interests Onboarding | User interests setup    | `/src/app/(user)/onboarding/interests/page.tsx`           |
| Cooking Onboarding   | Cooking preferences     | `/src/app/(user)/onboarding/cooking/page.tsx`             |

#### (seller) - Seller Dashboard Routes

| File                    | Purpose              | Path                                                                |
| ----------------------- | -------------------- | ------------------------------------------------------------------- |
| Seller Dashboard        | Main seller page     | `/src/app/(seller)/seller/page.tsx`                                 |
| Seller Dashboard Alt    | Dashboard view       | `/src/app/(seller)/seller/dashboard/page.tsx`                       |
| Orders Management       | Seller orders        | `/src/app/(seller)/seller/orders/page.tsx`                          |
| Order Details           | Individual order     | `/src/app/(seller)/seller/orders/[id]/page.tsx`                     |
| Inventory               | Stock management     | `/src/app/(seller)/seller/inventory/page.tsx`                       |
| Inventory Dashboard Alt | Inventory view       | `/src/app/(seller)/inventory-dashboard/page.tsx`                    |
| Analytics               | Sales analytics      | `/src/app/(seller)/seller/analytics/page.tsx`                       |
| Shipping Settings       | Shipping config      | `/src/app/(seller)/seller/shipping/page.tsx`                        |
| Refunds                 | Refund requests      | `/src/app/(seller)/seller/refund/page.tsx`                          |
| Handover                | Order handover       | `/src/app/(seller)/seller/handover/page.tsx`                        |
| Notifications           | Seller notifications | `/src/app/(seller)/seller/notifications/page.tsx`                   |
| Settings                | Seller settings      | `/src/app/(seller)/seller/settings/page.tsx`                        |
| Address Management      | Seller addresses     | `/src/app/(seller)/seller/address/page.tsx`                         |
| Start Selling           | Seller application   | `/src/app/(seller)/start-selling/page.tsx`                          |
| Application Schema      | Form validation      | `/src/app/(seller)/start-selling/schema.ts`                         |
| Application Hook        | Form logic           | `/src/app/(seller)/start-selling/hooks/useSellerApplicationForm.ts` |

##### Start Selling Components

| File             | Purpose                 | Path                                                             |
| ---------------- | ----------------------- | ---------------------------------------------------------------- |
| Application Form | Seller application form | `/src/app/(seller)/start-selling/components/ApplicationForm.tsx` |
| Hero Section     | Application hero        | `/src/app/(seller)/start-selling/components/HeroSection.tsx`     |
| Success Modal    | Application success     | `/src/app/(seller)/start-selling/components/SuccessModal.tsx`    |

### API Routes (`/src/app/api`)

#### Core API

| File              | Purpose               | Path                                      |
| ----------------- | --------------------- | ----------------------------------------- |
| Health Check      | API health status     | `/src/app/api/health/route.ts`            |
| Main Home         | Homepage data         | `/src/app/api/main/home/route.ts`         |
| Draft Mode Enable | CMS preview mode      | `/src/app/api/draft-mode/enable/route.ts` |
| Devices           | IoT device management | `/src/app/api/devices/route.ts`           |
| Notifications     | User notifications    | `/src/app/api/notifications/route.ts`     |

#### Products API

| File              | Purpose                 | Path                                              |
| ----------------- | ----------------------- | ------------------------------------------------- |
| Products List     | GET all products        | `/src/app/api/products/route.ts`                  |
| Product Details   | GET/PUT/DELETE product  | `/src/app/api/products/[id]/route.ts`             |
| Product Inventory | Inventory management    | `/src/app/api/products/[id]/inventory/route.ts`   |
| Stock Alerts      | Low stock notifications | `/src/app/api/products/[id]/stock-alert/route.ts` |

#### Orders API

| File              | Purpose             | Path                                             |
| ----------------- | ------------------- | ------------------------------------------------ |
| Orders List       | GET/POST orders     | `/src/app/api/orders/route.ts`                   |
| Order Details     | GET/PUT order       | `/src/app/api/orders/[id]/route.ts`              |
| Order Status      | Update order status | `/src/app/api/orders/[id]/status/route.ts`       |
| Schedule Delivery | Lalamove scheduling | `/src/app/api/orders/schedule-delivery/route.ts` |

#### Inventory API

| File      | Purpose          | Path                                        |
| --------- | ---------------- | ------------------------------------------- |
| Low Stock | Low stock alerts | `/src/app/api/inventory/low-stock/route.ts` |

#### Payment API

| File            | Purpose              | Path                                          |
| --------------- | -------------------- | --------------------------------------------- |
| Create Intent   | PayMongo payment     | `/src/app/api/payment/create-intent/route.ts` |
| Payment Status  | Check payment status | `/src/app/api/payment/status/route.ts`        |
| Payment Webhook | PayMongo webhooks    | `/src/app/api/payment/webhook/route.ts`       |

#### Email API

| File       | Purpose       | Path                               |
| ---------- | ------------- | ---------------------------------- |
| Send Email | Email service | `/src/app/api/email/send/route.ts` |

#### User API

| File               | Purpose              | Path                                         |
| ------------------ | -------------------- | -------------------------------------------- |
| User Profile       | Profile CRUD         | `/src/app/api/user/profile/route.ts`         |
| Avatar Upload      | Profile picture      | `/src/app/api/user/avatar/route.ts`          |
| Onboarding         | User onboarding data | `/src/app/api/user/onboarding/route.ts`      |
| Seller Application | Apply as seller      | `/src/app/api/user/apply-as-seller/route.ts` |

#### Seller API

| File               | Purpose                | Path                                                    |
| ------------------ | ---------------------- | ------------------------------------------------------- |
| Seller Profile     | Seller profile CRUD    | `/src/app/api/seller/profile/route.ts`                  |
| Seller Dashboard   | Dashboard data         | `/src/app/api/seller/dashboard/route.ts`                |
| Seller Products    | Products CRUD          | `/src/app/api/seller/products/route.ts`                 |
| Product Details    | GET/PUT/DELETE product | `/src/app/api/seller/products/[id]/route.ts`            |
| Image Upload       | Product images         | `/src/app/api/seller/products/upload-image/route.ts`    |
| Seller Orders      | Orders management      | `/src/app/api/seller/orders/route.ts`                   |
| Seller Addresses   | Address management     | `/src/app/api/seller/addresses/route.ts`                |
| Seller Refunds     | Refund requests        | `/src/app/api/seller/refunds/route.ts`                  |
| Payment Info       | Payment settings       | `/src/app/api/seller/payment-info/route.ts`             |
| Password Change    | Change password        | `/src/app/api/seller/password/route.ts`                 |
| Notifications      | Seller notifications   | `/src/app/api/seller/notifications/route.ts`            |
| Notification Prefs | Notification settings  | `/src/app/api/seller/notification-preferences/route.ts` |

---

## 🎨 Components (`/src/components`)

### UI Components (`/src/components/ui`)

**Location:** `/src/components/ui/`

Shadcn/Radix UI components:

| Component          | Purpose                | File                     |
| ------------------ | ---------------------- | ------------------------ |
| Accordion          | Collapsible content    | `accordion.tsx`          |
| Alert              | Alert messages         | `alert.tsx`              |
| Alert Dialog       | Modal alerts           | `alert-dialog.tsx`       |
| Aspect Ratio       | Maintain aspect ratio  | `aspect-ratio.tsx`       |
| Avatar             | User avatars           | `avatar.tsx`             |
| Badge              | Status badges          | `badge.tsx`              |
| Bar Chart          | Bar chart component    | `Bar-Chart.tsx`          |
| Breadcrumb         | Navigation breadcrumbs | `breadcrumb.tsx`         |
| Button             | Button component       | `button.tsx`             |
| Button Group       | Grouped buttons        | `button-group.tsx`       |
| Calendar           | Date picker calendar   | `calendar.tsx`           |
| Card               | Card container         | `card.tsx`               |
| Carousel           | Image carousel         | `carousel.tsx`           |
| Chart              | Chart container        | `chart.tsx`              |
| Chart Tooltip      | Chart tooltips         | `chart-tooltip.tsx`      |
| Checkbox           | Checkbox input         | `checkbox.tsx`           |
| Collapsible        | Collapsible sections   | `collapsible.tsx`        |
| Command            | Command palette        | `command.tsx`            |
| Context Menu       | Right-click menu       | `context-menu.tsx`       |
| Dialog             | Modal dialogs          | `dialog.tsx`             |
| Drawer             | Side drawer            | `drawer.tsx`             |
| Dropdown Menu      | Dropdown menus         | `dropdown-menu.tsx`      |
| Empty State        | Empty state UI         | `empty-state.tsx`        |
| Empty              | Empty component        | `empty.tsx`              |
| Field              | Form field             | `field.tsx`              |
| Form               | Form wrapper           | `form.tsx`               |
| Google Maps Picker | Map address picker     | `google-maps-picker.tsx` |
| Hover Card         | Hover popover          | `hover-card.tsx`         |
| Input              | Text input             | `input.tsx`              |
| Input Enhanced     | Enhanced input         | `input-enhanced.tsx`     |
| Input Group        | Input grouping         | `input-group.tsx`        |
| Input OTP          | OTP input              | `input-otp.tsx`          |
| Item               | List item              | `item.tsx`               |
| KBD                | Keyboard shortcut      | `kbd.tsx`                |
| Label              | Form label             | `label.tsx`              |
| Line Chart         | Line chart component   | `Line-chart.tsx`         |
| Loading Spinner    | Loading indicator      | `loading-spinner.tsx`    |
| Map Picker         | Map picker component   | `map-picker.tsx`         |
| Menubar            | Menu bar               | `menubar.tsx`            |
| Navigation Menu    | Navigation menu        | `navigation-menu.tsx`    |
| Pagination         | Pagination controls    | `pagination.tsx`         |
| Popover            | Popover component      | `popover.tsx`            |
| Progress           | Progress bar           | `progress.tsx`           |
| Radio Group        | Radio button group     | `radio-group.tsx`        |
| Resizable          | Resizable panels       | `resizable.tsx`          |
| Scroll Area        | Scrollable area        | `scroll-area.tsx`        |
| Select             | Select dropdown        | `select.tsx`             |
| Separator          | Visual separator       | `separator.tsx`          |
| Sheet              | Side sheet             | `sheet.tsx`              |
| Sidebar            | Sidebar component      | `sidebar.tsx`            |
| Skeleton           | Loading skeleton       | `skeleton.tsx`           |
| Skeleton Loaders   | Multiple skeletons     | `skeleton-loaders.tsx`   |
| Slider             | Range slider           | `slider.tsx`             |
| Sonner             | Toast notifications    | `sonner.tsx`             |
| Spinner            | Loading spinner        | `spinner.tsx`            |
| Switch             | Toggle switch          | `switch.tsx`             |
| Table              | Data table             | `table.tsx`              |
| Tabs               | Tab navigation         | `tabs.tsx`               |
| Textarea           | Multiline text input   | `textarea.tsx`           |
| Theme Switcher     | Theme toggle           | `theme-switcher.tsx`     |
| TikTok Icon        | TikTok social icon     | `tiktok-icon.tsx`        |
| Toggle             | Toggle button          | `toggle.tsx`             |
| Toggle Group       | Toggle button group    | `toggle-group.tsx`       |
| Tooltip            | Tooltip component      | `tooltip.tsx`            |

### Layout Components (`/src/components/layout`)

**Location:** `/src/components/layout/`

| Component             | Purpose                 | File                        |
| --------------------- | ----------------------- | --------------------------- |
| Header                | Main site header        | `header.tsx`                |
| Footer                | Main site footer        | `footer.tsx`                |
| Auth Layout           | Auth pages wrapper      | `auth-layout.tsx`           |
| Cart Dropdown         | Shopping cart           | `cart-dropdown.tsx`         |
| Mobile Bottom Nav     | Mobile navigation       | `mobile-bottom-nav.tsx`     |
| Notification Dropdown | Notifications           | `notification-dropdown.tsx` |
| Seller Header         | Seller dashboard header | `seller-header.tsx`         |
| Simple Header         | Minimal header          | `simple-header.tsx`         |
| Index                 | Layout exports          | `index.ts`                  |

### Product Components (`/src/components/product`)

**Location:** `/src/components/product/`

| Component             | Purpose             | File                         |
| --------------------- | ------------------- | ---------------------------- |
| Product Card          | Product grid item   | `ProductCard.tsx`            |
| Product Image Gallery | Product images      | `ProductImageGallery.tsx`    |
| Quick View Modal      | Quick product view  | `QuickViewModal.tsx`         |
| Related Products      | Product suggestions | `RelatedProductsSection.tsx` |
| Stock Badge           | Stock status badge  | `StockBadge.tsx`             |
| Variant Selector      | Product variants    | `VariantSelector.tsx`        |
| Bundle Card           | Product bundle card | `BundleCard.tsx`             |
| Index                 | Product exports     | `index.ts`                   |

### Seller Components (`/src/components/seller`)

**Location:** `/src/components/seller/`

| Component         | Purpose           | File                           |
| ----------------- | ----------------- | ------------------------------ |
| Lalamove Timeline | Delivery tracking | `LalamoveTrackingTimeline.tsx` |

#### Product Form Components

**Location:** `/src/components/seller/product-form/`

| Component         | Purpose            | File                   |
| ----------------- | ------------------ | ---------------------- |
| Add Product Form  | Create product     | `AddProductForm.tsx`   |
| Edit Product Form | Edit product       | `EditProductForm.tsx`  |
| Category Selector | Category picker    | `CategorySelector.tsx` |
| Image Uploader    | Image upload       | `ImageUploader.tsx`    |
| Rich Text Editor  | Description editor | `RichTextEditor.tsx`   |
| SEO Fields        | SEO metadata       | `SeoFields.tsx`        |
| Variant Manager   | Product variants   | `VariantManager.tsx`   |
| Index             | Form exports       | `index.ts`             |

### Checkout Components (`/src/components/checkout`)

**Location:** `/src/components/checkout/`

| Component        | Purpose              | File                  |
| ---------------- | -------------------- | --------------------- |
| Address Picker   | Map-based address    | `AddressPicker.tsx`   |
| Address Selector | Saved address picker | `AddressSelector.tsx` |
| Lalamove Quote   | Delivery quote       | `LalamoveQuote.tsx`   |
| Index            | Checkout exports     | `index.ts`            |

### Orders Components (`/src/components/orders`)

**Location:** `/src/components/orders/`

| Component       | Purpose            | File                      |
| --------------- | ------------------ | ------------------------- |
| Order Card      | Order display card | `OrderCard.tsx`           |
| Rejection Modal | Order rejection    | `OrderRejectionModal.tsx` |

### Delivery Components (`/src/components/delivery`)

**Location:** `/src/components/delivery/`

| Component         | Purpose           | File                   |
| ----------------- | ----------------- | ---------------------- |
| Delivery Chat     | Driver chat       | `DeliveryChat.tsx`     |
| Priority Delivery | Priority options  | `PriorityDelivery.tsx` |
| Status Timeline   | Delivery timeline | `StatusTimeline.tsx`   |
| Tracking Map      | Live map tracking | `TrackingMap.tsx`      |

### CMS Components (`/src/components/cms`)

**Location:** `/src/components/cms/`

| Component        | Purpose               | File                       |
| ---------------- | --------------------- | -------------------------- |
| About Section    | About page content    | `AboutSection.tsx`         |
| Announcement Bar | Top banner            | `AnnouncementBar.tsx`      |
| Banner Section   | Hero banners          | `BannerSection.tsx`        |
| Contact Section  | Contact page          | `ContactSection.tsx`       |
| FAQ Section      | FAQ display           | `FAQSection.tsx`           |
| Feature Section  | Feature highlights    | `FeatureSection.tsx`       |
| Hero Section     | Homepage hero         | `HeroSection.tsx`          |
| Sanity Feature   | Sanity features       | `SanityFeatureSection.tsx` |
| Testimonials     | Customer testimonials | `TestimonialsSection.tsx`  |

### Hero Components (`/src/components/hero`)

**Location:** `/src/components/hero/`

| Component            | Purpose           | File                     |
| -------------------- | ----------------- | ------------------------ |
| Sanity Hero Carousel | CMS hero carousel | `SanityHeroCarousel.tsx` |
| Index                | Hero exports      | `index.ts`               |

### Analytics Components (`/src/components/analytics`)

**Location:** `/src/components/analytics/`

| Component           | Purpose           | File                    |
| ------------------- | ----------------- | ----------------------- |
| Comparison Period   | Period comparison | `ComparisonPeriod.tsx`  |
| Date Range Selector | Date picker       | `DateRangeSelector.tsx` |
| Export Button       | Export data       | `ExportButton.tsx`      |
| Order Metrics       | Order analytics   | `OrderMetrics.tsx`      |
| Revenue Breakdown   | Revenue charts    | `RevenueBreakdown.tsx`  |
| Sales Trend Chart   | Sales charts      | `SalesTrendChart.tsx`   |

### Search Components (`/src/components/search`)

**Location:** `/src/components/search/`

| Component           | Purpose            | File                     |
| ------------------- | ------------------ | ------------------------ |
| Search Autocomplete | Search suggestions | `SearchAutocomplete.tsx` |
| Search Dialog       | Search modal       | `SearchDialog.tsx`       |
| Search Trigger      | Search button      | `SearchTrigger.tsx`      |
| Index               | Search exports     | `index.ts`               |

### Admin Components (`/src/components/admin`)

**Location:** `/src/components/admin/`

| Component         | Purpose       | File                    |
| ----------------- | ------------- | ----------------------- |
| Dashboard Widgets | Admin widgets | `dashboard-widgets.tsx` |

### Auth Components (`/src/components/auth`)

**Location:** `/src/components/auth/`

| Component             | Purpose             | File                        |
| --------------------- | ------------------- | --------------------------- |
| Google Sign-In Button | Google OAuth button | `google-sign-in-button.tsx` |

### Appointment Components (`/src/components/appointments`)

**Location:** `/src/components/appointments/`

| Component       | Purpose             | File                 |
| --------------- | ------------------- | -------------------- |
| Calendly Button | Booking button      | `CalendlyButton.tsx` |
| Calendly Embed  | Booking widget      | `CalendlyEmbed.tsx`  |
| Index           | Appointment exports | `index.ts`           |

#### Appointment Tests

**Location:** `/src/components/appointments/__tests__/`

| File              | Purpose               | Path                      |
| ----------------- | --------------------- | ------------------------- |
| Button Tests      | CalendlyButton tests  | `CalendlyButton.test.tsx` |
| Embed Tests       | CalendlyEmbed tests   | `CalendlyEmbed.test.tsx`  |
| Integration Tests | E2E integration tests | `integration.test.tsx`    |

### Common Components (`/src/components/common`)

**Location:** `/src/components/common/`

| Component      | Purpose                | File                 |
| -------------- | ---------------------- | -------------------- |
| Breadcrumbs    | Navigation breadcrumbs | `breadcrumbs.tsx`    |
| Error Boundary | Error handling         | `error-boundary.tsx` |
| Loading States | Loading UI             | `loading-states.tsx` |

### Other Components (`/src/components`)

| Component             | Purpose            | Path                                        |
| --------------------- | ------------------ | ------------------------------------------- |
| App Sidebar           | Main app sidebar   | `/src/components/app-sidebar.tsx`           |
| Bulk Action Bar       | Bulk operations    | `/src/components/BulkActionBar.tsx`         |
| Catalog Filter        | Product filters    | `/src/components/catalog/FilterSidebar.tsx` |
| Content YouTube       | YouTube embed      | `/src/components/content/YouTubeEmbed.tsx`  |
| Content Index         | Content exports    | `/src/components/content/index.ts`          |
| Demo Control Panel    | Demo mode controls | `/src/components/demo/DemoControlPanel.tsx` |
| Google Map            | Map component      | `/src/components/maps/GoogleMap.tsx`        |
| Nav Main              | Main navigation    | `/src/components/nav-main.tsx`              |
| Nav Projects          | Projects nav       | `/src/components/nav-projects.tsx`          |
| Nav Secondary         | Secondary nav      | `/src/components/nav-secondary.tsx`         |
| Nav User              | User menu          | `/src/components/nav-user.tsx`              |
| Operating Hours       | Hours modal        | `/src/components/OperatingHoursModal.tsx`   |
| Reviews List          | Product reviews    | `/src/components/reviews/ReviewList.tsx`    |
| Sanity Visual Editing | CMS editing        | `/src/components/sanity/VisualEditing.tsx`  |
| Sanity Index          | Sanity exports     | `/src/components/sanity/index.ts`           |
| Seller Sidebar        | Seller nav         | `/src/components/seller-sidebar.tsx`        |
| TanStack Table        | Data tables        | `/src/components/table/TanStackTable.tsx`   |
| Index                 | Component exports  | `/src/components/index.ts`                  |

### Provider Components (`/src/components/providers`)

**Location:** `/src/components/providers/`

| Component      | Purpose           | File                 |
| -------------- | ----------------- | -------------------- |
| Query Provider | React Query setup | `query-provider.tsx` |
| Theme Provider | Theme context     | `theme-provider.tsx` |

---

## 🧩 Contexts (`/src/contexts`)

**Location:** `/src/contexts/`

| Context          | Purpose              | File                      |
| ---------------- | -------------------- | ------------------------- |
| Auth Context     | Authentication state | `AuthContext.tsx`         |
| Cart Context     | Shopping cart (v2)   | `CartContext.tsx`         |
| Wishlist Context | User wishlist        | `WishlistContext.tsx`     |
| Realtime Mode    | Realtime updates     | `RealtimeModeContext.tsx` |

---

## 🪝 Custom Hooks (`/src/hooks`)

**Location:** `/src/hooks/`

### Core Hooks

| Hook                     | Purpose              | File                          |
| ------------------------ | -------------------- | ----------------------------- |
| useAddresses             | Address management   | `useAddresses.ts`             |
| useAdminDashboard        | Admin data           | `useAdminDashboard.ts`        |
| useAnalytics             | Analytics data       | `useAnalytics.ts`             |
| useBulkSelect            | Bulk selection       | `useBulkSelect.ts`            |
| useCMS                   | CMS content          | `useCMS.ts`                   |
| useColorTheme            | Theme management     | `use-color-theme.ts`          |
| useDebounce              | Input debouncing     | `useDebounce.ts`              |
| useInventory             | Inventory data       | `useInventory.ts`             |
| useMain                  | Main app data        | `useMain.ts`                  |
| useMobile                | Mobile detection     | `use-mobile.ts`               |
| useNavigation            | Navigation state     | `useNavigation.ts`            |
| useNotifications         | Notifications        | `useNotifications.ts`         |
| useOrders                | Orders data          | `useOrders.ts`                |
| useProducts              | Products data        | `useProducts.ts`              |
| useRealtimeProducts      | Live products        | `useRealtimeProducts.ts`      |
| useRecentOrders          | Recent orders        | `useRecentOrders.ts`          |
| useSearchShortcut        | Search keyboard      | `useSearchShortcut.ts`        |
| useSeller                | Seller data          | `useSeller.ts`                |
| useSellerApplication     | Seller application   | `useSellerApplication.ts`     |
| useTopPerformingProducts | Top products         | `useTopPerformingProducts.ts` |
| useUser                  | User data            | `useUser.ts`                  |
| useWebSocket             | WebSocket connection | `useWebSocket.ts`             |

### Firebase Hooks

| Hook                     | Purpose                | File                          |
| ------------------------ | ---------------------- | ----------------------------- |
| useFirebaseAddresses     | Firebase addresses     | `useFirebaseAddresses.ts`     |
| useFirebaseNotifications | Firebase notifications | `useFirebaseNotifications.ts` |
| useFirebaseOrders        | Firebase orders        | `useFirebaseOrders.ts`        |

### Sanity CMS Hooks

| Hook                  | Purpose          | File                       |
| --------------------- | ---------------- | -------------------------- |
| useSanityAboutPage    | About page       | `useSanityAboutPage.ts`    |
| useSanityAnalytics    | Analytics        | `useSanityAnalytics.ts`    |
| useSanityBanners      | Banners          | `useSanityBanners.ts`      |
| useSanityBlogPosts    | Blog posts       | `useSanityBlogPosts.ts`    |
| useSanityBundles      | Product bundles  | `useSanityBundles.ts`      |
| useSanityCategories   | Categories       | `useSanityCategories.ts`   |
| useSanityContactPage  | Contact page     | `useSanityContactPage.ts`  |
| useSanityFAQ          | FAQs             | `useSanityFAQ.ts`          |
| useSanityFeatures     | Features         | `useSanityFeatures.ts`     |
| useSanityGrowers      | Growers          | `useSanityGrowers.ts`      |
| useSanityHero         | Hero content     | `useSanityHero.ts`         |
| useSanityInventory    | Inventory        | `useSanityInventory.ts`    |
| useSanityMarketing    | Marketing        | `useSanityMarketing.ts`    |
| useSanityOrders       | Orders           | `useSanityOrders.ts`       |
| useSanityProducts     | Products         | `useSanityProducts.ts`     |
| useSanityReviews      | Reviews          | `useSanityReviews.ts`      |
| useSanitySiteSettings | Site settings    | `useSanitySiteSettings.ts` |
| useSanityStores       | Stores           | `useSanityStores.ts`       |
| useSanityTestimonials | Testimonials     | `useSanityTestimonials.ts` |
| useSanityVariants     | Product variants | `useSanityVariants.ts`     |

---

## 📚 Libraries (`/src/lib`)

**Location:** `/src/lib/`

### Core Libraries

| Library         | Purpose                 | File                 |
| --------------- | ----------------------- | -------------------- |
| Analytics       | Analytics utilities     | `analytics.ts`       |
| API Client      | Backend API client      | `api-client.ts`      |
| API Interceptor | API request interceptor | `api-interceptor.ts` |
| Auth            | Authentication helpers  | `auth.ts`            |
| Avatar          | Avatar utilities        | `avatar.ts`          |
| Cloudinary      | Image hosting           | `cloudinary.ts`      |
| Colors          | Color utilities         | `colors.ts`          |
| Constants       | App constants           | `constants.ts`       |
| Error Messages  | Error strings           | `error-messages.ts`  |
| Export CSV      | CSV export              | `exportCsv.ts`       |
| Grower Utils    | Grower helpers          | `grower-utils.ts`    |
| JWT             | JWT utilities           | `jwt.ts`             |
| Lalamove        | Delivery service        | `lalamove.ts`        |
| Locations       | Location data           | `locations.ts`       |
| Maps Config     | Google Maps config      | `maps-config.ts`     |
| Products        | Product utilities       | `products.ts`        |
| Status Utils    | Status helpers          | `status-utils.tsx`   |
| Tailwind Theme  | Theme config            | `tailwind-theme.ts`  |
| Themes          | Color themes            | `themes.ts`          |
| Token Refresh   | JWT refresh             | `token-refresh.ts`   |
| Utils           | General utilities       | `utils.ts`           |
| Index           | Library exports         | `index.ts`           |

### API Client Library (`/src/lib/api`)

**Location:** `/src/lib/api/`

| File              | Purpose              | Path                            |
| ----------------- | -------------------- | ------------------------------- |
| Addresses API     | Address CRUD         | `/src/lib/api/addresses.ts`     |
| Inventory API     | Inventory management | `/src/lib/api/inventory.ts`     |
| Notifications API | Notifications        | `/src/lib/api/notifications.ts` |
| Orders API        | Orders CRUD          | `/src/lib/api/orders.ts`        |
| Products API      | Products CRUD        | `/src/lib/api/products.ts`      |
| User API          | User profile         | `/src/lib/api/user.ts`          |

### CMS Library (`/src/lib/cms`)

**Location:** `/src/lib/cms/`

| File         | Purpose           | Path                       |
| ------------ | ----------------- | -------------------------- |
| CMS Config   | CMS configuration | `/src/lib/cms/config.ts`   |
| CMS Database | Data operations   | `/src/lib/cms/database.ts` |

### Email Library (`/src/lib/email`)

**Location:** `/src/lib/email/`

| File         | Purpose           | Path                           |
| ------------ | ----------------- | ------------------------------ |
| Email Client | Email service     | `/src/lib/email/client.ts`     |
| Gmail SMTP   | Gmail integration | `/src/lib/email/gmail-smtp.ts` |
| Resend       | Resend service    | `/src/lib/email/resend.ts`     |
| Send Email   | Email sender      | `/src/lib/email/send-email.ts` |
| Index        | Email exports     | `/src/lib/email/index.ts`      |

#### Email Templates

**Location:** `/src/lib/email/templates/`

| Template           | Purpose          | File                     |
| ------------------ | ---------------- | ------------------------ |
| Email Layout       | Base template    | `email-layout.tsx`       |
| Order Approved     | Order approval   | `order-approved.tsx`     |
| Order Confirmation | Order confirm    | `order-confirmation.tsx` |
| Order Delivered    | Delivery confirm | `order-delivered.tsx`    |
| Order Items        | Order details    | `order-items.tsx`        |
| Order Rejected     | Order rejection  | `order-rejected.tsx`     |
| Order Shipped      | Shipping confirm | `order-shipped.tsx`      |
| Index              | Template exports | `index.ts`               |

### Firebase Library (`/src/lib/firebase`)

**Location:** `/src/lib/firebase/`

| File          | Purpose          | Path               |
| ------------- | ---------------- | ------------------ |
| Config        | Firebase setup   | `config.ts`        |
| Index         | Firebase exports | `index.ts`         |
| Auth          | Firebase Auth    | `auth.ts`          |
| Users         | User profiles    | `users.ts`         |
| Cart          | Cart sync        | `cart.ts`          |
| Wishlist      | Wishlist sync    | `wishlist.ts`      |
| Orders        | Order sync       | `orders.ts`        |
| Notifications | Notifications    | `notifications.ts` |
| Addresses     | Address storage  | `addresses.ts`     |

### Lalamove Library (`/src/lib/lalamove`)

**Location:** `/src/lib/lalamove/`

| File          | Purpose             | Path               |
| ------------- | ------------------- | ------------------ |
| Client        | Lalamove API client | `client.ts`        |
| Vehicle Types | Vehicle options     | `vehicle-types.ts` |

### Payment Library (`/src/lib/payment`)

**Location:** `/src/lib/payment/`

| File     | Purpose            | Path          |
| -------- | ------------------ | ------------- |
| PayMongo | Payment processing | `paymongo.ts` |

### Sanity Library (`/src/lib/sanity`)

**Location:** `/src/lib/sanity/`

| File          | Purpose           | Path              |
| ------------- | ----------------- | ----------------- |
| Client        | Sanity API client | `client.ts`       |
| Growers       | Grower queries    | `growers.ts`      |
| Products      | Product queries   | `products.ts`     |
| Queries       | GROQ queries      | `queries.ts`      |
| Realtime      | Live updates      | `realtime.ts`     |
| Site Settings | Settings queries  | `siteSettings.ts` |
| Stores        | Store queries     | `stores.ts`       |

### Utils Library (`/src/lib/utils`)

**Location:** `/src/lib/utils/`

| File     | Purpose          | Path          |
| -------- | ---------------- | ------------- |
| Enums    | Enum utilities   | `enums.ts`    |
| Username | Username helpers | `username.ts` |

### WebSocket Library (`/src/lib/websocket`)

**Location:** `/src/lib/websocket/`

| File   | Purpose          | Path        |
| ------ | ---------------- | ----------- |
| Client | WebSocket client | `client.ts` |

---

## 🔷 TypeScript Types (`/src/types`)

**Location:** `/src/types/`

| File            | Purpose              | Path           |
| --------------- | -------------------- | -------------- |
| Admin Types     | Admin interfaces     | `admin.ts`     |
| Analytics Types | Analytics interfaces | `analytics.ts` |
| API Types       | API response types   | `api.ts`       |
| CMS Types       | CMS data types       | `cms.ts`       |
| Sanity Types    | Sanity schema types  | `sanity.ts`    |

---

## 🏗️ Configuration (`/src/config`)

**Location:** `/src/config/`

| File         | Purpose            | Path       |
| ------------ | ------------------ | ---------- |
| Admin Config | Admin panel config | `admin.ts` |

---

## 🎨 Assets (`/src/assets`)

**Location:** `/src/assets/`

(SVG icons, images, fonts - directory structure varies)

---

## 🖼️ Public Assets (`/public`)

**Location:** `/public/`

| File             | Purpose           | Path                            |
| ---------------- | ----------------- | ------------------------------- |
| Index HTML       | Firebase hosting  | `/public/index.html`            |
| Clear Auth Data  | Auth debugging    | `/public/clear-auth-data.html`  |
| Fix Profile Data | Profile debugging | `/public/fix-profile-data.html` |
| Blue Kit 1       | Product image     | `/public/blue-kit1.avif`        |
| Blue Kit 3       | Product image     | `/public/blue-kit3.avif`        |
| King Kit 1       | Product image     | `/public/king-kit1.avif`        |
| King Kit 4       | Product image     | `/public/king-kit4.avif`        |

### Payment Logos

**Location:** `/public/payment-logos/`

(Payment provider logos - GCash, PayMaya, etc.)

---

## 🎥 Sanity Studio (`/studio`)

**Location:** `/studio/`

### Studio Configuration

| File           | Purpose                | Path                          |
| -------------- | ---------------------- | ----------------------------- |
| Sanity Config  | Studio configuration   | `/studio/sanity.config.ts`    |
| Sanity CLI     | CLI configuration      | `/studio/sanity.cli.ts`       |
| Sanity Types   | Generated types        | `/studio/sanity.types.ts`     |
| Schema JSON    | Schema export          | `/studio/schema.json`         |
| Typegen JSON   | Type generation config | `/studio/sanity-typegen.json` |
| Package JSON   | Studio dependencies    | `/studio/package.json`        |
| Package Lock   | Locked versions        | `/studio/package-lock.json`   |
| PostCSS Config | PostCSS config         | `/studio/postcss.config.js`   |
| TSConfig       | TypeScript config      | `/studio/tsconfig.json`       |
| Vercel Config  | Vercel deployment      | `/studio/vercel.json`         |

### Studio Source (`/studio/src`)

#### Structure

**Location:** `/studio/src/structure/`

| File            | Purpose          | Path                             |
| --------------- | ---------------- | -------------------------------- |
| Structure Index | Studio structure | `/studio/src/structure/index.ts` |

#### Libraries

**Location:** `/studio/src/lib/`

| File               | Purpose            | Path                                   |
| ------------------ | ------------------ | -------------------------------------- |
| Initial Categories | Default categories | `/studio/src/lib/initialCategories.ts` |
| Initial Values     | Default values     | `/studio/src/lib/initialValues.ts`     |

#### Schema Types

**Location:** `/studio/src/schemaTypes/`

| File         | Purpose        | Path                               |
| ------------ | -------------- | ---------------------------------- |
| Schema Index | Schema exports | `/studio/src/schemaTypes/index.ts` |

##### Document Schemas

**Location:** `/studio/src/schemaTypes/documents/`

| Schema          | Purpose            | File                |
| --------------- | ------------------ | ------------------- |
| Analytics       | Analytics config   | `analytics.ts`      |
| Banner          | Marketing banners  | `banner.ts`         |
| Blog Category   | Blog categories    | `blogCategory.ts`   |
| Category        | Product categories | `category.ts`       |
| Coupon          | Discount coupons   | `coupon.ts`         |
| Email Campaign  | Email marketing    | `emailCampaign.ts`  |
| FAQ Category    | FAQ categories     | `faqCategory.ts`    |
| FAQ Item        | FAQ questions      | `faqItem.ts`        |
| Feature Section | Features           | `featureSection.ts` |
| Grower          | Grower profiles    | `grower.ts`         |
| Growing Guide   | Growing guides     | `growingGuide.ts`   |
| Navigation      | Nav menus          | `navigation.ts`     |
| Order           | Order schema       | `order.ts`          |
| Page            | CMS pages          | `page.ts`           |
| Person          | Team members       | `person.ts`         |
| Post            | Blog posts         | `post.ts`           |
| Product         | Products           | `product.ts`        |
| Product Bundle  | Product bundles    | `productBundle.ts`  |
| Product Variant | Product variants   | `productVariant.ts` |
| Promotion       | Promotions         | `promotion.ts`      |
| Recipe          | Recipes            | `recipe.ts`         |
| Review          | Product reviews    | `review.ts`         |
| Store           | Physical stores    | `store.ts`          |
| Testimonial     | Testimonials       | `testimonial.ts`    |

##### Object Schemas

**Location:** `/studio/src/schemaTypes/objects/`

| Schema         | Purpose      | File               |
| -------------- | ------------ | ------------------ |
| Block Content  | Rich text    | `blockContent.tsx` |
| Call to Action | CTA buttons  | `callToAction.ts`  |
| Info Section   | Info blocks  | `infoSection.ts`   |
| Link           | Link objects | `link.ts`          |

##### Singleton Schemas

**Location:** `/studio/src/schemaTypes/singletons/`

| Schema            | Purpose              | File                  |
| ----------------- | -------------------- | --------------------- |
| About Page        | About page content   | `aboutPage.ts`        |
| Contact Page      | Contact page content | `contactPage.ts`      |
| Featured Products | Homepage featured    | `featuredProducts.ts` |
| Hero Carousel     | Homepage hero        | `heroCarousel.ts`     |
| Settings          | Legacy settings      | `settings.tsx`        |
| Site Settings     | Site configuration   | `siteSettings.ts`     |

### Studio Scripts

**Location:** `/studio/scripts/`

| Script               | Purpose            | File                      |
| -------------------- | ------------------ | ------------------------- |
| Import Complete Data | Full data import   | `import-complete-data.js` |
| Import Sample Data   | Sample data import | `import-sample-data.js`   |

### Studio Sample Data

**Location:** `/studio/sample-data/`

| File              | Purpose       | Path                                         |
| ----------------- | ------------- | -------------------------------------------- |
| Complete Products | All products  | `/studio/sample-data/complete-products.json` |
| Complete Reviews  | All reviews   | `/studio/sample-data/complete-reviews.json`  |
| Phase 13 Products | Phase 13 data | `/studio/sample-data/phase-13-products.json` |
| Phase 16 Reviews  | Phase 16 data | `/studio/sample-data/phase-16-reviews.json`  |
| Product Bundles   | Bundles       | `/studio/sample-data/product-bundles.json`   |
| Product Variants  | Variants      | `/studio/sample-data/product-variants.json`  |

---

## 📜 Scripts (`/scripts`)

**Location:** `/scripts/`

### Product Scripts

| Script                 | Purpose             | File                          |
| ---------------------- | ------------------- | ----------------------------- |
| Add More Products      | Add products        | `add-more-products.js`        |
| Add Remaining Products | Complete catalog    | `add-remaining-products.js`   |
| Complete Catalog       | Full product import | `complete-product-catalog.js` |
| Product Report         | Product analytics   | `product-report.js`           |

### Data Check Scripts

| Script                 | Purpose             | File                          |
| ---------------------- | ------------------- | ----------------------------- |
| Check About Page       | Validate about      | `check-about-page.js`         |
| Check Array Keys       | Validate arrays     | `check-array-keys.js`         |
| Check Blog Content     | Validate blog       | `check-blog-content.js`       |
| Check Categories       | Validate categories | `check-add-categories.js`     |
| Check FAQs             | Validate FAQs       | `check-faqs.js`               |
| Check Featured         | Validate featured   | `check-featured.js`           |
| Check Growers          | Validate growers    | `check-growers.js`            |
| Check Grower Products  | Grower products     | `check-grower-products.js`    |
| Check Grower Stores    | Grower stores       | `check-growers-stores.js`     |
| Check Hero Data        | Validate hero       | `check-hero-data.js`          |
| Check Phase C          | Phase C validation  | `check-phase-c-data.js`       |
| Check Product Images   | Image validation    | `check-product-images.js`     |
| Check Product Video    | Video validation    | `check-product-video.js`      |
| Check Products         | Product validation  | `check-products.js`           |
| Check Published        | Published status    | `check-published-settings.js` |
| Check Sanity Data      | Data validation     | `check-sanity-data.js`        |
| Check Slugs            | Slug validation     | `check-slugs.js`              |
| Check Team Members     | Team validation     | `check-team-members.js`       |
| Check Variants Reviews | Variants/reviews    | `check-variants-reviews.js`   |

### Data Fix Scripts

| Script                   | Purpose           | File                             |
| ------------------------ | ----------------- | -------------------------------- |
| Clean Invalid Categories | Remove invalid    | `clean-invalid-categories.js`    |
| Cleanup Duplicate Video  | Remove duplicates | `cleanup-duplicate-video.js`     |
| Direct Fix Growers       | Fix growers       | `direct-fix-growers.js`          |
| Fix Array Keys           | Fix array keys    | `fix-array-keys.js`              |
| Fix Blog Categories      | Fix blog cats     | `fix-blog-category-keys.js`      |
| Fix Categories           | Fix categories    | `fix-categories.js`              |
| Fix Final Categories     | Final cat fix     | `fix-final-categories.js`        |
| Fix Hero Carousel        | Fix hero data     | `fix-hero-carousel-data.js`      |
| Fix Product Assignments  | Fix assignments   | `fix-product-assignments.js`     |
| Fix Product Variants     | Fix variants      | `fix-product-variants-flag.js`   |
| Fix Published Hero       | Fix published     | `fix-published-hero.js`          |
| Fix Recipes Guides       | Fix recipes       | `fix-recipes-guides-data.js`     |
| Fix Sanity Complete      | Complete fix      | `fix-sanity-data-complete.js`    |
| Fix Sanity References    | Fix references    | `fix-sanity-references.js`       |
| Quick Fix Refs           | Quick ref fix     | `quick-fix-refs.js`              |
| Remove Duplicates        | Remove dupes      | `remove-duplicate-categories.js` |

### Linking Scripts

| Script                   | Purpose           | File                          |
| ------------------------ | ----------------- | ----------------------------- |
| Link Growers Stores      | Link stores       | `link-growers-stores.js`      |
| Link Products Fixed      | Fix product links | `link-products-fixed.js`      |
| Link Products Growers    | Link to growers   | `link-products-growers.js`    |
| Link Products to Growers | Link products     | `link-products-to-growers.js` |
| Link Suggested Products  | Link suggestions  | `link-suggested-products.js`  |

### Migration Scripts

| Script                | Purpose             | File                                  |
| --------------------- | ------------------- | ------------------------------------- |
| Migrate Banners       | Import banners      | `migrate-banners-to-sanity.js`        |
| Migrate Blog Posts    | Import blog         | `migrate-blog-posts-to-sanity.js`     |
| Migrate FAQ           | Import FAQ          | `migrate-faq-to-sanity.js`            |
| Migrate Features      | Import features     | `migrate-features-to-sanity.js`       |
| Migrate Growers       | Import growers      | `migrate-growers-to-sanity.js`        |
| Migrate Grower Stores | Import stores       | `migrate-grower-stores.js`            |
| Migrate Guides        | Import guides       | `migrate-growing-guides-to-sanity.js` |
| Migrate Phase 8       | Phase 8 content     | `migrate-phase8-content.js`           |
| Migrate Recipes       | Import recipes      | `migrate-recipes-to-sanity.js`        |
| Migrate Settings      | Import settings     | `migrate-site-settings-to-sanity.js`  |
| Migrate Stores        | Import stores       | `migrate-stores-to-sanity.js`         |
| Migrate Testimonials  | Import testimonials | `migrate-testimonials-to-sanity.js`   |

### Setup Scripts

| Script             | Purpose           | File                          |
| ------------------ | ----------------- | ----------------------------- |
| Add Hero Slides    | Create hero       | `add-hero-slides.js`          |
| Add Product Tags   | Create tags       | `add-product-tags.js`         |
| Add Product Video  | Add videos        | `add-product-video.js`        |
| Create Featured    | Create featured   | `create-featured-products.js` |
| Enable Calendly    | Enable booking    | `enable-growers-calendly.js`  |
| Ensure Categories  | Ensure cats exist | `ensure-categories.js`        |
| Setup Announcement | Create banner     | `setup-announcement-bar.js`   |
| Update Settings    | Update config     | `update-site-settings.js`     |
| Update Team        | Update team       | `update-team-members.js`      |

### Testing Scripts

| Script               | Purpose           | File                                          |
| -------------------- | ----------------- | --------------------------------------------- |
| Audit Sanity         | Audit data        | `audit-sanity-data.js`                        |
| List Categories      | List all cats     | `list-categories.js`                          |
| Quick Audit          | Quick check       | `quick-audit.js`                              |
| Quick Check          | Quick validate    | `quick-check.js`                              |
| Test Booking Flow    | Test Calendly     | `validate-booking-flow.js`                    |
| Test Gmail           | Test email        | `test-gmail-email.js` / `test-gmail-email.ts` |
| Test Lalamove        | Test delivery     | `test-lalamove-delivery.js`                   |
| Test Media Schema    | Test media        | `test-media-schema.js`                        |
| Test Settings        | Test config       | `test-site-settings.js`                       |
| Test Write Access    | Test write        | `test-write-access.js`                        |
| Validate Env         | Validate env vars | `validate-env.js`                             |
| Validate Image Query | Test queries      | `verify-image-query.js`                       |
| Verify Phase B       | Phase B check     | `verify-phase-b.js`                           |

### Sanity Scripts

**Location:** `/scripts/sanity/`

| Script              | Purpose             | File                     |
| ------------------- | ------------------- | ------------------------ |
| Check Data Counts   | Count records       | `check-data-counts.js`   |
| Check Settings      | Validate settings   | `check-settings.js`      |
| Delete Products     | Remove products     | `delete-products.js`     |
| Fix Categories      | Fix category fields | `fix-category-fields.js` |
| Fix Product Images  | Fix images          | `fix-product-images.js`  |
| Fix Products Schema | Fix schema          | `fix-products-schema.js` |
| Import Bundles      | Import bundles      | `import-bundles.js`      |
| Import Categories   | Import categories   | `import-categories.js`   |
| Import Products     | Import products     | `import-products.js`     |
| Import Reviews      | Import reviews      | `import-reviews.js`      |
| Import Variants     | Import variants     | `import-variants.js`     |
| Link Relationships  | Link data           | `link-relationships.js`  |
| Run All Tests       | Run tests           | `run-all-tests.js`       |
| Test Connection     | Test API            | `test-connection.js`     |
| Test Frontend Query | Test queries        | `test-frontend-query.js` |
| Upload Images       | Upload images       | `upload-images.js`       |
| Verify Images       | Verify images       | `verify-images.js`       |
| Verify Variants     | Verify variants     | `verify-variants.js`     |

#### Sanity Client Library

**Location:** `/scripts/sanity/lib/`

| File          | Purpose           | Path                                   |
| ------------- | ----------------- | -------------------------------------- |
| Sanity Client | Sanity API client | `/scripts/sanity/lib/sanity-client.js` |

---

## 📊 Sample Data (`/data`)

**Location:** `/data/`

### Addresses

**Location:** `/data/addresses/`

| File           | Purpose        | Path                                       |
| -------------- | -------------- | ------------------------------------------ |
| Manila Address | Sample address | `/data/addresses/manila-address.json`      |
| Quezon City    | Sample address | `/data/addresses/quezon-city-address.json` |

### Categories

**Location:** `/data/categories/`

| File            | Purpose       | Path                                    |
| --------------- | ------------- | --------------------------------------- |
| Dried Mushrooms | Category data | `/data/categories/dried-mushrooms.json` |
| Fresh Mushrooms | Category data | `/data/categories/fresh-mushrooms.json` |
| Mushroom Kits   | Category data | `/data/categories/mushroom-kits.json`   |

### CMS

**Location:** `/data/cms/`

| File           | Purpose      | Path                            |
| -------------- | ------------ | ------------------------------- |
| About          | About page   | `/data/cms/about.json`          |
| FAQ            | FAQ data     | `/data/cms/faq.json`            |
| FAQ Categories | FAQ cats     | `/data/cms/faq-categories.json` |
| Features       | Features     | `/data/cms/features.json`       |
| Hero           | Hero content | `/data/cms/hero.json`           |

### Devices

**Location:** `/data/devices/`

| File            | Purpose    | Path                                    |
| --------------- | ---------- | --------------------------------------- |
| Growing Chamber | IoT device | `/data/devices/growing-chamber-01.json` |

### Growers

**Location:** `/data/growers/`

| File         | Purpose        | Path                                       |
| ------------ | -------------- | ------------------------------------------ |
| Baguio Farms | Grower profile | `/data/growers/baguio-highland-farms.json` |
| Manila Farm  | Grower profile | `/data/growers/manila-urban-farm.json`     |

### Inventory

**Location:** `/data/inventory/`

| File          | Purpose    | Path                                 |
| ------------- | ---------- | ------------------------------------ |
| Product Stock | Stock data | `/data/inventory/product-stock.json` |

### Notifications

**Location:** `/data/notifications/`

| File            | Purpose      | Path                                       |
| --------------- | ------------ | ------------------------------------------ |
| Low Stock Alert | Alert sample | `/data/notifications/low-stock-alert.json` |
| Order Shipped   | Notification | `/data/notifications/order-shipped.json`   |

### Orders

**Location:** `/data/orders/`

| File            | Purpose      | Path                                |
| --------------- | ------------ | ----------------------------------- |
| Completed Order | Order sample | `/data/orders/order-completed.json` |

### Products

**Location:** `/data/products/`

| File              | Purpose      | Path                                          |
| ----------------- | ------------ | --------------------------------------------- |
| Growing Kit       | Product data | `/data/products/mushroom-growing-kit.json`    |
| Oyster Fresh      | Product data | `/data/products/oyster-mushroom-fresh.json`   |
| Shiitake Dried    | Product data | `/data/products/shiitake-mushroom-dried.json` |
| Products Database | All products | `/data/products-database.json`                |

### Reviews

**Location:** `/data/reviews/`

| File            | Purpose       | Path                                 |
| --------------- | ------------- | ------------------------------------ |
| Verified Review | Review sample | `/data/reviews/verified-review.json` |

### Sanity

**Location:** `/data/sanity/`

| File          | Purpose       | Path                              |
| ------------- | ------------- | --------------------------------- |
| Bundles       | Bundle data   | `/data/sanity/bundles.json`       |
| Categories    | Category data | `/data/sanity/categories.json`    |
| Products      | Product data  | `/data/sanity/products.json`      |
| Relationships | Data links    | `/data/sanity/relationships.json` |
| Reviews       | Review data   | `/data/sanity/reviews.json`       |
| Variants      | Variant data  | `/data/sanity/variants.json`      |

### Users

**Location:** `/data/users/`

| File           | Purpose     | Path                              |
| -------------- | ----------- | --------------------------------- |
| Buyer Profile  | Buyer data  | `/data/users/buyer-profile.json`  |
| Grower Profile | Grower data | `/data/users/grower-profile.json` |

### Database Tables

**Location:** `/data/tables/`

Comprehensive backend database schema samples organized by domain:

#### Alerts & Notifications

**Location:** `/data/tables/alerts-notifications/`

- alert.json
- alert-acknowledgment.json
- alert-escalation-policy.json
- alert-rule.json
- alert-rule-recipient.json
- notification.json
- notification-template.json
- user-notification.json

#### Analytics

**Location:** `/data/tables/analytics/`

- report.json
- report-execution.json
- report-subscription.json
- search-log.json

#### API Gateway

**Location:** `/data/tables/api-gateway/`

- api-gateway-config.json
- api-usage-log.json
- api-version-usage.json
- circuit-breaker-state.json
- rate-limit-override.json
- request-queue.json

#### Core E-Commerce

**Location:** `/data/tables/core-ecommerce/`

- address.json
- category.json
- order.json
- order-item.json
- payment.json
- product.json
- user.json

#### Import/Export

**Location:** `/data/tables/import-export/`

- import-export-error.json
- import-export-job.json
- import-export-template.json

#### IoT Devices

**Location:** `/data/tables/iot-devices/`

- device.json
- device-command.json
- device-health.json
- sensor.json
- sensor-alert.json
- sensor-data.json

#### RBAC (Role-Based Access Control)

**Location:** `/data/tables/rbac/`

- permission.json
- role.json
- role-permission.json
- user-role-assignment.json

#### Security & Auth

**Location:** `/data/tables/security-auth/`

- api-key.json
- rate-limit-log.json
- security-log.json
- session.json

#### System

**Location:** `/data/tables/system/`

- audit-log.json
- push-subscription.json
- system-config.json

---

## 📝 Documentation (`/docs`)

**Location:** `/docs/`

| File                    | Purpose              | Path                                           |
| ----------------------- | -------------------- | ---------------------------------------------- |
| Fix Notes               | Bug fixes            | `/docs/fix.md`                                 |
| Google OAuth Summary    | OAuth implementation | `/docs/GOOGLE_OAUTH_IMPLEMENTATION_SUMMARY.md` |
| Google OAuth Quickstart | OAuth quick guide    | `/docs/GOOGLE_OAUTH_QUICKSTART.md`             |
| Google OAuth Setup      | OAuth detailed setup | `/docs/GOOGLE_OAUTH_SETUP.md`                  |

---

## 📚 GitHub Documentation (`/.github`)

**Location:** `/.github/`

| File                  | Purpose             | Path                                          |
| --------------------- | ------------------- | --------------------------------------------- |
| Copilot Instructions  | AI agent guide      | `/.github/copilot-instructions.md`            |
| Blog & Recipes Plan   | Content strategy    | `/.github/BLOG_AND_RECIPES_PLAN.md`           |
| Cart & Checkout Plan  | Cart implementation | `/.github/CART_AND_CHECKOUT_COMPLETE_PLAN.md` |
| GitHub Tasks          | Task tracking       | `/.github/GITHUB_PROJECT_TASKS.md`            |
| GitHub Tasks V2       | Updated tasks       | `/.github/GITHUB_PROJECT_TASKS_V2.md`         |
| Railway Deployment    | Railway guide       | `/.github/RAILWAY_DEPLOYMENT_GUIDE.md`        |
| README                | GitHub README       | `/.github/README.md`                          |
| Sanity Migration      | CMS migration       | `/.github/SANITY_FREE_MIGRATION_PLAN.md`      |
| Sanity Seeding        | Data seeding plan   | `/.github/SANITY_SEEDING_PLAN.md`             |
| Vercel Deployment     | Vercel guide        | `/.github/VERCEL_DEPLOYMENT_PLAN.md`          |
| YouTube Guide         | Video documentation | `/.github/YOUTUBE_VIDEO_GUIDE.md`             |
| **Codebase File Map** | **This document**   | `/.github/CODEBASE_FILE_MAP.md`               |

### Postman Collections

**Location:** `/.github/postman/`

(API testing collections - Postman JSON files)

### GitHub Workflows

**Location:** `/.github/workflows/`

(CI/CD pipeline configurations - GitHub Actions YAML files)

---

## 🔥 Firebase Functions (`/functions`)

**Location:** `/functions/`

| File         | Purpose                | Path                           |
| ------------ | ---------------------- | ------------------------------ |
| Package JSON | Functions dependencies | `/functions/package.json`      |
| Package Lock | Locked versions        | `/functions/package-lock.json` |
| TSConfig     | TypeScript config      | `/functions/tsconfig.json`     |
| TSConfig Dev | Dev TypeScript config  | `/functions/tsconfig.dev.json` |
| ESLint RC    | ESLint config          | `/functions/.eslintrc.js`      |

### Functions Source

**Location:** `/functions/src/`

| File  | Purpose               | Path                      |
| ----- | --------------------- | ------------------------- |
| Index | Functions entry point | `/functions/src/index.ts` |

---

## 🗂️ Additional Root Files

### Clerk (Legacy - Not Currently Used)

**Location:** `/.clerk/.tmp/`

| File           | Purpose         | Path                          |
| -------------- | --------------- | ----------------------------- |
| Keyless JSON   | Clerk config    | `/.clerk/.tmp/keyless.json`   |
| Telemetry JSON | Clerk telemetry | `/.clerk/.tmp/telemetry.json` |

### Deployment Scripts

| File            | Purpose                    | Path                   |
| --------------- | -------------------------- | ---------------------- |
| Deploy Firebase | Firebase deployment script | `/deploy-firebase.ps1` |

### Additional Documentation

| File            | Purpose                 | Path                   |
| --------------- | ----------------------- | ---------------------- |
| License         | MIT License             | `/LICENSE`             |
| README          | Project README          | `/README.md`           |
| Railway Setup   | Railway setup guide     | `/RAILWAY_SETUP.md`    |
| Category Output | Generated category list | `/category-output.txt` |

---

## 🔍 Quick Reference: Common File Paths

### Most Frequently Used Files

```
# Core Application
/src/app/layout.tsx                          # Root layout
/src/app/page.tsx                            # Homepage
/src/proxy.ts                                # Route protection (Next.js 16)
/src/app/globals.css                         # Global styles

# Context & State
/src/contexts/AuthContext.tsx                # Authentication
/src/contexts/CartContext.tsx                # Shopping cart (v2)
/src/contexts/WishlistContext.tsx            # Wishlist

# API Integration
/src/lib/api-client.ts                       # Backend API client
/src/lib/firebase/config.ts                  # Firebase setup
/src/lib/sanity/client.ts                    # Sanity CMS client
/src/lib/sanity/queries.ts                   # GROQ queries

# Core Libraries
/src/lib/auth.ts                             # Auth helpers
/src/lib/utils.ts                            # Utility functions
/src/lib/firebase/auth.ts                    # Firebase Auth
/src/lib/firebase/orders.ts                  # Order sync

# UI Components
/src/components/ui/button.tsx                # Button component
/src/components/ui/card.tsx                  # Card component
/src/components/ui/dialog.tsx                # Modal dialogs
/src/components/layout/header.tsx            # Main header
/src/components/layout/footer.tsx            # Main footer

# Configuration
/.env                                        # Environment variables (production)
/next.config.ts                              # Next.js config
/tsconfig.json                               # TypeScript config
/firebase.json                               # Firebase config
/firestore.rules                             # Firestore security

# Documentation
/.github/copilot-instructions.md             # AI agent guide
/.github/CODEBASE_FILE_MAP.md                # This file
/.github/CART_AND_CHECKOUT_COMPLETE_PLAN.md  # Cart architecture
```

---

## 📌 Path Aliases

**Configured in:** `tsconfig.json`

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Usage Examples:**

```typescript
// Instead of: import { Button } from '../../components/ui/button'
import { Button } from "@/components/ui/button";

// Instead of: import { useAuth } from '../../contexts/AuthContext'
import { useAuth } from "@/contexts/AuthContext";

// Instead of: import { apiRequest } from '../../lib/api-client'
import { apiRequest } from "@/lib/api-client";
```

---

## 🎯 Directory Purpose Summary

| Directory         | Primary Purpose             | Key Technologies                      |
| ----------------- | --------------------------- | ------------------------------------- |
| `/src/app`        | Next.js 16 App Router pages | React Server Components, Route Groups |
| `/src/components` | Reusable UI components      | Shadcn UI, Radix Primitives           |
| `/src/contexts`   | Global state management     | React Context API                     |
| `/src/hooks`      | Custom React hooks          | React Hooks, Firebase, Sanity         |
| `/src/lib`        | Utility libraries           | API clients, Firebase, Sanity         |
| `/src/types`      | TypeScript definitions      | Interfaces, Types, Enums              |
| `/studio`         | Sanity CMS Studio           | Sanity Studio, GROQ                   |
| `/scripts`        | Data migration & testing    | Node.js, Sanity Client                |
| `/public`         | Static assets               | Images, HTML files                    |
| `/functions`      | Firebase Cloud Functions    | TypeScript, Firebase SDK              |
| `/data`           | Sample/test data            | JSON files                            |
| `/.github`        | Documentation & CI/CD       | Markdown, GitHub Actions              |

---

## 🔗 Related Documentation

For detailed implementation guides, refer to:

- [copilot-instructions.md](copilot-instructions.md) - Complete AI agent guide
- [CART_AND_CHECKOUT_COMPLETE_PLAN.md](CART_AND_CHECKOUT_COMPLETE_PLAN.md) - Cart implementation
- [RAILWAY_DEPLOYMENT_GUIDE.md](RAILWAY_DEPLOYMENT_GUIDE.md) - Production deployment
- [SANITY_FREE_MIGRATION_PLAN.md](SANITY_FREE_MIGRATION_PLAN.md) - CMS migration history

---

## 📊 Statistics Summary

- **Total TypeScript/JavaScript Files:** 577+ files
- **React Components:** 150+ components
- **API Routes:** 30+ endpoints
- **Custom Hooks:** 40+ hooks
- **Sanity Schemas:** 25+ document types
- **Scripts:** 80+ utility scripts
- **Data Samples:** 100+ JSON files

---

## 🔄 Keeping This Document Updated

**When adding new files:**

1. Update the relevant section in this document
2. Follow the existing naming conventions
3. Include file purpose and full path
4. Update the statistics summary if significant changes

**Automation Note:** This document is manually maintained. Consider creating a script to auto-generate portions of this documentation in the future.

---

**Last Updated:** January 25, 2026  
**Maintained By:** AI Agent (Ralph) + Development Team  
**Version:** 1.0.0
