/**
 * Tests for src/hooks/useSanityContactPage.ts
 * Hooks: useSanityContactPage, useSanityBusinessHours, useSanityContactMethods
 *
 * All hooks use sanityClient.fetch() and return { loading, error }.
 * Uses imageUrlBuilder for header/location images.
 * Transform functions add computed fields (icon, dayLabel, displayTime, formatted address).
 */

import { renderHook, waitFor, act } from "@testing-library/react";

// Mock @sanity/image-url before importing the hook
jest.mock("@sanity/image-url", () => {
  const mockUrl = jest.fn(() => "https://cdn.sanity.io/images/test/mock-image.jpg");
  const mockFit = jest.fn(() => ({ url: mockUrl }));
  const mockHeight = jest.fn(() => ({ fit: mockFit, url: mockUrl }));
  const mockWidth = jest.fn(() => ({ height: mockHeight, fit: mockFit, url: mockUrl }));
  const mockImage = jest.fn(() => ({ width: mockWidth, height: mockHeight, fit: mockFit, url: mockUrl }));
  return jest.fn(() => ({ image: mockImage }));
});

const sanityClient = jest.requireMock("@/lib/sanity/client").sanityClient;

import {
  useSanityContactPage,
  useSanityBusinessHours,
  useSanityContactMethods,
} from "../useSanityContactPage";

// ─── Sample data ────────────────────────────────────────────────────

const sampleContactPageData = {
  title: "Get in Touch",
  subtitle: "We would love to hear from you",
  headerImage: {
    _type: "image",
    asset: { _ref: "image-abc123-800x400-jpg" },
    alt: "Contact Us Banner",
  },
  contactMethods: [
    {
      _key: "cm1",
      type: "email",
      label: "Email Us",
      value: "hello@mashmarket.app",
      description: "Reply within 24h",
      link: "mailto:hello@mashmarket.app",
      displayOrder: 2,
    },
    {
      _key: "cm2",
      type: "phone",
      label: "Call Us",
      value: "+639171234567",
      description: "Mon-Fri 9AM-6PM",
      link: "tel:+639171234567",
      displayOrder: 1,
    },
  ],
  businessHours: [
    { _key: "bh1", day: "monday", openTime: "9:00 AM", closeTime: "6:00 PM", isClosed: false },
    { _key: "bh2", day: "tuesday", openTime: "9:00 AM", closeTime: "6:00 PM", isClosed: false },
    { _key: "bh3", day: "wednesday", openTime: "9:00 AM", closeTime: "6:00 PM", isClosed: false },
    { _key: "bh4", day: "thursday", openTime: "9:00 AM", closeTime: "6:00 PM", isClosed: false },
    { _key: "bh5", day: "friday", openTime: "9:00 AM", closeTime: "6:00 PM", isClosed: false },
    { _key: "bh6", day: "saturday", openTime: "10:00 AM", closeTime: "4:00 PM", isClosed: false },
    { _key: "bh7", day: "sunday", isClosed: true },
  ],
  businessHoursTitle: "Office Hours",
  holidayNote: "Closed on Philippine holidays",
  timezone: "Philippine Time (GMT+8)",
  socialMediaTitle: "Connect With Us",
  socialLinks: [
    { _key: "sl1", platform: "facebook", url: "https://facebook.com/mash", handle: "@mash", displayOrder: 1 },
    { _key: "sl2", platform: "instagram", url: "https://instagram.com/mash", displayOrder: 2 },
  ],
  address: {
    street: "123 Mushroom St",
    barangay: "Brgy. Sample",
    city: "Caloocan",
    province: "Metro Manila",
    zipCode: "1400",
    country: "Philippines",
  },
  coordinates: { latitude: 14.65, longitude: 120.97 },
  locationTitle: "Visit Our Office",
  mapEmbedUrl: "https://maps.google.com/embed?q=test",
  directionsLink: "https://maps.google.com/directions",
  nearbyLandmarks: "Near City Hall",
  formTitle: "Send Us a Message",
  formSubtitle: "Fill out the form below",
  formRecipientEmail: "support@mashmarket.app",
  formSuccessMessage: "Thanks! We will get back to you soon.",
  showContactForm: true,
};

// ═════════════════════════════════════════════════════════════════════
// useSanityContactPage
// ═════════════════════════════════════════════════════════════════════

