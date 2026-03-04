import React from "react";
import { render, screen } from "@testing-library/react";

// Dynamic mock values
const mockUseSanitySiteSettings = jest.fn();
const mockUseSanityNavigation = jest.fn();

jest.mock("@/hooks/useSanitySiteSettings", () => ({
  useSanitySiteSettings: () => mockUseSanitySiteSettings(),
  useSanityNavigation: (slug: string) => mockUseSanityNavigation(slug),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, target, rel }: any) => (
    <a href={href} target={target} rel={rel}>{children}</a>
  ),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

jest.mock("lucide-react", () => ({
  MapPin: () => <svg data-testid="icon-map-pin" />,
  Phone: () => <svg data-testid="icon-phone" />,
  Mail: () => <svg data-testid="icon-mail" />,
}));

jest.mock("@/components/common/social-links", () => ({
  SocialLinks: (props: any) => <div data-testid="social-links" data-variant={props.variant} />,
}));

jest.mock("@/components/common/payment-logos", () => ({
  PaymentLogos: () => <div data-testid="payment-logos" />,
}));

import { Footer } from "../footer";

describe("Footer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: no settings, no nav items
    mockUseSanitySiteSettings.mockReturnValue({ settings: null });
    mockUseSanityNavigation.mockReturnValue({ menu: null });
  });

  // --- LOGO BRANCHES ---

  it("renders fallback Next/Image logo when no CMS logo", () => {
    render(<Footer />);
    const logo = screen.getByAltText("MASH Market");
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("width", "260");
    expect(logo).toHaveAttribute("height", "90");
  });

  it("renders CMS img when settings.logo is set", () => {
    mockUseSanitySiteSettings.mockReturnValue({
      settings: { logo: "https://cdn.test/logo.png", companyName: "Custom Co" },
    });
    render(<Footer />);
    const logo = screen.getByAltText("Custom Co");
    expect(logo.tagName).toBe("IMG");
    expect(logo).toHaveAttribute("src", "https://cdn.test/logo.png");
  });

  it("uses 'MASH Market' alt when companyName is absent but logo exists", () => {
    mockUseSanitySiteSettings.mockReturnValue({
      settings: { logo: "https://cdn.test/logo.png" },
    });
    render(<Footer />);
    expect(screen.getByAltText("MASH Market")).toBeInTheDocument();
  });

  // --- SHOP NAV BRANCHES ---

  it("renders fallback shop links when shopNav has no items", () => {
    render(<Footer />);
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("Recipes")).toBeInTheDocument();
    expect(screen.getByText("Growing Guides")).toBeInTheDocument();
    expect(screen.getByText("Growers")).toBeInTheDocument();
    // "Store Locations" appears in both Shop and About columns
    expect(screen.getAllByText("Store Locations")).toHaveLength(2);
    expect(screen.getByText("How to Order")).toBeInTheDocument();
  });

  it("renders CMS shop nav items instead of fallbacks", () => {
    mockUseSanityNavigation.mockImplementation((slug: string) => {
      if (slug === "footer-shop") {
        return {
          menu: {
            items: [
              { _key: "s1", label: "CMS Seeds", internalPath: "/seeds" },
              { _key: "s2", label: "CMS Kits", externalUrl: "https://kits.test", openInNewTab: true },
            ],
          },
        };
      }
      return { menu: null };
    });
    render(<Footer />);
    expect(screen.getByText("CMS Seeds")).toBeInTheDocument();
    expect(screen.getByText("CMS Kits")).toBeInTheDocument();
    // Fallback should NOT render
    expect(screen.queryByText("Products")).not.toBeInTheDocument();
  });

  it("uses internalPath for link href when present", () => {
    mockUseSanityNavigation.mockImplementation((slug: string) => {
      if (slug === "footer-shop") {
        return {
          menu: { items: [{ _key: "s1", label: "Internal", internalPath: "/internal-path" }] },
        };
      }
      return { menu: null };
    });
    render(<Footer />);
    const link = screen.getByText("Internal").closest("a");
    expect(link).toHaveAttribute("href", "/internal-path");
  });

  it("uses externalUrl for link href when internalPath is absent", () => {
    mockUseSanityNavigation.mockImplementation((slug: string) => {
      if (slug === "footer-shop") {
        return {
          menu: {
            items: [
              { _key: "s1", label: "External", externalUrl: "https://ext.test", openInNewTab: true },
            ],
          },
        };
      }
      return { menu: null };
    });
    render(<Footer />);
    const link = screen.getByText("External").closest("a");
    expect(link).toHaveAttribute("href", "https://ext.test");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("uses / as fallback when both paths are absent", () => {
    mockUseSanityNavigation.mockImplementation((slug: string) => {
      if (slug === "footer-shop") {
        return { menu: { items: [{ _key: "s1", label: "NoPath" }] } };
      }
      return { menu: null };
    });
    render(<Footer />);
    const link = screen.getByText("NoPath").closest("a");
    expect(link).toHaveAttribute("href", "/");
  });

  it("does not set target/rel when openInNewTab is false", () => {
    mockUseSanityNavigation.mockImplementation((slug: string) => {
      if (slug === "footer-shop") {
        return {
          menu: {
            items: [
              { _key: "s1", label: "SameTab", internalPath: "/same", openInNewTab: false },
            ],
          },
        };
      }
      return { menu: null };
    });
    render(<Footer />);
    const link = screen.getByText("SameTab").closest("a");
    expect(link).not.toHaveAttribute("target");
  });

  // --- SUPPORT NAV BRANCHES ---

  it("renders fallback support links when supportNav is empty", () => {
    render(<Footer />);
    expect(screen.getByText("FAQs")).toBeInTheDocument();
    expect(screen.getByText("Contact Us")).toBeInTheDocument();
    expect(screen.getByText("Shipping Info")).toBeInTheDocument();
    expect(screen.getByText("Return Policy")).toBeInTheDocument();
    expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
    expect(screen.getByText("Terms of Service")).toBeInTheDocument();
  });

  it("renders CMS support nav items", () => {
    mockUseSanityNavigation.mockImplementation((slug: string) => {
      if (slug === "footer-support") {
        return {
          menu: { items: [{ _key: "c1", label: "CMS Help", internalPath: "/help" }] },
        };
      }
      return { menu: null };
    });
    render(<Footer />);
    expect(screen.getByText("CMS Help")).toBeInTheDocument();
    expect(screen.queryByText("FAQs")).not.toBeInTheDocument();
  });

  // --- ABOUT NAV BRANCHES ---

  it("renders fallback about links when aboutNav is empty", () => {
    render(<Footer />);
    expect(screen.getByText("About Us")).toBeInTheDocument();
    expect(screen.getByText("Our Mission")).toBeInTheDocument();
    expect(screen.getByText("Become a Grower")).toBeInTheDocument();
  });

  it("renders CMS about nav items", () => {
    mockUseSanityNavigation.mockImplementation((slug: string) => {
      if (slug === "footer-about") {
        return {
          menu: { items: [{ _key: "a1", label: "CMS Story", internalPath: "/story" }] },
        };
      }
      return { menu: null };
    });
    render(<Footer />);
    expect(screen.getByText("CMS Story")).toBeInTheDocument();
    expect(screen.queryByText("About Us")).not.toBeInTheDocument();
  });

  // --- CONTACT DETAILS BRANCHES ---

  it("renders address when settings.address.full is set", () => {
    mockUseSanitySiteSettings.mockReturnValue({
      settings: { address: { full: "123 Mushroom St, Manila" } },
    });
    render(<Footer />);
    expect(screen.getByText("123 Mushroom St, Manila")).toBeInTheDocument();
    expect(screen.getByTestId("icon-map-pin")).toBeInTheDocument();
  });

  it("does not render address when settings.address is absent", () => {
    mockUseSanitySiteSettings.mockReturnValue({ settings: {} });
    render(<Footer />);
    expect(screen.queryByTestId("icon-map-pin")).not.toBeInTheDocument();
  });

  it("renders phone link when contactPhone is set", () => {
    mockUseSanitySiteSettings.mockReturnValue({
      settings: { contactPhone: "+63-912-345-6789" },
    });
    render(<Footer />);
    expect(screen.getByText("+63-912-345-6789")).toBeInTheDocument();
    expect(screen.getByTestId("icon-phone")).toBeInTheDocument();
    const link = screen.getByText("+63-912-345-6789").closest("a");
    expect(link).toHaveAttribute("href", "tel:+63-912-345-6789");
  });

  it("does not render phone when contactPhone is absent", () => {
    mockUseSanitySiteSettings.mockReturnValue({ settings: {} });
    render(<Footer />);
    expect(screen.queryByTestId("icon-phone")).not.toBeInTheDocument();
  });

  it("renders email link when contactEmail is set", () => {
    mockUseSanitySiteSettings.mockReturnValue({
      settings: { contactEmail: "info@mash.ph" },
    });
    render(<Footer />);
    expect(screen.getByText("info@mash.ph")).toBeInTheDocument();
    expect(screen.getByTestId("icon-mail")).toBeInTheDocument();
    const link = screen.getByText("info@mash.ph").closest("a");
    expect(link).toHaveAttribute("href", "mailto:info@mash.ph");
  });

  it("does not render email when contactEmail is absent", () => {
    mockUseSanitySiteSettings.mockReturnValue({ settings: {} });
    render(<Footer />);
    expect(screen.queryByTestId("icon-mail")).not.toBeInTheDocument();
  });

  // --- COPYRIGHT / ABOUT TEXT BRANCHES ---

  it("renders custom copyright from CMS with year replacement", () => {
    mockUseSanitySiteSettings.mockReturnValue({
      settings: { footer: { copyrightText: "Copyright {year} MyBrand" } },
    });
    render(<Footer />);
    const year = new Date().getFullYear();
    expect(screen.getByText(`Copyright ${year} MyBrand`)).toBeInTheDocument();
  });

  it("renders default copyright with companyName when no CMS text", () => {
    mockUseSanitySiteSettings.mockReturnValue({
      settings: { companyName: "MASH Market" },
    });
    render(<Footer />);
    const year = new Date().getFullYear();
    expect(screen.getByText(`© ${year} MASH Market. All rights reserved.`)).toBeInTheDocument();
  });

  it("renders default copyright with 'MASH' when companyName is absent", () => {
    mockUseSanitySiteSettings.mockReturnValue({ settings: {} });
    render(<Footer />);
    const year = new Date().getFullYear();
    expect(screen.getByText(`© ${year} MASH. All rights reserved.`)).toBeInTheDocument();
  });

  it("renders aboutText when present in footer settings", () => {
    mockUseSanitySiteSettings.mockReturnValue({
      settings: { footer: { aboutText: "Organic mushrooms delivered fresh" } },
    });
    render(<Footer />);
    expect(screen.getByText("Organic mushrooms delivered fresh")).toBeInTheDocument();
  });

  it("does not render aboutText paragraph when absent", () => {
    mockUseSanitySiteSettings.mockReturnValue({ settings: {} });
    const { container } = render(<Footer />);
    // Only one <p> in copyright bar (the copyright text)
    const copyrightBar = container.querySelector(".border-t.border-border");
    const paragraphs = copyrightBar?.querySelectorAll("p");
    expect(paragraphs?.length).toBe(1);
  });

  // --- MISC ---

  it("renders payment logos", () => {
    render(<Footer />);
    expect(screen.getByTestId("payment-logos")).toBeInTheDocument();
  });

  it("renders social links with footer variant", () => {
    render(<Footer />);
    const social = screen.getByTestId("social-links");
    expect(social).toHaveAttribute("data-variant", "footer");
  });

  it("renders all three navigation headings", () => {
    render(<Footer />);
    expect(screen.getByText("Shop")).toBeInTheDocument();
    expect(screen.getByText("Customer Service")).toBeInTheDocument();
    expect(screen.getByText("About MASH")).toBeInTheDocument();
  });

  it("renders all three CMS navs with external links simultaneously", () => {
    mockUseSanityNavigation.mockImplementation((slug: string) => ({
      menu: {
        items: [
          { _key: "x1", label: `Item-${slug}`, externalUrl: `https://${slug}.test`, openInNewTab: true },
        ],
      },
    }));
    render(<Footer />);
    expect(screen.getByText("Item-footer-shop")).toBeInTheDocument();
    expect(screen.getByText("Item-footer-support")).toBeInTheDocument();
    expect(screen.getByText("Item-footer-about")).toBeInTheDocument();
    // No fallbacks
    expect(screen.queryByText("Products")).not.toBeInTheDocument();
    expect(screen.queryByText("FAQs")).not.toBeInTheDocument();
    expect(screen.queryByText("About Us")).not.toBeInTheDocument();
  });

  it("renders full contact section with all details", () => {
    mockUseSanitySiteSettings.mockReturnValue({
      settings: {
        logo: "https://cdn.test/logo.png",
        companyName: "MASH Farms",
        address: { full: "BGC, Taguig, Metro Manila" },
        contactPhone: "+63-999-888-7777",
        contactEmail: "hello@mashfarms.ph",
        footer: {
          copyrightText: "© {year} MASH Farms Inc.",
          aboutText: "Premium Philippine mushrooms",
        },
      },
    });
    render(<Footer />);
    expect(screen.getByAltText("MASH Farms")).toBeInTheDocument();
    expect(screen.getByText("BGC, Taguig, Metro Manila")).toBeInTheDocument();
    expect(screen.getByText("+63-999-888-7777")).toBeInTheDocument();
    expect(screen.getByText("hello@mashfarms.ph")).toBeInTheDocument();
    expect(screen.getByText("Premium Philippine mushrooms")).toBeInTheDocument();
    const year = new Date().getFullYear();
    expect(screen.getByText(`© ${year} MASH Farms Inc.`)).toBeInTheDocument();
  });
});
