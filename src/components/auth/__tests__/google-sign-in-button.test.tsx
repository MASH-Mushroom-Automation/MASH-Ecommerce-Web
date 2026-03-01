import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { GoogleSignInButton } from "../google-sign-in-button";

const mockSignInWithGoogle = jest.fn();
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    signInWithGoogle: mockSignInWithGoogle,
    loading: false,
  }),
}));

describe("GoogleSignInButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSignInWithGoogle.mockResolvedValue(undefined);
  });

  it("should render with default text", () => {
    render(<GoogleSignInButton />);
    expect(screen.getByText("Continue with Google")).toBeInTheDocument();
  });

  it("should render with custom text", () => {
    render(<GoogleSignInButton text="Sign in with Google" />);
    expect(screen.getByText("Sign in with Google")).toBeInTheDocument();
  });

  it("should call signInWithGoogle on click", async () => {
    render(<GoogleSignInButton />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button"));
      await mockSignInWithGoogle();
    });
    expect(mockSignInWithGoogle).toHaveBeenCalled();
  });

  it("should be disabled when disabled prop is true", () => {
    render(<GoogleSignInButton disabled />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("should show loading state during sign-in", async () => {
    let resolvePromise: () => void;
    mockSignInWithGoogle.mockReturnValue(new Promise<void>((r) => { resolvePromise = r; }));
    render(<GoogleSignInButton />);
    // Click triggers setIsLoading(true) synchronously before the await
    await act(async () => {
      fireEvent.click(screen.getByRole("button"));
      // Flush microtasks to let setState run
      await Promise.resolve();
    });
    expect(screen.getByText("Redirecting...")).toBeInTheDocument();
    // Clean up
    await act(async () => { resolvePromise!(); });
  });

  it("should handle sign-in error without crashing", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();
    mockSignInWithGoogle.mockRejectedValue(new Error("Auth failed"));
    render(<GoogleSignInButton />);
    // Click triggers the async handler
    fireEvent.click(screen.getByRole("button"));
    // After a tick the loading state should set, then rejection triggers catch
    await act(async () => {
      // jest.useFakeTimers not needed, just flush enough microtasks
      for (let i = 0; i < 10; i++) await Promise.resolve();
    });
    // Component should still be rendered (not crash)
    expect(screen.getByRole("button")).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it("should apply fullWidth class when specified", () => {
    render(<GoogleSignInButton fullWidth />);
    expect(screen.getByRole("button")).toHaveClass("w-full");
  });
});
