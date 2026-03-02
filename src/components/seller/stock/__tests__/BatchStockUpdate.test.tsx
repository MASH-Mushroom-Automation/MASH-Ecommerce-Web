/**
 * Tests for BatchStockUpdate component
 * Batch 12: Expanded coverage for branches + functions
 */
import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";

// Mock sonner
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    loading: jest.fn(),
    dismiss: jest.fn(),
  },
}));

// Mock CSV parser
jest.mock("@/lib/csv/stock-adjustment-parser", () => ({
  parseStockAdjustmentCSV: jest.fn(),
  generateTemplateCSV: jest.fn(() => "sku,adjustment_type,quantity,reason\n"),
  generateErrorReportCSV: jest.fn(() => "row,errors\n3,Invalid SKU\n"),
}));

import { BatchStockUpdate } from "../BatchStockUpdate";
import { toast } from "sonner";
import {
  parseStockAdjustmentCSV,
  generateTemplateCSV,
  generateErrorReportCSV,
} from "@/lib/csv/stock-adjustment-parser";

const mockParseResult = {
  success: true,
  validRows: 2,
  invalidRows: 1,
  totalRows: 3,
  rows: [
    {
      rowNumber: 1,
      valid: true,
      raw: { sku: "SKU-001", type: "received", quantity: "10", reason: "Restock" },
      data: { sku: "SKU-001", adjustmentType: "received", quantityChange: 10, reason: "Restock", notes: "" },
      errors: [],
    },
    {
      rowNumber: 2,
      valid: true,
      raw: { sku: "SKU-002", type: "sold", quantity: "5", reason: "Sale" },
      data: { sku: "SKU-002", adjustmentType: "sold", quantityChange: 5, reason: "Sale", notes: "" },
      errors: [],
    },
    {
      rowNumber: 3,
      valid: false,
      raw: { sku: "BAD", type: "", quantity: "", reason: "" },
      data: null,
      errors: ["Invalid SKU", "Missing quantity"],
    },
  ],
  errors: [],
};

const mockImportResponse = {
  success: true,
  message: "2 adjustments applied",
  summary: { total: 2, succeeded: 2, failed: 0, mode: "partial" },
  results: {
    successes: [{ sku: "SKU-001", productId: "p1", previousStock: 10, newStock: 20 }],
    failures: [],
  },
};

function createMockCSVFile(name = "stock.csv", content = "csv-data", sizeOverride?: number): File {
  const file = new File([content], name, { type: "text/csv" });
  if (sizeOverride) {
    Object.defineProperty(file, "size", { value: sizeOverride });
  }
  // Mock .text() for jsdom environments where Blob.text() may not be available
  (file as any).text = jest.fn().mockResolvedValue(content);
  return file;
}

function getFileInput(container: HTMLElement): HTMLInputElement {
  return container.querySelector('input[type="file"]') as HTMLInputElement;
}

async function uploadFile(container: HTMLElement, file: File) {
  const input = getFileInput(container);
  await act(async () => {
    Object.defineProperty(input, "files", { value: [file], configurable: true });
    fireEvent.change(input);
  });
}

async function goToPreview(container: HTMLElement) {
  const file = createMockCSVFile();
  await uploadFile(container, file);
  await waitFor(() => {
    expect(screen.getByRole("button", { name: /import \d+ rows/i })).toBeInTheDocument();
  });
}

