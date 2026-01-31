"use client";

import React from "react";
import { render } from "@testing-library/react";

// Mock cookies utilities
jest.mock("@/lib/cookies", () => ({
  getThemeCookie: jest.fn(),
  setThemeCookie: jest.fn(),
}));

// Replace ThemeProvider with a test double that captures props
jest.mock("@/components/providers/theme-provider", () => {
  const React = require("react");
  return {
    ThemeProvider: ({ children, ...props }: any) => {
      // expose props to global for assertions
      (global as any).__THEME_PROVIDER_PROPS = props;
      return React.createElement("div", { "data-testid": "theme-root" }, children);
    },
  };
});
// Mock other heavy dependencies to avoid importing ESM-only libs (next-sanity, etc.)
jest.mock("@/contexts/ChatContext", () => ({ ChatProvider: ({ children }: any) => children }));
jest.mock("@/contexts/WishlistContext", () => ({ WishlistProvider: ({ children }: any) => children }));
jest.mock("@/contexts/CartContext", () => ({ CartProvider: ({ children }: any) => children }));
jest.mock("@/contexts/AuthContext", () => ({ AuthProvider: ({ children }: any) => children }));
jest.mock("@/components/providers/query-provider", () => ({ QueryProvider: ({ children }: any) => children }));
jest.mock("@/components/chatbot", () => ({ Chatbot: () => null }));
jest.mock("@/components/sanity/VisualEditing", () => ({ SanityVisualEditing: () => null }));
jest.mock("@/components/search/SearchDialog", () => ({ SearchDialog: () => null }));
jest.mock("@/hooks/useSearchShortcut", () => ({ useSearchShortcut: () => ({ isOpen: false, setIsOpen: () => {} }) }));
jest.mock("@/components/layout/header", () => ({ Header: () => null }));
jest.mock("@/components/layout/simple-header", () => ({ SimpleHeader: () => null }));
jest.mock("@/components/layout/seller-header", () => ({ SellerHeader: () => null }));
jest.mock("@/components/layout/footer", () => ({ Footer: () => null }));
jest.mock("@/components/ui/sonner", () => ({ Toaster: () => null }));
import { ClientLayout } from "../client-layout";
import { getThemeCookie, setThemeCookie } from "@/lib/cookies";

describe("ClientLayout - theme defaults", () => {
  beforeEach(() => {
    // clear captured props and mock calls
    (global as any).__THEME_PROVIDER_PROPS = undefined;
    jest.clearAllMocks();
  });

  test("uses light default theme in development and sets cookie if not present", () => {
    process.env.NODE_ENV = "development";
    (getThemeCookie as jest.Mock).mockReturnValue(null);

    render(
      <ClientLayout>
        <div>child</div>
      </ClientLayout>
    );

    const props = (global as any).__THEME_PROVIDER_PROPS;
    expect(props).toBeDefined();
    expect(props.defaultTheme).toBe("light");
    expect(props.enableSystem).toBe(false);
    expect((setThemeCookie as jest.Mock).mock.calls.length).toBe(1);
    expect((setThemeCookie as jest.Mock).mock.calls[0][0]).toBe("light");
  });

  test("does not set cookie when theme cookie already present in dev", () => {
    process.env.NODE_ENV = "development";
    (getThemeCookie as jest.Mock).mockReturnValue("dark");

    render(
      <ClientLayout>
        <div>child</div>
      </ClientLayout>
    );

    const props = (global as any).__THEME_PROVIDER_PROPS;
    expect(props.defaultTheme).toBe("light");
    expect((setThemeCookie as jest.Mock).mock.calls.length).toBe(0);
  });

  test("uses system default theme in production and does not set cookie", () => {
    process.env.NODE_ENV = "production";
    (getThemeCookie as jest.Mock).mockReturnValue(null);

    render(
      <ClientLayout>
        <div>child</div>
      </ClientLayout>
    );

    const props = (global as any).__THEME_PROVIDER_PROPS;
    expect(props.defaultTheme).toBe("system");
    expect(props.enableSystem).toBe(true);
    expect((setThemeCookie as jest.Mock).mock.calls.length).toBe(0);
  });
});
