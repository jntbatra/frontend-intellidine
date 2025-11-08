"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Trash2, Archive } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNotifications } from "@/hooks/admin/useNotifications";
import { MOCK_NOTIFICATIONS } from "@/lib/constants/mockNotifications";
import type { NotificationType } from "@/lib/api/admin/notifications";

const NOTIFICATION_FILTERS = [
  { value: "all", label: "All Notifications" },
  { value: "unread", label: "Unread Only" },
  { value: "alert", label: "Alerts" },
  { value: "order", label: "Orders" },
  { value: "inventory", label: "Inventory" },
  { value: "staff", label: "Staff" },
  { value: "system", label: "System" },
];

const TYPE_BADGES: Record<string, { color: string; icon: string }> = {
  alert: { color: "bg-red-100 text-red-800", icon: "🚨" },
  order: { color: "bg-blue-100 text-blue-800", icon: "🛒" },
  inventory: { color: "bg-orange-100 text-orange-800", icon: "📦" },
  staff: { color: "bg-purple-100 text-purple-800", icon: "👥" },
  system: { color: "bg-slate-100 text-slate-800", icon: "⚙️" },
};

export default function NotificationsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications(MOCK_NOTIFICATIONS);

  const getFilteredNotifications = () => {
    let filtered = notifications;

    if (filter === "unread") {
      filtered = filtered.filter((n) => n.status === "unread");
    } else if (filter !== "all") {
      filtered = filtered.filter((n) => n.type === filter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(query) ||
          n.message.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const filteredNotifications = getFilteredNotifications();

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft size={20} className="mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Notifications
        </h1>
        <p className="text-slate-600 mt-2">
          Manage all your notifications in one place
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-slate-600">Total Notifications</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {notifications.length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-slate-600">Unread</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{unreadCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-slate-600">Read</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {notifications.length - unreadCount}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NOTIFICATION_FILTERS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  className="flex-1"
                >
                  Mark All Read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={clearAll}
                  className="flex-1"
                >
                  Clear All
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filteredNotifications.length} Notification
            {filteredNotifications.length !== 1 ? "s" : ""}
          </CardTitle>
          <CardDescription>
            {filter !== "all"
              ? `Showing ${filter === "unread" ? "unread" : filter} notifications`
              : "All notifications"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 text-lg">No notifications found</p>
              <p className="text-slate-400 text-sm mt-1">
                You're all caught up!
              </p>
            </div>
          ) : (
            <div className="space-y-0 border rounded-lg overflow-hidden">
              {filteredNotifications.map((notification, index) => (
                <div
                  key={notification.id}
                  className={`p-4 flex items-start gap-4 hover:bg-slate-50 transition-colors ${
                    index !== filteredNotifications.length - 1
                      ? "border-b"
                      : ""
                  } ${
                    notification.status === "unread" ? "bg-blue-50" : ""
                  }`}
                >
                  {/* Icon */}
                  <div className="text-2xl shrink-0 mt-1">
                    {notification.icon || "📢"}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900">
                        {notification.title}
                      </h3>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge
                          className={TYPE_BADGES[notification.type]?.color}
                        >
                          {notification.type}
                        </Badge>
                        {notification.status === "unread" && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-slate-400">
                      {getTimeAgo(notification.timestamp)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {notification.status === "unread" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => markAsRead(notification.id)}
                        title="Mark as read"
                      >
                        <Archive size={16} />
                      </Button>
                    )}
                    {notification.actionUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 text-xs"
                        onClick={() => router.push(notification.actionUrl!)}
                      >
                        View
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-red-600 hover:text-red-700"
                      onClick={() => deleteNotification(notification.id)}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
