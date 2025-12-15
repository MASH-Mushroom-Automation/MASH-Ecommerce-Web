import React from "react";

interface TikTokIconProps {
  size?: number;
  className?: string;
}

/**
 * TikTok Icon Component
 * Custom SVG icon since Lucide React doesn't include TikTok
 */
export function TikTokIcon({ size = 24, className = "" }: TikTokIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}
