import React from "react";
import TestLalamovePage from "@/app/(shop)/test-lalamove/page";
import { render } from "@testing-library/react";

jest.mock("@/components/ui/button", () => ({ Button: ({ children, ...props }: any) => <button {...props}>{children}</button> }));
jest.mock("@/components/ui/input", () => ({ Input: (props: any) => <input {...props} /> }));
jest.mock("@/components/ui/label", () => ({ Label: ({ children, ...props }: any) => <label {...props}>{children}</label> }));
jest.mock("@/components/ui/card", () => ({ Card: ({ children }: any) => <div>{children}</div>, CardContent: ({ children }: any) => <div>{children}</div>, CardDescription: ({ children }: any) => <div>{children}</div>, CardFooter: ({ children }: any) => <div>{children}</div>, CardHeader: ({ children }: any) => <div>{children}</div>, CardTitle: ({ children }: any) => <div>{children}</div> }));
jest.mock("@/components/ui/alert", () => ({ Alert: ({ children }: any) => <div>{children}</div>, AlertDescription: ({ children }: any) => <div>{children}</div> }));
jest.mock("@/components/ui/radio-group", () => ({ RadioGroup: ({ children, ...props }: any) => <div {...props}>{children}</div>, RadioGroupItem: ({ ...props }) => <input type="radio" {...props} /> }));
jest.mock("@/components/ui/checkbox", () => ({ Checkbox: ({ ...props }) => <input type="checkbox" {...props} /> }));
jest.mock("lucide-react", () => ({ AlertCircle: () => <span>alert</span>, CheckCircle2: () => <span>check</span>, Clock: () => <span>clock</span>, MapPin: () => <span>pin</span>, Phone: () => <span>phone</span>, User: () => <span>user</span>, DollarSign: () => <span>dollar</span> }));

describe("TestLalamovePage", () => {
  it("renders without crashing (try/catch)", () => {
    let error = null;
    try {
      const { container } = render(<TestLalamovePage />);
      expect(container.textContent).toBeDefined();
    } catch (e) {
      error = e;
    }
    expect(error).toBeNull();
  });
});
