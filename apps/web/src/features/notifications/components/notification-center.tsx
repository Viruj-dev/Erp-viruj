"use client";

import { Button } from "@/features/dashboard/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/features/dashboard/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  Archive,
  Bell,
  CheckCheck,
  ChevronRight,
  CircleDot,
  Inbox,
  Loader2,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import type { ErpNotification } from "../lib/notification-types";
import { formatNotificationTime } from "../lib/notification-utils";
import { useNotificationManager } from "./notification-provider";

export function NotificationCenter({
  organizationId,
}: {
  organizationId?: string;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const {
    archiveNotification,
    connectionStatus,
    deleteNotification,
    error,
    fetchNotifications,
    loading,
    markAllAsRead,
    markAsRead,
    notifications,
    unreadCount,
  } = useNotificationManager();

  useEffect(() => {
    if (!open) return;
    void fetchNotifications(organizationId);
  }, [fetchNotifications, open, organizationId]);

  const visibleNotifications = useMemo(
    () => notifications.filter((notification) => !notification.isArchived).slice(0, 40),
    [notifications]
  );

  const handleAction = async (notification: ErpNotification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id, organizationId);
    }
    if (notification.actionUrl) {
      setOpen(false);
      router.push(notification.actionUrl);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          aria-label="Open notifications"
          className="relative rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-200/50 dark:text-slate-400 dark:hover:bg-white/[0.08] dark:hover:text-white"
          type="button"
        >
          <Bell size={20} />
          {unreadCount > 0 ? (
            <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-slate-50 bg-error px-1 text-[10px] font-bold leading-none text-white dark:border-[#101214]">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </button>
      </SheetTrigger>
      <SheetContent className="w-[min(440px,100vw)] gap-0 border-slate-200 bg-slate-50 p-0 dark:border-white/10 dark:bg-[#0d1117] sm:max-w-[440px]">
        <SheetHeader className="border-b border-slate-200 bg-white px-5 py-5 dark:border-white/10 dark:bg-[#11161d]">
          <div className="flex items-start justify-between gap-4 pr-8">
            <div>
              <SheetTitle className="font-headline text-xl text-slate-950 dark:text-white">
                Notifications
              </SheetTitle>
              <SheetDescription className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Business events synced from Viruj ERP.
              </SheetDescription>
            </div>
            <ConnectionPill status={connectionStatus} />
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              {unreadCount} unread
            </p>
            <Button
              className="h-8 gap-1.5 rounded-md px-3 text-xs"
              disabled={unreadCount === 0}
              onClick={() => void markAllAsRead(organizationId)}
              size="sm"
              type="button"
              variant="outline"
            >
              <CheckCheck size={14} />
              Mark all read
            </Button>
          </div>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {loading ? (
            <CenterState icon={<Loader2 className="animate-spin" size={18} />} text="Loading notifications..." />
          ) : null}
          {!loading && error ? (
            <CenterState icon={<Inbox size={18} />} text={error} />
          ) : null}
          {!loading && !error && visibleNotifications.length === 0 ? (
            <CenterState icon={<Inbox size={18} />} text="No active notifications." />
          ) : null}
          {!loading && !error && visibleNotifications.length > 0 ? (
            <div className="space-y-2">
              {visibleNotifications.map((notification) => (
                <NotificationRow
                  key={notification.id}
                  notification={notification}
                  onArchive={() => archiveNotification(notification.id, organizationId)}
                  onDelete={() => deleteNotification(notification.id, organizationId)}
                  onMarkRead={() => markAsRead(notification.id, organizationId)}
                  onOpen={() => handleAction(notification)}
                />
              ))}
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function NotificationRow({
  notification,
  onArchive,
  onDelete,
  onMarkRead,
  onOpen,
}: {
  notification: ErpNotification;
  onArchive: () => Promise<void>;
  onDelete: () => Promise<void>;
  onMarkRead: () => Promise<void>;
  onOpen: () => Promise<void>;
}) {
  const priorityTone = priorityClass(notification.priority);

  return (
    <article
      className={cn(
        "group rounded-lg border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-[#121820]",
        notification.isRead
          ? "border-slate-200 dark:border-white/10"
          : "border-sky-200 ring-1 ring-sky-500/10 dark:border-sky-500/30 dark:ring-sky-500/20"
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
            priorityTone.icon
          )}
        >
          <CircleDot size={15} />
        </span>
        <button
          className="min-w-0 flex-1 text-left"
          onClick={() => void onOpen()}
          type="button"
        >
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">
              {notification.title}
            </p>
            {!notification.isRead ? (
              <span className="h-2 w-2 shrink-0 rounded-full bg-sky-500" />
            ) : null}
          </div>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600 dark:text-slate-400">
            {notification.message}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className={cn("rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em]", priorityTone.badge)}>
              {notification.priority}
            </span>
            <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500 dark:bg-white/8 dark:text-slate-400">
              {notification.category}
            </span>
            <span className="text-[11px] text-slate-400">
              {formatNotificationTime(notification.createdAt)}
            </span>
          </div>
        </button>
        {notification.actionUrl ? (
          <ChevronRight className="mt-2 text-slate-300 transition group-hover:text-slate-500" size={16} />
        ) : null}
      </div>
      <div className="mt-3 flex items-center justify-end gap-1 border-t border-slate-100 pt-3 dark:border-white/8">
        {!notification.isRead ? (
          <IconButton label="Mark read" onClick={() => void onMarkRead()}>
            <CheckCheck size={14} />
          </IconButton>
        ) : null}
        <IconButton label="Archive" onClick={() => void onArchive()}>
          <Archive size={14} />
        </IconButton>
        <IconButton danger label="Delete" onClick={() => void onDelete()}>
          <Trash2 size={14} />
        </IconButton>
      </div>
    </article>
  );
}

function IconButton({
  children,
  danger,
  label,
  onClick,
}: {
  children: ReactNode;
  danger?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      className={cn(
        "rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-white/10 dark:hover:text-white",
        danger && "hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
      )}
      onClick={onClick}
      title={label}
      type="button"
    >
      {children}
    </button>
  );
}

function CenterState({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex min-h-60 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-slate-200 bg-white/70 p-6 text-center text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
      {icon}
      {text}
    </div>
  );
}

function ConnectionPill({ status }: { status: string }) {
  const connected = status === "connected";
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em]",
        connected
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/12 dark:text-emerald-300"
          : "bg-slate-100 text-slate-500 dark:bg-white/8 dark:text-slate-400"
      )}
    >
      {connected ? "Synced" : status}
    </span>
  );
}

function priorityClass(priority: string) {
  const normalized = priority?.toUpperCase();
  if (normalized === "CRITICAL") {
    return {
      badge: "bg-rose-50 text-rose-700 dark:bg-rose-500/12 dark:text-rose-300",
      icon: "bg-rose-50 text-rose-600 dark:bg-rose-500/12 dark:text-rose-300",
    };
  }
  if (normalized === "HIGH") {
    return {
      badge: "bg-amber-50 text-amber-700 dark:bg-amber-500/12 dark:text-amber-300",
      icon: "bg-amber-50 text-amber-600 dark:bg-amber-500/12 dark:text-amber-300",
    };
  }
  return {
    badge: "bg-sky-50 text-sky-700 dark:bg-sky-500/12 dark:text-sky-300",
    icon: "bg-sky-50 text-sky-600 dark:bg-sky-500/12 dark:text-sky-300",
  };
}
