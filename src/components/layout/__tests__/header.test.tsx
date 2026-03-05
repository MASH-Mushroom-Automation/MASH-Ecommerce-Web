import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ---------------------------------------------------------------------------
// Mocks – module-level, executed before imports
// ---------------------------------------------------------------------------

const mockPush = jest.fn();
const mockSignOut = jest.fn().mockResolvedValue(undefined);
const mockClearWishlist = jest.fn();
const mockClearCart = jest.fn();
const mockClearProfile = jest.fn();

// -- next/navigation (override global mock to expose mockPush) --
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

// -- AuthContext: use global mock from jest.setupMocks.js --
// The global mock exposes `global.__mockUseAuth` (a jest.fn) that we configure per test.
// Do NOT re-declare jest.mock("@/contexts/AuthContext") here; the global mock wins.

let mockWishlistValues: Record<string, unknown> = {
  wishlistCount: 0,
  clearWishlist: mockClearWishlist,
  wishlistIds: [],
  items: [],
  addToWishlist: jest.fn(),
  removeFromWishlist: jest.fn(),
  isInWishlist: jest.fn(() => false),
  toggleWishlist: jest.fn(),
  loading: false,
};

jest.mock("@/contexts/WishlistContext", () => ({
  useWishlist: () => mockWishlistValues,
  WishlistProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock("@/contexts/CartContext", () => ({
  useCart: () => ({
    items: [],
    summary: { subtotal: 0, shipping: 0, tax: 0, total: 0, itemCount: 0 },
    loading: false,
    error: null,
    addToCart: jest.fn(),
    removeFromCart: jest.fn(),
    updateQuantity: jest.fn(),
    clearCart: mockClearCart,
    removeVendorItems: jest.fn(),
    isInCart: jest.fn(() => false),
    getItemQuantity: jest.fn(() => 0),
  }),
  CartProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// -- Hooks --
let mockProfileValues: Record<string, unknown> = {
  profile: null,
  clearProfile: mockClearProfile,
};

jest.mock("@/hooks/useUser", () => ({
  useUserProfile: () => mockProfileValues,
}));

let mockAnnouncementBar: Record<string, unknown> | null = null;
let mockNavMenu: { items: Array<Record<string, unknown>> } | null = null;
let mockNavLoading = false;

jest.mock("@/hooks/useSanitySiteSettings", () => ({
  useSanitySiteSettings: () => ({ settings: null }),
  useSanityAnnouncementBar: () => ({ announcementBar: mockAnnouncementBar }),
  useSanityNavigation: () => ({ menu: mockNavMenu, loading: mockNavLoading }),
}));

// -- UI sub-components (lightweight stubs) --
jest.mock("@/components/search/SearchAutocomplete", () => ({
  SearchAutocomplete: (props: Record<string, unknown>) => (
    <div data-testid="search-autocomplete" data-placeholder={props.placeholder} />
  ),
}));

jest.mock("@/components/layout/cart-dropdown", () => ({
  CartDropdown: () => <div data-testid="cart-dropdown">Cart</div>,
}));

jest.mock("@/components/layout/notification-dropdown", () => ({
  NotificationDropdown: () => (
    <div data-testid="notification-dropdown">Notifications</div>
  ),
}));

jest.mock("@/components/ui/theme-switcher", () => ({
  ThemeSwitcher: () => <button data-testid="theme-switcher">Theme</button>,
}));

jest.mock("@/components/common/social-links", () => ({
  SocialLinks: () => <div data-testid="social-links" />,
}));

jest.mock("@/lib/auth", () => ({
  logout: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
    loading: jest.fn(),
    dismiss: jest.fn(),
  },
}));

// ---------------------------------------------------------------------------
// Import components AFTER mocks
// ---------------------------------------------------------------------------
import { Header, SellerHeader, SimpleHeader } from "../header";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Helper to configure auth mock for a given test */
function setAuthMock(overrides: Record<string, unknown> = {}) {
  const defaults = {
    user: null,
    isAuthenticated: false,
    loading: false,
    signOut: mockSignOut,
    signInWithGoogle: jest.fn(),
    signInWithEmailPassword: jest.fn(),
    signUpWithEmailPassword: jest.fn(),
    signOutEverywhere: jest.fn(),
    sendEmailSignInLink: jest.fn(),
    completeEmailLinkSignIn: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
    confirmPasswordReset: jest.fn(),
    requestEmailVerification: jest.fn(),
    verifyEmailCode: jest.fn(),
  };
  const merged = { ...defaults, ...overrides };
  (global as any).__mockUseAuth.mockReturnValue(merged);
  (global as any).__mockAuthContext = merged;
}

/** Reset per-test overrides to sensible defaults */
function resetMockDefaults() {
  setAuthMock(); // unauthenticated by default
  mockWishlistValues = {
    wishlistCount: 0,
    clearWishlist: mockClearWishlist,
    wishlistIds: [],
    items: [],
    addToWishlist: jest.fn(),
    removeFromWishlist: jest.fn(),
    isInWishlist: jest.fn(() => false),
    toggleWishlist: jest.fn(),
    loading: false,
  };
  mockProfileValues = {
    profile: null,
    clearProfile: mockClearProfile,
  };
  mockAnnouncementBar = null;
  mockNavMenu = null;
  mockNavLoading = false;
}

beforeEach(() => {
  resetMockDefaults();
  jest.clearAllMocks();
});

// ===========================================================================
// HEADER COMPONENT
// ===========================================================================

describe("Header", () => {
  // ---- Rendering basics ----

  it("renders the MASH logo linked to home", () => {
    render(<Header />);

    const logo = screen.getByAltText("MASH Logo");
    expect(logo).toBeInTheDocument();

    // Logo should be wrapped in a link to "/"
    const link = logo.closest("a");
    expect(link).toHaveAttribute("href", "/");
  });

  it("shows Login button when user is NOT authenticated", () => {
    render(<Header />);

    // Desktop login button
    const loginBtns = screen.getAllByText("Login");
    expect(loginBtns.length).toBeGreaterThanOrEqual(1);

    // The login button should link to /login
    const loginLink = loginBtns[0].closest("a");
    expect(loginLink).toHaveAttribute("href", "/login");
  });

  it("shows user dropdown trigger when authenticated", () => {
    setAuthMock({
      user: { uid: "u1", email: "test@test.com" },
      isAuthenticated: true,
    });
    mockProfileValues = {
      profile: { firstName: "Alice", avatar: null, sellerStatus: "none" },
      clearProfile: mockClearProfile,
    };

    render(<Header />);

    // The dropdown trigger displays the user's first name  
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("shows 'User' as fallback name when profile has no firstName", () => {
    setAuthMock({
      user: { uid: "u1", email: "test@test.com" },
      isAuthenticated: true,
    });
    mockProfileValues = {
      profile: { firstName: null, avatar: null, sellerStatus: "none" },
      clearProfile: mockClearProfile,
    };

    render(<Header />);

    expect(screen.getByText("User")).toBeInTheDocument();
  });

  // ---- Wishlist ----

  it("shows wishlist link with badge count when authenticated and count > 0", () => {
    setAuthMock({
      user: { uid: "u1" },
      isAuthenticated: true,
    });
    mockWishlistValues = {
      ...mockWishlistValues,
      wishlistCount: 5,
    };

    render(<Header />);

    // Badge with count
    expect(screen.getByText("5")).toBeInTheDocument();

    // Wishlist text
    expect(screen.getByText("Wishlist")).toBeInTheDocument();
  });

  it("does NOT show wishlist badge when count is 0", () => {
    setAuthMock({
      user: { uid: "u1" },
      isAuthenticated: true,
    });
    mockWishlistValues = {
      ...mockWishlistValues,
      wishlistCount: 0,
    };

    render(<Header />);

    // "0" badge should NOT appear
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  // ---- Cart icon (mobile) ----

  it("renders a mobile cart button with aria-label", () => {
    render(<Header />);

    const cartBtn = screen.getByLabelText("View cart");
    expect(cartBtn).toBeInTheDocument();
  });

  // ---- Navigation links (fallback) ----

  it("renders fallback navigation links when CMS is loading", () => {
    mockNavLoading = true;
    render(<Header />);

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("Recipes")).toBeInTheDocument();
    expect(screen.getByText("Guides")).toBeInTheDocument();
    expect(screen.getByText("Growers")).toBeInTheDocument();
    expect(screen.getByText("Stores")).toBeInTheDocument();
  });

  it("renders CMS-driven navigation items when available", () => {
    mockNavMenu = {
      items: [
        { _key: "n1", label: "Custom Page", internalPath: "/custom", openInNewTab: false },
        { _key: "n2", label: "External", externalUrl: "https://example.com", openInNewTab: true },
      ],
    };
    mockNavLoading = false;

    render(<Header />);

    expect(screen.getAllByText("Custom Page").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("External").length).toBeGreaterThanOrEqual(1);
  });

  // ---- Announcement bar ----

  it("shows announcement bar when enabled with a message", () => {
    mockAnnouncementBar = {
      enabled: true,
      message: "Free shipping on orders over 1000!",
      backgroundColor: "#6A994E",
      textColor: "#ffffff",
      link: "/shop",
      linkText: "Shop Now",
    };

    render(<Header />);

    expect(
      screen.getByText("Free shipping on orders over 1000!"),
    ).toBeInTheDocument();
    expect(screen.getByText("Shop Now")).toBeInTheDocument();
  });

  it("does NOT show announcement bar when disabled", () => {
    mockAnnouncementBar = {
      enabled: false,
      message: "Should not appear",
    };

    render(<Header />);

    expect(screen.queryByText("Should not appear")).not.toBeInTheDocument();
  });

  it("does NOT show announcement bar when message is empty", () => {
    mockAnnouncementBar = {
      enabled: true,
      message: "",
    };

    render(<Header />);

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  // ---- Mobile menu trigger ----

  it("renders the mobile menu trigger (hamburger icon)", () => {
    render(<Header />);

    // The Sheet trigger has a Menu icon inside a button with variant="outline"
    // It renders inside the lg:hidden block
    const menuButtons = screen.getAllByRole("button");
    // At least one button should exist for the mobile menu
    expect(menuButtons.length).toBeGreaterThanOrEqual(1);
  });

  // ---- Search autocomplete ----

  it("renders search autocomplete component", () => {
    render(<Header />);

    const searchElements = screen.getAllByTestId("search-autocomplete");
    expect(searchElements.length).toBeGreaterThanOrEqual(1);
  });

  // ---- Cart dropdown (desktop) ----

  it("renders cart dropdown on desktop", () => {
    render(<Header />);

    expect(screen.getByTestId("cart-dropdown")).toBeInTheDocument();
  });

  // ---- Theme switcher ----

  it("renders theme switcher", () => {
    render(<Header />);

    const switches = screen.getAllByTestId("theme-switcher");
    expect(switches.length).toBeGreaterThanOrEqual(1);
  });

  // ---- Seller Dashboard link for approved sellers ----

  it("shows Dashboard nav link for approved sellers", () => {
    setAuthMock({
      user: { uid: "u1" },
      isAuthenticated: true,
    });
    mockProfileValues = {
      profile: { firstName: "Seller", sellerStatus: "approved" },
      clearProfile: mockClearProfile,
    };

    render(<Header />);

    // Wait for isMounted to flip
    // The "Dashboard" link appears in the nav bar for approved sellers
    const dashLinks = screen.getAllByText("Dashboard");
    expect(dashLinks.length).toBeGreaterThanOrEqual(1);
  });

  // ---- Logout dialog ----

  it("opens logout confirmation dialog and confirms logout", async () => {
    const user = userEvent.setup();

    setAuthMock({
      user: { uid: "u1", email: "test@test.com" },
      isAuthenticated: true,
    });
    mockProfileValues = {
      profile: { firstName: "Alice", avatar: null, sellerStatus: "none" },
      clearProfile: mockClearProfile,
    };

    render(<Header />);

    // Find the desktop dropdown trigger and click it to open the dropdown
    const dropdownTrigger = screen.getByText("Alice").closest("button");
    expect(dropdownTrigger).toBeTruthy();
    await user.click(dropdownTrigger!);

    // Wait for dropdown to open and click Logout
    await waitFor(() => {
      expect(screen.getByText("Logout")).toBeInTheDocument();
    });

    const logoutItem = screen.getByText("Logout");
    await user.click(logoutItem);

    // AlertDialog should show confirmation text
    await waitFor(() => {
      expect(screen.getByText("Confirm Logout")).toBeInTheDocument();
      expect(
        screen.getByText("Are you sure you want to log out of your account?"),
      ).toBeInTheDocument();
    });

    // Click the confirm action
    const confirmBtn = screen.getByRole("button", { name: /logout/i });
    await user.click(confirmBtn);

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
      expect(mockClearWishlist).toHaveBeenCalled();
      expect(mockClearCart).toHaveBeenCalled();
      expect(mockClearProfile).toHaveBeenCalled();
    });
  });

  it("cancels the logout dialog without signing out", async () => {
    const user = userEvent.setup();

    setAuthMock({
      user: { uid: "u1", email: "test@test.com" },
      isAuthenticated: true,
    });
    mockProfileValues = {
      profile: { firstName: "Bob", avatar: null, sellerStatus: "none" },
      clearProfile: mockClearProfile,
    };

    render(<Header />);

    // Open dropdown
    const trigger = screen.getByText("Bob").closest("button");
    await user.click(trigger!);

    await waitFor(() => {
      expect(screen.getByText("Logout")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Logout"));

    await waitFor(() => {
      expect(screen.getByText("Confirm Logout")).toBeInTheDocument();
    });

    // Cancel the dialog
    const cancelBtn = screen.getByRole("button", { name: /cancel/i });
    await user.click(cancelBtn);

    // signOut should NOT have been called
    expect(mockSignOut).not.toHaveBeenCalled();
  });

  // ---- SellerInfoBar inside Header ----

  it("shows 'Start Selling' link when seller status is none", () => {
    render(<Header />);

    expect(screen.getByText("Start Selling")).toBeInTheDocument();
  });

  it("shows FAQ and Contact Us links in seller info bar", () => {
    render(<Header />);

    expect(screen.getByText("FAQ")).toBeInTheDocument();
    expect(screen.getByText("CONTACT US")).toBeInTheDocument();
  });
});

// ===========================================================================
// SELLER HEADER COMPONENT
// ===========================================================================

describe("SellerHeader", () => {
  it("renders the MASH logo linked to home", () => {
    render(<SellerHeader />);

    const logo = screen.getByAltText("MASH Logo");
    expect(logo).toBeInTheDocument();

    const link = logo.closest("a");
    expect(link).toHaveAttribute("href", "/");
  });

  it("renders notification dropdown", () => {
    render(<SellerHeader />);

    expect(screen.getByTestId("notification-dropdown")).toBeInTheDocument();
  });

  it("renders theme switcher", () => {
    render(<SellerHeader />);

    expect(screen.getByTestId("theme-switcher")).toBeInTheDocument();
  });

  it("shows Start Selling link when seller status is none", () => {
    render(<SellerHeader />);

    expect(screen.getByText("Start Selling")).toBeInTheDocument();
  });
});

// ===========================================================================
// SIMPLE HEADER COMPONENT
// ===========================================================================

describe("SimpleHeader", () => {
  it("renders a centered logo linked to home", () => {
    render(<SimpleHeader />);

    const logo = screen.getByAltText("MASH Logo");
    expect(logo).toBeInTheDocument();

    const link = logo.closest("a");
    expect(link).toHaveAttribute("href", "/");
  });

  it("renders theme switcher", () => {
    render(<SimpleHeader />);

    expect(screen.getByTestId("theme-switcher")).toBeInTheDocument();
  });

  it("does NOT render navigation links (Home, Products, etc.)", () => {
    render(<SimpleHeader />);

    // SimpleHeader should not have the full nav
    expect(screen.queryByText("Products")).not.toBeInTheDocument();
    expect(screen.queryByText("Recipes")).not.toBeInTheDocument();
    expect(screen.queryByText("Guides")).not.toBeInTheDocument();
  });

  it("does NOT render search autocomplete", () => {
    render(<SimpleHeader />);

    expect(screen.queryByTestId("search-autocomplete")).not.toBeInTheDocument();
  });

  it("does NOT render cart dropdown", () => {
    render(<SimpleHeader />);

    expect(screen.queryByTestId("cart-dropdown")).not.toBeInTheDocument();
  });
});
