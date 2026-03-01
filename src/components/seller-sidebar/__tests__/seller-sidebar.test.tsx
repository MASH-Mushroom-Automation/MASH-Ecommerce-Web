import React from "react";
import { SellerSidebar } from "@/components/seller-sidebar";
import { render } from "@testing-library/react";

jest.mock("next/link", () => ({ __esModule: true, default: ({ href, children }: any) => <a href={href}>{children}</a> }));
jest.mock("next/navigation", () => ({ usePathname: () => "/seller/dashboard", useRouter: () => ({ push: jest.fn() }) }));
jest.mock("@/components/ui/sidebar", () => ({
  Sidebar: ({ children }: any) => <div>{children}</div>,
  SidebarContent: ({ children }: any) => <div>{children}</div>,
  SidebarFooter: ({ children }: any) => <div>{children}</div>,
  SidebarGroup: ({ children }: any) => <div>{children}</div>,
  SidebarGroupContent: ({ children }: any) => <div>{children}</div>,
  SidebarMenu: ({ children }: any) => <div>{children}</div>,
  SidebarMenuButton: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  SidebarMenuItem: ({ children }: any) => <div>{children}</div>,
  SidebarRail: ({}) => <div />,
  useSidebar: () => ({ isMobile: false }),
}));
jest.mock("@/hooks/useInventoryData", () => ({ useInventoryStats: () => ({ stats: { lowStock: 0 } }) }));
jest.mock("@/contexts/WishlistContext", () => ({ useWishlist: () => ({ clearWishlist: jest.fn() }) }));
jest.mock("@/contexts/CartContext", () => ({ useCart: () => ({ clearCart: jest.fn() }) }));
jest.mock("@/hooks/useUser", () => ({ useUserProfile: () => ({ profile: { firstName: "Test", lastName: "User", email: "test@example.com" } }) }));
jest.mock("@/lib/avatar", () => ({ getProfileAvatar: () => "avatar.png", getUserInitials: () => "TU" }));
jest.mock("lucide-react", () => ({ Store: () => <span>icon</span>, LayoutGrid: () => <span>icon</span>, Box: () => <span>icon</span>, Package: () => <span>icon</span>, PackageSearch: () => <span>icon</span>, ShoppingBag: () => <span>icon</span>, MapPin: () => <span>icon</span>, MessageSquare: () => <span>icon</span>, BarChart3: () => <span>icon</span>, Settings: () => <span>icon</span>, LogOut: () => <span>icon</span>, ChevronsUpDown: () => <span>icon</span>, User: () => <span>icon</span>, Bell: () => <span>icon</span>, RotateCcw: () => <span>icon</span> }));
jest.mock("@/components/ui/alert-dialog", () => ({ AlertDialog: ({ children }: any) => <div>{children}</div>, AlertDialogAction: ({ children, ...props }: any) => <button {...props}>{children}</button>, AlertDialogCancel: ({ children, ...props }: any) => <button {...props}>{children}</button>, AlertDialogContent: ({ children }: any) => <div>{children}</div>, AlertDialogDescription: ({ children }: any) => <div>{children}</div>, AlertDialogFooter: ({ children }: any) => <div>{children}</div>, AlertDialogHeader: ({ children }: any) => <div>{children}</div>, AlertDialogTitle: ({ children }: any) => <div>{children}</div> }));
jest.mock("@/components/ui/avatar", () => ({ Avatar: ({ children }: any) => <div>{children}</div>, AvatarImage: ({ src, alt }: any) => <img src={src} alt={alt} />, AvatarFallback: ({ children }: any) => <div>{children}</div> }));
jest.mock("@/components/ui/dropdown-menu", () => ({ DropdownMenu: ({ children }: any) => <div>{children}</div>, DropdownMenuContent: ({ children }: any) => <div>{children}</div>, DropdownMenuGroup: ({ children }: any) => <div>{children}</div>, DropdownMenuItem: ({ children, ...props }: any) => <div {...props}>{children}</div>, DropdownMenuLabel: ({ children }: any) => <div>{children}</div>, DropdownMenuSeparator: () => <div />, DropdownMenuTrigger: ({ children }: any) => <div>{children}</div> }));

describe("SellerSidebar", () => {
  it("renders without crashing", () => {
    const { container } = render(<SellerSidebar />);
    expect(container.textContent).toBeDefined();
  });
});
