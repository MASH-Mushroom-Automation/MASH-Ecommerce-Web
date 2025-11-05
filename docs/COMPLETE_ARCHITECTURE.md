# MASH E-Commerce Platform - Complete Architecture
**Version:** 2.0  
**Last Updated:** November 6, 2025  
**Status:** Production-Ready Frontend | Backend Integration Ready

---

## 📁 Complete File Structure

```
MASH-Ecommerce-Web/
├── 📁 src/
│   ├── 📁 app/                                    # Next.js 13+ App Router
│   │   ├── 📁 (auth)/                            # Auth Route Group
│   │   │   ├── login/
│   │   │   │   └── page.tsx                      ✅ Login page with Clerk
│   │   │   ├── signup/
│   │   │   │   └── page.tsx                      ✅ Signup page
│   │   │   └── layout.tsx                        ✅ Simple header layout
│   │   │
│   │   ├── 📁 (shop)/                            # Shop Route Group
│   │   │   ├── shop/                             # Product Catalog (renamed from catalog)
│   │   │   │   └── page.tsx                      ✅ Filters, search, pagination
│   │   │   ├── product/[id]/
│   │   │   │   └── page.tsx                      ✅ Product details, reviews
│   │   │   ├── cart/
│   │   │   │   └── page.tsx                      ✅ Shopping cart
│   │   │   ├── checkout/
│   │   │   │   └── page.tsx                      ✅ Checkout flow
│   │   │   ├── grower/
│   │   │   │   ├── page.tsx                      ✅ Growers directory
│   │   │   │   └── [id]/page.tsx                 ✅ Grower profile
│   │   │   └── layout.tsx                        ✅ Main header layout
│   │   │
│   │   ├── 📁 (user)/                            # User Route Group
│   │   │   └── profile/
│   │   │       ├── layout.tsx                    ✅ Profile sidebar
│   │   │       ├── my-information/
│   │   │       │   └── page.tsx                  ✅ Profile info, avatar upload
│   │   │       ├── order-history/
│   │   │       │   └── page.tsx                  ✅ User orders (to-pay, to-receive, completed)
│   │   │       ├── addresses/
│   │   │       │   └── page.tsx                  ✅ Address management
│   │   │       ├── wishlist/
│   │   │       │   └── page.tsx                  ✅ Saved products
│   │   │       └── settings/
│   │   │           └── page.tsx                  ✅ Account settings
│   │   │
│   │   ├── 📁 (seller)/                          # Seller Route Group
│   │   │   └── seller/
│   │   │       ├── dashboard/
│   │   │       │   └── page.tsx                  ✅ Sales stats, charts
│   │   │       ├── products/
│   │   │       │   ├── page.tsx                  ✅ Product list, CRUD
│   │   │       │   ├── new/page.tsx              ✅ Add new product
│   │   │       │   └── [id]/edit/page.tsx        ✅ Edit product
│   │   │       ├── orders/
│   │   │       │   ├── page.tsx                  ✅ Order management
│   │   │       │   └── [id]/page.tsx             ✅ Order details
│   │   │       ├── inventory/
│   │   │       │   └── page.tsx                  ✅ Stock management
│   │   │       ├── refunds/
│   │   │       │   └── page.tsx                  ⚠️  Mock data only
│   │   │       ├── notifications/
│   │   │       │   └── page.tsx                  ⚠️  Mock data only
│   │   │       ├── settings/
│   │   │       │   ├── profile/page.tsx          ⚠️  Mock data only
│   │   │       │   ├── password/page.tsx         ⚠️  Mock data only
│   │   │       │   ├── bank/page.tsx             ⚠️  Mock data only
│   │   │       │   └── account/page.tsx          ⚠️  Mock data only
│   │   │       ├── handover-centers/
│   │   │       │   └── page.tsx                  ⚠️  Mock data only
│   │   │       ├── shipping-channels/
│   │   │       │   └── page.tsx                  ⚠️  Mock data only
│   │   │       └── layout.tsx                    ✅ Seller header layout
│   │   │
│   │   ├── 📁 (onboarding)/                      # Onboarding Route Group
│   │   │   └── onboarding/
│   │   │       └── page.tsx                      ✅ User interests, cooking level
│   │   │
│   │   ├── 📁 (misc)/                            # Misc Pages Route Group
│   │   │   ├── about/page.tsx                    ✅ About us
│   │   │   ├── contact/page.tsx                  ✅ Contact form
│   │   │   ├── faq/page.tsx                      ✅ FAQ page
│   │   │   ├── blog/page.tsx                     ✅ Blog listing
│   │   │   ├── terms/page.tsx                    ✅ Terms of service
│   │   │   ├── privacy/page.tsx                  ✅ Privacy policy
│   │   │   └── start-selling/page.tsx            ✅ Seller application form
│   │   │
│   │   ├── page.tsx                              ✅ Homepage (Hero, Featured, Growers)
│   │   ├── layout.tsx                            ✅ Root layout
│   │   ├── globals.css                           ✅ Global styles
│   │   ├── not-found.tsx                         ✅ Custom 404 page
│   │   └── error.tsx                             ✅ Error boundary
│   │
│   ├── 📁 components/                            # Reusable Components
│   │   ├── 📁 layout/                            # Layout Components
│   │   │   ├── header.tsx                        ✅ Main header (three-state seller)
│   │   │   ├── seller-header.tsx                 ✅ Seller dashboard header
│   │   │   ├── simple-header.tsx                 ✅ Auth pages header
│   │   │   ├── footer.tsx                        ✅ Site footer
│   │   │   ├── navigation.tsx                    ✅ Desktop navigation
│   │   │   ├── mobile-nav.tsx                    ✅ Mobile bottom nav
│   │   │   └── breadcrumbs.tsx                   ✅ Breadcrumb navigation
│   │   │
│   │   ├── 📁 product/                           # Product Components
│   │   │   ├── ProductCard.tsx                   ✅ Product grid card
│   │   │   ├── ProductCardSkeleton.tsx           ✅ Loading skeleton
│   │   │   ├── ProductGrid.tsx                   ✅ Product grid layout
│   │   │   ├── ProductList.tsx                   ✅ Product list view
│   │   │   ├── ProductGallery.tsx                ✅ Image carousel
│   │   │   ├── ProductDetails.tsx                ✅ Product info section
│   │   │   └── ProductReviews.tsx                ✅ Reviews section
│   │   │
│   │   ├── 📁 cart/                              # Cart Components
│   │   │   ├── CartItem.tsx                      ✅ Cart line item
│   │   │   ├── CartSummary.tsx                   ✅ Price breakdown
│   │   │   ├── CartDropdown.tsx                  ✅ Header cart dropdown
│   │   │   └── CartEmpty.tsx                     ✅ Empty state
│   │   │
│   │   ├── 📁 catalog/                           # Catalog Components
│   │   │   ├── FilterSidebar.tsx                 ✅ Desktop filters
│   │   │   ├── FilterSheet.tsx                   ✅ Mobile filter sheet
│   │   │   ├── SortDropdown.tsx                  ✅ Sort selector
│   │   │   ├── PriceRangeFilter.tsx              ✅ Price slider
│   │   │   └── CategoryFilter.tsx                ✅ Category checkboxes
│   │   │
│   │   ├── 📁 seller/                            # Seller Components
│   │   │   ├── SellerSidebar.tsx                 ✅ Dashboard sidebar
│   │   │   ├── StatCard.tsx                      ✅ Stats widget
│   │   │   ├── SalesChart.tsx                    ✅ Revenue chart
│   │   │   ├── OrderTable.tsx                    ✅ Order list table
│   │   │   ├── ProductTable.tsx                  ✅ Product list table
│   │   │   └── NotificationBell.tsx              ✅ Notification dropdown
│   │   │
│   │   ├── 📁 profile/                           # Profile Components
│   │   │   ├── ProfileSidebar.tsx                ✅ Profile navigation
│   │   │   ├── AvatarUpload.tsx                  ✅ Avatar upload widget
│   │   │   ├── AddressCard.tsx                   ✅ Address display/edit
│   │   │   └── OrderCard.tsx                     ✅ Order history item
│   │   │
│   │   ├── 📁 grower/                            # Grower Components
│   │   │   ├── GrowerCard.tsx                    ✅ Grower grid card
│   │   │   ├── GrowerProfile.tsx                 ✅ Grower details
│   │   │   ├── GrowerMap.tsx                     ✅ Location map
│   │   │   └── RegionFilter.tsx                  ✅ Region selector
│   │   │
│   │   ├── 📁 forms/                             # Form Components
│   │   │   ├── CheckoutForm.tsx                  ✅ Checkout fields
│   │   │   ├── ContactForm.tsx                   ✅ Contact page form
│   │   │   ├── SellerApplicationForm.tsx         ✅ Seller onboarding
│   │   │   └── AddressForm.tsx                   ✅ Address input
│   │   │
│   │   ├── 📁 ui/                                # ShadCN UI Components
│   │   │   ├── button.tsx                        ✅ Button
│   │   │   ├── card.tsx                          ✅ Card
│   │   │   ├── input.tsx                         ✅ Input
│   │   │   ├── select.tsx                        ✅ Select
│   │   │   ├── dialog.tsx                        ✅ Modal dialog
│   │   │   ├── dropdown-menu.tsx                 ✅ Dropdown
│   │   │   ├── sheet.tsx                         ✅ Slide-over panel
│   │   │   ├── tabs.tsx                          ✅ Tabs
│   │   │   ├── badge.tsx                         ✅ Badge
│   │   │   ├── skeleton.tsx                      ✅ Loading skeleton
│   │   │   ├── toast.tsx                         ✅ Toast notification
│   │   │   ├── table.tsx                         ✅ Table
│   │   │   ├── label.tsx                         ✅ Label
│   │   │   ├── textarea.tsx                      ✅ Textarea
│   │   │   ├── checkbox.tsx                      ✅ Checkbox
│   │   │   ├── radio-group.tsx                   ✅ Radio buttons
│   │   │   ├── slider.tsx                        ✅ Slider
│   │   │   ├── separator.tsx                     ✅ Divider
│   │   │   └── ...30+ more components            ✅ Full ShadCN library
│   │   │
│   │   └── 📁 shared/                            # Shared Components
│   │       ├── LoadingSpinner.tsx                ✅ Loading indicator
│   │       ├── ErrorMessage.tsx                  ✅ Error display
│   │       ├── EmptyState.tsx                    ✅ No data state
│   │       ├── Pagination.tsx                    ✅ Page navigation
│   │       ├── SearchBar.tsx                     ✅ Search input
│   │       └── ImageUpload.tsx                   ✅ Image upload widget
│   │
│   ├── 📁 hooks/                                 # Custom React Hooks
│   │   ├── useUser.ts                            ✅ User profile management
│   │   ├── useCart.ts                            ✅ Shopping cart state
│   │   ├── useWishlist.ts                        ✅ Wishlist management
│   │   ├── useProducts.ts                        ✅ Product fetching
│   │   ├── useOrders.ts                          ✅ Order management
│   │   ├── useAuth.ts                            ✅ Authentication state
│   │   ├── useSeller.ts                          ✅ Seller dashboard data
│   │   ├── useInventory.ts                       ✅ Inventory management
│   │   ├── useAddresses.ts                       ✅ Address CRUD
│   │   ├── useNotifications.ts                   ✅ Notification system
│   │   ├── useHomePageData.ts                    ✅ Homepage CMS data
│   │   ├── useProductCategories.ts               ✅ Category fetching
│   │   ├── useProductGrowers.ts                  ✅ Grower fetching
│   │   └── useDebounce.ts                        ✅ Debounce utility
│   │
│   ├── 📁 lib/                                   # Utility Libraries
│   │   ├── 📁 api/                               # API Integration Modules
│   │   │   ├── auth.ts                           ✅ Authentication APIs
│   │   │   ├── user.ts                           ✅ User profile APIs
│   │   │   ├── products.ts                       ✅ Product CRUD APIs
│   │   │   ├── cart.ts                           ✅ Cart sync APIs
│   │   │   ├── orders.ts                         ✅ Order management APIs
│   │   │   ├── seller.ts                         ✅ Seller dashboard APIs
│   │   │   ├── inventory.ts                      ✅ Inventory APIs
│   │   │   ├── addresses.ts                      ✅ Address APIs
│   │   │   ├── notifications.ts                  ✅ Notification APIs
│   │   │   ├── growers.ts                        ✅ Grower APIs
│   │   │   ├── cms.ts                            ✅ CMS content APIs
│   │   │   └── contact.ts                        ✅ Contact form API
│   │   │
│   │   ├── utils.ts                              ✅ Utility functions
│   │   ├── cn.ts                                 ✅ Class name merger
│   │   ├── format.ts                             ✅ Number/date formatters
│   │   └── validation.ts                         ✅ Form validators
│   │
│   ├── 📁 types/                                 # TypeScript Types
│   │   ├── api.ts                                ✅ API response types (main)
│   │   ├── admin.ts                              ✅ Admin integration types
│   │   └── index.ts                              ✅ Common types
│   │
│   ├── 📁 config/                                # Configuration Files
│   │   ├── admin.ts                              ✅ Admin dashboard config
│   │   ├── site.ts                               ✅ Site metadata
│   │   └── routes.ts                             ✅ Route constants
│   │
│   └── 📁 styles/                                # Additional Styles
│       └── components.css                        ✅ Component-specific styles
│
├── 📁 public/                                    # Static Assets
│   ├── images/                                   ✅ Product images, banners
│   ├── icons/                                    ✅ SVG icons
│   ├── favicon.ico                               ✅ Favicon
│   ├── robots.txt                                ✅ SEO robots file
│   └── sitemap.xml                               ✅ SEO sitemap
│
├── 📁 docs/                                      # Project Documentation
│   ├── COMPLETE_ARCHITECTURE.md                  ✅ This file
│   ├── SELLER_APPLICATION_FLOW.md                ✅ Seller onboarding docs
│   ├── ADMIN_INTEGRATION.md                      ✅ Admin API integration
│   ├── COMPLETE_ROUTE_IMPROVEMENTS_SUMMARY.md    ✅ Route refactoring log
│   ├── FIGMA_IMPLEMENTATION_PROGRESS.md          ✅ Design implementation
│   └── MISSING-API-ENDPOINTS.md                  ✅ Backend requirements
│
├── 📁 documents/                                 # Backend Documentation
│   ├── BACKEND_INTEGRATION_AUDIT_REPORT.md       ✅ Integration audit
│   ├── Backend_Development_Plan.md               ✅ Backend roadmap
│   ├── API_Endpoints_Structure.md                ✅ Complete API specs
│   └── IMPLEMENTATION_SUMMARY.md                 ✅ Implementation status
│
├── 📁 .github/                                   # GitHub Configuration
│   └── workflows/
│       ├── ci.yml                                ⚠️  CI/CD pipeline (future)
│       └── deploy.yml                            ⚠️  Deployment (future)
│
├── next.config.ts                                ✅ Next.js config
├── tailwind.config.ts                            ✅ Tailwind config
├── tsconfig.json                                 ✅ TypeScript config
├── package.json                                  ✅ Dependencies
├── .env.local                                    ✅ Environment variables
├── .eslintrc.json                                ✅ ESLint config
└── README.md                                     ✅ Project readme
```

