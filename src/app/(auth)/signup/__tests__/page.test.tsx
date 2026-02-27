import React from "react";
import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ----- Global mock toast from jest.setupMocks.js -----
const mockToast = (global as Record<string, unknown>).__mockToast as {
  success: jest.Mock;
  error: jest.Mock;
  info: jest.Mock;
  warning: jest.Mock;
  loading: jest.Mock;
  dismiss: jest.Mock;
};

// ----- Router mock: re-mock next/navigation with own factory -----
const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: jest.fn(),
    prefetch: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/signup",
  useParams: () => ({}),
}));

// ----- Auth mock: use global __mockUseAuth from jest.setupMocks.js -----
const mockUseAuth = (global as Record<string, unknown>).__mockUseAuth as jest.Mock;

// ----- Mock AuthApi -----
const mockRegister = jest.fn();
jest.mock("@/lib/api/auth", () => ({
  AuthApi: {
    register: (...args: unknown[]) => mockRegister(...args),
  },
}));

// ----- Mock utilities -----
jest.mock("@/lib/utils/username", () => ({
  generateUsername: jest.fn((email: string) => email.split("@")[0]),
  generateUniqueUsername: jest.fn((base: string) => Promise.resolve(base)),
}));

jest.mock("@/lib/avatar", () => ({
  getDiceBearAvatar: jest.fn((seed: string) => `https://avatar.test/${seed}`),
}));

jest.mock("@/lib/auth/password", () => ({
  getPasswordRequirements: jest.fn((pw: string) => ({
    minLength: pw.length >= 6,
    hasUppercase: /[A-Z]/.test(pw),
    hasNumber: /\d/.test(pw),
    hasSpecialChar: /[!@#$%^&*]/.test(pw),
  })),
}));

// ----- Mock GoogleSignInButton -----
jest.mock("@/components/auth/google-sign-in-button", () => ({
  GoogleSignInButton: (props: { text?: string }) => (
    <button data-testid="google-signin">{props.text || "Sign up with Google"}</button>
  ),
}));

// ----- Mock shadcn Checkbox (Radix) to be testable -----
jest.mock("@/components/ui/checkbox", () => ({
  Checkbox: React.forwardRef(function MockCheckbox(
    {
      checked,
      onCheckedChange,
      id,
    }: {
      checked?: boolean;
      onCheckedChange?: (v: boolean) => void;
      id?: string;
      className?: string;
    },
    ref: React.Ref<HTMLButtonElement>
  ) {
    return (
      <button
        ref={ref}
        role="checkbox"
        aria-checked={!!checked}
        data-state={checked ? "checked" : "unchecked"}
        id={id}
        onClick={() => onCheckedChange?.(!checked)}
        type="button"
      />
    );
  }),
}));

// ----- Mock sessionStorage -----
const mockSessionStorage: Record<string, string> = {};
beforeAll(() => {
  Object.defineProperty(window, "sessionStorage", {
    value: {
      getItem: jest.fn((key: string) => mockSessionStorage[key] ?? null),
      setItem: jest.fn((key: string, val: string) => {
        mockSessionStorage[key] = val;
      }),
      removeItem: jest.fn((key: string) => {
        delete mockSessionStorage[key];
      }),
      clear: jest.fn(() => {
        Object.keys(mockSessionStorage).forEach((k) => delete mockSessionStorage[k]);
      }),
    },
    writable: true,
  });
});

// ----- Import component under test -----
import SignupPage from "../page";

// ----- Helpers -----
function setUnauthenticated() {
  mockUseAuth.mockReturnValue({
    user: null,
    isAuthenticated: false,
    signInWithGoogle: jest.fn(),
    signOut: jest.fn(),
    loading: false,
  });
}

async function fillForm(
  user: ReturnType<typeof userEvent.setup>,
  overrides: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    terms: boolean;
    privacy: boolean;
  }> = {}
) {
  const defaults = {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    password: "Secret1",
    confirmPassword: "Secret1",
    terms: true,
    privacy: true,
    ...overrides,
  };

  await user.type(screen.getByPlaceholderText("Enter your first name"), defaults.firstName);
  await user.type(screen.getByPlaceholderText("Enter your last name"), defaults.lastName);
  await user.type(screen.getByPlaceholderText("Enter your email"), defaults.email);
  await user.type(
    screen.getByPlaceholderText("Create a password (min 6 characters)"),
    defaults.password
  );
  await user.type(screen.getByPlaceholderText("Confirm your password"), defaults.confirmPassword);

  if (defaults.terms) {
    const termsCheckbox = screen.getByRole("checkbox", { name: /terms/i });
    if (termsCheckbox.getAttribute("aria-checked") !== "true") {
      await user.click(termsCheckbox);
    }
  }
  if (defaults.privacy) {
    const privacyCheckbox = screen.getByRole("checkbox", { name: /privacy/i });
    if (privacyCheckbox.getAttribute("aria-checked") !== "true") {
      await user.click(privacyCheckbox);
    }
  }
}