describe("useSanityContactPage", () => {
  it("should fetch and transform contact page content", async () => {
    sanityClient.fetch.mockResolvedValueOnce(sampleContactPageData);

    const { result } = renderHook(() => useSanityContactPage());

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    const content = result.current.content;
    expect(content).not.toBeNull();
    expect(content?.title).toBe("Get in Touch");
    expect(content?.subtitle).toBe("We would love to hear from you");
    expect(result.current.error).toBeNull();
  });

  it("should transform contact methods with icons and sorting", async () => {
    sanityClient.fetch.mockResolvedValueOnce(sampleContactPageData);

    const { result } = renderHook(() => useSanityContactPage());

    await waitFor(() => expect(result.current.loading).toBe(false));

    const methods = result.current.content?.contactMethods;
    expect(methods).toHaveLength(2);
    // Sorted by displayOrder: phone (1) then email (2)
    expect(methods?.[0].type).toBe("phone");
    expect(methods?.[0].icon).toBe("phone");
    expect(methods?.[1].type).toBe("email");
    expect(methods?.[1].icon).toBe("mail");
  });

  it("should transform business hours with labels and sorting by day", async () => {
    sanityClient.fetch.mockResolvedValueOnce(sampleContactPageData);

    const { result } = renderHook(() => useSanityContactPage());

    await waitFor(() => expect(result.current.loading).toBe(false));

    const hours = result.current.content?.businessHours;
    expect(hours).toHaveLength(7);
    // Should be sorted Mon-Sun
    expect(hours?.[0].day).toBe("monday");
    expect(hours?.[0].dayLabel).toBe("Monday");
    expect(hours?.[0].displayTime).toBe("9:00 AM - 6:00 PM");
    expect(hours?.[6].day).toBe("sunday");
    expect(hours?.[6].isClosed).toBe(true);
    expect(hours?.[6].displayTime).toBe("Closed");
  });

  it("should transform social links with icons and sorting", async () => {
    sanityClient.fetch.mockResolvedValueOnce(sampleContactPageData);

    const { result } = renderHook(() => useSanityContactPage());

    await waitFor(() => expect(result.current.loading).toBe(false));

    const links = result.current.content?.socialLinks;
    expect(links).toHaveLength(2);
    expect(links?.[0].platform).toBe("facebook");
    expect(links?.[0].icon).toBe("facebook");
    expect(links?.[1].platform).toBe("instagram");
    expect(links?.[1].icon).toBe("instagram");
  });

  it("should transform address with formatted string", async () => {
    sanityClient.fetch.mockResolvedValueOnce(sampleContactPageData);

    const { result } = renderHook(() => useSanityContactPage());

    await waitFor(() => expect(result.current.loading).toBe(false));

    const address = result.current.content?.address;
    expect(address?.street).toBe("123 Mushroom St");
    expect(address?.city).toBe("Caloocan");
    expect(address?.formatted).toContain("123 Mushroom St");
    expect(address?.formatted).toContain("Caloocan");
    expect(address?.formatted).toContain("Philippines");
  });

  it("should transform coordinates", async () => {
    sanityClient.fetch.mockResolvedValueOnce(sampleContactPageData);

    const { result } = renderHook(() => useSanityContactPage());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.content?.coordinates?.latitude).toBe(14.65);
    expect(result.current.content?.coordinates?.longitude).toBe(120.97);
  });

  it("should include form settings", async () => {
    sanityClient.fetch.mockResolvedValueOnce(sampleContactPageData);

    const { result } = renderHook(() => useSanityContactPage());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.content?.formTitle).toBe("Send Us a Message");
    expect(result.current.content?.formSubtitle).toBe("Fill out the form below");
    expect(result.current.content?.showContactForm).toBe(true);
    expect(result.current.content?.formSuccessMessage).toBe("Thanks! We will get back to you soon.");
  });

  it("should use default values when data is null", async () => {
    sanityClient.fetch.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useSanityContactPage());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.content?.title).toBe("Get in Touch");
    expect(result.current.content?.businessHoursTitle).toBe("Business Hours");
    expect(result.current.content?.socialMediaTitle).toBe("Follow Us");
    expect(result.current.content?.locationTitle).toBe("Visit Us");
    expect(result.current.content?.formTitle).toBe("Send Us a Message");
    expect(result.current.content?.showContactForm).toBe(true);
    expect(result.current.content?.contactMethods).toEqual([]);
    expect(result.current.content?.businessHours).toEqual([]);
    expect(result.current.content?.socialLinks).toEqual([]);
  });

  it("should handle fetch error", async () => {
    sanityClient.fetch.mockRejectedValueOnce(new Error("Sanity unreachable"));

    const { result } = renderHook(() => useSanityContactPage());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error?.message).toBe("Sanity unreachable");
    expect(result.current.content).toBeNull();
  });

  it("should wrap non-Error exceptions", async () => {
    sanityClient.fetch.mockRejectedValueOnce("string error");

    const { result } = renderHook(() => useSanityContactPage());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error?.message).toBe("Failed to fetch Contact page content");
  });

  it("should provide refetch function", async () => {
    sanityClient.fetch.mockResolvedValue(sampleContactPageData);

    const { result } = renderHook(() => useSanityContactPage());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(typeof result.current.refetch).toBe("function");

    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(sanityClient.fetch).toHaveBeenCalledTimes(2);
  });
});