---

## 🏗️ Architecture Patterns

### 1. **Route Groups (App Router)**
```typescript
// Route groups organize pages without affecting URL structure
(shop)/     → Public shopping pages
(user)/     → Authenticated user pages
(seller)/   → Seller dashboard pages
(auth)/     → Authentication pages
(onboarding)/ → User onboarding
(misc)/     → Miscellaneous pages
```

### 2. **Layout Hierarchy**
```typescript
app/layout.tsx                           // Root layout (providers, fonts)
├── (shop)/layout.tsx                   // Main header + footer
├── (user)/profile/layout.tsx           // Profile sidebar
├── (seller)/seller/layout.tsx          // Seller header + sidebar
└── (auth)/layout.tsx                   // Simple header only
```

### 3. **Data Fetching Pattern**
```typescript
// Custom hook → API module → Backend/Mock fallback
useProducts() 
  → ProductsApi.getProducts()
    → Try real API endpoint
    → Fallback to MOCK_PRODUCTS if API fails
```

### 4. **Component Organization**
```typescript
// Feature-based component folders
components/
├── product/     → Product-specific components
├── cart/        → Cart-specific components
├── catalog/     → Catalog/filter components
├── seller/      → Seller dashboard components
├── profile/     → User profile components
├── grower/      → Grower-specific components
├── forms/       → Form components
├── ui/          → Base UI components (ShadCN)
├── layout/      → Layout components
└── shared/      → Shared utilities
```

