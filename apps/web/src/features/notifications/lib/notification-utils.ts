import type { ErpNotification, NotificationListResponse } from "./notification-types";

export function normalizeNotificationList(response: NotificationListResponse): ErpNotification[] {
  if (Array.isArray(response)) return response;
  return response.data ?? [];
}

export function notificationToastTone(notification: ErpNotification) {
  const type = notification.type?.toUpperCase();
  const priority = notification.priority?.toUpperCase();

  if (type === "ERROR" || priority === "CRITICAL") return "error";
  if (type === "WARNING") return "warning";
  if (type === "SUCCESS") return "success";
  return "info";
}

export function isToastWorthyNotification(notification: ErpNotification) {
  if (notification.isArchived || notification.isRead) return false;
  const category = notification.category?.toLowerCase();
  return !["profile", "ui", "settings"].includes(category);
}

export function formatNotificationTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}
