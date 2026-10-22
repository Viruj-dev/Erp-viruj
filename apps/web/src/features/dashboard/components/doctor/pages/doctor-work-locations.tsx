"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/erp/checkbox";
import { Input } from "@/components/ui/erp/input";
import { ErpSelect } from "@/components/ui/erp/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DoctorPageShell,
  HospitalPanel,
} from "../_components/doctor-shared-ui";
import {
  useDoctorQuery,
  useDoctorSave,
  type WorkLocation,
} from "@/features/dashboard/lib/doctor-workspace";
const empty: WorkLocation = {
  id: "",
  name: "",
  type: "HOSPITAL",
  post: "",
  position: "",
  department: "",
  currentlyWorking: true,
  addressLine1: "",
  city: "",
  state: "",
  country: "India",
  postalCode: "",
};
export function DoctorWorkLocationsPage() {
  const q = useDoctorQuery<WorkLocation[]>("/doctor/locations");
  const save = useDoctorSave();
  const [draft, setDraft] = useState<WorkLocation>();
  return (
    <DoctorPageShell
      eyebrow="Practice"
      title="Work locations"
      subtitle="Your hospitals, clinics, laboratories and personal practices."
      actions={
        <Button onClick={() => setDraft({ ...empty })}>Add location</Button>
      }
    >
      {q.isPending && <p>Loading locations…</p>}
      {q.isError && (
        <p role="alert">
          Unable to load locations.{" "}
          <Button onClick={() => void q.refetch()}>Retry</Button>
        </p>
      )}
      {q.data?.length === 0 && (
        <HospitalPanel title="Add your first work location">
          <p className="text-sm text-muted-foreground">
            Record where you work, your department and your role. Organisation
            staff still control patient bookings at their facilities.
          </p>
        </HospitalPanel>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {q.data?.map((l) => (
          <HospitalPanel
            title={l.name}
            subtitle={`${l.type.replaceAll("_", " ")} · ${l.currentlyWorking === false ? "Previous workplace" : "Currently working"}`}
            key={l.id}
          >
            <p className="text-sm">
              {[l.post, l.position, l.department].filter(Boolean).join(" · ")}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {l.addressLine1}, {l.city}, {l.state} {l.postalCode}
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setDraft({ ...l })}
            >
              Edit location
            </Button>
          </HospitalPanel>
        ))}
      </div>
      <Dialog
        open={!!draft}
        onOpenChange={(open) => {
          if (!open) setDraft(undefined);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {draft?.id ? "Edit work location" : "Add work location"}
            </DialogTitle>
          </DialogHeader>
          {draft && (
            <form
              className="grid gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                save.mutate(
                  {
                    path: `/doctor/locations${draft.id ? `/${draft.id}` : ""}`,
                    method: draft.id ? "PATCH" : "POST",
                    body: draft,
                  },
                  { onSuccess: () => setDraft(undefined) }
                );
              }}
            >
              <label>
                Organisation type
                <ErpSelect
                  value={draft.type}
                  onChange={(e) => setDraft({ ...draft, type: e.target.value })}
                >
                  <option value="HOSPITAL">Hospital</option>
                  <option value="CLINIC">Clinic</option>
                  <option value="LAB">Laboratory</option>
                  <option value="PERSONAL_PRACTICE">Personal practice</option>
                </ErpSelect>
              </label>
              {(
                [
                  ["name", "Organisation name"],
                  ["post", "Post"],
                  ["position", "Position"],
                  ["department", "Department"],
                  ["addressLine1", "Street address"],
                  ["city", "City"],
                  ["state", "State"],
                  ["postalCode", "Postal code"],
                  ["country", "Country"],
                ] as const
              ).map(([key, label]) => (
                <label key={key}>
                  {label}
                  <Input
                    required
                    value={draft[key] || ""}
                    maxLength={200}
                    onChange={(e) =>
                      setDraft({ ...draft, [key]: e.target.value })
                    }
                  />
                </label>
              ))}
              <label className="flex gap-2">
                <Checkbox
                  checked={draft.currentlyWorking !== false}
                  onCheckedChange={(checked) =>
                    setDraft({ ...draft, currentlyWorking: checked === true })
                  }
                />
                Currently working here
              </label>
              {save.isError && (
                <p role="alert" className="text-destructive">
                  {save.error.message}
                </p>
              )}
              <Button disabled={save.isPending}>Save location</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </DoctorPageShell>
  );
}
