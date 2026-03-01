import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";

jest.mock("@/components/ui/checkbox", () => ({
  Checkbox: ({ checked, onCheckedChange, ...props }: any) => (
    <input
      type="checkbox"
      checked={checked || false}
      onChange={() => onCheckedChange?.(!checked)}
      {...props}
    />
  ),
}));

import { TanStackTable } from "../TanStackTable";

type TestRow = { id: number; name: string; value: number };

const testData: TestRow[] = [
  { id: 1, name: "Alpha", value: 100 },
  { id: 2, name: "Beta", value: 200 },
  { id: 3, name: "Gamma", value: 50 },
];

const testColumns = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "value", header: "Value" },
];

describe("TanStackTable", () => {
  it("should render table with data rows", () => {
    render(
      <TanStackTable data={testData} columns={testColumns} rowKey="id" />
    );
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
    expect(screen.getByText("Gamma")).toBeInTheDocument();
  });

  it("should render column headers", () => {
    render(
      <TanStackTable data={testData} columns={testColumns} rowKey="id" />
    );
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Value")).toBeInTheDocument();
  });

  it("should show empty state when no data", () => {
    render(
      <TanStackTable data={[]} columns={testColumns} rowKey="id" />
    );
    expect(screen.getByText("No data")).toBeInTheDocument();
  });

  it("should render select all checkbox", () => {
    render(
      <TanStackTable data={testData} columns={testColumns} rowKey="id" />
    );
    expect(screen.getByLabelText("Select all rows")).toBeInTheDocument();
  });

  it("should render row checkboxes", () => {
    render(
      <TanStackTable data={testData} columns={testColumns} rowKey="id" />
    );
    expect(screen.getByLabelText("Select row 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Select row 2")).toBeInTheDocument();
    expect(screen.getByLabelText("Select row 3")).toBeInTheDocument();
  });

  it("should call onToggleRow when row checkbox clicked", () => {
    const mockToggle = jest.fn();
    render(
      <TanStackTable
        data={testData}
        columns={testColumns}
        rowKey="id"
        onToggleRow={mockToggle}
      />
    );
    fireEvent.click(screen.getByLabelText("Select row 1"));
    expect(mockToggle).toHaveBeenCalledWith(1);
  });

  it("should call onSelectAll when header checkbox clicked", () => {
    const mockSelectAll = jest.fn();
    render(
      <TanStackTable
        data={testData}
        columns={testColumns}
        rowKey="id"
        onSelectAll={mockSelectAll}
      />
    );
    fireEvent.click(screen.getByLabelText("Select all rows"));
    expect(mockSelectAll).toHaveBeenCalledWith([1, 2, 3]);
  });

  it("should deselect all when all are selected", () => {
    const mockSelectAll = jest.fn();
    render(
      <TanStackTable
        data={testData}
        columns={testColumns}
        rowKey="id"
        selectedIds={[1, 2, 3]}
        onSelectAll={mockSelectAll}
      />
    );
    fireEvent.click(screen.getByLabelText("Select all rows"));
    expect(mockSelectAll).toHaveBeenCalledWith([]);
  });

  it("should support sorting by clicking column header", () => {
    render(
      <TanStackTable data={testData} columns={testColumns} rowKey="id" />
    );
    // Click Value header to sort
    fireEvent.click(screen.getByText("Value"));
    // Table should still render all rows
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
  });

  it("should filter with globalFilter prop", () => {
    render(
      <TanStackTable
        data={testData}
        columns={testColumns}
        rowKey="id"
        globalFilter="Alpha"
      />
    );
    expect(screen.getByText("Alpha")).toBeInTheDocument();
  });

  it("should show checked state for selected rows", () => {
    render(
      <TanStackTable
        data={testData}
        columns={testColumns}
        rowKey="id"
        selectedIds={[2]}
      />
    );
    const checkbox = screen.getByLabelText("Select row 2") as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });
});
