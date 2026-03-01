import React from "react";
import { render, screen } from "@testing-library/react";

// Mock cmdk
jest.mock("cmdk", () => {
  const React = require("react");
  const fw = (tag: string, slot: string) =>
    React.forwardRef((props: Record<string, unknown>, ref: React.Ref<HTMLElement>) => {
      const { children, ...rest } = props;
      return React.createElement(tag, { ...rest, ref, "data-cmdk-slot": slot }, children);
    });
  const Command = fw("div", "command");
  Command.Input = fw("input", "input");
  Command.List = fw("div", "list");
  Command.Empty = fw("div", "empty");
  Command.Group = fw("div", "group");
  Command.Separator = fw("hr", "separator");
  Command.Item = fw("div", "item");
  return { Command };
});

jest.mock("lucide-react", () => ({
  SearchIcon: (p: Record<string, unknown>) => <svg data-testid="search-icon" {...p} />,
}));

jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog">{children}</div>,
  DialogContent: ({ children, ...rest }: { children: React.ReactNode }) => <div data-testid="dialog-content" {...rest}>{children}</div>,
  DialogHeader: ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={className}>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
}));

import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from "../command";

describe("Command components", () => {
  it("Command renders with data-slot", () => {
    render(<Command data-testid="cmd" />);
    expect(screen.getByTestId("cmd")).toHaveAttribute("data-slot", "command");
  });

  it("Command applies className", () => {
    render(<Command data-testid="cmd" className="my-cmd" />);
    expect(screen.getByTestId("cmd")).toHaveClass("my-cmd");
  });

  it("CommandDialog renders dialog with title and description", () => {
    render(
      <CommandDialog open title="Test Palette" description="Search...">
        <CommandInput placeholder="Type..." />
      </CommandDialog>
    );
    expect(screen.getByText("Test Palette")).toBeInTheDocument();
    expect(screen.getByText("Search...")).toBeInTheDocument();
  });

  it("CommandInput renders with search icon", () => {
    render(<CommandInput data-testid="ci" placeholder="Search" />);
    expect(screen.getByTestId("search-icon")).toBeInTheDocument();
    expect(screen.getByTestId("ci")).toHaveAttribute("data-slot", "command-input");
  });

  it("CommandList renders with data-slot", () => {
    render(<CommandList data-testid="cl">Items</CommandList>);
    expect(screen.getByTestId("cl")).toHaveAttribute("data-slot", "command-list");
  });

  it("CommandEmpty renders", () => {
    render(<CommandEmpty data-testid="ce">No results</CommandEmpty>);
    expect(screen.getByTestId("ce")).toHaveAttribute("data-slot", "command-empty");
  });

  it("CommandGroup renders", () => {
    render(<CommandGroup data-testid="cg">Group</CommandGroup>);
    expect(screen.getByTestId("cg")).toHaveAttribute("data-slot", "command-group");
  });

  it("CommandItem renders", () => {
    render(<CommandItem data-testid="cit">Item</CommandItem>);
    expect(screen.getByTestId("cit")).toHaveAttribute("data-slot", "command-item");
  });

  it("CommandShortcut renders span with data-slot", () => {
    render(<CommandShortcut data-testid="cs">Ctrl+K</CommandShortcut>);
    const el = screen.getByTestId("cs");
    expect(el.tagName).toBe("SPAN");
    expect(el).toHaveAttribute("data-slot", "command-shortcut");
  });

  it("CommandSeparator renders", () => {
    render(<CommandSeparator data-testid="csep" />);
    expect(screen.getByTestId("csep")).toHaveAttribute("data-slot", "command-separator");
  });
});
