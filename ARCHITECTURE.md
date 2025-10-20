# MASH E-commerce Platform - Architecture Documentation

> **Last Updated:** October 20, 2025  
> **Version:** 1.0.0  
> **Status:** ✅ Production Build Ready

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Route Architecture](#route-architecture)
5. [Component System](#component-system)
6. [Page Components](#page-components)
7. [Design Patterns](#design-patterns)
8. [Build Status](#build-status)

---

## 🎯 Overview

**MASH** (Mushroom Automation System Hub) is a full-featured e-commerce marketplace connecting Philippine mushroom growers directly with customers. The platform features:

- **Customer Portal**: Browse products, manage cart, checkout, account management
- **Seller Portal**: Dashboard, inventory, orders, returns management
- **Community Features**: Recipe sharing, grower profiles
- **Localized Experience**: ₱ PHP currency, GCash payments, Metro Manila delivery

---

## 🛠 Tech Stack

### Core Framework

- **Next.js 15.5.4** - React framework with App Router
- **React 19.1.0** - UI library with Server/Client Components
- **TypeScript 5.x** - Type-safe development
- **Turbopack** - Fast bundler for dev/build

### UI & Styling

- **shadcn/ui** - Component library (53 components installed)
- **Radix UI Primitives** - Unstyled, accessible components
- **Tailwind CSS v4** - Utility-first CSS framework
- **Lucide React** - Icon system (v0.545.0)
- **Framer Motion** - Animation library (v12.23.23)

### Form Management

- **react-hook-form** (v7.64.0) - Form state management
- **Zod** (v4.1.12) - Schema validation
- **@hookform/resolvers** - Form validation integration

### Additional Libraries

- **date-fns** - Date utilities
- **embla-carousel-react** - Carousel component
- **@tanstack/react-table** - Table component
- **next-themes** - Dark mode support
- **cmdk** - Command palette

---

## 📁 Project Structure

```
MASH-Ecommerce-Web/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (customer)/               # Customer route group
│   │   │   ├── products/             # Product catalog & details
│   │   │   ├── stores/               # Grower directory
│   │   │   ├── cart/                 # Shopping cart
│   │   │   ├── checkout/             # Multi-step checkout
│   │   │   ├── account/              # User account management
│   │   │   ├── community/            # Recipes & community
│   │   │   ├── login/                # Authentication
│   │   │   └── signup/               # Registration
│   │   ├── (seller)/                 # Seller route group
│   │   │   └── seller/
│   │   │       ├── dashboard/        # Sales overview
│   │   │       ├── orders/           # Order management
│   │   │       ├── products/         # Inventory
│   │   │       ├── profile/          # Shop profile
│   │   │       └── returns/          # Returns management
│   │   ├── about/                    # About page
│   │   ├── faq/                      # FAQ
│   │   ├── returns-policy/           # Policy page
│   │   ├── sell-with-us/             # Grower application
│   │   ├── api/                      # API routes
│   │   ├── layout.tsx                # Root layout with nav
│   │   ├── page.tsx                  # Homepage
│   │   └── globals.css               # Global styles
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components (53 files)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── form.tsx
│   │   │   ├── table.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── badge.tsx
│   │   │   └── ...
│   │   └── layout/                   # Layout components (empty, ready for custom)
│   │
│   ├── [pageName]Page.tsx            # Page component files (28 files)
│   │   ├── landingPage.tsx
│   │   ├── productCatalogPage.tsx
│   │   ├── cartPage.tsx
│   │   ├── checkoutShippingPage.tsx
│   │   ├── sellerDashboardPage.tsx
│   │   └── ...
│   │
│   ├── lib/
│   │   └── utils.ts                  # Utility functions (cn, etc.)
│   │
│   ├── hooks/
│   │   └── use-mobile.ts             # Custom hooks
│   │
│   ├── types/                        # TypeScript type definitions
│   └── services/                     # API service layer (ready for implementation)
│
├── public/                            # Static assets
├── components.json                    # shadcn/ui config
├── tailwind.config.ts                 # Tailwind configuration
├── tsconfig.json                      # TypeScript configuration
├── next.config.ts                     # Next.js configuration
├── package.json                       # Dependencies
├── README.md                          # Project README
├── SITE_STRUCTURE.md                  # Route documentation
└── ARCHITECTURE.md                    # This file
```

---

## 🛣 Route Architecture

### Route Groups

Next.js App Router uses **route groups** (folders in parentheses) to organize routes without affecting the URL structure.

#### (customer) Route Group

All customer-facing routes (shopping, checkout, account):

```
/products              → Browse all mushroom products
/products/[id]         → Product detail page (dynamic)
/stores                → Grower directory
/stores/[id]           → Grower profile (dynamic)
/cart                  → Shopping cart
/checkout/shipping     → Shipping address form
/checkout/payment      → Payment method selection
/checkout/success      → Order confirmation
/account/profile       → User profile
/account/orders        → Order history
/account/addresses     → Saved addresses
/account/preferences   → Shopping preferences
/community/recipes     → Recipe collection
/login                 → User login
/signup                → User registration
```

#### (seller) Route Group

Grower business management portal:

```
/seller/dashboard      → Sales overview & stats
/seller/orders         → Order fulfillment
/seller/products       → Inventory management
/seller/profile        → Shop profile editor
/seller/returns        → Returns & refunds
```

#### Root Level Routes

Informational and marketing pages:

```
/                      → Homepage (landing)
/about                 → About MASH mission
/faq                   → Frequently asked questions
/returns-policy        → Returns policy
/sell-with-us          → Grower application form
```

### Total Routes: **28 pages** (26 static + 2 dynamic)

---

## 🧩 Component System

### shadcn/ui Components (53 total)

The application uses **shadcn/ui**, a collection of re-usable components built with Radix UI primitives and Tailwind CSS. All components are:

- ✅ Fully accessible (WCAG compliant)
- ✅ Customizable and themeable
- ✅ Type-safe with TypeScript
- ✅ Copy-paste friendly (owned by the project)

**Installed Components:**

```
accordion        alert-dialog      alert            aspect-ratio
avatar           badge             breadcrumb       button-group
button           calendar          card             carousel
chart            checkbox          collapsible      command
context-menu     dialog            drawer           dropdown-menu
empty            field             form             hover-card
input-group      input-otp         input            item
kbd              label             menubar          navigation-menu
pagination       popover           progress         radio-group
resizable        scroll-area       select           separator
sheet            sidebar           skeleton         slider
sonner           spinner           switch           table
tabs             textarea          toggle-group     toggle
tooltip
```

### Component Architecture Pattern

```
src/
├── components/ui/           # Primitive UI components
│   └── button.tsx           # Example: <Button variant="default" size="lg" />
│
└── [page]Page.tsx           # Page-level components
    └── Composes multiple ui/* components
```

**Example Usage:**

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ProductCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Oyster Mushrooms</CardTitle>
        <Badge>Fresh</Badge>
      </CardHeader>
      <CardContent>
        <Button>Add to Cart</Button>
      </CardContent>
    </Card>
  );
}
```

---

## 📄 Page Components

### Component-Route Mapping

Each page has two files:

1. **Page Component** (`src/[pageName]Page.tsx`) - UI implementation
2. **Route File** (`src/app/[route]/page.tsx`) - Re-exports the component

| Page Component             | Route                  | Purpose                       |
| -------------------------- | ---------------------- | ----------------------------- |
| `landingPage.tsx`          | `/`                    | Homepage with hero & features |
| `productCatalogPage.tsx`   | `/products`            | Product grid with filters     |
| `productDetailsPage.tsx`   | `/products/[id]`       | Single product view           |
| `storesPage.tsx`           | `/stores`              | Grower directory              |
| `storeDetailPage.tsx`      | `/stores/[id]`         | Grower profile                |
| `cartPage.tsx`             | `/cart`                | Shopping cart                 |
| `checkoutShippingPage.tsx` | `/checkout/shipping`   | Address form                  |
| `checkoutPaymentPage.tsx`  | `/checkout/payment`    | Payment selection             |
| `checkoutSuccessPage.tsx`  | `/checkout/success`    | Order confirmation            |
| `loginPage.tsx`            | `/login`               | Authentication                |
| `signupPage.tsx`           | `/signup`              | Registration                  |
| `profilePage.tsx`          | `/account/profile`     | User profile                  |
| `ordersPage.tsx`           | `/account/orders`      | Order history                 |
| `addressesPage.tsx`        | `/account/addresses`   | Address management            |
| `preferencesPage.tsx`      | `/account/preferences` | User preferences              |
| `aboutPage.tsx`            | `/about`               | About MASH                    |
| `sellWithUsPage.tsx`       | `/sell-with-us`        | Grower application            |
| `faqPage.tsx`              | `/faq`                 | FAQ accordion                 |
| `returnsPolicyPage.tsx`    | `/returns-policy`      | Policy details                |
| `recipesPage.tsx`          | `/community/recipes`   | Recipe collection             |
| `sellerDashboardPage.tsx`  | `/seller/dashboard`    | Seller overview               |
| `sellerOrdersPage.tsx`     | `/seller/orders`       | Order management              |
| `sellerProductsPage.tsx`   | `/seller/products`     | Inventory                     |
| `sellerProfilePage.tsx`    | `/seller/profile`      | Shop profile                  |
| `sellerReturnsPage.tsx`    | `/seller/returns`      | Returns management            |

**Total: 28 page components** (including old checkoutPage.tsx)

---

## 🎨 Design Patterns

### 1. **Client vs Server Components**

```tsx
// Client Component (interactive)
"use client";
import { useState } from "react";

export default function CartPage() {
  const [cart, setCart] = useState([]);
  // ... interactive logic
}

// Server Component (default, no directive needed)
export default function AboutPage() {
  return <div>Static content</div>;
}
```

**Client Components Used:**

- Forms (cart, checkout, login, signup, preferences)
- Interactive tables (orders, inventory)
- Search/filter UI (products, stores)

**Server Components Used:**

- Static pages (about, FAQ, policy)
- Initial renders (can be hydrated to client)

### 2. **Form Validation Pattern**

All forms use `react-hook-form` + `zod`:

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be 8+ characters"),
});

export default function LoginPage() {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data) => {
    // Handle form submission
  };
}
```

### 3. **Navigation Pattern**

Using Next.js `<Link>` for client-side navigation:

```tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

<Button asChild>
  <Link href="/products">Shop Now</Link>
</Button>;
```

### 4. **Philippine Localization**

- **Currency**: ₱ (Philippine Peso)
- **Payment Methods**: GCash, Bank Transfer, Cash on Delivery
- **Locations**: Metro Manila cities (Quezon City, Makati, Manila, etc.)
- **Delivery**: Barangay-level addressing

---

## ✅ Build Status

### Latest Build Results

```bash
npm run build
```

**Output:**

```
✓ Compiled successfully in 5.3s
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (28/28)
✓ Collecting build traces
✓ Finalizing page optimization

Route (app)                         Size  First Load JS
┌ ○ /                            3.02 kB         130 kB
├ ○ /about                       3.05 kB         130 kB
├ ○ /account/addresses           2.69 kB         130 kB
├ ○ /account/orders              2.95 kB         130 kB
├ ○ /account/preferences         2.67 kB         130 kB
├ ○ /account/profile            13.40 kB         131 kB
├ ○ /cart                        3.31 kB         130 kB
├ ○ /checkout                    2.24 kB         197 kB
├ ○ /checkout/payment            2.75 kB         130 kB
├ ○ /checkout/shipping           6.46 kB         225 kB
├ ○ /checkout/success            2.81 kB         130 kB
├ ○ /community/recipes           3.18 kB         130 kB
├ ○ /faq                        18.40 kB         136 kB
├ ○ /login                       1.98 kB         197 kB
├ ○ /products                    6.64 kB         157 kB
├ ƒ /products/[id]               6.67 kB         157 kB
├ ○ /returns-policy              2.95 kB         130 kB
├ ○ /sell-with-us                7.70 kB         202 kB
├ ○ /seller/dashboard            2.83 kB         130 kB
├ ○ /seller/orders               6.66 kB         157 kB
├ ○ /seller/products             3.00 kB         130 kB
├ ○ /seller/profile              4.37 kB         199 kB
├ ○ /seller/returns              3.27 kB         130 kB
├ ○ /signup                      6.47 kB         201 kB
├ ○ /stores                      6.97 kB         157 kB
└ ƒ /stores/[id]                 5.06 kB         132 kB

Legend:
○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

**Status:** ✅ All routes compiled successfully  
**TypeScript:** ✅ No type errors  
**ESLint:** ✅ No linting errors  
**Total Routes:** 28 (26 static + 2 dynamic)

---

## 🚀 Next Steps

### Backend Integration

- [ ] Connect to database (PostgreSQL/MongoDB)
- [ ] Implement API routes in `/api`
- [ ] Set up authentication (NextAuth.js/Clerk)
- [ ] Add payment gateway (PayMongo for PHP)

### Features to Implement

- [ ] Real-time inventory updates
- [ ] Order tracking system
- [ ] Email notifications (Resend/SendGrid)
- [ ] Image upload (Cloudinary/S3)
- [ ] Search functionality (Algolia/Meilisearch)
- [ ] Analytics (Vercel Analytics/Google Analytics)

### Performance Optimization

- [ ] Image optimization with next/image
- [ ] Add loading states and skeletons
- [ ] Implement ISR for product pages
- [ ] Add error boundaries
- [ ] Set up monitoring (Sentry)

### Testing

- [ ] Unit tests (Jest/Vitest)
- [ ] Integration tests (React Testing Library)
- [ ] E2E tests (Playwright/Cypress)
- [ ] Accessibility testing (axe-core)

---

## 📚 Additional Documentation

- **[README.md](./README.md)** - Project overview and setup
- **[SITE_STRUCTURE.md](./SITE_STRUCTURE.md)** - Detailed route documentation
- **[components.json](./components.json)** - shadcn/ui configuration

---

## 👥 Development

**Branch:** `frontend/pages`  
**Repository:** MASH-Mushroom-Automation/MASH-Ecommerce-Web  
**Node Version:** 18.x or higher  
**Package Manager:** npm

### Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run production build
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

---

**Built with ❤️ for Philippine mushroom growers and customers**