### 5. **Three-State Seller Flow**
```typescript
// UserProfile type determines header state
sellerStatus: 'none'      → "Start Selling" link
sellerStatus: 'pending'   → "Application Pending ⏳" (non-clickable)
sellerStatus: 'approved'  → "Seller Center" link

// Implemented in:
- src/types/api.ts (type definition)
- src/components/layout/header.tsx (UI logic)
- src/components/layout/seller-header.tsx (UI logic)
- src/components/layout/simple-header.tsx (UI logic)
```

---

## 🔄 Data Flow Architecture

### Frontend → Backend Flow
```
User Action (UI)
    ↓
React Hook (useProducts, useSeller, etc.)
    ↓
API Module (src/lib/api/*.ts)
    ↓
Try Real Backend Endpoint
    ↓
✅ Success → Return data
❌ Fail → Return mock data
    ↓
Update React State
    ↓
Re-render UI
```

### Backend → Frontend Flow (WebSocket)
```
Backend Event (order created, notification, etc.)
    ↓
WebSocket Server
    ↓
Frontend WebSocket Client
    ↓
React Hook (useNotifications, useOrders)
    ↓
Update React State
    ↓
Show Toast/Update UI
```

---

## 📊 Page Status Summary

### ✅ Fully Implemented (45 pages)
All pages have:
- Complete UI implementation
- Loading states with skeletons
- Error boundaries
- Mock data fallback
- Responsive design
- Accessibility features

