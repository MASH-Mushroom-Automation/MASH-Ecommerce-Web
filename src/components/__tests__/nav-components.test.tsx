/**
 * Tests for NavMain, NavProjects, NavSecondary, NavUser components
 * Targets: nav-main (3fn, 2br), nav-projects (2fn, 4br), nav-secondary (2fn, 0br), nav-user (1fn, 2br)
 */
import React from "react";
import { render, screen } from "@testing-library/react";

// Mock all sidebar components as simple divs
jest.mock("@/components/ui/sidebar", () => ({
  SidebarGroup: ({ children, ...props }: any) => <div data-testid="sidebar-group" {...props}>{children}</div>,
  SidebarGroupLabel: ({ children }: any) => <div data-testid="sidebar-group-label">{children}</div>,
  SidebarGroupContent: ({ children }: any) => <div>{children}</div>,
  SidebarMenu: ({ children }: any) => <ul data-testid="sidebar-menu">{children}</ul>,
  SidebarMenuItem: ({ children }: any) => <li>{children}</li>,
  SidebarMenuButton: ({ children, asChild, ...props }: any) => <div data-testid="sidebar-menu-button" {...props}>{children}</div>,
  SidebarMenuAction: ({ children, ...props }: any) => <div data-testid="sidebar-menu-action">{children}</div>,
  SidebarMenuSub: ({ children }: any) => <ul data-testid="sidebar-menu-sub">{children}</ul>,
  SidebarMenuSubItem: ({ children }: any) => <li>{children}</li>,
  SidebarMenuSubButton: ({ children, asChild }: any) => <div>{children}</div>,
  useSidebar: () => ({ isMobile: false }),
}));

jest.mock("@/components/ui/collapsible", () => ({
  Collapsible: ({ children }: any) => <div data-testid="collapsible">{children}</div>,
  CollapsibleTrigger: ({ children }: any) => <div>{children}</div>,
  CollapsibleContent: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: any) => <div data-testid="dropdown-menu">{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => <div>{children}</div>,
  DropdownMenuContent: ({ children, ...props }: any) => <div data-testid="dropdown-content" {...props}>{children}</div>,
  DropdownMenuItem: ({ children }: any) => <div data-testid="dropdown-item">{children}</div>,
  DropdownMenuLabel: ({ children }: any) => <div>{children}</div>,
  DropdownMenuSeparator: () => <hr />,
  DropdownMenuGroup: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("@/components/ui/avatar", () => ({
  Avatar: ({ children }: any) => <div data-testid="avatar">{children}</div>,
  AvatarImage: ({ alt }: any) => <img alt={alt} />,
  AvatarFallback: ({ children }: any) => <span>{children}</span>,
}));

jest.mock("lucide-react", () => ({
  ChevronRight: () => <svg data-testid="chevron-right" />,
  Folder: () => <svg />,
  MoreHorizontal: () => <svg data-testid="more-horizontal" />,
  Share: () => <svg />,
  Trash2: () => <svg />,
  BadgeCheck: () => <svg />,
  Bell: () => <svg />,
  ChevronsUpDown: () => <svg />,
  CreditCard: () => <svg />,
  LogOut: () => <svg />,
  Sparkles: () => <svg />,
}));

// Test icons for items
const TestIcon = () => <svg data-testid="test-icon" />;

import { NavMain } from "../nav-main";
import { NavProjects } from "../nav-projects";
import { NavSecondary } from "../nav-secondary";
import { NavUser } from "../nav-user";

describe("NavMain", () => {
  const items = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: TestIcon,
      isActive: true,
      items: [
        { title: "Overview", url: "/dashboard/overview" },
        { title: "Analytics", url: "/dashboard/analytics" },
      ],
    },
    {
      title: "Settings",
      url: "/settings",
      icon: TestIcon,
    },
  ];

  it("renders Platform label", () => {
    render(<NavMain items={items} />);
    expect(screen.getByText("Platform")).toBeInTheDocument();
  });

  it("renders all items", () => {
    render(<NavMain items={items} />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("renders sub-items when present", () => {
    render(<NavMain items={items} />);
    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Analytics")).toBeInTheDocument();
  });

  it("renders toggle for items with sub-items", () => {
    render(<NavMain items={items} />);
    expect(screen.getByText("Toggle")).toBeInTheDocument();
  });

  it("does not render sub-menu for items without sub-items", () => {
    render(<NavMain items={[{ title: "Simple", url: "/simple", icon: TestIcon }]} />);
    expect(screen.queryByText("Toggle")).not.toBeInTheDocument();
  });
});

describe("NavProjects", () => {
  const projects = [
    { name: "Project A", url: "/project-a", icon: TestIcon },
    { name: "Project B", url: "/project-b", icon: TestIcon },
  ];

  it("renders Projects label", () => {
    render(<NavProjects projects={projects} />);
    expect(screen.getByText("Projects")).toBeInTheDocument();
  });

  it("renders all projects", () => {
    render(<NavProjects projects={projects} />);
    expect(screen.getByText("Project A")).toBeInTheDocument();
    expect(screen.getByText("Project B")).toBeInTheDocument();
  });

  it("renders More button", () => {
    render(<NavProjects projects={projects} />);
    expect(screen.getAllByText("More").length).toBeGreaterThanOrEqual(1);
  });

  it("renders dropdown menu for each project", () => {
    render(<NavProjects projects={projects} />);
    const dropdowns = screen.getAllByTestId("dropdown-menu");
    expect(dropdowns.length).toBe(projects.length);
  });

  it("renders View/Share/Delete options in dropdown", () => {
    render(<NavProjects projects={projects} />);
    expect(screen.getAllByText("View Project").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Share Project").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Delete Project").length).toBeGreaterThanOrEqual(1);
  });
});

describe("NavSecondary", () => {
  const items = [
    { title: "Help", url: "/help", icon: TestIcon },
    { title: "Support", url: "/support", icon: TestIcon },
  ];

  it("renders all items", () => {
    render(<NavSecondary items={items} />);
    expect(screen.getByText("Help")).toBeInTheDocument();
    expect(screen.getByText("Support")).toBeInTheDocument();
  });

  it("renders links for each item", () => {
    render(<NavSecondary items={items} />);
    const links = screen.getAllByTestId("sidebar-menu-button");
    expect(links.length).toBeGreaterThanOrEqual(2);
  });
});

describe("NavUser", () => {
  const user = {
    name: "John Doe",
    email: "john@example.com",
    avatar: "/avatar.jpg",
  };

  it("renders user name and email", () => {
    render(<NavUser user={user} />);
    expect(screen.getAllByText("John Doe").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("john@example.com").length).toBeGreaterThanOrEqual(1);
  });

  it("renders avatar", () => {
    render(<NavUser user={user} />);
    const avatars = screen.getAllByTestId("avatar");
    expect(avatars.length).toBeGreaterThanOrEqual(1);
  });

  it("renders dropdown menu items", () => {
    render(<NavUser user={user} />);
    expect(screen.getByText("Upgrade to Pro")).toBeInTheDocument();
    expect(screen.getByText("Account")).toBeInTheDocument();
    expect(screen.getByText("Billing")).toBeInTheDocument();
    expect(screen.getByText("Notifications")).toBeInTheDocument();
    expect(screen.getByText("Log out")).toBeInTheDocument();
  });

  it("renders fallback initials", () => {
    render(<NavUser user={user} />);
    expect(screen.getAllByText("CN").length).toBeGreaterThanOrEqual(1);
  });
});
