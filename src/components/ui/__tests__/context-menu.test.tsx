import React from "react";
import { render, screen } from "@testing-library/react";

// Mock Radix UI context-menu primitives
jest.mock("@radix-ui/react-context-menu", () => {
  const React = require("react");
  const fw = (tag: string, slot: string) =>
    React.forwardRef((props: Record<string, unknown>, ref: React.Ref<HTMLElement>) => {
      const { children, ...rest } = props;
      return React.createElement(tag, { ...rest, ref, "data-radix-slot": slot }, children);
    });
  return {
    Root: fw("div", "root"),
    Trigger: fw("div", "trigger"),
    Group: fw("div", "group"),
    Portal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Sub: fw("div", "sub"),
    RadioGroup: fw("div", "radio-group"),
    SubTrigger: fw("button", "sub-trigger"),
    SubContent: fw("div", "sub-content"),
    Content: fw("div", "content"),
    Item: fw("div", "item"),
    CheckboxItem: fw("div", "checkbox-item"),
    RadioItem: fw("div", "radio-item"),
    Label: fw("div", "label"),
    Separator: fw("hr", "separator"),
    ItemIndicator: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

jest.mock("lucide-react", () => ({
  CheckIcon: (p: Record<string, unknown>) => <svg data-testid="check-icon" {...p} />,
  ChevronRightIcon: (p: Record<string, unknown>) => <svg data-testid="chevron-right" {...p} />,
  CircleIcon: (p: Record<string, unknown>) => <svg data-testid="circle-icon" {...p} />,
}));

import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
} from "../context-menu";

describe("ContextMenu components", () => {
  it("ContextMenu renders with data-slot", () => {
    render(<ContextMenu data-testid="cm" />);
    expect(screen.getByTestId("cm")).toHaveAttribute("data-slot", "context-menu");
  });

  it("ContextMenuTrigger renders", () => {
    render(<ContextMenuTrigger data-testid="cmt">Trigger</ContextMenuTrigger>);
    expect(screen.getByTestId("cmt")).toHaveAttribute("data-slot", "context-menu-trigger");
  });

  it("ContextMenuContent renders", () => {
    render(<ContextMenuContent data-testid="cmc">Content</ContextMenuContent>);
    expect(screen.getByTestId("cmc")).toHaveAttribute("data-slot", "context-menu-content");
  });

  it("ContextMenuItem renders with variant and inset", () => {
    render(<ContextMenuItem data-testid="cmi" variant="destructive" inset>Delete</ContextMenuItem>);
    const el = screen.getByTestId("cmi");
    expect(el).toHaveAttribute("data-slot", "context-menu-item");
    expect(el).toHaveAttribute("data-variant", "destructive");
    expect(el).toHaveAttribute("data-inset", "true");
  });

  it("ContextMenuCheckboxItem renders", () => {
    render(<ContextMenuCheckboxItem data-testid="cmci" checked>Check</ContextMenuCheckboxItem>);
    expect(screen.getByTestId("cmci")).toHaveAttribute("data-slot", "context-menu-checkbox-item");
  });

  it("ContextMenuRadioGroup renders", () => {
    render(<ContextMenuRadioGroup data-testid="cmrg" />);
    expect(screen.getByTestId("cmrg")).toHaveAttribute("data-slot", "context-menu-radio-group");
  });

  it("ContextMenuRadioItem renders", () => {
    render(<ContextMenuRadioItem data-testid="cmri" value="a">Opt</ContextMenuRadioItem>);
    expect(screen.getByTestId("cmri")).toHaveAttribute("data-slot", "context-menu-radio-item");
  });

  it("ContextMenuLabel renders with inset", () => {
    render(<ContextMenuLabel data-testid="cml" inset>Label</ContextMenuLabel>);
    const el = screen.getByTestId("cml");
    expect(el).toHaveAttribute("data-slot", "context-menu-label");
    expect(el).toHaveAttribute("data-inset", "true");
  });

  it("ContextMenuSeparator renders", () => {
    render(<ContextMenuSeparator data-testid="cms" />);
    expect(screen.getByTestId("cms")).toHaveAttribute("data-slot", "context-menu-separator");
  });

  it("ContextMenuShortcut renders span", () => {
    render(<ContextMenuShortcut data-testid="cmsh">Del</ContextMenuShortcut>);
    const el = screen.getByTestId("cmsh");
    expect(el.tagName).toBe("SPAN");
    expect(el).toHaveAttribute("data-slot", "context-menu-shortcut");
  });

  it("ContextMenuGroup renders", () => {
    render(<ContextMenuGroup data-testid="cmg" />);
    expect(screen.getByTestId("cmg")).toHaveAttribute("data-slot", "context-menu-group");
  });

  it("ContextMenuSub renders", () => {
    render(<ContextMenuSub data-testid="cmsub" />);
    expect(screen.getByTestId("cmsub")).toHaveAttribute("data-slot", "context-menu-sub");
  });

  it("ContextMenuSubTrigger renders with chevron and inset", () => {
    render(<ContextMenuSubTrigger data-testid="cmst" inset>Sub</ContextMenuSubTrigger>);
    const el = screen.getByTestId("cmst");
    expect(el).toHaveAttribute("data-slot", "context-menu-sub-trigger");
    expect(el).toHaveAttribute("data-inset", "true");
    expect(screen.getByTestId("chevron-right")).toBeInTheDocument();
  });

  it("ContextMenuSubContent renders", () => {
    render(<ContextMenuSubContent data-testid="cmsc">Sub</ContextMenuSubContent>);
    expect(screen.getByTestId("cmsc")).toHaveAttribute("data-slot", "context-menu-sub-content");
  });
});