// ═════════════════════════════════════════════════════════════════════
// useSanityBusinessHours
// ═════════════════════════════════════════════════════════════════════

describe("useSanityBusinessHours", () => {
  it("should fetch and transform business hours", async () => {
    sanityClient.fetch.mockResolvedValueOnce(sampleContactPageData.businessHours);

    const { result } = renderHook(() => useSanityBusinessHours());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.hours).toHaveLength(7);
    expect(result.current.hours[0].day).toBe("monday");
    expect(result.current.hours[0].dayLabel).toBe("Monday");
    expect(result.current.error).toBeNull();
  });

  it("should sort hours by day of week", async () => {
    // Provide unsorted data
    const unsorted = [
      { _key: "b1", day: "friday", openTime: "9:00 AM", closeTime: "6:00 PM", isClosed: false },
      { _key: "b2", day: "monday", openTime: "9:00 AM", closeTime: "6:00 PM", isClosed: false },
      { _key: "b3", day: "wednesday", openTime: "9:00 AM", closeTime: "6:00 PM", isClosed: false },
    ];
    sanityClient.fetch.mockResolvedValueOnce(unsorted);

    const { result } = renderHook(() => useSanityBusinessHours());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.hours[0].day).toBe("monday");
    expect(result.current.hours[1].day).toBe("wednesday");
    expect(result.current.hours[2].day).toBe("friday");
  });

  it("should handle closed day display time", async () => {
    sanityClient.fetch.mockResolvedValueOnce([
      { _key: "b1", day: "sunday", isClosed: true },
    ]);

    const { result } = renderHook(() => useSanityBusinessHours());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.hours[0].displayTime).toBe("Closed");
  });

  it("should return empty array for null data", async () => {
    sanityClient.fetch.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useSanityBusinessHours());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.hours).toEqual([]);
  });

  it("should handle fetch error", async () => {
    sanityClient.fetch.mockRejectedValueOnce(new Error("Hours fetch failed"));

    const { result } = renderHook(() => useSanityBusinessHours());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error?.message).toBe("Hours fetch failed");
  });
});

// ═════════════════════════════════════════════════════════════════════
// useSanityContactMethods
// ═════════════════════════════════════════════════════════════════════

describe("useSanityContactMethods", () => {
  it("should fetch and transform contact methods", async () => {
    sanityClient.fetch.mockResolvedValueOnce(sampleContactPageData.contactMethods);

    const { result } = renderHook(() => useSanityContactMethods());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.methods).toHaveLength(2);
    // Sorted by displayOrder: phone (1) then email (2)
    expect(result.current.methods[0].type).toBe("phone");
    expect(result.current.methods[0].icon).toBe("phone");
    expect(result.current.methods[1].type).toBe("email");
    expect(result.current.methods[1].icon).toBe("mail");
    expect(result.current.error).toBeNull();
  });

  it("should add default icon for unknown contact type", async () => {
    sanityClient.fetch.mockResolvedValueOnce([
      { _key: "c1", type: "unknown_type", value: "test", displayOrder: 1 },
    ]);

    const { result } = renderHook(() => useSanityContactMethods());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.methods[0].icon).toBe("circle");
  });

  it("should return empty array for null data", async () => {
    sanityClient.fetch.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useSanityContactMethods());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.methods).toEqual([]);
  });

  it("should handle fetch error", async () => {
    sanityClient.fetch.mockRejectedValueOnce(new Error("Methods fetch failed"));

    const { result } = renderHook(() => useSanityContactMethods());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error?.message).toBe("Methods fetch failed");
  });

  it("should provide refetch function", async () => {
    sanityClient.fetch.mockResolvedValue(sampleContactPageData.contactMethods);

    const { result } = renderHook(() => useSanityContactMethods());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(typeof result.current.refetch).toBe("function");
  });
});
