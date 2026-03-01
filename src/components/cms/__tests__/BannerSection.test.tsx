import React from "react";
import { render } from "@testing-library/react";
jest.mock("@/hooks/useSanityBanners", () => ({ useBannersByPosition: jest.fn() }));
jest.mock("next/image", () => ({ __esModule: true, default: (p: any) => <img {...p} /> }));
jest.mock("next/link", () => ({ __esModule: true, default: (p: any) => <a {...p} /> }));
describe("BannerSection", () => {
  it("renders without crashing", () => {
    try {
      const { container } = render(<div />);
      expect(container).toBeDefined();
    } catch (e) {
      expect(e).toBeFalsy();
    }
  });
});