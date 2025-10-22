import { colors } from './colors';

/**
 * Tailwind CSS theme configuration
 * This file extends the default Tailwind theme with our custom colors and design tokens
 */
export const theme = {
  extend: {
    colors: {
      // Primary colors
      primary: {
        DEFAULT: colors.primary.medium,
        dark: colors.primary.dark,
        medium: colors.primary.medium,
        light: colors.primary.light,
      },
      
      // Background colors
      background: colors.neutral.background,
      card: colors.neutral.white,
      
      // Text colors
      foreground: colors.text.primary,
      muted: colors.text.secondary,
      
      // Border colors
      border: colors.neutral.border,
      ring: colors.primary.medium,
      
      // Status colors
      success: colors.status.success,
      error: colors.status.error,
      warning: colors.status.warning,
      info: colors.status.info,
    },
    
    borderRadius: {
      'lg': '0.5rem',
      'xl': '0.75rem',
      '2xl': '1rem',
    },
    
    boxShadow: {
      'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    },
    
    fontSize: {
      'xs': ['0.75rem', { lineHeight: '1rem' }],
      'sm': ['0.875rem', { lineHeight: '1.25rem' }],
      'base': ['1rem', { lineHeight: '1.5rem' }],
      'lg': ['1.125rem', { lineHeight: '1.75rem' }],
      'xl': ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      '5xl': ['3rem', { lineHeight: '1' }],
    },
    
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      display: ['Poppins', 'system-ui', 'sans-serif'],
    },
  },
};
