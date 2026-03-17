/**
 * FAQ Page render tests (Client Component)
 * COV-012: Page coverage batch
 */
import React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("@/hooks/useSanityFAQ", () => ({
  useSanityFAQs: () => ({
    faqs: [
      { _id: "1", question: "What is MASH?", answer: "A marketplace" },
    ],
    loading: false,
    error: null,
  }),
}));

jest.mock("@/components/cms/FAQSection", () => ({
  CMSFAQSection: ({
    faqs,
    loading,
    error,
  }: {
    faqs: unknown[];
    loading: boolean;
    error: unknown;
  }) => (
    <div data-testid="faq-section">
      {loading && <span>Loading...</span>}
      {error && <span>Error</span>}
      {faqs.map((f: any) => (
        <div key={f._id}>{f.question}</div>
      ))}
    </div>
  ),
}));

import FAQPage from "../page";

describe("FAQPage", () => {
  it("renders CMSFAQSection with FAQ data", () => {
    render(<FAQPage />);
    expect(screen.getByTestId("faq-section")).toBeInTheDocument();
    expect(screen.getByText("What is MASH?")).toBeInTheDocument();
  });
});