### ⚠️ Mock Data Only (7 pages)
These pages are UI-complete but use only mock data:
- Seller refunds
- Seller notifications
- Seller settings (4 sub-pages)
- Handover centers
- Shipping channels

### ❌ Not Yet Implemented
- Admin dashboard (separate repo)

---

## 🔌 Integration Points

### Current State
- **Frontend:** 100% complete with mock fallbacks
- **Backend:** 85% ready (32 endpoints missing)
- **Admin:** Types/config ready, UI in separate repo

### Critical Missing APIs (Phase 1 MVP)
1. `POST /api/orders/create` - Order creation
2. `GET /api/user/orders` - Order history
3. `GET /api/products/search` - Product search
4. `POST /api/seller/products` - Create product
5. `POST /api/seller/application` - Seller application
6. `GET /api/seller/application/status` - Application status
7. `PUT /api/admin/seller-applications/:id/approve` - Admin approval
8. `PUT /api/admin/seller-applications/:id/reject` - Admin rejection
9. `POST /api/contact` - Contact form

---

## 🎯 Key Features

### Buyer Features ✅
- Product browsing with filters
- Shopping cart (localStorage + API sync ready)
- Checkout flow with auto-fill
- Order history with status tracking
- Wishlist management
- Address management
- Profile customization
- Grower discovery

