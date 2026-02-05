// CMS Data Fetching Hooks
// src/hooks/useCMS.ts

import { useState, useEffect, useCallback } from "react";

// CMS Base Model
interface CMSBaseModel {
  id: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

// CMS Response Types
interface CMSResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface AboutHeroSection extends CMSBaseModel {
  title: string;
  subtitle: string;
  backgroundImage?: string;
}

export interface ChallengesSection extends CMSBaseModel {
  title: string;
  subtitle: string;
  challenges: string[];
}

export interface SolutionsSection extends CMSBaseModel {
  title: string;
  subtitle: string;
  solutions: SolutionItem[];
}

export interface VisionSection extends CMSBaseModel {
  title: string;
  content: string[];
  callToAction: string;
}

export interface MentorSection extends CMSBaseModel {
  title: string;
  subtitle: string;
  mentor: {
    name: string;
    title: string;
    avatar?: string;
    bio?: string;
  };
}

export interface ContactInfo extends CMSBaseModel {
  type: "phone" | "email" | "address" | "whatsapp" | "telegram";
  title: string;
  value: string;
  description?: string;
}

export interface BusinessHours extends CMSBaseModel {
  dayOfWeek:
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";
  openTime: string;
  closeTime: string;
  isClosed: boolean;
  notes?: string;
}

export interface SocialLink {
  id: string;
  platform:
    | "facebook"
    | "twitter"
    | "instagram"
    | "linkedin"
    | "youtube"
    | "tiktok"
    | "github";
  url: string;
  displayOrder: number;
  isActive: boolean;
}
export interface SolutionItem {
  id: string;
  title: string;
  description: string;
  icon?: string;
  displayOrder: number;
}

export interface HeroSection {
  id: string;
  title: string;
  subtitle: string;
  backgroundImages: string[];
  primaryButton: {
    text: string;
    url: string;
    variant: "primary" | "secondary" | "outline" | "ghost";
  };
  secondaryButton: {
    text: string;
    url: string;
    variant: "primary" | "secondary" | "outline" | "ghost";
  };
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface FeatureSection {
  id: string;
  title: string;
  subtitle: string;
  features: FeatureItem[];
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface FeatureItem {
  id: string;
  icon: string;
  headline: string;
  subheadline: string;
  displayOrder: number;
  isActive: boolean;
}

export interface FAQCategory {
  id: string;
  name: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FAQItem {
  id: string;
  categoryId: string;
  question: string;
  answer: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FAQGroup {
  id: string;
  name: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  questions: FAQItem[];
}

// Hero Sections Hook
export function useHeroSections() {
  const [heroes, setHeroes] = useState<HeroSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHeroes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/cms/hero?activeOnly=true");
      const data: CMSResponse<HeroSection[]> = await response.json();

      if (data.success) {
        // Sort by display order
        const sortedHeroes = data.data.sort(
          (a, b) => a.displayOrder - b.displayOrder,
        );
        setHeroes(sortedHeroes);
      } else {
        setError(data.error || "Failed to fetch hero sections");
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHeroes();
  }, [fetchHeroes]);

  return {
    heroes,
    loading,
    error,
    refetch: fetchHeroes,
  };
}

// Feature Sections Hook
export function useFeatureSections() {
  const [features, setFeatures] = useState<FeatureSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeatures = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/cms/features?activeOnly=true");
      const data: CMSResponse<FeatureSection[]> = await response.json();

      if (data.success) {
        // Sort by display order
        const sortedFeatures = data.data.sort(
          (a, b) => a.displayOrder - b.displayOrder,
        );
        setFeatures(sortedFeatures);
      } else {
        setError(data.error || "Failed to fetch feature sections");
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeatures();
  }, [fetchFeatures]);

  return {
    features,
    loading,
    error,
    refetch: fetchFeatures,
  };
}

// FAQ Hook
export function useFAQs() {
  const [faqs, setFAQs] = useState<FAQGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFAQs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/cms/faq");
      const data: CMSResponse<FAQGroup[]> = await response.json();

      if (data.success) {
        // Sort categories and questions by display order
        const sortedFAQs = data.data
          .map((category) => ({
            ...category,
            questions: category.questions.sort(
              (a, b) => a.displayOrder - b.displayOrder,
            ),
          }))
          .sort((a, b) => a.displayOrder - b.displayOrder);

        setFAQs(sortedFAQs);
      } else {
        setError(data.error || "Failed to fetch FAQs");
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFAQs();
  }, [fetchFAQs]);

  return {
    faqs,
    loading,
    error,
    refetch: fetchFAQs,
  };
}

// FAQ Categories Hook
export function useFAQCategories() {
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/cms/faq/categories");
      const data: CMSResponse<FAQCategory[]> = await response.json();

      if (data.success) {
        const sortedCategories = data.data.sort(
          (a, b) => a.displayOrder - b.displayOrder,
        );
        setCategories(sortedCategories);
      } else {
        setError(data.error || "Failed to fetch FAQ categories");
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  };
}

// About Page Hook
export function useAboutContent() {
  const [content, setContent] = useState<{
    hero?: AboutHeroSection;
    challenges?: ChallengesSection;
    solutions?: SolutionsSection;
    vision?: VisionSection;
    mentor?: MentorSection;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAboutContent = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // For now, return static data - in production, these would be API calls
      setContent({
        hero: {
          id: "about-hero-1",
          title: "Cultivating the Future of Philippine Agriculture",
          subtitle:
            "We are a team of student innovators from the University of Caloocan City dedicated to bridging the gap between technology and farming.",
          backgroundImage: "/about-hero.jpg",
          isActive: true,
          displayOrder: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        challenges: {
          id: "challenges-1",
          title: "The Challenge Facing Filipino Growers",
          subtitle:
            "Mushroom production in the Philippines holds immense potential, but small-scale farmers face persistent obstacles.",
          challenges: [
            "Unpredictable climate conditions and high tropical heat",
            "Devastating pest infestations and contamination",
            "Traditional, labor-intensive methods leading to inconsistent harvests",
            "Limited market access and dependence on middlemen",
            "Pricing uncertainties that discourage growth",
          ],
          isActive: true,
          displayOrder: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        solutions: {
          id: "solutions-1",
          title: "Our Solution: The M.A.S.H. System",
          subtitle:
            "M.A.S.H. (Mushroom Automation with Smart Hydro-environment) is an integrated ecosystem designed to solve these challenges.",
          solutions: [
            {
              id: "solution-1",
              title: "Automated Growing",
              description:
                "An IoT-enabled chamber monitors and controls temperature, humidity, and CO₂ in real-time",
              displayOrder: 1,
            },
            {
              id: "solution-2",
              title: "AI-Powered Insights",
              description:
                "An AI model analyzes data to predict environmental needs, recommend adjustments, and help detect contamination early",
              displayOrder: 2,
            },
            {
              id: "solution-3",
              title: "Direct Market Access",
              description:
                "An integrated e-commerce platform connects growers directly with consumers, ensuring fairer prices and a streamlined supply chain",
              displayOrder: 3,
            },
          ],
          isActive: true,
          displayOrder: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        vision: {
          id: "vision-1",
          title: "Our Vision for a Greener Tomorrow",
          content: [
            "We believe that technology can be a powerful force for good. The M.A.S.H. project is more than just a requirement for our Bachelor of Science in Computer Science degree; it is our contribution to a more food-secure and economically inclusive Philippines.",
            "By empowering local farmers with smart tools, we aim to help grow not just mushrooms, but also opportunities, livelihoods, and a more sustainable future for our communities.",
          ],
          callToAction: "Join us in growing the mushroom movement!",
          isActive: true,
          displayOrder: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        mentor: {
          id: "mentor-1",
          title: "Our Academic Adviser",
          subtitle:
            "We are grateful for the guidance and expertise of our Thesis Adviser in bringing this project to life.",
          mentor: {
            name: "Prof. Joemen G. Barrios, MIT",
            title: "Thesis Adviser",
            avatar: "/mentor-avatar.jpg",
          },
          isActive: true,
          displayOrder: 4,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    } catch (err) {
      setError("Failed to fetch about content");
      setContent(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAboutContent();
  }, [fetchAboutContent]);

  return {
    content,
    loading,
    error,
    refetch: fetchAboutContent,
  };
}

// Contact Page Hook
export function useContactContent() {
  const [content, setContent] = useState<{
    contactInfo: ContactInfo[];
    businessHours: BusinessHours[];
    socialLinks: SocialLink[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContactContent = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // For now, return static data - in production, these would be API calls
      setContent({
        contactInfo: [
          {
            id: "contact-phone",
            type: "phone",
            title: "Phone",
            value: "09272533969",
            description: "Mon-Sat: 9AM-6PM",
            displayOrder: 1,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "contact-email",
            type: "email",
            title: "Email",
            value: "MASH.Mushroom.Automation@gmail.com",
            description: "We'll respond in 24hrs",
            displayOrder: 2,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "contact-address",
            type: "address",
            title: "Location",
            value: "University of Caloocan City, Philippines",
            description: "MASH Research Lab",
            displayOrder: 3,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        businessHours: [
          {
            id: "hours-mon",
            dayOfWeek: "monday",
            openTime: "09:00",
            closeTime: "18:00",
            isClosed: false,
            isActive: true,
            displayOrder: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "hours-tue",
            dayOfWeek: "tuesday",
            openTime: "09:00",
            closeTime: "18:00",
            isClosed: false,
            isActive: true,
            displayOrder: 2,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "hours-wed",
            dayOfWeek: "wednesday",
            openTime: "09:00",
            closeTime: "18:00",
            isClosed: false,
            isActive: true,
            displayOrder: 3,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "hours-thu",
            dayOfWeek: "thursday",
            openTime: "09:00",
            closeTime: "18:00",
            isClosed: false,
            isActive: true,
            displayOrder: 4,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "hours-fri",
            dayOfWeek: "friday",
            openTime: "09:00",
            closeTime: "18:00",
            isClosed: false,
            isActive: true,
            displayOrder: 5,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "hours-sat",
            dayOfWeek: "saturday",
            openTime: "10:00",
            closeTime: "16:00",
            isClosed: false,
            isActive: true,
            displayOrder: 6,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "hours-sun",
            dayOfWeek: "sunday",
            openTime: "00:00",
            closeTime: "00:00",
            isClosed: true,
            isActive: true,
            displayOrder: 7,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        socialLinks: [
          {
            id: "social-fb",
            platform: "facebook",
            url: "https://www.facebook.com/MASHMarketPH",
            displayOrder: 1,
            isActive: true,
          },
          {
            id: "social-yt",
            platform: "youtube",
            url: "https://www.youtube.com/@MASH-UCC",
            displayOrder: 2,
            isActive: true,
          },
          {
            id: "social-li",
            platform: "linkedin",
            url: "https://www.linkedin.com/company/mash-mushroom-automation/",
            displayOrder: 3,
            isActive: true,
          },
        ],
      });
    } catch (err) {
      setError("Failed to fetch contact content");
      setContent(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContactContent();
  }, [fetchContactContent]);

  return {
    content,
    loading,
    error,
    refetch: fetchContactContent,
  };
}
