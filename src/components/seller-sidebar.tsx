"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutGrid,
  Package,
  ShoppingBag,
  MapPin,
  Store,
  RotateCcw,
  Settings,
  LogOut,
  ChevronsUpDown,
  User,
  Bell,
  Box,
  PackageSearch,
  MessageSquare,
  BarChart3,
} from "lucide-react"

import { logout } from "@/lib/auth"
import { useInventoryStats } from "@/hooks/useInventoryData"
import { getProfileAvatar, getUserInitials as getAvatarInitials } from "@/lib/avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useWishlist } from "@/contexts/WishlistContext"
import { useCart } from "@/contexts/CartContext"
import { useUserProfile } from "@/hooks/useUser"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"

// Seller navigation items
const sidebarLinks = [
  {
    href: "/seller/dashboard",
    icon: LayoutGrid,
    label: "Dashboard",
  },
  {
    href: "/seller/products",
    icon: Box,
    label: "Products",
  },
  {
    href: "/seller/inventory",
    icon: Package,
    label: "Inventory",
  },
  {
    href: "/seller/stock-management",
    icon: PackageSearch,
    label: "Stock Management",
  },
  {
    href: "/seller/orders",
    icon: ShoppingBag,
    label: "Orders",
  },
  {
    href: "/seller/address",
    icon: MapPin,
    label: "Address Management",
  },
  // {
  //   href: "/seller/handover",
  //   icon: Store,
  //   label: "Handover Center Pickup",
  // },
  {
    href: "/seller/my-reviews",
    icon: MessageSquare,
    label: "My Reviews",
  },
  // {
  //   href: "/seller/reviews",
  //   icon: MessageSquare,
  //   label: "Review Moderation",
  // },
  {
    href: "/seller/analytics/reviews",
    icon: BarChart3,
    label: "Review Analytics",
  },
  // {
  //   href: "/seller/refund",
  //   icon: RotateCcw,
  //   label: "Refund",
  // },
  {
    href: "/seller/settings",
    icon: Settings,
    label: "Settings",
  },
]

function SellerNavUser() {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const { clearWishlist } = useWishlist()
  const { clearCart } = useCart()
  const { profile } = useUserProfile()

  // Get user initials from profile using utility function
  const getUserInitials = () => {
    return getAvatarInitials(profile)
  }

  // Get avatar URL using utility function (supports DiceBear)
  const getAvatarUrl = () => {
    return getProfileAvatar(profile)
  }

  // Get display name
  const getDisplayName = () => {
    if (!profile) return "Loading..."
    if (profile.firstName && profile.lastName) {
      return `${profile.firstName} ${profile.lastName}`
    }
    return profile.email?.split('@')[0] || "User"
  }

  // Get email
  const getUserEmail = () => {
    return profile?.email || "Loading..."
  }

  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true)
  }

  const handleLogoutConfirm = () => {
    logout()
    try {
      clearWishlist()
      clearCart()
    } catch { }
    router.push("/login")
    setLogoutDialogOpen(false)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center w-full gap-3 rounded-md p-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
            <Avatar className="w-8 h-8">
              <AvatarImage src={getAvatarUrl()} alt={getDisplayName()} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-medium truncate">
                {getDisplayName()}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {getUserEmail()}
              </p>
            </div>
            <ChevronsUpDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-48 p-1">
          <DropdownMenuItem asChild>
            <Link
              href="/seller/settings"
              className="flex items-center gap-3 w-full px-3 py-2 rounded-md hover:bg-muted/5"
            >
              <User className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-sm">Account Settings</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href="/seller/notifications"
              className="flex items-center gap-3 w-full px-3 py-2 rounded-md hover:bg-muted/5"
            >
              <Bell className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-sm">Notifications</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <button
              onClick={handleLogoutClick}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-md hover:bg-muted/5 text-destructive"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span className="text-sm">Log out</span>
            </button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out of your account?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogoutConfirm}>Logout</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function SellerNavMain() {
  const pathname = usePathname()

  // Get low stock count for inventory badge
  const { stats } = useInventoryStats({
    enabled: true,
  });
  const lowStockCount = stats?.lowStock || 0;

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {sidebarLinks.map((item) => {
            const isActive = pathname === item.href
            const showBadge = item.href === "/seller/inventory" && lowStockCount > 0

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.label}
                  className={cn(
                    isActive && "bg-primary hover:bg-primary/90 [&>a]:text-primary-foreground"
                  )}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md transition-colors",
                      isActive && "!bg-primary !text-primary-foreground hover:!bg-primary/90"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="font-medium">{item.label}</span>
                    {showBadge && (
                      <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-xs font-medium text-destructive-foreground">
                        {lowStockCount}
                      </span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export function SellerSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible="icon"
      variant="inset"
      {...props}
    >
      {/* User section at the top */}
      <div className="px-2 h-14 flex items-center border-b">
        <SellerNavUser />
      </div>

      <SidebarContent>
        {/* Navigation items */}
        <SellerNavMain />
      </SidebarContent>

      <SidebarRail />

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Back to Store">
              <Link href="/" className="flex items-center gap-3 rounded-md transition-colors">
                <Store className="w-4 h-4" />
                <span>Back to Store</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