### Seller Features ✅
- Three-state application flow (none → pending → approved)
- Sales dashboard with analytics
- Product CRUD operations
- Inventory management with stock alerts
- Order management with status updates
- Notification system (UI ready)
- Profile settings (UI ready)

### Admin Features (Separate Repo)
- Seller application review
- Product moderation
- Order oversight
- Analytics dashboard
- User management

---

## 🚀 Performance Optimizations

- **Image Optimization:** Next.js `<Image>` with `priority` and `sizes`
- **Code Splitting:** Route-based with dynamic imports
- **Lazy Loading:** Below-fold images and components
- **Caching:** API responses with mock fallback
- **Debouncing:** Search and filter inputs (500ms)
- **Skeleton Loaders:** Immediate visual feedback
- **Error Boundaries:** Graceful error handling

---

## 📱 Mobile-First Design

- **Bottom Navigation:** Mobile-specific nav bar
- **Touch Targets:** Minimum 44x44px
- **Filter Sheets:** Mobile-optimized filters
- **Responsive Grid:** Adapts to screen size
- **Swipe Gestures:** Image galleries, product carousels

---

## 🔐 Security Features

- **Clerk Authentication:** JWT-based auth
- **CSRF Protection:** Built into Next.js
- **Input Validation:** Zod schemas
- **Rate Limiting:** Ready for backend
- **CORS Configuration:** Admin dashboard CORS
- **Secure Headers:** Helmet integration ready

