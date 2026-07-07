"use client";

import { virujBackend } from "@/lib/viruj-backend";
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import {
  errorDescriptionForApi,
  errorTitleForApi,
  successTitleForApi,
} from "../lib/api-feedback";
import { notificationEvents } from "../lib/notification-events";
import type {
  ErpNotification,
  ManagedToast,
  NotificationStoreState,
  ToastInput,
  ToastTone,
} from "../lib/notification-types";
import {
  isToastWorthyNotification,
  normalizeNotificationList,
  notificationToastTone,
} from "../lib/notification-utils";
import { NotificationToastViewport } from "./notification-toast-viewport";

type NotificationManagerContextValue = NotificationStoreState & {
  archiveNotification: (id: string, organizationId?: string) => Promise<void>;
  deleteNotification: (id: string, organizationId?: string) => Promise<void>;
  dismissToast: (id: string) => void;
  fetchNotifications: (organizationId?: string) => Promise<void>;
  markAllAsRead: (organizationId?: string) => Promise<void>;
  markAsRead: (id: string, organizationId?: string) => Promise<void>;
  showToast: (input: ToastInput) => void;
  visibleToasts: ManagedToast[];
};

type State = NotificationStoreState & {
  queuedToasts: ManagedToast[];
  visibleToasts: ManagedToast[];
};

type Action =
  | { type: "archive"; id: string }
  | { type: "delete"; id: string }
  | { type: "dismissToast"; id: string }
  | { type: "enqueueToast"; toast: ManagedToast }
  | { type: "markAllRead" }
  | { type: "markRead"; id: string }
  | { type: "notificationsLoaded"; notifications: ErpNotification[] }
  | { type: "notificationReceived"; notification: ErpNotification }
  | { type: "setError"; error: string | null }
  | { type: "setLoading"; loading: boolean }
  | { type: "setConnectionStatus"; status: State["connectionStatus"] };

const NotificationManagerContext = createContext<NotificationManagerContextValue | null>(null);
const maxVisibleToasts = 4;

const initialState: State = {
  connectionStatus: "idle",
  error: null,
  loading: false,
  notifications: [],
  queuedToasts: [],
  unreadCount: 0,
  visibleToasts: [],
};

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const showToast = useCallback((input: ToastInput) => {
    dispatch({ type: "enqueueToast", toast: toManagedToast(input) });
  }, []);

  const fetchNotifications = useCallback(async (organizationId?: string) => {
    dispatch({ type: "setLoading", loading: true });
    dispatch({ type: "setError", error: null });
    try {
      const response = await virujBackend.notifications.list({
        limit: 40,
        organizationId,
      });
      dispatch({
        type: "notificationsLoaded",
        notifications: normalizeNotificationList(response),
      });
      dispatch({ type: "setConnectionStatus", status: "connected" });
    } catch (error) {
      dispatch({ type: "setError", error: errorMessage(error) });
      dispatch({ type: "setConnectionStatus", status: "error" });
    } finally {
      dispatch({ type: "setLoading", loading: false });
    }
  }, []);

  const markAsRead = useCallback(async (id: string, organizationId?: string) => {
    dispatch({ type: "markRead", id });
    await virujBackend.notifications.markRead({ id, organizationId });
  }, []);

  const markAllAsRead = useCallback(async (organizationId?: string) => {
    dispatch({ type: "markAllRead" });
    await virujBackend.notifications.markAllRead({ organizationId });
  }, []);

  const archiveNotification = useCallback(async (id: string, organizationId?: string) => {
    dispatch({ type: "archive", id });
    await virujBackend.notifications.archive({ id, organizationId });
  }, []);

  const deleteNotification = useCallback(async (id: string, organizationId?: string) => {
    dispatch({ type: "delete", id });
    await virujBackend.notifications.delete({ id, organizationId });
  }, []);

  const dismissToast = useCallback((id: string) => {
    dispatch({ type: "dismissToast", id });
  }, []);

  useEffect(() => {
    const unsubscribers = [
      notificationEvents.on("toast.show", showToast),
      notificationEvents.on("api.success", (payload) => {
        showToast({
          dedupeKey: `api-success:${payload.method}:${payload.path}`,
          description: payload.description,
          title: successTitleForApi(payload),
          tone: "success",
        });
      }),
      notificationEvents.on("api.error", (payload) => {
        showToast({
          dedupeKey: `api-error:${payload.status}:${payload.description ?? payload.path}`,
          description: errorDescriptionForApi(payload),
          durationMs: payload.status && payload.status >= 500 ? 12000 : undefined,
          title: errorTitleForApi(payload),
          tone: "error",
        });
      }),
      notificationEvents.on("notification.created", (notification) => {
        dispatch({ type: "notificationReceived", notification });
        if (isToastWorthyNotification(notification)) {
          showToast({
            dedupeKey: `notification:${notification.id}`,
            description: notification.message,
            title: notification.title,
            tone: notificationToastTone(notification) as ToastTone,
          });
        }
      }),
    ];

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [showToast]);

  const value = useMemo(
    () => ({
      archiveNotification,
      connectionStatus: state.connectionStatus,
      deleteNotification,
      dismissToast,
      error: state.error,
      fetchNotifications,
      loading: state.loading,
      markAllAsRead,
      markAsRead,
      notifications: state.notifications,
      showToast,
      unreadCount: state.unreadCount,
      visibleToasts: state.visibleToasts,
    }),
    [
      archiveNotification,
      deleteNotification,
      dismissToast,
      fetchNotifications,
      markAllAsRead,
      markAsRead,
      showToast,
      state,
    ]
  );

  return (
    <NotificationManagerContext.Provider value={value}>
      {children}
      <NotificationToastViewport />
    </NotificationManagerContext.Provider>
  );
}

