"use client";
import { Button } from "@/components/ui/button";
import { DoctorPageShell } from "../_components/doctor-shared-ui";
import {
  useDoctorQuery,
  type WorkLocation,
} from "@/features/dashboard/lib/doctor-workspace";
export function DoctorWorkLocationsPage() {
  const q = useDoctorQuery<WorkLocation[]>("/doctor/locations");
  return (
    <DoctorPageShell
      eyebrow="Practice"
      title="Work locations"
      subtitle="Organisations that have added you to their doctor roster. Workplace details are maintained by the organisation."
    >
      {q.isPending && <p role="status">Loading work locations…</p>}
      {q.isError && (
        <p role="alert">
          Unable to load work locations.{" "}
          <Button onClick={() => void q.refetch()}>Retry</Button>
        </p>
      )}
      {q.data?.length === 0 && (
        <p className="rounded-xl border border-dashed p-8 text-sm text-muted-foreground">
          No linked workplaces yet. Your hospital, clinic or laboratory will
          appear here after adding your verified registration number and email.
        </p>
      )}
      <div className="overflow-x-auto rounded-2xl border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted">
            <tr>
              {[
                "Organisation",
                "Post / position",
                "Department",
                "Address",
                "Contact",
                "Working hours",
                "Status",
              ].map((h) => (
                <th key={h} scope="col" className="p-4">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {q.data?.map((l) => (
              <tr key={l.id} className="border-t align-top">
                <td className="p-4">
                  <strong>{l.name}</strong>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {l.type}
                  </span>
                </td>
                <td className="p-4">
                  {[l.post, l.position].filter(Boolean).join(" / ") || "—"}
                </td>
                <td className="p-4">{l.department || "—"}</td>
                <td className="p-4">
                  {[l.addressLine1, l.city, l.state, l.postalCode, l.country]
                    .filter(Boolean)
                    .join(", ")}
                </td>
                <td className="p-4">{l.phone || "—"}</td>
                <td className="p-4">
                  {l.schedules?.length
                    ? l.schedules.map((s, i) => (
                        <p key={i}>
                          {s.dayOfWeek.slice(0, 3)} {s.startTime}–{s.endTime}
                          <span className="block text-xs text-muted-foreground">
                            {s.timezone}
                          </span>
                        </p>
                      ))
                    : "Hours not allocated yet"}
                </td>
                <td className="p-4">
                  {l.currentlyWorking === false
                    ? "Previous workplace"
                    : "Currently working"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DoctorPageShell>
  );
}
