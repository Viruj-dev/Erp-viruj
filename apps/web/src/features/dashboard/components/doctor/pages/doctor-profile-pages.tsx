"use client";
import { Plus, Save } from "lucide-react";
import { DoctorCredentialsPage } from "./doctor-credentials";
import { ErpUserProfilePage } from "../../shared/profile";
import { ErpDemoSettings } from "../../hospital/pages/settings";
import { DoctorWorkingHoursFields } from "./doctor-working-hours";
import {
  useDoctorTenant,
  useDoctorQuery,
  useDoctorSave,
  type WorkingHours,
  type WorkLocation,
} from "@/features/dashboard/lib/doctor-workspace";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DoctorWorkLocationsPage } from "./doctor-work-locations";
import { DoctorCalendarPage } from "./doctor-calendar";
import {
  DataTable,
  DoctorPageShell,
  FilterBar,
  PrimaryAction,
  RowActions,
  SettingsPanel,
  StatusBadge,
} from "../_components/doctor-shared-ui";

export function DoctorProfileManagementPage() {
  return <ErpUserProfilePage />;
}

export function DoctorVerificationVaultPage() {
  return <DoctorCredentialsPage />;
}
export function DoctorDocumentsPage() {
  return <DoctorCredentialsPage />;
}

export function DoctorPracticeLocationsPage() {
  return <DoctorWorkLocationsPage />;
}
export function DoctorAvailabilityPage() {
  return <DoctorCalendarPage />;
}

export function DoctorLeavesPage() {
  const leaves = [
    ["Nov 14 - Nov 16", "Conference", "Upcoming", "3 days"],
    ["Oct 24 - Oct 28", "Cardiology Summit 2023", "Approved", "5 days"],
    ["Sep 02 - Sep 03", "Personal time", "Past", "2 days"],
  ] as const;

  return (
    <DoctorPageShell
      eyebrow="Schedule"
      title="Leave Management"
      subtitle="Upcoming and past leave periods."
      actions={<PrimaryAction icon={<Plus size={16} />} label="Create Leave" />}
    >
      <FilterBar tabs={["Upcoming", "Past", "All"]} />
      <DataTable
        columns="grid-cols-[1fr_1.4fr_0.8fr_0.8fr_90px]"
        headers={["Duration", "Reason", "Status", "Length", "Actions"]}
        rows={leaves.map((leave) => [
          <strong key="duration">{leave[0]}</strong>,
          leave[1],
          <StatusBadge key="status" status={leave[2]} />,
          leave[3],
          <RowActions key="actions" />,
        ])}
      />
    </DoctorPageShell>
  );
}

export function DoctorSettingsPage() {
  const tenant = useDoctorTenant();
  const hours = useDoctorQuery<WorkingHours[]>("/doctor/working-hours");
  const locations = useDoctorQuery<WorkLocation[]>("/doctor/locations");
  const [draft, setDraft] = useState<WorkingHours[]>();
  const save = useDoctorSave();
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="outline"
          disabled={!hours.data || !locations.data}
          onClick={() => setDraft(hours.data || [])}
        >
          Manage organisation working hours
        </Button>
      </div>
      <ErpDemoSettings
        organizationId={tenant.organizationId}
        section="operational"
      />
      <Dialog
        open={!!draft}
        onOpenChange={(open) => {
          if (!open) setDraft(undefined);
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Organisation working hours</DialogTitle>
          </DialogHeader>
          {draft && (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                save.mutate(
                  {
                    path: "/doctor/working-hours",
                    method: "PATCH",
                    body: draft,
                  },
                  { onSuccess: () => setDraft(undefined) }
                );
              }}
            >
              <DoctorWorkingHoursFields
                locations={locations.data || []}
                value={draft}
                onChange={setDraft}
              />
              {save.isError && <p role="alert">{save.error.message}</p>}
              <Button disabled={save.isPending}>Save working hours</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
