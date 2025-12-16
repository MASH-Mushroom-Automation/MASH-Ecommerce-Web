"use client";

import React from "react";
import Link from "next/link";
import { Bell, Check, X, Loader2, Package, Truck, CheckCircle, XCircle, Tag, ShoppingBag, Megaphone, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFirebaseNotifications } from "@/hooks/useFirebaseNotifications";
import { NotificationType } from "@/lib/firebase/notifications";
import { formatDistanceToNow } from "date-fns";

const getNotificationIcon = (type: NotificationType | string) => {
  switch (type) {
    case "order_placed":
      return <ShoppingBag className="h-4 w-4" />;
    case "order_approved":
      return <CheckCircle className="h-4 w-4" />;
    case "order_rejected":
      return <XCircle className="h-4 w-4" />;
    case "order_shipped":
      return <Truck className="h-4 w-4" />;
    case "order_delivered":
      return <Package className="h-4 w-4" />;
    case "price_drop":
      return <Tag className="h-4 w-4" />;
    case "back_in_stock":
      return <ShoppingBag className="h-4 w-4" />;
    case "promotion":
      return <Megaphone className="h-4 w-4" />;
    case "system":
      return <Settings className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

const getNotificationColor = (type: NotificationType | string) => {
  switch (type) {
    case "order_placed":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
    case "order_approved":
      return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
    case "order_rejected":
      return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
    case "order_shipped":
      return "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300";
    case "order_delivered":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300";
    case "price_drop":
      return "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300";
    case "back_in_stock":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
    case "promotion":
      return "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300";
    case "system":
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const formatNotificationTime = (timestamp: unknown): string => {
  if (!timestamp) return "";
  
  // Handle Firestore Timestamp
  if (typeof timestamp === "object" && timestamp !== null && "toDate" in timestamp) {
    return formatDistanceToNow((timestamp as { toDate: () => Date }).toDate(), { addSuffix: true });
  }
  
  // Handle Date object or string
  if (timestamp instanceof Date) {
    return formatDistanceToNow(timestamp, { addSuffix: true });
  }
  
  if (typeof timestamp === "string") {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  }
  
  return "";
};

export function NotificationDropdown() {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useFirebaseNotifications({ realtime: true, maxResults: 10 });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell size={20} className="text-muted-foreground hover:text-foreground transition-colors" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-primary text-primary-foreground text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Notifications</h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  Mark all read
                </Button>
              )}
              <Link href="/seller/notifications">
                <Button variant="ghost" size="sm" className="text-xs">
                  View all
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <ScrollArea className="h-96">
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
              <p className="text-muted-foreground">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell size={32} className="mx-auto mb-2 text-muted-foreground/50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => {
                const notificationLink = notification.data?.link;
                const NotificationWrapper = notificationLink ? Link : "div";
                const wrapperProps = notificationLink 
                  ? { href: notificationLink, onClick: () => markAsRead(notification.id) }
                  : {};
                
                return (
                  <NotificationWrapper
                    key={notification.id}
                    {...wrapperProps}
                    className={`block p-4 hover:bg-muted transition-colors cursor-pointer ${
                      !notification.read ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getNotificationColor(
                          notification.type
                        )}`}
                      >
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">
                              {notification.title}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground/70 mt-1">
                              {formatNotificationTime(notification.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center space-x-1 ml-2" onClick={(e) => e.stopPropagation()}>
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault();
                                  markAsRead(notification.id);
                                }}
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-primary transition-colors"
                              >
                                <Check size={14} />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                deleteNotification(notification.id);
                              }}
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                            >
                              <X size={14} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </NotificationWrapper>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <div className="p-4 border-t border-border">
            <Link href="/seller/notifications">
              <Button
                variant="outline"
                className="w-full"
              >
                View All Notifications
              </Button>
            </Link>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
