import { render, screen, fireEvent } from "@testing-library/react";

// Mock dependencies
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, variant, ...props }: any) => (
    <button onClick={onClick} data-variant={variant} {...props}>
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/card", () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardDescription: ({ children }: any) => <p>{children}</p>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h2>{children}</h2>,
}));

jest.mock("@/components/auth/google-sign-in-button", () => ({
  GoogleSignInButton: ({ fullWidth }: any) => (
    <button data-testid="google-sign-in" data-fullwidth={fullWidth}>
      Sign in with Google
    </button>
  ),
}));

jest.mock("lucide-react", () => ({
  CheckCircle2: (props: any) => <svg data-testid="check-icon" {...props} />,
  XCircle: (props: any) => <svg data-testid="x-icon" {...props} />,
  Loader2: (props: any) => <svg data-testid="loader-icon" {...props} />,
}));

const mockSignOut = jest.fn();

describe("AuthTestPage", () => {
  let AuthTestPage: any;

  beforeAll(async () => {
    const mod = await import("../page");
    AuthTestPage = mod.default;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockSignOut.mockReset();
    // Reset localStorage/sessionStorage
    Storage.prototype.getItem = jest.fn().mockReturnValue(null);
  });

  it("should show loading state", () => {
    (global as any).__mockUseAuth.mockReturnValue({
      ...(global as any).__mockAuthContext,
      loading: true,
      user: null,
      firebaseUser: null,
      isAuthenticated: false,
    });

    render(<AuthTestPage />);
    expect(screen.getByText("Loading authentication state...")).toBeInTheDocument();
    expect(screen.getByTestId("loader-icon")).toBeInTheDocument();
  });

  it("should show not authenticated state with Google sign-in button", () => {
    (global as any).__mockUseAuth.mockReturnValue({
      ...(global as any).__mockAuthContext,
      loading: false,
      user: null,
      firebaseUser: null,
      isAuthenticated: false,
      signOut: mockSignOut,
    });

    render(<AuthTestPage />);
    expect(screen.getByText("Not Authenticated")).toBeInTheDocument();
    expect(screen.getByTestId("x-icon")).toBeInTheDocument();
    expect(screen.getByTestId("google-sign-in")).toBeInTheDocument();
  });

  it("should show authenticated state with sign out button", () => {
    (global as any).__mockUseAuth.mockReturnValue({
      ...(global as any).__mockAuthContext,
      loading: false,
      user: { id: "u1", email: "test@test.com", provider: "google" },
      firebaseUser: { uid: "fb1", email: "test@test.com" },
      isAuthenticated: true,
      signOut: mockSignOut,
    });

    render(<AuthTestPage />);
    expect(screen.getByText("Authenticated")).toBeInTheDocument();
    expect(screen.getByTestId("check-icon")).toBeInTheDocument();
    expect(screen.getByText("Sign Out")).toBeInTheDocument();
    expect(screen.queryByTestId("google-sign-in")).not.toBeInTheDocument();
  });

  it("should call signOut when sign out button is clicked", () => {
    (global as any).__mockUseAuth.mockReturnValue({
      ...(global as any).__mockAuthContext,
      loading: false,
      user: { id: "u1", email: "test@test.com", provider: "google" },
      firebaseUser: { uid: "fb1", email: "test@test.com" },
      isAuthenticated: true,
      signOut: mockSignOut,
    });

    render(<AuthTestPage />);
    fireEvent.click(screen.getByText("Sign Out"));
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it("should display Firebase user data when firebaseUser is present", () => {
    (global as any).__mockUseAuth.mockReturnValue({
      ...(global as any).__mockAuthContext,
      loading: false,
      user: null,
      firebaseUser: {
        uid: "firebase-uid-123",
        email: "fb@test.com",
        displayName: "John Doe",
        photoURL: null,
        emailVerified: true,
      },
      isAuthenticated: true,
      signOut: mockSignOut,
    });

    render(<AuthTestPage />);
    expect(screen.getByText("Firebase User Data")).toBeInTheDocument();
    expect(screen.getByText("firebase-uid-123")).toBeInTheDocument();
    expect(screen.getByText("fb@test.com")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Verified")).toBeInTheDocument();
  });

  it("should show 'Not set' for missing displayName", () => {
    (global as any).__mockUseAuth.mockReturnValue({
      ...(global as any).__mockAuthContext,
      loading: false,
      user: { id: "u1", email: "fb@test.com", provider: "google" },
      firebaseUser: {
        uid: "fb1",
        email: "fb@test.com",
        displayName: null,
        photoURL: null,
        emailVerified: false,
      },
      isAuthenticated: true,
      signOut: mockSignOut,
    });

    render(<AuthTestPage />);
    // displayName "Not set", photoURL "Not set", email not verified
    const notSetElements = screen.getAllByText("Not set");
    expect(notSetElements.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("Not verified")).toBeInTheDocument();
  });

  it("should display firebase user photoURL with image when present", () => {
    (global as any).__mockUseAuth.mockReturnValue({
      ...(global as any).__mockAuthContext,
      loading: false,
      user: { id: "u1", email: "fb@test.com", provider: "google" },
      firebaseUser: {
        uid: "fb1",
        email: "fb@test.com",
        displayName: "Test",
        photoURL: "https://photo.example.com/avatar.jpg",
        emailVerified: true,
      },
      isAuthenticated: true,
      signOut: mockSignOut,
    });

    render(<AuthTestPage />);
    const profileImg = screen.getByAltText("Profile");
    expect(profileImg).toBeInTheDocument();
    expect(profileImg).toHaveAttribute("src", "https://photo.example.com/avatar.jpg");
  });

  it("should display AuthContext user data when user is present", () => {
    (global as any).__mockUseAuth.mockReturnValue({
      ...(global as any).__mockAuthContext,
      loading: false,
      user: {
        id: "user-123",
        email: "ctx@test.com",
        firstName: "Jane",
        lastName: "Smith",
        displayName: "Jane Smith",
        phone: "09171234567",
        provider: "email",
        photoURL: null,
        avatar: null,
        onboardingCompleted: true,
      },
      firebaseUser: null,
      isAuthenticated: true,
      signOut: mockSignOut,
    });

    render(<AuthTestPage />);
    expect(screen.getByText("AuthContext User Profile")).toBeInTheDocument();
    expect(screen.getByText("user-123")).toBeInTheDocument();
    expect(screen.getByText("ctx@test.com")).toBeInTheDocument();
    expect(screen.getByText("Jane")).toBeInTheDocument();
    expect(screen.getByText("Smith")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("09171234567")).toBeInTheDocument();
    expect(screen.getByText("email")).toBeInTheDocument();
  });

  it("should show Not set for missing user fields", () => {
    (global as any).__mockUseAuth.mockReturnValue({
      ...(global as any).__mockAuthContext,
      loading: false,
      user: {
        id: "u1",
        email: "t@t.com",
        firstName: null,
        lastName: null,
        displayName: null,
        phone: null,
        provider: "google",
        photoURL: null,
        avatar: null,
        onboardingCompleted: false,
      },
      firebaseUser: null,
      isAuthenticated: true,
      signOut: mockSignOut,
    });

    render(<AuthTestPage />);
    const notSetElements = screen.getAllByText("Not set");
    expect(notSetElements.length).toBeGreaterThanOrEqual(4);
    expect(screen.getByText("Not completed")).toBeInTheDocument();
  });

  it("should show user photoURL image when present", () => {
    (global as any).__mockUseAuth.mockReturnValue({
      ...(global as any).__mockAuthContext,
      loading: false,
      user: {
        id: "u1",
        email: "t@t.com",
        provider: "google",
        photoURL: "https://example.com/photo.jpg",
        avatar: null,
        onboardingCompleted: true,
      },
      firebaseUser: null,
      isAuthenticated: true,
      signOut: mockSignOut,
    });

    render(<AuthTestPage />);
    // There should be an image for photoURL
    const imgs = screen.getAllByRole("img");
    const photoImg = imgs.find((img: HTMLElement) =>
      img.getAttribute("src") === "https://example.com/photo.jpg"
    );
    expect(photoImg).toBeTruthy();
  });

  it("should show user avatar image when present", () => {
    (global as any).__mockUseAuth.mockReturnValue({
      ...(global as any).__mockAuthContext,
      loading: false,
      user: {
        id: "u1",
        email: "t@t.com",
        provider: "google",
        photoURL: null,
        avatar: "https://example.com/avatar.jpg",
        onboardingCompleted: false,
      },
      firebaseUser: null,
      isAuthenticated: true,
      signOut: mockSignOut,
    });

    render(<AuthTestPage />);
    const avatarImg = screen.getByAltText("Avatar");
    expect(avatarImg).toHaveAttribute("src", "https://example.com/avatar.jpg");
  });

  it("should show raw user JSON when user is present", () => {
    const mockUser = {
      id: "u1",
      email: "t@t.com",
      provider: "google",
    };
    (global as any).__mockUseAuth.mockReturnValue({
      ...(global as any).__mockAuthContext,
      loading: false,
      user: mockUser,
      firebaseUser: null,
      isAuthenticated: true,
      signOut: mockSignOut,
    });

    render(<AuthTestPage />);
    expect(screen.getByText("Raw User Object")).toBeInTheDocument();
  });

  it("should show Browser Storage section", () => {
    (global as any).__mockUseAuth.mockReturnValue({
      ...(global as any).__mockAuthContext,
      loading: false,
      user: null,
      firebaseUser: null,
      isAuthenticated: false,
      signOut: mockSignOut,
    });

    render(<AuthTestPage />);
    expect(screen.getByText("Browser Storage")).toBeInTheDocument();
  });

  it("should display localStorage user data when set", () => {
    Storage.prototype.getItem = jest.fn().mockImplementation((key: string) => {
      if (key === "user") return JSON.stringify({ name: "Stored User" });
      return null;
    });

    (global as any).__mockUseAuth.mockReturnValue({
      ...(global as any).__mockAuthContext,
      loading: false,
      user: null,
      firebaseUser: null,
      isAuthenticated: false,
      signOut: mockSignOut,
    });

    render(<AuthTestPage />);
    expect(screen.getByText(/Stored User/)).toBeInTheDocument();
  });

  it("should show 'Not set' when localStorage has no user", () => {
    Storage.prototype.getItem = jest.fn().mockReturnValue(null);

    (global as any).__mockUseAuth.mockReturnValue({
      ...(global as any).__mockAuthContext,
      loading: false,
      user: null,
      firebaseUser: null,
      isAuthenticated: false,
      signOut: mockSignOut,
    });

    render(<AuthTestPage />);
    const notSetElements = screen.getAllByText("Not set");
    expect(notSetElements.length).toBeGreaterThanOrEqual(2);
  });

  it("should display sessionStorage firebase-token when set", () => {
    Storage.prototype.getItem = jest.fn().mockImplementation((key: string) => {
      if (key === "firebase-token") return "mock-firebase-token-value";
      return null;
    });

    (global as any).__mockUseAuth.mockReturnValue({
      ...(global as any).__mockAuthContext,
      loading: false,
      user: null,
      firebaseUser: null,
      isAuthenticated: false,
      signOut: mockSignOut,
    });

    render(<AuthTestPage />);
    expect(screen.getByText("mock-firebase-token-value")).toBeInTheDocument();
  });

  it("should render page heading", () => {
    (global as any).__mockUseAuth.mockReturnValue({
      ...(global as any).__mockAuthContext,
      loading: false,
      user: null,
      firebaseUser: null,
      isAuthenticated: false,
      signOut: mockSignOut,
    });

    render(<AuthTestPage />);
    expect(screen.getByText("Authentication Test Page")).toBeInTheDocument();
  });

  it("should not show Firebase or AuthContext cards when not authenticated", () => {
    (global as any).__mockUseAuth.mockReturnValue({
      ...(global as any).__mockAuthContext,
      loading: false,
      user: null,
      firebaseUser: null,
      isAuthenticated: false,
      signOut: mockSignOut,
    });

    render(<AuthTestPage />);
    expect(screen.queryByText("Firebase User Data")).not.toBeInTheDocument();
    expect(screen.queryByText("AuthContext User Profile")).not.toBeInTheDocument();
    expect(screen.queryByText("Raw User Object")).not.toBeInTheDocument();
  });

  it("should show onboarding completed status", () => {
    (global as any).__mockUseAuth.mockReturnValue({
      ...(global as any).__mockAuthContext,
      loading: false,
      user: {
        id: "u1",
        email: "t@t.com",
        provider: "google",
        onboardingCompleted: true,
      },
      firebaseUser: null,
      isAuthenticated: true,
      signOut: mockSignOut,
    });

    render(<AuthTestPage />);
    // The component uses a checkmark character for completed
    expect(screen.getByText(/✓ Completed/)).toBeInTheDocument();
  });
});
