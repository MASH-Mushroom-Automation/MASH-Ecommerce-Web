# MASH E-commerce Color Palette

This document outlines the official color palette for the MASH E-commerce platform, based on the Figma designs.

## Primary Colors

| Color Name | Hex Code | Usage |
|------------|----------|-------|
| Primary Dark | `#1E392A` | Primary buttons, headers, important actions |
| Primary Medium | `#6A994E` | Secondary buttons, accents, highlights |
| Primary Light | `#A7C957` | Tertiary elements, badges, success states |

## Neutral Colors

| Color Name | Hex Code | Usage |
|------------|----------|-------|
| White | `#FFFFFF` | Card backgrounds, primary content areas |
| Background | `#F5F5F5` | Page backgrounds, secondary content areas |
| Border | `#E5E7EB` | Borders, dividers, separators |
| Divider | `#D1D5DB` | Stronger dividers, form field borders |

## Text Colors

| Color Name | Hex Code | Usage |
|------------|----------|-------|
| Text Primary | `#1F2937` | Main text content |
| Text Secondary | `#6B7280` | Secondary text, labels |
| Text Tertiary | `#9CA3AF` | Placeholder text, disabled text |
| Text Inverse | `#FFFFFF` | Text on dark backgrounds |

## Status Colors

| Color Name | Hex Code | Usage |
|------------|----------|-------|
| Success | `#10B981` | Success messages, confirmations |
| Error | `#EF4444` | Error messages, destructive actions |
| Warning | `#F59E0B` | Warning messages, alerts |
| Info | `#3B82F6` | Information messages, help text |

## Component-Specific Colors

### Buttons

| Button Type | Background | Text | Hover |
|-------------|------------|------|-------|
| Primary | `#1E392A` | `#FFFFFF` | `#1E392A` with 90% opacity |
| Secondary | `#6A994E` | `#FFFFFF` | `#6A994E` with 90% opacity |
| Outline | `#FFFFFF` | `#1F2937` | `#F5F5F5` background, `#1E392A` text |
| Ghost | Transparent | `#1F2937` | `#F5F5F5` background, `#1E392A` text |
| Destructive | `#EF4444` | `#FFFFFF` | `#EF4444` with 90% opacity |

### Cards

| Element | Color |
|---------|-------|
| Background | `#FFFFFF` |
| Border | `#E5E7EB` |
| Shadow | `0 1px 3px rgba(0,0,0,0.1)` |
| Title | `#1F2937` |
| Description | `#6B7280` |

### Form Elements

| Element | Border | Background | Focus |
|---------|--------|------------|-------|
| Input | `#D1D5DB` | `#FFFFFF` | Border: `#6A994E`, Ring: `#6A994E` with 50% opacity |
| Checkbox/Radio | `#D1D5DB` | `#FFFFFF` | `#6A994E` |
| Select | `#D1D5DB` | `#FFFFFF` | Border: `#6A994E` |

## Usage Guidelines

1. **Consistency**: Use the primary colors consistently across the application to maintain brand identity.
2. **Accessibility**: Ensure text has sufficient contrast against backgrounds (WCAG AA compliance).
3. **Hierarchy**: Use color to establish visual hierarchy - primary actions should use Primary Dark.
4. **Status**: Use status colors only for their intended purpose to maintain clear communication.

## Implementation

The color palette is implemented in:

- `src/lib/colors.ts` - JavaScript constants
- `src/lib/tailwind-theme.ts` - Tailwind CSS theme configuration
- `tailwind.config.js` - Tailwind configuration

When adding new components, refer to this document and the Figma designs to ensure color consistency.
