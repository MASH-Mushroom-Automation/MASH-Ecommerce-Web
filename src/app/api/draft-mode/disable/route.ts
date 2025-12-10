/**
 * Draft Mode Disable Route
 * 
 * This route disables Sanity's Visual Editing / Presentation tool
 * by clearing the Next.js draft mode cookies.
 * 
 * URL: /api/draft-mode/disable
 */

import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  
  // Disable draft mode
  const draft = await draftMode();
  draft.disable();

  // Get the redirect URL from query params, default to home
  const redirectUrl = searchParams.get('redirect') || '/';
  
  // Redirect to the specified URL
  redirect(redirectUrl);
}
