import { apiClient, ApiResponse } from "@/lib/api/client";

export type NotificationType =
  | "LOW_STOCK_ALERT"
  | "ORDER_UPDATE"
  | "PAYMENT_RECEIVED"
  | "NEW_ORDER"
  | "INVENTORY_EXPIRY"
  | "SYSTEM_ALERT"
  | "PROMOTION_UPDATE";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface NotificationData extends Record<string, any> {
  inventory_id?: string;
  order_id?: string;
  item_name?: string;
  current_quantity?: number;
  reorder_level?: number;
}

export interface Notification {
  id: string;
  tenant_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: NotificationData;
  read: boolean;
  created_at: string;
  updated_at?: string;
  read_at?: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  data?: Notification[];
  total: number;
  unread_count: number;
  limit?: number;
  offset?: number;
}

// Get notifications
export async function getNotifications(
  tenantId: string,
  status: "unread" | "read" | "all" = "unread",
  limit: number = 20,
  offset: number = 0
): Promise<ApiResponse<NotificationsResponse>> {
  const url = `/api/notifications?tenant_id=${tenantId}&status=${status}&limit=${limit}&offset=${offset}`;
  return apiClient.get<NotificationsResponse>(url);
}

// Mark notification as read
export async function markNotificationAsRead(
  notificationId: string,
  tenantId: string
): Promise<ApiResponse<{ message: string }>> {
  return apiClient.patch(
    `/api/notifications/${notificationId}/mark-read?tenant_id=${tenantId}`
  );
}

// Mark all as read
export async function markAllNotificationsAsRead(
  tenantId: string
): Promise<ApiResponse<{ message: string }>> {
  return apiClient.patch(
    `/api/notifications/mark-all-read?tenant_id=${tenantId}`
  );
}

// Delete notification
export async function deleteNotification(
  notificationId: string,
  tenantId: string
): Promise<ApiResponse<{ message: string }>> {
  return apiClient.delete(
    `/api/notifications/${notificationId}?tenant_id=${tenantId}`
  );
}
