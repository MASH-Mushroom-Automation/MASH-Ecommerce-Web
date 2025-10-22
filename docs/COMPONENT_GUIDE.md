# MASH E-commerce Component Guide

This document outlines the key components used in the MASH E-commerce platform, based on the Figma designs.

## Button Component

Buttons follow a consistent design pattern across the application:

```tsx
// Primary button (dark green)
<Button variant="primary" size="lg" rounded="lg">
  Login
</Button>

// Secondary button (medium green)
<Button variant="default" size="lg" rounded="lg">
  Shop All Mushrooms
</Button>

// Outline button
<Button variant="outline" size="lg" rounded="lg">
  View Details
</Button>
```

### Button Variants

- `primary` - Dark green (#1E392A) background, white text
- `default` - Medium green (#6A994E) background, white text
- `outline` - White background, dark text, border
- `ghost` - No background, dark text
- `destructive` - Red background, white text

### Button Sizes

- `sm` - Small (h-9)
- `default` - Medium (h-10)
- `lg` - Large (h-11)
- `xl` - Extra Large (h-12)
- `icon` - Icon button (square)

### Button Rounding

- `default` - Slightly rounded (rounded-md)
- `lg` - More rounded (rounded-lg)
- `xl` - Very rounded (rounded-xl)
- `full` - Fully rounded (rounded-full)

## Card Component

Cards are used throughout the application to display content in a consistent way:

```tsx
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description text</CardDescription>
  </CardHeader>
  <CardContent>
    Main content goes here
  </CardContent>
  <CardFooter>
    Footer content, often contains buttons
  </CardFooter>
</Card>
```

### Card Variants

- Default - White background, light border, subtle shadow
- Product Card - Used for product listings
- Grower Card - Used for grower profiles

## Form Components

### Input

```tsx
<Input 
  placeholder="Search..." 
  className="rounded-lg border-gray-300 focus:border-primary focus:ring-primary/50" 
/>
```

### Select

```tsx
<Select value={value} onValueChange={setValue}>
  <SelectTrigger className="w-full">
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

### Checkbox

```tsx
<div className="flex items-center space-x-2">
  <Checkbox id="terms" />
  <Label htmlFor="terms">Accept terms and conditions</Label>
</div>
```

## Navigation Components

### Header

The header consists of three sections:
1. Top bar - Dark green background with seller links and social media
2. Main bar - Logo, search, cart, wishlist, and login
3. Navigation bar - Main navigation links

```tsx
<Header />
```

### Footer

The footer contains:
- Logo and company information
- Quick links
- Contact information
- Newsletter signup
- Social media links
- Copyright information

```tsx
<Footer />
```

## Product Components

### ProductCard

Used to display products in grid layouts:

```tsx
<ProductCard
  id="product-id"
  name="Product Name"
  farm="Farm Name"
  price={150}
  unit="100g"
  image="/product-image.jpg"
  inStock={true}
/>
```

### FilterSidebar

Used for filtering products:

```tsx
// Desktop
<FilterSidebar />

// Mobile
<Sheet>
  <SheetTrigger asChild>
    <Button variant="outline">Filters</Button>
  </SheetTrigger>
  <SheetContent>
    <FilterSidebar isMobile />
  </SheetContent>
</Sheet>
```

## Layout Guidelines

### Spacing

- Use consistent spacing with Tailwind's spacing scale
- Common values: p-4, p-6, gap-4, gap-6, my-8, etc.

### Responsive Design

- Mobile-first approach
- Common breakpoints:
  - `sm`: 640px and up
  - `md`: 768px and up
  - `lg`: 1024px and up
  - `xl`: 1280px and up

### Typography

- Headings: Use text-lg through text-4xl with appropriate font-weight
- Body text: Use text-sm or text-base
- Use leading-tight for headings, leading-normal for body text

## Implementation Notes

1. All components should match the Figma designs as closely as possible
2. Use the color palette defined in `src/lib/colors.ts`
3. Maintain consistent spacing and typography
4. Ensure all components are fully responsive
5. Follow accessibility best practices