describe("BatchStockUpdate", () => {
  const mockOnImportComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (parseStockAdjustmentCSV as jest.Mock).mockReturnValue(mockParseResult);
    global.URL.createObjectURL = jest.fn(() => "blob:test-url");
    global.URL.revokeObjectURL = jest.fn();
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockImportResponse),
      })
    ) as jest.Mock;
  });

  // --- Idle state ---

  it("should render component title", () => {
    render(<BatchStockUpdate />);
    expect(screen.getByText("Batch Stock Update")).toBeInTheDocument();
  });

  it("should render file drop zone text", () => {
    render(<BatchStockUpdate />);
    expect(screen.getByText(/drop csv file here/i)).toBeInTheDocument();
  });

  it("should render download template button", () => {
    render(<BatchStockUpdate />);
    expect(screen.getByRole("button", { name: /download template/i })).toBeInTheDocument();
  });

  it("should accept className prop", () => {
    const { container } = render(<BatchStockUpdate className="test-cls" />);
    expect(container.firstElementChild?.className).toContain("test-cls");
  });

  it("should have hidden CSV file input", () => {
    const { container } = render(<BatchStockUpdate />);
    const input = getFileInput(container);
    expect(input).toBeTruthy();
    expect(input.accept).toBe(".csv");
  });

  // --- Template download ---

  it("should generate and download template CSV", () => {
    render(<BatchStockUpdate />);
    fireEvent.click(screen.getByRole("button", { name: /download template/i }));
    expect(generateTemplateCSV).toHaveBeenCalled();
    expect(URL.createObjectURL).toHaveBeenCalled();
  });

  // --- File validation ---

  it("should reject non-CSV file", async () => {
    const { container } = render(<BatchStockUpdate />);
    await uploadFile(container, createMockCSVFile("data.txt"));
    expect(toast.error).toHaveBeenCalledWith("Please select a CSV file");
  });

  it("should reject file exceeding 5MB", async () => {
    const { container } = render(<BatchStockUpdate />);
    await uploadFile(container, createMockCSVFile("big.csv", "x", 6 * 1024 * 1024));
    expect(toast.error).toHaveBeenCalledWith("File size exceeds 5MB limit");
  });

  // --- Parse → Preview ---

  it("should parse CSV and show preview state", async () => {
    const { container } = render(<BatchStockUpdate />);
    await goToPreview(container);
    expect(screen.getByText("Total Rows")).toBeInTheDocument();
    expect(screen.getAllByText("Valid").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Invalid").length).toBeGreaterThanOrEqual(1);
  });

  it("should display row data in preview table", async () => {
    const { container } = render(<BatchStockUpdate />);
    await goToPreview(container);
    expect(screen.getByText("SKU-001")).toBeInTheDocument();
    expect(screen.getByText("SKU-002")).toBeInTheDocument();
    expect(screen.getByText("BAD")).toBeInTheDocument();
  });

  it("should show Valid and Invalid badges", async () => {
    const { container } = render(<BatchStockUpdate />);
    await goToPreview(container);
    // 2 valid badges + 1 stat label = 3
    expect(screen.getAllByText("Valid").length).toBe(3);
    // 1 invalid badge + 1 stat label = 2
    expect(screen.getAllByText("Invalid").length).toBe(2);
  });

  it("should show validation errors warning", async () => {
    const { container } = render(<BatchStockUpdate />);
    await goToPreview(container);
    expect(screen.getByText(/1 rows have errors/)).toBeInTheDocument();
  });

  it("should show cancel and import buttons in preview", async () => {
    const { container } = render(<BatchStockUpdate />);
    await goToPreview(container);
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /import 2 rows/i })).toBeInTheDocument();
  });

  // --- Atomic mode ---

  it("should have atomic mode switch in preview", async () => {
    const { container } = render(<BatchStockUpdate />);
    await goToPreview(container);
    expect(screen.getByText("Atomic Mode")).toBeInTheDocument();
    expect(screen.getByRole("switch")).toBeInTheDocument();
  });

  it("should toggle atomic mode switch", async () => {
    const { container } = render(<BatchStockUpdate />);
    await goToPreview(container);
    const toggle = screen.getByRole("switch");
    fireEvent.click(toggle);
    expect(toggle).toBeInTheDocument();
  });

  // --- Row expansion ---

  it("should expand invalid row to show errors", async () => {
    const { container } = render(<BatchStockUpdate />);
    await goToPreview(container);
    const badRow = screen.getByText("BAD").closest("tr")!;
    fireEvent.click(badRow);
    await waitFor(() => {
      expect(screen.getByText("Invalid SKU")).toBeInTheDocument();
      expect(screen.getByText("Missing quantity")).toBeInTheDocument();
    });
  });

  it("should collapse expanded row on second click", async () => {
    const { container } = render(<BatchStockUpdate />);
    await goToPreview(container);
    const badRow = screen.getByText("BAD").closest("tr")!;
    fireEvent.click(badRow);
    await waitFor(() => expect(screen.getByText("Invalid SKU")).toBeInTheDocument());
    fireEvent.click(badRow);
    await waitFor(() => expect(screen.queryByText("Invalid SKU")).not.toBeInTheDocument());
  });

  // --- Error report download ---

  it("should download error report CSV", async () => {
    const { container } = render(<BatchStockUpdate />);
    await goToPreview(container);
    fireEvent.click(screen.getByText(/download error report/i));
    expect(generateErrorReportCSV).toHaveBeenCalled();
    expect(URL.createObjectURL).toHaveBeenCalled();
  });

  // --- Import flow ---

  it("should complete import successfully", async () => {
    const { container } = render(<BatchStockUpdate onImportComplete={mockOnImportComplete} />);
    await goToPreview(container);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /import 2 rows/i }));
    });
    await waitFor(() => {
      expect(screen.getByText(/import complete/i)).toBeInTheDocument();
    });
    expect(mockOnImportComplete).toHaveBeenCalledWith(mockImportResponse);
  });

  it("should send POST request on import", async () => {
    const { container } = render(<BatchStockUpdate />);
    await goToPreview(container);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /import 2 rows/i }));
    });
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/seller/stock/batch",
        expect.objectContaining({ method: "POST" })
      );
    });
  });

  it("should show import results with failure details", async () => {
    const failResponse = {
      success: false,
      message: "Partial import",
      summary: { total: 2, succeeded: 1, failed: 1, mode: "partial" },
      results: {
        successes: [],
        failures: [{ sku: "SKU-002", error: "Product not found" }],
      },
    };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(failResponse),
    });
    const { container } = render(<BatchStockUpdate />);
    await goToPreview(container);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /import 2 rows/i }));
    });
    await waitFor(() => {
      expect(screen.getByText(/product not found/i)).toBeInTheDocument();
    });
  });

  it("should handle fetch error on import", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: "Server error" }),
    });
    const { container } = render(<BatchStockUpdate />);
    await goToPreview(container);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /import 2 rows/i }));
    });
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Server error");
    });
  });

  it("should show Import Another File button after complete", async () => {
    const { container } = render(<BatchStockUpdate />);
    await goToPreview(container);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /import 2 rows/i }));
    });
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /import another file/i })).toBeInTheDocument();
    });
  });

  // --- Cancel ---

  it("should return to idle on cancel from preview", async () => {
    const { container } = render(<BatchStockUpdate />);
    await goToPreview(container);
    fireEvent.click(screen.getByRole("button", { name: /^cancel$/i }));
    await waitFor(() => {
      expect(screen.getByText(/drop csv file here/i)).toBeInTheDocument();
    });
  });

  // --- Reset ---

  it("should reset to idle from complete state", async () => {
    const { container } = render(<BatchStockUpdate />);
    await goToPreview(container);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /import 2 rows/i }));
    });
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /import another file/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: /import another file/i }));
    await waitFor(() => {
      expect(screen.getByText(/drop csv file here/i)).toBeInTheDocument();
    });
  });

  // --- Parse errors ---

  it("should show error when no valid rows found", async () => {
    (parseStockAdjustmentCSV as jest.Mock).mockReturnValue({
      success: false, validRows: 0, invalidRows: 2, totalRows: 2, rows: [], errors: [],
    });
    const { container } = render(<BatchStockUpdate />);
    await uploadFile(container, createMockCSVFile());
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("No valid rows found in CSV");
    });
  });

  it("should show error state with messages and try again", async () => {
    (parseStockAdjustmentCSV as jest.Mock).mockReturnValue({
      success: false, validRows: 0, invalidRows: 0, totalRows: 0,
      rows: [], errors: ["Bad CSV format"],
    });
    const { container } = render(<BatchStockUpdate />);
    await uploadFile(container, createMockCSVFile());
    await waitFor(() => {
      expect(screen.getByText(/failed to process csv/i)).toBeInTheDocument();
      expect(screen.getByText("Bad CSV format")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
    });
  });

  it("should reset from error state via Try Again", async () => {
    (parseStockAdjustmentCSV as jest.Mock).mockReturnValue({
      success: false, validRows: 0, invalidRows: 0, totalRows: 0,
      rows: [], errors: ["Bad"],
    });
    const { container } = render(<BatchStockUpdate />);
    await uploadFile(container, createMockCSVFile());
    await waitFor(() => expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    await waitFor(() => {
      expect(screen.getByText(/drop csv file here/i)).toBeInTheDocument();
    });
  });

  it("should handle parse exception gracefully", async () => {
    (parseStockAdjustmentCSV as jest.Mock).mockImplementation(() => {
      throw new Error("Malformed CSV");
    });
    const { container } = render(<BatchStockUpdate />);
    await uploadFile(container, createMockCSVFile());
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Malformed CSV");
    });
  });

  // --- Drag and drop ---

  it("should handle file drop on drop zone", async () => {
    render(<BatchStockUpdate />);
    const dropZone = screen.getByText(/drop csv file here/i).parentElement!;
    const file = createMockCSVFile();
    await act(async () => {
      fireEvent.drop(dropZone, { dataTransfer: { files: [file] } });
    });
    await waitFor(() => {
      expect(parseStockAdjustmentCSV).toHaveBeenCalled();
    });
  });

  it("should handle drag over without error", () => {
    render(<BatchStockUpdate />);
    const dropZone = screen.getByText(/drop csv file here/i).parentElement!;
    fireEvent.dragOver(dropZone);
    expect(dropZone).toBeInTheDocument();
  });

  // --- Disabled import ---

  it("should disable import button when 0 valid rows", async () => {
    (parseStockAdjustmentCSV as jest.Mock).mockReturnValue({
      ...mockParseResult, success: true, validRows: 0,
      rows: mockParseResult.rows.map(r => ({ ...r, valid: false, data: null })),
    });
    const { container } = render(<BatchStockUpdate />);
    await uploadFile(container, createMockCSVFile());
    await waitFor(() => {
      const btn = screen.getByRole("button", { name: /import 0 rows/i });
      expect(btn).toBeDisabled();
    });
  });
});
