"use client";

import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { DashboardPageShell } from "@/features/dashboard/components/shared/dashboard-page-shell";
import type { VirujFacility } from "@/lib/viruj-backend";
import { BackButton } from "./primitives";
import { FacilitySkeletonGrid } from "./catalog";
export function DeleteDialog({
  facility,
  isDeleting,
  onClose,
  onConfirm,
}: {
  facility: VirujFacility | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!facility || typeof document === "undefined") return null;
  return createPortal(
    <div className="erp-dialog-backdrop fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        aria-modal="true"
        className="w-full max-w-md rounded-[1.5rem] border border-red-100 bg-white p-5 shadow-2xl dark:border-red-400/20 dark:bg-[#111418]"
        role="dialog"
      >
        <div className="flex size-11 items-center justify-center rounded-2xl bg-red-100 text-red-700 dark:bg-red-400/15 dark:text-red-200">
          <Trash2 size={18} />
        </div>
        <h3 className="mt-4 font-headline text-xl font-semi-bold text-slate-950 dark:text-slate-100">
          Delete {facility.name}?
        </h3>
        <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
          This permanently removes the service from the hospital catalog and
          future patient discovery feeds.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semi-bold text-slate-700 transition hover:bg-slate-50 dark:border-white/[0.08] dark:text-slate-200 dark:hover:bg-white/[0.06]"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semi-bold text-white transition hover:bg-red-700 disabled:opacity-60"
            disabled={isDeleting}
            onClick={onConfirm}
            type="button"
          >
            {isDeleting ? (
              <Loader2 className="animate-spin" size={15} />
            ) : (
              <Trash2 size={15} />
            )}
            Delete
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export function FacilitiesLoading({ title }: { title: string }) {
  return (
    <DashboardPageShell
      eyebrow="Facilities & Services"
      framed
      subtitle="Preparing the service catalog."
      title={title}
    >
      <FacilitySkeletonGrid />
    </DashboardPageShell>
  );
}

export function FacilityMissing({ onBack }: { onBack: () => void }) {
  return (
    <DashboardPageShell
      actions={<BackButton onClick={onBack} />}
      eyebrow="Facilities & Services"
      framed
      subtitle="The requested service was not found in this workspace."
      title="Service not found"
    >
      <StatePanel
        icon={<AlertTriangle size={26} />}
        title="Service not found"
        subtitle="It may have been deleted, archived by another user, or you may not have access."
      />
    </DashboardPageShell>
  );
}

export function StatePanel({
  icon,
  subtitle,
  title,
}: {
  icon: ReactNode;
  subtitle: string;
  title: string;
}) {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center p-8 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-white/[0.07]">
        {icon}
      </span>
      <h3 className="mt-4 font-headline text-xl font-semi-bold text-slate-950 dark:text-slate-100">
        {title}
      </h3>
      <p className="mt-2 max-w-md text-sm font-medium text-slate-500">
        {subtitle}
      </p>
    </div>
  );
}
