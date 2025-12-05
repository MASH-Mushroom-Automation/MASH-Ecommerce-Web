// API functions for main page operations
import {
  Grower,
  HomePageData,
  ProductApiResponse,
  ApiResponse,
} from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

// Mock data for main pages
const MOCK_GROWERS: Grower[] = [
  {
    id: 1,
    name: "Fungi Fresh Farms",
    address: "Caloocan City, Metro Manila",
    phone: "+63 956 955 2808",
    hours: "7AM to 9PM, MON-FRI",
    logo: "/FFF.jpg",
    location: "Caloocan City, Metro Manila",
    tagline: "Urban-grown gourmet mushrooms for the modern kitchen.",
    coords: { lat: 14.7583, lng: 121.0453 },
  },
  {
    id: 2,
    name: "The Mushroom Patch Bukidnon",
    address: "Lantapan, Bukidnon",
    phone: "+63 922 524 1234",
    hours: "7AM to 9PM, MON-FRI",
    logo: "/TMP.jpg",
    location: "Lantapan, Bukidnon",
    tagline: "From the cool highlands of Bukidnon, delivered to your door.",
    coords: { lat: 8.0811, lng: 125.0119 },
  },
  {
    id: 3,
    name: "Kabutehan ni Aling Nena",
    address: "Antipolo, Rizal",
    phone: "+63 966 552 3612",
    hours: "7AM to 9PM, MON-FRI",
    logo: "/ANM.jpg",
    location: "Antipolo, Rizal",
    tagline: "Traditional mushroom growing with a mother's touch.",
    coords: { lat: 14.5864, lng: 121.1754 },
  },
  {
    id: 4,
    name: "Shroomarket",
    address: "Malate, Manila",
    phone: "+63 917 252 7378",
    hours: "7AM to 9PM, MON-FRI",
    logo: "/placeholder.png",
    location: "Malate, Manila",
    tagline: "Premium mushrooms from the heart of Manila.",
    coords: { lat: 14.5699, lng: 120.9929 },
  },
];

const MOCK_HERO_SLIDES = [
  "/Hero Section.png",
  "/Hero Section.png",
  "/Hero Section.png",
];

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class MainApi {
  // Home page data - Returns mock growers only
  // Featured products are now fetched from Sanity CMS via useSanityFeaturedProducts hook
  static async getHomePageData(): Promise<ApiResponse<HomePageData>> {
    await delay(300);

    // Return only growers data - products are handled by Sanity CMS now
    return {
      data: {
        featuredProducts: [], // Empty - use useSanityFeaturedProducts hook instead
        topGrowers: MOCK_GROWERS.slice(0, 3),
        heroSlides: MOCK_HERO_SLIDES,
      },
      success: true,
    };
  }

  // Growers
  static async getGrowers(): Promise<ApiResponse<Grower[]>> {
    await delay(200);

    return {
      data: MOCK_GROWERS,
      success: true,
    };
  }

  static async getGrowerById(id: number): Promise<ApiResponse<Grower | null>> {
    await delay(200);

    const grower = MOCK_GROWERS.find((g) => g.id === id);

    return {
      data: grower || null,
      success: !!grower,
      message: grower ? undefined : "Grower not found",
    };
  }

  // About page content
  static async getAboutContent(): Promise<
    ApiResponse<{ title: string; content: string; team: any[] }>
  > {
    await delay(200);

    return {
      data: {
        title: "About MASH Marketplace",
        content: "We connect mushroom growers with consumers...",
        team: [
          { name: "John Doe", role: "CEO", avatar: "/placeholder.png" },
          { name: "Jane Smith", role: "CTO", avatar: "/placeholder.png" },
        ],
      },
      success: true,
    };
  }

  // FAQ content
  static async getFAQContent(): Promise<
    ApiResponse<{ question: string; answer: string }[]>
  > {
    await delay(200);

    return {
      data: [
        {
          question: "How do I place an order?",
          answer:
            "Simply browse our catalog, add items to your cart, and proceed to checkout.",
        },
        {
          question: "What is your delivery policy?",
          answer: "We deliver within Metro Manila within 24-48 hours.",
        },
        {
          question: "How do I become a seller?",
          answer:
            "Contact us through our seller registration page to get started.",
        },
      ],
      success: true,
    };
  }
}
