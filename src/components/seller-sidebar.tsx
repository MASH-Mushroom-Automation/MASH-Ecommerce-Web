"use client"

import * as React from "react"
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
} from "lucide-react"

import { logout } from "@/lib/auth"
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
    icon: Package,
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

  // Get user initials from first and last name
  const getUserInitials = () => {
    if (!profile?.firstName && !profile?.lastName) return "U"
    const firstInitial = profile?.firstName?.[0] || ""
    const lastInitial = profile?.lastName?.[0] || ""
    return (firstInitial + lastInitial).toUpperCase() || "U"
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

  const handleLogout = () => {
    logout()
    try {
      clearWishlist()
      clearCart()
    } catch {}
    router.push("/login")
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                {profile?.avatar ? (
                  <AvatarImage src={profile.avatar} alt={getDisplayName()} />
                ) : null}
                <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{getDisplayName()}</span>
                <span className="truncate text-xs">{getUserEmail()}</span>
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
                  {profile?.avatar ? (
                    <AvatarImage src={profile.avatar} alt={getDisplayName()} />
                  ) : null}
                  <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{getDisplayName()}</span>
                  <span className="truncate text-xs">{getUserEmail()}</span>
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
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

function SellerNavMain() {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {sidebarLinks.map((item) => {
            const isActive = pathname === item.href
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={isActive}>
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
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
