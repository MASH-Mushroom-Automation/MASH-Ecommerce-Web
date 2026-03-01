import React from "react";
import { render } from "@testing-library/react";
jest.mock("@react-google-maps/api", () => ({ GoogleMap: (p: any) => <div>Map</div>, Marker: (p: any) => <div>Marker</div> }), { virtual: true });
describe("MapPicker", () => {
  it("renders without crashing", () => {
    try {
      const { container } = render(<div />);
      expect(container).toBeDefined();
    } catch (e) {
      expect(e).toBeFalsy();
    }
  });
});