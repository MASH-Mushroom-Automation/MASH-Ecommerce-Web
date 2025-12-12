"use client";

import Link from "next/link";
import Image from "next/image";
import { Facebook, MapPin, Phone, Mail, Youtube, Instagram, Twitter } from "lucide-react";
import { useSanitySiteSettings, useSanityNavigation } from "@/hooks/useSanitySiteSettings";

export function Footer() {
  const { settings } = useSanitySiteSettings();
  const { menu: shopNav } = useSanityNavigation('footer-shop');
  const { menu: supportNav } = useSanityNavigation('footer-support');
  const { menu: aboutNav } = useSanityNavigation('footer-about');

  return (
    <footer className="bg-muted text-foreground border-t border-border font-['Roboto']">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Main Content Grid: Logo/Info (col-1), Shop (col-2), Customer Service (col-3), About MASH (col-4) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-16 gap-y-10">
          {/* Column 1: MASH Logo/Brand Info and Social Media - Real-time from Sanity CMS */}
          <div className="col-span-2 md:col-span-1 flex flex-col items-center text-center">
            {/* MASH Logo - Real-time */}
            <div className="mb-6">
              <Image
                src={settings?.logo || "/Logo  v6 - Market.png"}
                alt={settings?.companyName || "MASH Market"}
                width={180}
                height={60}
                className="h-auto w-auto max-w-[180px]"
              />
            </div>

            {/* Accepted Payments Section */}
            {/* This will be updated to CMS */}
            <h4 className="text-sm luz font-light mb-3 text-muted-foreground">
              Accepted Payments:
            </h4>
            <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
              <Image
                src="/payment-logos/gcash-logo.png"
                alt="GCash"
                width={50}
                height={50}
                className="h-7 w-7 object-contain"
              />
              <Image
                src="/payment-logos/Maya_Logo.svg"
                alt="Maya"
                width={50}
                height={50}
                className="h-8 w-12 object-contain"
              />
            </div>

            {/* Social Media - Real-time from Sanity CMS */}
            <div className="flex justify-center space-x-4 mt-6">
              {settings?.socialMedia?.facebook && (
                <a
                  href={settings.socialMedia.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-primary"
                  aria-label="Facebook"
                >
                  <Facebook size={24} />
                </a>
              )}
              {settings?.socialMedia?.instagram && (
                <a
                  href={settings.socialMedia.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-primary"
                  aria-label="Instagram"
                >
                  <Instagram size={24} />
                </a>
              )}
              {settings?.socialMedia?.twitter && (
                <a
                  href={settings.socialMedia.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-primary"
                  aria-label="Twitter"
                >
                  <Twitter size={24} />
                </a>
              )}
              {settings?.socialMedia?.youtube && (
                <a
                  href={settings.socialMedia.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-primary"
                  aria-label="YouTube"
                >
                  <Youtube size={24} />
                </a>
              )}
              {settings?.contactEmail && (
                <a
                  href={`mailto:${settings.contactEmail}`}
                  className="text-foreground hover:text-primary"
                  aria-label="Email"
                >
                  <Mail size={24} />
                </a>
              )}
            </div>
          </div>

          {/* Column 2: Shop Links - CMS or Fallback */}
          <div className="md:pl-6">
            <h3 className="text-lg font-semibold mb-4 text-primary">Shop</h3>
            <ul className="space-y-3 text-sm">
              {shopNav?.items?.length ? (
                shopNav.items.map((item) => (
                  <li key={item._key}>
                    <Link 
                      href={item.internalPath || item.externalUrl || '/'} 
                      className="hover:underline"
                      target={item.openInNewTab ? '_blank' : undefined}
                      rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li>
                    <Link href="/shop" className="hover:underline">
                      Products
                    </Link>
                  </li>
                  <li>
                    <Link href="/recipes" className="hover:underline">
                      Recipes
                    </Link>
                  </li>
                  <li>
                    <Link href="/guides" className="hover:underline">
                      Growing Guides
                    </Link>
                  </li>
                  <li>
                    <Link href="/grower" className="hover:underline">
                      Growers
                    </Link>
                  </li>
                  <li>
                    <Link href="/stores" className="hover:underline">
                      Store Locations
                    </Link>
                  </li>
                  <li>
                    <Link href="/faq" className="hover:underline">
                      How to Order
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Column 3: Customer Service Links - CMS or Fallback */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-primary">
              Customer Service
            </h3>
            <ul className="space-y-3 text-sm">
              {supportNav?.items?.length ? (
                supportNav.items.map((item) => (
                  <li key={item._key}>
                    <Link 
                      href={item.internalPath || item.externalUrl || '/'} 
                      className="hover:underline"
                      target={item.openInNewTab ? '_blank' : undefined}
                      rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li>
                    <Link href="/faq" className="hover:underline">
                      FAQs
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="hover:underline">
                      Contact Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/shipping-info" className="hover:underline">
                      Shipping Info
                    </Link>
                  </li>
                  <li>
                    <Link href="/returns-policy" className="hover:underline">
                      Return Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy" className="hover:underline">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="hover:underline">
                      Terms of Service
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Column 4: About MASH & Contact Details - CMS or Fallback */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-primary">
              About MASH
            </h3>
            <ul className="space-y-3 text-sm mb-8">
              {aboutNav?.items?.length ? (
                aboutNav.items.map((item) => (
                  <li key={item._key}>
                    <Link 
                      href={item.internalPath || item.externalUrl || '/'} 
                      className="hover:underline"
                      target={item.openInNewTab ? '_blank' : undefined}
                      rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li>
                    <Link href="/about" className="hover:underline">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/about#mission" className="hover:underline">
                      Our Mission
                    </Link>
                  </li>
                  <li>
                    <Link href="/start-selling" className="hover:underline">
                      Become a Grower
                    </Link>
                  </li>
                  <li>
                    <Link href="/stores" className="hover:underline">
                      Store Locations
                    </Link>
                  </li>
                </>
              )}
            </ul>

            {/* Contact Details - Real-time from Sanity CMS */}
            <div className="text-sm space-y-3">
              {settings?.address?.full && (
                <div className="flex items-center space-x-2">
                  <MapPin size={16} />
                  <span className="hover:underline">
                    {settings.address.full}
                  </span>
                </div>
              )}
              {settings?.contactPhone && (
                <div className="flex items-center space-x-2">
                  <Phone size={16} />
                  <a href={`tel:${settings.contactPhone}`} className="hover:underline">
                    {settings.contactPhone}
                  </a>
                </div>
              )}
              {settings?.contactEmail && (
                <div className="flex items-center space-x-2">
                  <Mail size={16} />
                  <a href={`mailto:${settings.contactEmail}`} className="hover:underline">
                    {settings.contactEmail}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar - Real-time from Sanity CMS */}
      <div className="border-t border-border pt-3 pb-4 text-center text-xs text-muted-foreground">
        <p>
          {(settings?.footer?.copyrightText || `© {year} ${settings?.companyName || 'MASH'}. All rights reserved.`).replace('{year}', new Date().getFullYear().toString())}
        </p>
        {settings?.footer?.aboutText && (
          <p className="mt-1">
            {settings.footer.aboutText}
          </p>
        )}
      </div>
    </footer>
  );
}
