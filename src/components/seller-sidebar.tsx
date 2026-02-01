"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
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
  Box
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
    href: "/seller/orders",
    icon: ShoppingBag,
    label: "Orders",
  },
  {
    href: "/seller/address",
    icon: MapPin,
    label: "Address Management",
  },
  {
    href: "/seller/handover",
    icon: Store,
    label: "Handover Center Pickup",
  },
  {
    href: "/seller/refund",
    icon: RotateCcw,
    label: "Refund",
  },
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
    } catch {}
    router.push("/login")
    setLogoutDialogOpen(false)
  }

  return (
    <>
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={getAvatarUrl()} alt={getDisplayName()} />
                <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{getDisplayName()}</span>
                <span className="truncate text-xs text-gray-500">{getUserEmail()}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={getAvatarUrl()} alt={getDisplayName()} />
                  <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{getDisplayName()}</span>
                  <span className="truncate text-xs text-gray-500">{getUserEmail()}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/seller/settings">
                  <User />
                  Account Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/seller/notifications">
                  <Bell />
                  Notifications
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogoutClick}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>

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
                <SidebarMenuButton asChild isActive={isActive}>
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
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
      className="p-0"
      {...props}
    >
      <SidebarContent className="py-0"> 
        {/* User section at the top */}
        <SidebarGroup className="border-b border-sidebar-border p-0">
          <SidebarGroupContent className="px-2 py-1.5">
            <SellerNavUser />
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* Navigation items */}
        <SellerNavMain />
      </SidebarContent>
      
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/">
                <Store />
                <span>Back to Store</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
