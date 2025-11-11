/**
 * MASH E-commerce Color Palette
 * Based on Figma design system
 * 
 * @deprecated This file is kept for reference only.
 * All components now use semantic color tokens defined in:
 * - src/app/globals.css (CSS variables)
 * - Tailwind classes: bg-primary, text-foreground, etc.
 * 
 * For new components, use semantic tokens instead of these hardcoded values.
 * Example: Use "bg-primary" instead of "bg-[#6A994E]"
 */

export const colors = {
  // Primary Colors
  primary: {
    dark: '#1E392A',    // Dark Green - Primary actions, headers
    medium: '#6A994E',  // Medium Green - Secondary actions, accents
    light: '#A7C957',   // Light Green - Tertiary elements, highlights
  },
  
  // Neutral Colors
  neutral: {
    white: '#FFFFFF',
    background: '#F5F5F5',  // Light gray background
    border: '#E5E7EB',      // Light border color
    divider: '#D1D5DB',     // Slightly darker border for dividers
  },
  
  // Text Colors
  text: {
    primary: '#1F2937',   // Almost black - Main text
    secondary: '#6B7280', // Medium gray - Secondary text
    tertiary: '#9CA3AF',  // Light gray - Tertiary text
    inverse: '#FFFFFF',   // White text on dark backgrounds
  },
  
  // Status Colors
  status: {
    success: '#10B981',   // Green
    error: '#EF4444',     // Red
    warning: '#F59E0B',   // Amber
    info: '#3B82F6',      // Blue
  },
  
  // Opacity Variants
  opacity: {
    hover: '0.9',
    disabled: '0.5',
    overlay: '0.7',
  }
};

// Tailwind CSS color mapping
export const tailwindColors = {
  primary: colors.primary.medium,
  'primary-dark': colors.primary.dark,
  'primary-light': colors.primary.light,
  background: colors.neutral.background,
  foreground: colors.text.primary,
  border: colors.neutral.border,
  input: colors.neutral.border,
  ring: colors.primary.medium,
  destructive: colors.status.error,
};
