"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Bell, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

// Sample notification data
const SAMPLE_NOTIFICATIONS = [
  {
    id: "1",
    title: "New Order Received",
    message: "You have received a new order for 5kg Oyster Mushrooms",
    time: "2 minutes ago",
    isRead: false,
    type: "order",
  },
  {
    id: "2",
    title: "Payment Confirmed",
    message: "Payment of ₱2,500 has been confirmed for Order #12345",
    time: "1 hour ago",
    isRead: false,
    type: "payment",
  },
  {
    id: "3",
    title: "Product Review",
    message: "Customer left a 5-star review for your Shiitake Mushrooms",
    time: "3 hours ago",
    isRead: true,
    type: "review",
  },
  {
    id: "4",
    title: "Low Stock Alert",
    message: "Your Enoki Mushrooms are running low (only 2kg left)",
    time: "1 day ago",
    isRead: true,
    type: "alert",
  },
  {
    id: "5",
    title: "Weekly Sales Report",
    message: "Your sales increased by 15% this week compared to last week",
    time: "2 days ago",
    isRead: true,
    type: "report",
  },
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "order":
      return "🛒";
    case "payment":
      return "💰";
    case "review":
      return "⭐";
    case "alert":
      return "⚠️";
    case "report":
      return "📊";
    default:
      return "🔔";
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case "order":
      return "bg-[#6A994E] text-white";
    case "payment":
      return "bg-green-500 text-white";
    case "review":
      return "bg-yellow-500 text-white";
    case "alert":
      return "bg-orange-500 text-white";
    case "report":
      return "bg-blue-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
};

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell size={20} className="text-gray-600 hover:text-gray-900" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-[#6A994E] text-white text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs text-[#6A994E] hover:text-[#1E392A]"
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
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell size={32} className="mx-auto mb-2 text-gray-300" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? "bg-blue-50/50" : ""
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${getNotificationColor(
                        notification.type
                      )}`}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {notification.time}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="h-6 w-6 p-0 text-gray-400 hover:text-[#6A994E]"
                            >
                              <Check size={14} />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeNotification(notification.id)}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                          >
                            <X size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <div className="p-4 border-t border-gray-200">
            <Link href="/seller/notifications">
              <Button
                variant="outline"
                className="w-full text-[#6A994E] border-[#6A994E] hover:bg-[#6A994E] hover:text-white"
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
