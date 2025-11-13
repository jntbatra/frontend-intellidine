"use client";

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  LogOut,
  User,
  CheckCircle,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface Notification {
  id: string;
  type: "info" | "warning" | "success";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  icon?: string;
}

export function AdminHeader() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "notif-1",
      type: "warning",
      title: "Low Stock Alert",
      message: "Dal Fry stock is critically low (3/20 items)",
      timestamp: new Date(Date.now() - 5 * 60000), // 5 mins ago
      read: false,
      icon: "📦",
    },
    {
      id: "notif-2",
      type: "success",
      title: "Order Completed",
      message: "Order ORD-007 has been completed and ready for pickup",
      timestamp: new Date(Date.now() - 15 * 60000), // 15 mins ago
      read: false,
      icon: "✅",
    },
    {
      id: "notif-3",
      type: "info",
      title: "New Discount Created",
      message: "WELCOME20 discount is now active",
      timestamp: new Date(Date.now() - 1 * 3600000), // 1 hour ago
      read: true,
      icon: "🏷️",
    },
    {
      id: "notif-4",
      type: "info",
      title: "Revenue Report",
      message: "Today's revenue: ₹15,240 (↑ 12%)",
      timestamp: new Date(Date.now() - 2 * 3600000), // 2 hours ago
      read: true,
      icon: "📊",
    },
    {
      id: "notif-5",
      type: "warning",
      title: "Payment Pending",
      message: "Order ORD-003 payment verification pending",
      timestamp: new Date(Date.now() - 3 * 3600000), // 3 hours ago
      read: true,
      icon: "💳",
    },
  ]);

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("staff_role");
    localStorage.removeItem("current_tenant_id");
    router.push("/staff/login");
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "success":
        return "bg-green-50 border-green-200";
      case "info":
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertCircle size={16} className="text-yellow-600" />;
      case "success":
        return <CheckCircle size={16} className="text-green-600" />;
      case "info":
      default:
        return <TrendingUp size={16} className="text-blue-600" />;
    }
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
      {/* Left side - Title */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Admin Panel</h2>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-4">
        {/* Notification Bell Dropdown */}
        <DropdownMenu
          open={isNotificationOpen}
          onOpenChange={setIsNotificationOpen}
        >
          <DropdownMenuTrigger asChild>
            <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <Bell size={20} className="text-slate-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-96">
            {/* Header */}
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-slate-500">
                  <Bell size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 border-b hover:bg-slate-50 cursor-pointer transition-colors ${
                      !notification.read ? "bg-blue-50" : ""
                    }`}
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    <div className="flex gap-3">
                      {/* Icon */}
                      <div className="shrink-0 mt-1">
                        {notification.icon ? (
                          <span className="text-lg">{notification.icon}</span>
                        ) : (
                          getNotificationIcon(notification.type)
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <p
                              className={`text-sm font-semibold ${
                                notification.read
                                  ? "text-slate-600"
                                  : "text-slate-900"
                              }`}
                            >
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <Badge className="bg-red-500 text-white text-xs">
                                New
                              </Badge>
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNotification(notification.id);
                            }}
                            className="text-slate-400 hover:text-slate-600 shrink-0"
                          >
                            ✕
                          </button>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {getTimeAgo(notification.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-center justify-center text-blue-600 hover:text-blue-700">
                  View All Notifications
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=rajesh"
                alt="Manager Avatar"
                className="w-8 h-8 rounded-full border border-orange-200"
              />
              <span className="text-sm font-medium text-slate-900">
                Manager
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <Link href="/admin/profile">
              <DropdownMenuItem>
                <User size={16} className="mr-2" />
                Profile Settings
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut size={16} className="mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
