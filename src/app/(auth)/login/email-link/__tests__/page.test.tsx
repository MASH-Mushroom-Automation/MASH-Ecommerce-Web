import React from "react";
import { render } from "@testing-library/react";
import * as AuthContext from "@/contexts/AuthContext";
import * as nextNavigation from "next/navigation";
import Page from "../page";

// Mock useRouter
jest.spyOn(nextNavigation, "useRouter").mockReturnValue({ push: jest.fn(), replace: jest.fn() });

// Mock AuthContext
jest.spyOn(AuthContext, "useAuth").mockReturnValue({
  checkForEmailLink: jest.fn().mockReturnValue(true),
  completeEmailLinkSignIn: jest.fn(),
  getStoredEmail: jest.fn().mockReturnValue("test@example.com"),
  isAuthenticated: false,
  user: null,
  updateUserProfile: jest.fn(),
});

describe("Email Link Sign-In Page", () => {
  it("renders without crashing", () => {
    let container;
    try {
      const result = render(<Page />);
      container = result.container;
    } catch (e) {
      container = undefined;
    }
    expect(container).toBeDefined();
  });
});
