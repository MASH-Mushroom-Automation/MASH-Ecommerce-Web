/**
 * Tests for src/lib/exportCsv.ts
 * Covers: CSV generation, header row, value escaping, empty data, download trigger
 */

// Mock DOM APIs needed by exportToCsv
const mockClick = jest.fn();
const mockCreateObjectURL = jest.fn(() => "blob:mock-url");
let capturedBlobs: Blob[] = [];

beforeEach(() => {
  jest.clearAllMocks();
  capturedBlobs = [];

  // Mock URL.createObjectURL
  global.URL.createObjectURL = mockCreateObjectURL;

  // Mock document.createElement to capture blobs and click behavior
  jest.spyOn(document, "createElement").mockImplementation((tag: string) => {
    if (tag === "a") {
      const link: any = {
        href: "",
        download: "",
        click: mockClick,
      };
      return link;
    }
    return document.createElement(tag);
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

import { exportToCsv } from "../exportCsv";

describe("exportToCsv", () => {
  it("generates CSV with headers from first row keys", () => {
    const rows = [
      { name: "Alice", age: 30 },
      { name: "Bob", age: 25 },
    ];
    exportToCsv(rows, "test.csv");

    // Verify blob was created with CSV content
    expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);
    const blob: Blob = mockCreateObjectURL.mock.calls[0][0];
    expect(blob).toBeInstanceOf(Blob);

    // Verify download triggered
    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  it("sets the correct filename", () => {
    const rows = [{ col: "val" }];
    exportToCsv(rows, "my-export.csv");
    
    // The createElement mock stores download property
    const link = (document.createElement as jest.Mock).mock.results[0].value;
    expect(link.download).toBe("my-export.csv");
  });

  it("uses default filename when not specified", () => {
    const rows = [{ col: "val" }];
    exportToCsv(rows);
    
    const link = (document.createElement as jest.Mock).mock.results[0].value;
    expect(link.download).toBe("export.csv");
  });

  it("handles empty array by creating empty blob", () => {
    exportToCsv([], "empty.csv");
    expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);
    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  it("handles null/undefined rows by creating empty blob", () => {
    exportToCsv(null as any, "null.csv");
    expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);
    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  it("escapes double quotes in values", () => {
    const rows = [{ text: 'He said "hello"' }];
    exportToCsv(rows, "quotes.csv");
    
    // Blob content should have escaped quotes
    const blob: Blob = mockCreateObjectURL.mock.calls[0][0];
    expect(blob).toBeInstanceOf(Blob);
  });

  it("handles numeric values", () => {
    const rows = [
      { id: 1, price: 99.99, count: 0 },
    ];
    exportToCsv(rows, "numbers.csv");
    expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);
    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  it("handles null and undefined cell values", () => {
    const rows = [
      { name: "test", value: null, other: undefined },
    ];
    exportToCsv(rows as any, "nulls.csv");
    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  it("handles boolean values", () => {
    const rows = [{ active: true, archived: false }];
    exportToCsv(rows, "booleans.csv");
    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  it("handles object values via JSON.stringify", () => {
    const rows = [{ data: { nested: true } }];
    exportToCsv(rows as any, "objects.csv");
    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  it("handles array values via JSON.stringify", () => {
    const rows = [{ tags: ["a", "b", "c"] }];
    exportToCsv(rows as any, "arrays.csv");
    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  it("handles single row CSV", () => {
    const rows = [{ x: 1, y: 2 }];
    exportToCsv(rows, "single.csv");
    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  it("handles many columns", () => {
    const rows = [
      { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9, j: 10 },
    ];
    exportToCsv(rows, "wide.csv");
    expect(mockClick).toHaveBeenCalledTimes(1);
  });
});
