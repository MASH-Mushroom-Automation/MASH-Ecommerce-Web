import React from "react";
import { render, screen } from "@testing-library/react";

// Mock Radix UI menubar primitives
jest.mock("@radix-ui/react-menubar", () => {
  const React = require("react");
  const fw = (tag: string, slot: string) =>
    React.forwardRef((props: Record<string, unknown>, ref: React.Ref<HTMLElement>) => {
      const { children, ...rest } = props;
      return React.createElement(tag, { ...rest, ref, "data-radix-slot": slot }, children);
    });
  return {
    Root: fw("div", "root"),
    Menu: fw("div", "menu"),
    Group: fw("div", "group"),
    Portal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Trigger: fw("button", "trigger"),
    Content: fw("div", "content"),
    Item: fw("div", "item"),
    CheckboxItem: fw("div", "checkbox-item"),
    RadioGroup: fw("div", "radio-group"),
    RadioItem: fw("div", "radio-item"),
    Label: fw("div", "label"),
    Separator: fw("hr", "separator"),
    Sub: fw("div", "sub"),
    SubTrigger: fw("button", "sub-trigger"),
    SubContent: fw("div", "sub-content"),
    ItemIndicator: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

jest.mock("lucide-react", () => ({
  CheckIcon: (p: Record<string, unknown>) => <svg data-testid="check-icon" {...p} />,
  ChevronRightIcon: (p: Record<string, unknown>) => <svg data-testid="chevron-right" {...p} />,
  CircleIcon: (p: Record<string, unknown>) => <svg data-testid="circle-icon" {...p} />,
}));

import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarLabel,
  MenubarSeparator,
  MenubarShortcut,
  MenubarGroup,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
} from "../menubar";

describe("Menubar components", () => {
  it("Menubar renders with data-slot", () => {
    render(<Menubar data-testid="mb" />);
    expect(screen.getByTestId("mb")).toHaveAttribute("data-slot", "menubar");
  });

  it("Menubar applies custom className", () => {
    render(<Menubar data-testid="mb" className="custom" />);
    expect(screen.getByTestId("mb")).toHaveClass("custom");
  });

  it("MenubarMenu renders", () => {
    render(<MenubarMenu data-testid="mm" />);
    expect(screen.getByTestId("mm")).toHaveAttribute("data-slot", "menubar-menu");
  });

  it("MenubarTrigger renders button", () => {
    render(<MenubarTrigger data-testid="mt">File</MenubarTrigger>);
    expect(screen.getByTestId("mt")).toHaveAttribute("data-slot", "menubar-trigger");
    expect(screen.getByText("File")).toBeInTheDocument();
  });

  it("MenubarContent renders with data-slot", () => {
    render(<MenubarContent data-testid="mc">Content</MenubarContent>);
    expect(screen.getByTestId("mc")).toHaveAttribute("data-slot", "menubar-content");
  });

  it("MenubarItem renders with data-slot", () => {
    render(<MenubarItem data-testid="mi">Item</MenubarItem>);
    expect(screen.getByTestId("mi")).toHaveAttribute("data-slot", "menubar-item");
  });

  it("MenubarItem supports inset and variant", () => {
    render(<MenubarItem data-testid="mi" inset variant="destructive">X</MenubarItem>);
    const el = screen.getByTestId("mi");
    expect(el).toHaveAttribute("data-inset", "true");
    expect(el).toHaveAttribute("data-variant", "destructive");
  });

  it("MenubarCheckboxItem renders with children", () => {
    render(<MenubarCheckboxItem data-testid="mci" checked>Check</MenubarCheckboxItem>);
    expect(screen.getByTestId("mci")).toHaveAttribute("data-slot", "menubar-checkbox-item");
    expect(screen.getByText("Check")).toBeInTheDocument();
  });

  it("MenubarRadioGroup renders", () => {
    render(<MenubarRadioGroup data-testid="mrg" />);
    expect(screen.getByTestId("mrg")).toHaveAttribute("data-slot", "menubar-radio-group");
  });

  it("MenubarRadioItem renders with children", () => {
    render(<MenubarRadioItem data-testid="mri" value="a">Option</MenubarRadioItem>);
    expect(screen.getByTestId("mri")).toHaveAttribute("data-slot", "menubar-radio-item");
  });

  it("MenubarLabel renders with inset", () => {
    render(<MenubarLabel data-testid="ml" inset>Label</MenubarLabel>);
    const el = screen.getByTestId("ml");
    expect(el).toHaveAttribute("data-slot", "menubar-label");
    expect(el).toHaveAttribute("data-inset", "true");
  });

  it("MenubarSeparator renders", () => {
    render(<MenubarSeparator data-testid="ms" />);
    expect(screen.getByTestId("ms")).toHaveAttribute("data-slot", "menubar-separator");
  });

  it("MenubarShortcut renders span", () => {
    render(<MenubarShortcut data-testid="msh">Ctrl+N</MenubarShortcut>);
    const el = screen.getByTestId("msh");
    expect(el).toHaveAttribute("data-slot", "menubar-shortcut");
    expect(el.tagName).toBe("SPAN");
  });

  it("MenubarGroup renders", () => {
    render(<MenubarGroup data-testid="mg" />);
    expect(screen.getByTestId("mg")).toHaveAttribute("data-slot", "menubar-group");
  });

  it("MenubarSub renders", () => {
    render(<MenubarSub data-testid="msub" />);
    expect(screen.getByTestId("msub")).toHaveAttribute("data-slot", "menubar-sub");
  });

  it("MenubarSubTrigger renders with chevron and inset", () => {
    render(<MenubarSubTrigger data-testid="mst" inset>Sub</MenubarSubTrigger>);
    const el = screen.getByTestId("mst");
    expect(el).toHaveAttribute("data-slot", "menubar-sub-trigger");
    expect(el).toHaveAttribute("data-inset", "true");
    expect(screen.getByTestId("chevron-right")).toBeInTheDocument();
  });

  it("MenubarSubContent renders", () => {
    render(<MenubarSubContent data-testid="msc">Sub content</MenubarSubContent>);
    expect(screen.getByTestId("msc")).toHaveAttribute("data-slot", "menubar-sub-content");
  });
});
