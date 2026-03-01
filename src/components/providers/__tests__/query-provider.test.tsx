import React from "react";
import { render, screen } from "@testing-library/react";
import { QueryProvider } from "../query-provider";

// Mock tanstack react-query
const mockQueryClientProvider = jest.fn(({ children }: { children: React.ReactNode }) => (
  <div data-testid="query-client-provider">{children}</div>
));

jest.mock("@tanstack/react-query", () => ({
  QueryClient: jest.fn().mockImplementation(() => ({
    defaultOptions: {},
  })),
  QueryClientProvider: (props: { children: React.ReactNode }) => mockQueryClientProvider(props),
}));

jest.mock("@tanstack/react-query-devtools", () => ({
  ReactQueryDevtools: () => <div data-testid="devtools" />,
}));

describe("QueryProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render children", () => {
    render(
      <QueryProvider>
        <div data-testid="child">Test Child</div>
      </QueryProvider>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("Test Child")).toBeInTheDocument();
  });

  it("should wrap children with QueryClientProvider", () => {
    render(
      <QueryProvider>
        <span>Content</span>
      </QueryProvider>
    );
    expect(screen.getByTestId("query-client-provider")).toBeInTheDocument();
  });

  it("should include ReactQueryDevtools", () => {
    render(
      <QueryProvider>
        <span>Content</span>
      </QueryProvider>
    );
    expect(screen.getByTestId("devtools")).toBeInTheDocument();
  });

  it("should render multiple children", () => {
    render(
      <QueryProvider>
        <div data-testid="a">A</div>
        <div data-testid="b">B</div>
      </QueryProvider>
    );
    expect(screen.getByTestId("a")).toBeInTheDocument();
    expect(screen.getByTestId("b")).toBeInTheDocument();
  });
});
