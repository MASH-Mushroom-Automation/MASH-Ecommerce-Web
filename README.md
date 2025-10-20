This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Website Page Structure for MASH Marketplace

This structure outlines all essential pages for both the Customer (Buyer) experience and the Seller (Grower) experience, excluding the platform's Admin Dashboard.

1. Customer (Buyer) Facing Pages

These are the public and account pages that customers use to browse, shop, and manage their orders.

Primary Browsing & Shopping Flow
Page Name,	Path,	Description
Home Page	/	The main entry point. Features hero content, bestsellers, "Why MASH?" pitch, and featured growers.
Products / Marketplace	/products	The main catalog for all products. Includes robust filtering (by type, grower, price) and sorting.
Product Detail Page	/products/{id}	Dedicated page for a single item, including images, price, quantity selector, detailed tabs (Description, Storage, Grower Info), and "Add to Cart."
Stores / Growers Hub	/stores	A directory of all registered mushroom growers. Includes filtering by location.
Store Detail Page	/stores/{id}	The public profile of a single grower, showing their story, location, and all products they sell.
Shopping Cart	/cart	Review items, adjust quantities, apply discounts (if any), and proceed to checkout.

Checkout Flow
Page Name,	Path,	Description
Checkout: Shipping	/checkout/shipping	Step 1: Input or select saved delivery address and contact information.
Checkout: Payment	/checkout/payment	Step 2: Select payment method (GCash, Bank Transfer, COD, etc.).
Order Confirmation	/checkout/success	Step 3: Final confirmation and thank you page with order ID and summary.

Customer Account Pages (User Dashboard)
Page Name,	Path,	Description
Login	/login	Authentication page.
Sign Up	/signup	New user registration page.
My Profile	/account/profile	Edit personal info, email, and password.
Order History	/account/orders	List of past and current orders with status tracking and "View Details" option.
My Addresses	/account/addresses	Manage saved delivery locations.
My Preferences	/account/preferences	Onboarding/Settings page to set cooking style and interests for personalization.

Informational & Community Pages
Page Name,	Path,	Description
About Us	/about	MASH's mission, values, and story (focus on supporting local growers).
Become a Grower	/sell-with-us	Information page and application instructions for potential sellers.
FAQ / Help Center	/faq	Self-service answers for common buyer and general questions.
Return & Refund Policy	/returns-policy	The full, detailed policy on returns and freshness guarantee.
Recipes & Guides	/community/recipes	Educational blog content to drive engagement and product usage.

2. Seller (Grower) Dashboard Pages

These pages are the Grower Portal where sellers manage their business operations on the MASH platform.

Seller Management
Page Name,	Path,	Description
Seller Dashboard	/seller/dashboard	Overview page showing key sales metrics, recent orders, and stock alerts.
Order Management	/seller/orders	Main view to manage incoming orders, update status (Preparing, Out for Delivery), and view order history.
Product Management	/seller/products	Manage inventory: add new products, edit existing listings, set pricing, and update stock levels.
Profile Management	/seller/profile	Edit the public shop banner, logo, tagline, location, and "About Us" story.
Returns & Refunds	/seller/returns	View and process customer return requests, approve refunds, or offer replacements.