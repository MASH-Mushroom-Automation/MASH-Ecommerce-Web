/**
 * Marketing Hooks
 * Fetch and monitor coupons, promotions, and email campaigns
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { sanityClient } from "@/lib/sanity/client";

// ============================================================================
// COUPON HOOKS
// ============================================================================

export interface Coupon {
  _id: string;
  id: string;
  code: string;
  description: string;
  discountType: "percentage" | "fixed" | "free-shipping" | "bogo";
  discountValue?: number;
  minimumPurchase: number;
  maximumDiscount?: number;
  applicableProducts: "all" | "specific" | "categories";
  products?: Array<{ id: string; name: string }>;
  categories?: Array<{ id: string; name: string }>;
  usageLimit?: number;
  usageLimitPerCustomer: number;
  usageCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isPublic: boolean;
  combinableWithOtherCoupons: boolean;
  customerEligibility: "all" | "new" | "existing";
  source?: string;
}

export function useSanityCoupons(filters?: { isActive?: boolean; isPublic?: boolean }) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCoupons = useCallback(async () => {
    try {
      console.log("🎟️ [COUPONS] Fetching coupons...");
      setLoading(true);

      const conditions = ["_type == 'coupon'"];
      if (filters?.isActive !== undefined) conditions.push(`isActive == ${filters.isActive}`);
      if (filters?.isPublic !== undefined) conditions.push(`isPublic == ${filters.isPublic}`);

      const query = `*[${conditions.join(" && ")}] | order(endDate asc) {
        _id, code, description, discountType, discountValue, minimumPurchase,
        maximumDiscount, applicableProducts, usageLimit, usageLimitPerCustomer,
        usageCount, startDate, endDate, isActive, isPublic,
        combinableWithOtherCoupons, customerEligibility, source
      }`;

      const result = await sanityClient.fetch<Coupon[]>(query);
      const transformed = result.map((c) => ({ ...c, id: c._id }));
      setCoupons(transformed);
      console.log(`✅ [COUPONS] Loaded ${transformed.length} coupons`);
      setError(null);
    } catch (err) {
      console.error("❌ [COUPONS] Error:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch coupons");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchCoupons();
    const subscription = sanityClient.listen(`*[_type == "coupon"]`).subscribe((update) => {
      if (update.type === "mutation") {
        console.log("🔄 [COUPONS] Real-time update!");
        fetchCoupons();
      }
    });
    return () => subscription.unsubscribe();
  }, [fetchCoupons]);

  const validateCoupon = useCallback((code: string) => {
    const coupon = coupons.find((c) => c.code === code.toUpperCase() && c.isActive);
    if (!coupon) return { valid: false, error: "Invalid coupon code" };

    const now = new Date();
    const start = new Date(coupon.startDate);
    const end = new Date(coupon.endDate);
    if (now < start) return { valid: false, error: "Coupon not yet active" };
    if (now > end) return { valid: false, error: "Coupon expired" };
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return { valid: false, error: "Coupon usage limit reached" };
    }

    return { valid: true, coupon };
  }, [coupons]);

  return { coupons, loading, error, refetch: fetchCoupons, validateCoupon };
}

// ============================================================================
// PROMOTION HOOKS
// ============================================================================

export interface Promotion {
  _id: string;
  id: string;
  name: string;
  displayName: string;
  slug: { current: string };
  tagline?: string;
  description: string;
  bannerImage?: { url: string };
  thumbnailImage?: { url: string };
  backgroundColor?: string;
  textColor?: string;
  promotionType: string;
  discountType: "percentage" | "fixed" | "none";
  discountValue?: number;
  applicableProducts: "all" | "products" | "categories" | "bundles";
  products?: Array<{ id: string; name: string }>;
  categories?: Array<{ id: string; name: string }>;
  startDate: string;
  endDate: string;
  showOnHomepage: boolean;
  showOnProductPages: boolean;
  priority: number;
  ctaText: string;
  ctaLink?: string;
  isActive: boolean;
  isFeatured: boolean;
  impressions: number;
  clicks: number;
  conversions: number;
}

export function useSanityPromotions(filters?: { isActive?: boolean; isFeatured?: boolean }) {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPromotions = useCallback(async () => {
    try {
      console.log("🎉 [PROMOTIONS] Fetching promotions...");
      setLoading(true);

      const conditions = ["_type == 'promotion'"];
      if (filters?.isActive !== undefined) conditions.push(`isActive == ${filters.isActive}`);
      if (filters?.isFeatured !== undefined) conditions.push(`isFeatured == ${filters.isFeatured}`);

      const query = `*[${conditions.join(" && ")}] | order(priority desc, startDate desc) {
        _id, name, displayName, slug, tagline, description,
        "bannerImage": bannerImage.asset->url,
        "thumbnailImage": thumbnailImage.asset->url,
        backgroundColor, textColor, promotionType, discountType, discountValue,
        applicableProducts, startDate, endDate, showOnHomepage, showOnProductPages,
        priority, ctaText, ctaLink, isActive, isFeatured,
        impressions, clicks, conversions
      }`;

      const result = await sanityClient.fetch<Promotion[]>(query);
      const transformed = result.map((p) => ({ ...p, id: p._id }));
      setPromotions(transformed);
      console.log(`✅ [PROMOTIONS] Loaded ${transformed.length} promotions`);
      setError(null);
    } catch (err) {
      console.error("❌ [PROMOTIONS] Error:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch promotions");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchPromotions();
    const subscription = sanityClient.listen(`*[_type == "promotion"]`).subscribe((update) => {
      if (update.type === "mutation") {
        console.log("🔄 [PROMOTIONS] Real-time update!");
        fetchPromotions();
      }
    });
    return () => subscription.unsubscribe();
  }, [fetchPromotions]);

  const getActivePromotions = useCallback(() => {
    const now = new Date();
    return promotions.filter((p) => {
      const start = new Date(p.startDate);
      const end = new Date(p.endDate);
      return p.isActive && now >= start && now <= end;
    });
  }, [promotions]);

  const getHomepagePromotions = useCallback(() => {
    return getActivePromotions().filter((p) => p.showOnHomepage);
  }, [getActivePromotions]);

  return { promotions, loading, error, refetch: fetchPromotions, getActivePromotions, getHomepagePromotions };
}

export function useSanityPromotion(slug: string) {
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPromotion = async () => {
      try {
        console.log(`🎉 [PROMOTION] Fetching: ${slug}`);
        const query = `*[_type == "promotion" && slug.current == $slug][0] {
          _id, name, displayName, slug, tagline, description,
          "bannerImage": bannerImage.asset->url,
          backgroundColor, textColor, promotionType, discountType, discountValue,
          applicableProducts, startDate, endDate, ctaText, ctaLink,
          isActive, isFeatured, impressions, clicks, conversions
        }`;
        const result = await sanityClient.fetch<Promotion>(query, { slug });
        setPromotion(result ? { ...result, id: result._id } : null);
        setError(null);
      } catch (err) {
        console.error("❌ [PROMOTION] Error:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch promotion");
      } finally {
        setLoading(false);
      }
    };

    fetchPromotion();
    const subscription = sanityClient
      .listen(`*[_type == "promotion" && slug.current == "${slug}"]`)
      .subscribe((update) => {
        if (update.type === "mutation") fetchPromotion();
      });
    return () => subscription.unsubscribe();
  }, [slug]);

  return { promotion, loading, error };
}

// ============================================================================
// EMAIL CAMPAIGN HOOKS
// ============================================================================

export interface EmailCampaign {
  _id: string;
  id: string;
  name: string;
  subject: string;
  preheader?: string;
  campaignType: string;
  status: "draft" | "scheduled" | "sent" | "cancelled";
  scheduledDate?: string;
  sentDate?: string;
  audience: string;
  recipientCount: number;
  opens: number;
  uniqueOpens: number;
  clicks: number;
  uniqueClicks: number;
  bounces: number;
  unsubscribes: number;
}

export function useSanityEmailCampaigns(filters?: { status?: string }) {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async () => {
    try {
      console.log("📧 [EMAIL CAMPAIGNS] Fetching...");
      setLoading(true);

      const conditions = ["_type == 'emailCampaign'"];
      if (filters?.status) conditions.push(`status == "${filters.status}"`);

      const query = `*[${conditions.join(" && ")}] | order(sentDate desc, scheduledDate desc) {
        _id, name, subject, preheader, campaignType, status,
        scheduledDate, sentDate, audience, recipientCount,
        opens, uniqueOpens, clicks, uniqueClicks, bounces, unsubscribes
      }`;

      const result = await sanityClient.fetch<EmailCampaign[]>(query);
      const transformed = result.map((c) => ({ ...c, id: c._id }));
      setCampaigns(transformed);
      console.log(`✅ [EMAIL CAMPAIGNS] Loaded ${transformed.length} campaigns`);
      setError(null);
    } catch (err) {
      console.error("❌ [EMAIL CAMPAIGNS] Error:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch campaigns");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchCampaigns();
    const subscription = sanityClient.listen(`*[_type == "emailCampaign"]`).subscribe((update) => {
      if (update.type === "mutation") {
        console.log("🔄 [EMAIL CAMPAIGNS] Real-time update!");
        fetchCampaigns();
      }
    });
    return () => subscription.unsubscribe();
  }, [fetchCampaigns]);

  const getSummary = useCallback(() => {
    const totalSent = campaigns.filter((c) => c.status === "sent").length;
    const totalRecipients = campaigns.reduce((sum, c) => sum + c.recipientCount, 0);
    const totalOpens = campaigns.reduce((sum, c) => sum + c.uniqueOpens, 0);
    const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
    const avgOpenRate = totalRecipients > 0 ? (totalOpens / totalRecipients) * 100 : 0;
    const avgClickRate = totalOpens > 0 ? (totalClicks / totalOpens) * 100 : 0;

    return {
      totalCampaigns: campaigns.length,
      totalSent,
      totalRecipients,
      avgOpenRate: Math.round(avgOpenRate * 10) / 10,
      avgClickRate: Math.round(avgClickRate * 10) / 10,
    };
  }, [campaigns]);

  return { campaigns, loading, error, refetch: fetchCampaigns, getSummary };
}