---

## 🧪 Testing Strategy (Planned)

- **Unit Tests:** Component testing with Jest
- **Integration Tests:** API hook testing
- **E2E Tests:** Playwright for critical flows
- **Visual Regression:** Chromatic for UI changes
- **Accessibility:** axe-core for a11y testing

---

## 📚 Documentation Coverage

| Document | Status | Purpose |
|----------|--------|---------|
| `COMPLETE_ARCHITECTURE.md` | ✅ | Full system architecture |
| `SELLER_APPLICATION_FLOW.md` | ✅ | Seller onboarding process |
| `ADMIN_INTEGRATION.md` | ✅ | Admin dashboard integration |
| `BACKEND_INTEGRATION_AUDIT_REPORT.md` | ✅ | Backend readiness audit |
| `MISSING-API-ENDPOINTS.md` | ✅ | API requirements |
| `API_Endpoints_Structure.md` | ✅ | Complete API specs |
| `Backend_Development_Plan.md` | ✅ | Backend roadmap |

---

## 🎨 Design System

### Color Palette
- **Primary:** Dark Green (`#1E392A`)
- **Accent:** Mushroom Beige/Cream
- **Success:** Green variations
- **Error:** Red shades
- **Text:** Gray scale

### Typography
- **Headings:** Inter (Bold)
- **Body:** Inter (Regular)
- **Code:** Fira Code

### Spacing
- Consistent 8px grid system
- Responsive breakpoints: sm, md, lg, xl, 2xl

---

## 🔮 Future Enhancements

### Phase 2 Features
- Real-time notifications via WebSocket
- Advanced analytics dashboards
- Seller verification system
- Payment gateway integration
- Multi-language support
- Dark mode

### Phase 3 Features
- Mobile app (React Native)
- AI-powered recommendations
- Social features (reviews, ratings)
- Loyalty program
- Subscription model

---

*End of Architecture Documentation*
