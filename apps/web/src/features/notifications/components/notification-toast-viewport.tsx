"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Check, Info, Loader2, X, XCircle } from "lucide-react";
import { useEffect } from "react";
import type { ManagedToast, ToastTone } from "../lib/notification-types";
import { useNotificationManager } from "./notification-provider";

const toneStyles: Record<ToastTone, { bar: string; icon: string; ring: string }> = {
  error: {
    bar: "bg-rose-500",
    icon: "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300",
    ring: "ring-rose-500/18",
  },
  info: {
    bar: "bg-sky-500",
    icon: "bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300",
    ring: "ring-sky-500/18",
  },
  loading: {
    bar: "bg-slate-500",
    icon: "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200",
    ring: "ring-slate-400/18",
  },
  success: {
    bar: "bg-emerald-500",
    icon: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
    ring: "ring-emerald-500/18",
  },
  warning: {
    bar: "bg-amber-500",
    icon: "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
    ring: "ring-amber-500/18",
  },
};

export function NotificationToastViewport() {
  const { dismissToast, visibleToasts } = useNotificationManager();

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[80] flex w-[calc(100vw-2rem)] max-w-[380px] flex-col gap-3 sm:right-5 sm:top-5">
      <AnimatePresence initial={false}>
        {visibleToasts.map((toast) => (
          <NotificationToast
            key={toast.id}
            onDismiss={() => dismissToast(toast.id)}
            toast={toast}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function NotificationToast({
  onDismiss,
  toast,
}: {
  onDismiss: () => void;
  toast: ManagedToast;
}) {
  const styles = toneStyles[toast.tone];

  useEffect(() => {
    if (toast.durationMs === null) return;
    const timeout = window.setTimeout(onDismiss, toast.durationMs);
    return () => window.clearTimeout(timeout);
  }, [onDismiss, toast.durationMs]);

  return (
    <motion.div
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      className={cn(
        "pointer-events-auto relative overflow-hidden rounded-xl border border-slate-200/80 bg-white/95 p-3 pr-10 shadow-[0_20px_50px_rgba(15,23,42,0.16)] ring-1 backdrop-blur dark:border-white/10 dark:bg-[#11161d]/95 dark:shadow-[0_22px_60px_rgba(0,0,0,0.45)]",
        styles.ring
      )}
      exit={{ opacity: 0, x: 24, scale: 0.98 }}
      initial={{ opacity: 0, x: 32, y: -6, scale: 0.98 }}
      layout
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <div className="flex gap-3">
        <div
          className={cn(
            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
            styles.icon
          )}
        >
          {toast.tone === "success" ? <Check size={17} /> : null}
          {toast.tone === "info" ? <Info size={17} /> : null}
          {toast.tone === "warning" ? <AlertTriangle size={17} /> : null}
          {toast.tone === "error" ? <XCircle size={17} /> : null}
          {toast.tone === "loading" ? <Loader2 className="animate-spin" size={17} /> : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-5 text-slate-950 dark:text-slate-50">
            {toast.title}
          </p>
          {toast.description ? (
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600 dark:text-slate-400">
              {toast.description}
            </p>
          ) : null}
          {toast.action ? (
            <button
              className="mt-2 rounded-md px-0 text-xs font-semibold text-primary hover:underline dark:text-sky-300"
              onClick={toast.action.onClick}
              type="button"
            >
              {toast.action.label}
            </button>
          ) : null}
        </div>
      </div>
      <button
        aria-label="Dismiss notification"
        className="absolute right-2 top-2 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
        onClick={onDismiss}
        type="button"
      >
        <X size={14} />
      </button>
      {toast.durationMs !== null ? (
        <motion.div
          animate={{ scaleX: 0 }}
          className={cn("absolute bottom-0 left-0 h-0.5 w-full origin-left", styles.bar)}
          initial={{ scaleX: 1 }}
          transition={{ duration: toast.durationMs / 1000, ease: "linear" }}
        />
      ) : null}
    </motion.div>
  );
}
