/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
// Stub file - placeholder for notifications functionality
export const useNotifications = (notifications: any[] = []) => ({
  notifications: [] as any[],
  unreadCount: 0,
  markAsRead: (id: any) => {},
  markAllAsRead: () => {},
  deleteNotification: (id: any) => {},
  clearAll: () => {},
});