export function useNotificationManager() {
  const context = useContext(NotificationManagerContext);
  if (!context) {
    throw new Error("useNotificationManager must be used within NotificationProvider");
  }
  return context;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "archive": {
      const notifications = state.notifications.map((notification) =>
        notification.id === action.id
          ? { ...notification, isArchived: true, status: "ARCHIVED" }
          : notification
      );
      return withUnread({ ...state, notifications });
    }
    case "delete": {
      const notifications = state.notifications.filter((notification) => notification.id !== action.id);
      return withUnread({ ...state, notifications });
    }
    case "dismissToast": {
      const visibleToasts = state.visibleToasts.filter((toast) => toast.id !== action.id);
      const nextQueued = [...state.queuedToasts];
      while (visibleToasts.length < maxVisibleToasts && nextQueued.length) {
        const next = nextQueued.shift();
        if (next) visibleToasts.push(next);
      }
      return { ...state, queuedToasts: nextQueued, visibleToasts };
    }
    case "enqueueToast": {
      const allToasts = [...state.visibleToasts, ...state.queuedToasts];
      const isDuplicate = allToasts.some(
        (toast) =>
          toast.dedupeKey &&
          action.toast.dedupeKey &&
          toast.dedupeKey === action.toast.dedupeKey &&
          Date.now() - toast.createdAt < 2500
      );
      if (isDuplicate) return state;
      if (state.visibleToasts.length < maxVisibleToasts) {
        return { ...state, visibleToasts: [...state.visibleToasts, action.toast] };
      }
      return { ...state, queuedToasts: [...state.queuedToasts, action.toast] };
    }
    case "markAllRead":
      return withUnread({
        ...state,
        notifications: state.notifications.map((notification) => ({
          ...notification,
          isRead: true,
          status: notification.isArchived ? notification.status : "READ",
        })),
      });
    case "markRead":
      return withUnread({
        ...state,
        notifications: state.notifications.map((notification) =>
          notification.id === action.id
            ? { ...notification, isRead: true, status: notification.isArchived ? notification.status : "READ" }
            : notification
        ),
      });
    case "notificationsLoaded":
      return withUnread({ ...state, notifications: dedupeNotifications(action.notifications) });
    case "notificationReceived":
      return withUnread({
        ...state,
        notifications: dedupeNotifications([action.notification, ...state.notifications]),
      });
    case "setConnectionStatus":
      return { ...state, connectionStatus: action.status };
    case "setError":
      return { ...state, error: action.error };
    case "setLoading":
      return { ...state, loading: action.loading };
    default:
      return state;
  }
}

function toManagedToast(input: ToastInput): ManagedToast {
  const tone = input.tone ?? "info";
  return {
    ...input,
    createdAt: Date.now(),
    durationMs: input.durationMs ?? durationForTone(tone),
    id: input.id ?? globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
    title: input.title,
    tone,
  };
}

function durationForTone(tone: ToastTone) {
  if (tone === "success") return 3000;
  if (tone === "info") return 4000;
  if (tone === "warning") return 5000;
  if (tone === "error") return 9000;
  return null;
}

function withUnread(state: State): State {
  return {
    ...state,
    unreadCount: state.notifications.filter(
      (notification) => !notification.isRead && !notification.isArchived && !notification.deletedAt
    ).length,
  };
}

function dedupeNotifications(notifications: ErpNotification[]) {
  const seen = new Set<string>();
  return notifications.filter((notification) => {
    if (seen.has(notification.id)) return false;
    seen.add(notification.id);
    return !notification.deletedAt;
  });
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unable to load notifications.";
}
