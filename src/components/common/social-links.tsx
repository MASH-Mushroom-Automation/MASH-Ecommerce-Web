"use client";

import { Facebook, Youtube, Instagram, Twitter, Linkedin, Mail } from "lucide-react";
import { TikTokIcon } from "@/components/ui/tiktok-icon";
import { cn } from "@/lib/utils";

interface SocialMediaData {
  facebook?: string;
  youtube?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  tiktok?: string;
}

interface SocialLinksProps {
  socialMedia?: SocialMediaData;
  contactEmail?: string;
  /** 'header' = inline 18px, 'mobile' = 24px with follow-us label, 'footer' = 24px inline */
  variant: "header" | "mobile" | "footer";
  className?: string;
}

const PLATFORMS = [
  { key: "facebook" as const, Icon: Facebook, label: "Facebook" },
  { key: "youtube" as const, Icon: Youtube, label: "YouTube" },
  { key: "instagram" as const, Icon: Instagram, label: "Instagram" },
  { key: "twitter" as const, Icon: Twitter, label: "Twitter" },
  { key: "linkedin" as const, Icon: Linkedin, label: "LinkedIn" },
  { key: "tiktok" as const, Icon: null, label: "TikTok" },
] as const;

const VARIANT_CONFIG = {
  header: {
    size: 18,
    linkClass: "hover:text-primary-foreground transition-opacity hover:opacity-80",
    containerClass: "hidden sm:flex items-center gap-2",
  },
  mobile: {
    size: 24,
    linkClass: "text-foreground hover:text-primary",
    containerClass: "flex items-center gap-4",
  },
  footer: {
    size: 24,
    linkClass: "text-foreground hover:text-primary transition-colors",
    containerClass: "flex justify-center space-x-4",
  },
} as const;

/**
 * Reusable social media links component.
 * Renders social icons from Sanity CMS site settings.
 */
export function SocialLinks({ socialMedia, contactEmail, variant, className }: SocialLinksProps) {
  const config = VARIANT_CONFIG[variant];

  if (!socialMedia) return null;

  const content = (
    <div className={cn(config.containerClass, className)}>
      {PLATFORMS.map(({ key, Icon, label }) => {
        const url = socialMedia[key];
        if (!url) return null;

        return (
          <a
            key={key}
            href={url}
            aria-label={label}
            className={config.linkClass}
            target="_blank"
            rel="noopener noreferrer"
          >
            {key === "tiktok" ? (
              <TikTokIcon size={config.size} />
            ) : (
              Icon && <Icon size={config.size} />
            )}
          </a>
        );
      })}
      {variant === "footer" && contactEmail && (
        <a
          href={`mailto:${contactEmail}`}
          className={config.linkClass}
          aria-label="Email"
        >
          <Mail size={config.size} />
        </a>
      )}
    </div>
  );

  if (variant === "mobile") {
    return (
      <div className="border-t border-border pt-4 mt-4">
        <p className="text-sm text-muted-foreground mb-3">Follow Us</p>
        {content}
      </div>
    );
  }

  return content;
}
