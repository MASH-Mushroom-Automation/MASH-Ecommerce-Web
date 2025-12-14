/**
 * Visual Editing Provider
 * 
 * This component enables Sanity's Visual Editing feature when in draft mode.
 * It allows click-to-edit functionality in the Presentation tool.
 */

"use client";

import { VisualEditing } from "next-sanity/visual-editing";
import { useEffect, useState } from "react";

export function SanityVisualEditing() {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    // Check if we're in an iframe (Presentation tool)
    const isInIframe = window.self !== window.top;
    
    // Also check for draft mode cookie
    const hasDraftCookie = document.cookie.includes("__prerender_bypass");
    
    setIsEnabled(isInIframe || hasDraftCookie);
  }, []);

  if (!isEnabled) {
    return null;
  }

  return <VisualEditing />;
}