// ----- Tests -----

describe("SignupPage", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockReplace.mockClear();
    mockRegister.mockClear();
    mockToast.success.mockClear();
    mockToast.error.mockClear();
    mockToast.info.mockClear();
    mockToast.warning.mockClear();
    (window.sessionStorage.setItem as jest.Mock).mockClear();
    Object.keys(mockSessionStorage).forEach((k) => delete mockSessionStorage[k]);
    setUnauthenticated();
  });

  // ---- RENDERING TESTS ----

  it("renders the signup form with all required fields", () => {
    render(<SignupPage />);

    expect(screen.getByPlaceholderText("Enter your first name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your last name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Create a password (min 6 characters)")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Confirm your password")).toBeInTheDocument();
  });

  it("renders the 'Create Account' submit button", () => {
    render(<SignupPage />);

    const submitBtn = screen.getByRole("button", { name: /create account/i });
    expect(submitBtn).toBeInTheDocument();
    expect(submitBtn).toHaveAttribute("type", "submit");
  });

  it("renders Google sign-up button", () => {
    render(<SignupPage />);

    expect(screen.getByTestId("google-signin")).toBeInTheDocument();
    expect(screen.getByTestId("google-signin")).toHaveTextContent(/sign up with google/i);
  });

  it("renders a link to the login page", () => {
    render(<SignupPage />);

    const loginLink = screen.getByRole("link", { name: /sign in here/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute("href", "/login");
  });

  it("renders page heading 'Create your account'", () => {
    render(<SignupPage />);

    expect(screen.getByRole("heading", { name: /create your account/i })).toBeInTheDocument();
  });

  it("renders Terms & Conditions and Privacy Policy checkboxes", () => {
    render(<SignupPage />);

    const termsCheckbox = screen.getByRole("checkbox", { name: /terms/i });
    const privacyCheckbox = screen.getByRole("checkbox", { name: /privacy/i });

    expect(termsCheckbox).toBeInTheDocument();
    expect(privacyCheckbox).toBeInTheDocument();
    expect(termsCheckbox).toHaveAttribute("aria-checked", "false");
    expect(privacyCheckbox).toHaveAttribute("aria-checked", "false");
  });

  it("renders links to Terms & Conditions and Privacy Policy pages", () => {
    render(<SignupPage />);

    const termsLink = screen.getByRole("link", { name: /terms & conditions/i });
    const privacyLink = screen.getByRole("link", { name: /data privacy policy/i });

    expect(termsLink).toHaveAttribute("href", "/terms");
    expect(privacyLink).toHaveAttribute("href", "/privacy");
  });

  // ---- PASSWORD VISIBILITY TOGGLE ----

  it("toggles password visibility when eye icon is clicked", async () => {
    const user = userEvent.setup();
    render(<SignupPage />);

    const passwordInput = screen.getByPlaceholderText("Create a password (min 6 characters)");
    expect(passwordInput).toHaveAttribute("type", "password");

    // Input is inside div.relative.w-full (Input wrapper), which is inside div.relative
    // The toggle button is a child of div.relative (grandparent of input)
    const outerContainer = passwordInput.closest(".relative:not([class*='w-full'])")
      || passwordInput.parentElement!.parentElement!;
    const passwordToggle = outerContainer.querySelector("button[type='button']")!;

    await user.click(passwordToggle);
    expect(passwordInput).toHaveAttribute("type", "text");

    await user.click(passwordToggle);
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  // ---- PASSWORD REQUIREMENTS ----

  it("shows password requirements when user starts typing a password", async () => {
    const user = userEvent.setup();
    render(<SignupPage />);

    // Requirements should NOT be visible initially
    expect(screen.queryByText("At least 6 characters")).not.toBeInTheDocument();

    // Type into password field to trigger requirements display
    const passwordInput = screen.getByPlaceholderText("Create a password (min 6 characters)");
    await user.type(passwordInput, "Ab");

    // Requirements should now be visible
    expect(screen.getByText("At least 6 characters")).toBeInTheDocument();
    expect(screen.getByText("One uppercase letter (recommended)")).toBeInTheDocument();
    expect(screen.getByText("One number (recommended)")).toBeInTheDocument();
  });

  // ---- FORM VALIDATION ----

  it("shows validation errors when submitting empty form", async () => {
    const user = userEvent.setup();
    render(<SignupPage />);

    const submitBtn = screen.getByRole("button", { name: /create account/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("First name is required")).toBeInTheDocument();
    });

    expect(screen.getByText("Last name is required")).toBeInTheDocument();
    expect(screen.getByText("Enter a valid email")).toBeInTheDocument();
  });

  it("shows email validation error for invalid email", async () => {
    const user = userEvent.setup();
    render(<SignupPage />);

    // Fill all other fields correctly
    await user.type(screen.getByPlaceholderText("Enter your first name"), "John");
    await user.type(screen.getByPlaceholderText("Enter your last name"), "Doe");
    await user.type(
      screen.getByPlaceholderText("Create a password (min 6 characters)"),
      "Secret1"
    );
    await user.type(screen.getByPlaceholderText("Confirm your password"), "Secret1");
    await user.click(screen.getByRole("checkbox", { name: /terms/i }));
    await user.click(screen.getByRole("checkbox", { name: /privacy/i }));

    // Set invalid email via fireEvent to bypass HTML5 native email validation in JSDOM
    const emailInput = screen.getByPlaceholderText("Enter your email");
    fireEvent.input(emailInput, { target: { value: "not-an-email" } });

    // Submit the form directly to bypass native constraint validation
    const form = screen.getByRole("button", { name: /create account/i }).closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText("Enter a valid email")).toBeInTheDocument();
    });
  });

  it("shows error when password is shorter than 6 characters", async () => {
    const user = userEvent.setup();
    render(<SignupPage />);

    await user.type(screen.getByPlaceholderText("Create a password (min 6 characters)"), "Ab1");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText("Password must be at least 6 characters")).toBeInTheDocument();
    });
  });

  it("shows error when passwords do not match", async () => {
    const user = userEvent.setup();
    render(<SignupPage />);

    await user.type(screen.getByPlaceholderText("Enter your first name"), "John");
    await user.type(screen.getByPlaceholderText("Enter your last name"), "Doe");
    await user.type(screen.getByPlaceholderText("Enter your email"), "john@example.com");
    await user.type(
      screen.getByPlaceholderText("Create a password (min 6 characters)"),
      "Secret1"
    );
    await user.type(screen.getByPlaceholderText("Confirm your password"), "Different1");

    await user.click(screen.getByRole("checkbox", { name: /terms/i }));
    await user.click(screen.getByRole("checkbox", { name: /privacy/i }));
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
    });
  });

  it("shows error when terms checkbox is not checked", async () => {
    const user = userEvent.setup();
    render(<SignupPage />);

    await fillForm(user, { terms: false, privacy: true });
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText("You must agree to Terms & Conditions")).toBeInTheDocument();
    });
  });

  it("shows error when privacy checkbox is not checked", async () => {
    const user = userEvent.setup();
    render(<SignupPage />);

    await fillForm(user, { terms: true, privacy: false });
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText("You must accept the Privacy Policy")).toBeInTheDocument();
    });
  });

  // ---- SUCCESSFUL SIGNUP ----

  it("calls AuthApi.register with correct data on valid submission", async () => {
    mockRegister.mockResolvedValue({ success: true, data: { success: true } });
    const user = userEvent.setup();
    render(<SignupPage />);

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "john@example.com",
          password: "Secret1",
          firstName: "John",
          lastName: "Doe",
          username: "john",
          imageUrl: "https://avatar.test/john",
        })
      );
    });
  });

  it("shows verification success view after successful registration", async () => {
    mockRegister.mockResolvedValue({ success: true, data: { success: true } });
    const user = userEvent.setup();
    render(<SignupPage />);

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText("Verify your email")).toBeInTheDocument();
    });

    expect(screen.getByText("john@example.com")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /enter verification code/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /use a different email/i })
    ).toBeInTheDocument();
  });

  it("stores email in sessionStorage after successful registration", async () => {
    mockRegister.mockResolvedValue({ success: true, data: { success: true } });
    const user = userEvent.setup();
    render(<SignupPage />);

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(window.sessionStorage.setItem).toHaveBeenCalledWith(
        "verification-email",
        "john@example.com"
      );
      expect(window.sessionStorage.setItem).toHaveBeenCalledWith(
        "pendingVerificationEmail",
        "john@example.com"
      );
    });
  });

  it("shows success toast after registration", async () => {
    mockRegister.mockResolvedValue({ success: true, data: { success: true } });
    const user = userEvent.setup();
    render(<SignupPage />);

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith(
        "Account created!",
        expect.objectContaining({
          description: "Check your email for the 6-digit verification code.",
        })
      );
    });
  });

  it("navigates to verify-otp when 'Enter Verification Code' is clicked", async () => {
    mockRegister.mockResolvedValue({ success: true, data: { success: true } });
    const user = userEvent.setup();
    render(<SignupPage />);

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText("Verify your email")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /enter verification code/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/verify-otp");
    });
  });

  it("returns to signup form when 'Use a different email' is clicked", async () => {
    mockRegister.mockResolvedValue({ success: true, data: { success: true } });
    const user = userEvent.setup();
    render(<SignupPage />);

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText("Verify your email")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /use a different email/i }));

    // Should be back on the signup form
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /create your account/i })).toBeInTheDocument();
    });
  });

  // ---- ERROR HANDLING ----

  it("shows toast error when email is already registered (409)", async () => {
    const conflictError = Object.assign(new Error("Email already exists"), {
      statusCode: 409,
      response: { error: { message: "Email already exists" }, statusCode: 409 },
    });
    mockRegister.mockRejectedValue(conflictError);

    const user = userEvent.setup();
    render(<SignupPage />);

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        "Email already registered",
        expect.objectContaining({
          duration: 6000,
        })
      );
    });
  });

  it("shows toast error when rate limited (429)", async () => {
    const rateLimitError = Object.assign(new Error("Too many requests"), {
      statusCode: 429,
      response: { statusCode: 429, message: "Too many requests" },
    });
    mockRegister.mockRejectedValue(rateLimitError);

    const user = userEvent.setup();
    render(<SignupPage />);

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        "Too many attempts",
        expect.objectContaining({
          description: "Please wait a few minutes before trying again.",
        })
      );
    });
  });

  it("shows toast error for server errors (500)", async () => {
    const serverError = Object.assign(new Error("Internal Server Error"), {
      statusCode: 500,
      response: { statusCode: 500, message: "Internal Server Error" },
    });
    mockRegister.mockRejectedValue(serverError);

    const user = userEvent.setup();
    render(<SignupPage />);

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        "Server error",
        expect.objectContaining({
          description: "Something went wrong on our end. Please try again later.",
        })
      );
    });
  });

  it("shows generic toast error for unhandled error types", async () => {
    // Use statusCode 403 to fall into the generic else branch
    const genericError = Object.assign(new Error("Access denied"), {
      statusCode: 403,
      response: { statusCode: 403, message: "Access denied" },
    });
    mockRegister.mockRejectedValue(genericError);

    const user = userEvent.setup();
    render(<SignupPage />);

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        "Registration failed",
        expect.objectContaining({
          description: "Access denied",
        })
      );
    });
  });

  // ---- LOADING STATE ----

  it("disables submit button and shows loading text while submitting", async () => {
    // Make register hang to keep isSubmitting=true
    mockRegister.mockImplementation(() => new Promise(() => {}));

    const user = userEvent.setup();
    render(<SignupPage />);

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      const submitBtn = screen.getByRole("button", { name: /creating account/i });
      expect(submitBtn).toBeDisabled();
    });
  });

  // ---- REDIRECT FOR AUTHENTICATED USERS ----

  it("redirects authenticated users to /shop", async () => {
    mockUseAuth.mockReturnValue({
      user: { id: "123", email: "test@test.com" },
      isAuthenticated: true,
      signInWithGoogle: jest.fn(),
      signOut: jest.fn(),
      loading: false,
    });

    await act(async () => {
      render(<SignupPage />);
    });

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/shop");
    });
  });
});
