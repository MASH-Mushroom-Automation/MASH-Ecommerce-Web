import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeSwitcher } from "../theme-switcher";

const mockSetTheme = jest.fn();
let mockResolvedTheme = "light";

jest.mock("next-themes", () => ({
  useTheme: () => ({
    setTheme: mockSetTheme,
    resolvedTheme: mockResolvedTheme,
  }),
}));

describe("ThemeSwitcher", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockResolvedTheme = "light";
  });

  it("should render nothing before mount", () => {
    // Before useEffect fires, mounted is false
    const { container } = render(<ThemeSwitcher />);
    // After useEffect (sync in test), it should render
    expect(container.querySelector("button")).toBeInTheDocument();
  });

  it("should render toggle button with sr-only text", () => {
    render(<ThemeSwitcher />);
    expect(screen.getByText("Toggle theme")).toBeInTheDocument();
  });

  it("should call setTheme with 'dark' when in light mode", () => {
    mockResolvedTheme = "light";
    render(<ThemeSwitcher />);
    fireEvent.click(screen.getByRole("button"));
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("should call setTheme with 'light' when in dark mode", () => {
    mockResolvedTheme = "dark";
    render(<ThemeSwitcher />);
    fireEvent.click(screen.getByRole("button"));
    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });
});
