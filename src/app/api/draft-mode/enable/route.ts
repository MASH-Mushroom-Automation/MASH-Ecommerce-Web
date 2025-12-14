/**
 * Draft Mode Enable Route
 * 
 * This route enables Sanity's Visual Editing / Presentation tool
 * by setting Next.js draft mode cookies.
 * 
 * URL: /api/draft-mode/enable
 * 
 * Uses defineEnableDraftMode for full Presentation Tool support including:
 * - Perspective switcher
 * - Preview URL sharing
 */

import { defineEnableDraftMode } from 'next-sanity/draft-mode';
import { sanityClient } from '@/lib/sanity/client';

const token = process.env.SANITY_API_READ_TOKEN;

export const { GET } = defineEnableDraftMode({
  client: sanityClient.withConfig({ token }),
});
