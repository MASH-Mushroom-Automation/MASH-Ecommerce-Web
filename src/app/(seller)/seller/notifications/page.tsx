"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  Check,
  X,
  Filter,
  Search,
  MoreHorizontal,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNotifications } from "@/hooks/useNotifications";

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
    case "customer":
      return "👤";
    case "shipping":
      return "🚚";
    case "performance":
      return "📈";
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
    case "customer":
      return "bg-purple-500 text-white";
    case "shipping":
      return "bg-indigo-500 text-white";
    case "performance":
      return "bg-emerald-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-800 border-red-200";
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "low":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export default function NotificationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    removeNotification,
  } = useNotifications();

  const totalCount = notifications.length;

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      const matchesSearch =
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        filterType === "all" ||
        (filterType === "unread" && !notification.isRead) ||
        (filterType === "read" && notification.isRead) ||
        notification.type === filterType;

      return matchesSearch && matchesFilter;
    });
  }, [notifications, searchTerm, filterType]);

  const notificationTypes = [
    { value: "all", label: "All" },
    { value: "unread", label: "Unread" },
    { value: "read", label: "Read" },
    { value: "order", label: "Orders" },
    { value: "payment", label: "Payments" },
    { value: "review", label: "Reviews" },
    { value: "alert", label: "Alerts" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#6A994E] mx-auto mb-4" />
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Bell className="h-12 w-12 text-red-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Failed to load notifications
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-[#6A994E] hover:bg-[#1E392A] text-white"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/seller/dashboard">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600">
              {unreadCount} unread • {totalCount} total
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              className="bg-[#6A994E] hover:bg-[#1E392A] text-white"
            >
              <Check className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#6A994E] focus:border-transparent"
              >
                {notificationTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell size={48} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No notifications found
              </h3>
              <p className="text-gray-500">
                {searchTerm || filterType !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "You're all caught up! No notifications at the moment."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`transition-all hover:shadow-md ${
                !notification.isRead ? "border-l-4 border-l-[#6A994E]" : ""
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-lg ${getNotificationColor(
                      notification.type
                    )}`}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <Badge className="bg-[#6A994E] text-white">
                              New
                            </Badge>
                          )}
                          <Badge
                            variant="outline"
                            className={getPriorityColor(notification.priority)}
                          >
                            {notification.priority}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-2">
                          {notification.message}
                        </p>
                        <p className="text-sm text-gray-400">
                          {notification.time}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="text-gray-400 hover:text-[#6A994E]"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeNotification(notification.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
