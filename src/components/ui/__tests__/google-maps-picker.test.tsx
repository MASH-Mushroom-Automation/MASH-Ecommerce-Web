import React from "react";
import { GoogleMapsPicker } from "@/components/ui/google-maps-picker";
import { render, fireEvent } from "@testing-library/react";

jest.mock("@/components/ui/button", () => ({ Button: ({ children, ...props }: any) => <button {...props}>{children}</button> }));
jest.mock("@/components/ui/input", () => ({ Input: (props: any) => <input {...props} /> }));
jest.mock("@/components/ui/label", () => ({ Label: ({ children, ...props }: any) => <label {...props}>{children}</label> }));
jest.mock("@/components/ui/card", () => ({ Card: ({ children }: any) => <div>{children}</div>, CardContent: ({ children }: any) => <div>{children}</div> }));
jest.mock("lucide-react", () => ({ Navigation: () => <span>nav</span>, MapPin: () => <span>pin</span>, Search: () => <span>search</span>, X: () => <span>x</span>, Check: () => <span>check</span> }));

describe("GoogleMapsPicker", () => {
  it("renders and allows manual address entry", () => {
    const onLocationSelect = jest.fn();
    const { container, getByPlaceholderText, getByText } = render(
      <GoogleMapsPicker onLocationSelect={onLocationSelect} />
    );
    const input = getByPlaceholderText(/Enter your address/i);
    fireEvent.change(input, { target: { value: "Test Address" } });
    fireEvent.click(getByText("Search"));
    expect(container.textContent).toContain("Test Address");
  });

  it("shows and hides map", () => {
    const { getByText } = render(
      <GoogleMapsPicker onLocationSelect={jest.fn()} />
    );
    fireEvent.click(getByText(/Hide Map/i));
    expect(getByText(/Map Hidden/i)).toBeDefined();
  });
});
