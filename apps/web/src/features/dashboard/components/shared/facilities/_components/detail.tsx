"use client";

import { Archive, Copy, Edit3, FileImage, Star, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { DashboardPageShell } from "@/features/dashboard/components/shared/dashboard-page-shell";
import type { VirujFacility } from "@/lib/viruj-backend";
import type { FacilityAction } from "../types";
import { formatDate, formatPrice } from "../utils";
import { Badge, BackButton, CategoryPill, DetailPanel, IconAction, InfoRow, StatusPill } from "./primitives";
export function FacilityDetail({
  children,
  facility,
  onArchive,
  onBack,
  onDelete,
  onDuplicate,
  onEdit,
  permissions,
}: {
  children: ReactNode;
  facility: VirujFacility;
  onArchive: () => void;
  onBack: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onEdit: () => void;
  permissions: Record<FacilityAction, boolean>;
}) {
  return (
    <DashboardPageShell
      actions={
        <div className="flex flex-wrap gap-2">
          <BackButton onClick={onBack} />
          {permissions.create ? (
            <IconAction
              icon={<Copy size={15} />}
              label="Duplicate"
              onClick={onDuplicate}
            />
          ) : null}
          {permissions.archive ? (
            <IconAction
              icon={<Archive size={15} />}
              label="Archive"
              onClick={onArchive}
            />
          ) : null}
          {permissions.update ? (
            <IconAction
              icon={<Edit3 size={15} />}
              label="Edit"
              onClick={onEdit}
              primary
            />
          ) : null}
          {permissions.delete ? (
            <IconAction
              danger
              icon={<Trash2 size={15} />}
              label="Delete"
              onClick={onDelete}
            />
          ) : null}
        </div>
      }
      eyebrow="Facilities & Services"
      framed
      subtitle="Read-only catalog detail with patient-facing content, availability, pricing, and metadata."
      title={facility.name}
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-5">
          <div className="overflow-hidden rounded-[1.65rem] border border-slate-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-[#15181d]">
            <div className="h-72 bg-slate-100 dark:bg-white/[0.05]">
              {facility.bannerImage ? (
                <img
                  alt=""
                  className="h-full w-full object-cover"
                  src={facility.bannerImage}
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <FileImage className="text-slate-400" size={42} />
                </div>
              )}
            </div>
            <div className="p-5">
              <div className="flex flex-wrap items-center gap-2">
                <CategoryPill category={facility.category} />
                <StatusPill status={facility.status} />
                {facility.isFeatured ? (
                  <Badge icon={<Star size={12} />} label="Featured" />
                ) : null}
              </div>
              <p className="mt-4 text-sm font-medium leading-7 text-slate-600 dark:text-slate-400">
                {facility.description ||
                  facility.shortDescription ||
                  "No description added yet."}
              </p>
            </div>
          </div>
          <DetailPanel title="Gallery">
            {facility.galleryImages.length ? (
              <div className="grid gap-3 sm:grid-cols-3">
                {facility.galleryImages.map((image, index) => (
                  <img
                    alt=""
                    className="aspect-video rounded-xl object-cover"
                    key={`${image}-${index}`}
                    src={image}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm font-medium text-slate-500">
                No gallery images added.
              </p>
            )}
          </DetailPanel>
        </section>
        <aside className="space-y-5">
          <DetailPanel title="Availability">
            <InfoRow
              label="Available"
              value={facility.isAvailable ? "Yes" : "No"}
            />
            <InfoRow
              label="24x7"
              value={facility.available247 ? "Yes" : "No"}
            />
            <InfoRow
              label="Emergency"
              value={facility.emergencyService ? "Yes" : "No"}
            />
            <InfoRow
              label="Online Booking"
              value={facility.onlineBooking ? "Yes" : "No"}
            />
            <InfoRow
              label="Appointment Required"
              value={facility.appointmentRequired ? "Yes" : "No"}
            />
          </DetailPanel>
          <DetailPanel title="Pricing">
            <InfoRow label="Price" value={formatPrice(facility)} />
            <InfoRow label="Currency" value={facility.currency} />
          </DetailPanel>
          <DetailPanel title="Metadata">
            <InfoRow label="Slug" value={facility.slug} />
            <InfoRow label="Visibility" value={facility.visibility} />
            <InfoRow
              label="Display Order"
              value={String(facility.displayOrder)}
            />
            <InfoRow label="Created By" value={facility.createdBy} />
            <InfoRow label="Updated By" value={facility.updatedBy} />
            <InfoRow
              label="Created Date"
              value={formatDate(facility.createdAt)}
            />
            <InfoRow
              label="Last Updated"
              value={formatDate(facility.updatedAt)}
            />
          </DetailPanel>
          <DetailPanel title="SEO">
            <InfoRow label="SEO Title" value={facility.seoTitle || "Not set"} />
            <InfoRow
              label="SEO Description"
              value={facility.seoDescription || "Not set"}
            />
            <InfoRow
              label="Keywords"
              value={facility.keywords.join(", ") || "Not set"}
            />
          </DetailPanel>
        </aside>
      </div>
      {children}
    </DashboardPageShell>
  );
}
