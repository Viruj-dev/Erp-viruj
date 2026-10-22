"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DoctorProfileForm } from "./doctor-onboarding";
import {
  DoctorPageShell,
  HospitalPanel,
} from "../_components/doctor-shared-ui";
import {
  useDoctorQuery,
  useDoctorTenant,
  type DoctorProfile,
  type CalendarEvent,
  type WorkLocation,
  type DoctorAppointment,
  type Page,
} from "@/features/dashboard/lib/doctor-workspace";
export function DoctorDashboardPage() {
  const tenant = useDoctorTenant();
  const profile = useDoctorQuery<DoctorProfile>("/doctor/profile");
  const stats =
    useDoctorQuery<Record<string, number | string>>("/doctor/dashboard");
  const events = useDoctorQuery<CalendarEvent[]>("/doctor/calendar");
  const locations = useDoctorQuery<WorkLocation[]>("/doctor/locations");
  const appointments = useDoctorQuery<Page<DoctorAppointment>>(
    "/doctor/appointments?pageSize=5"
  );
  const completion = useDoctorQuery<{ percentage: number }>(
    "/doctor/profile/completion"
  );
  const upcoming = (events.data || [])
    .filter((e) => Date.parse(e.endsAt) > Date.now())
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    .slice(0, 5);
  if (completion.isPending)
    return <p className="p-6">Loading your practice…</p>;
  if (completion.data && completion.data.percentage < 100)
    return <DoctorProfileForm onboarding />;
  return (
    <DoctorPageShell
      eyebrow="Overview"
      title={`Welcome, ${profile.data?.fullName || "Doctor"}`}
      subtitle="Your practice, patients and schedule in one place."
      actions={
        <Button asChild>
          <Link href={tenant.buildRoute("onboarding")}>
            Complete onboarding
          </Link>
        </Button>
      }
    >
      {stats.isError && (
        <p role="alert">
          Dashboard data could not load.{" "}
          <Button variant="outline" onClick={() => void stats.refetch()}>
            Retry
          </Button>
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {(
          [
            ["appointmentsToday", "Appointments today"],
            ["patientsSeenToday", "Patients treated today"],
            ["completedAppointments", "Completed appointments"],
            ["upcomingAppointments", "Upcoming appointments"],
            ["pendingConsultations", "Pending consultations"],
            ["newPatientsThisMonth", "New patients this month"],
            ["profileCompletionPercentage", "Profile completion (%)"],
            ["verificationStatus", "Credential review"],
          ] as const
        ).map(([key, label]) => (
          <HospitalPanel title={label} key={key}>
            <p className="text-2xl font-semibold">
              {stats.isPending ? "…" : (stats.data?.[key] ?? "Unavailable")}
            </p>
          </HospitalPanel>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <HospitalPanel title="Your next events">
          <div className="space-y-3">
            {events.isError ? (
              <p>Unable to load calendar.</p>
            ) : upcoming.length ? (
              upcoming.map((e) => (
                <div className="rounded-lg border p-3" key={e.id}>
                  <p className="text-sm font-semibold">
                    {e.pinned ? "📌 " : ""}
                    {e.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(e.startsAt).toLocaleString("en-IN")} ·{" "}
                    {locations.data?.find((l) => l.id === e.locationId)?.name ||
                      "Personal event"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No upcoming calendar events.
              </p>
            )}
            <Button variant="outline" asChild>
              <Link href={tenant.buildRoute("availability")}>
                Open calendar
              </Link>
            </Button>
          </div>
        </HospitalPanel>
        <HospitalPanel title="Recent appointments">
          {appointments.isError ? (
            <p>Unable to load appointments.</p>
          ) : (
            appointments.data?.data.map((a) => (
              <div className="border-b py-3 text-sm" key={a.id}>
                <p>
                  {a.patient?.name || a.patientDetails?.name || "Patient"} ·{" "}
                  {a.clinic?.name || "Practice"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(a.startsAt).toLocaleString("en-IN")} · {a.status}
                </p>
              </div>
            ))
          )}
          <Button variant="outline" className="mt-3" asChild>
            <Link href={tenant.buildRoute("consultations")}>
              All consultations
            </Link>
          </Button>
        </HospitalPanel>
      </div>
    </DoctorPageShell>
  );
}
export function DoctorOnboardingCenterPage() {
  return <DoctorProfileForm onboarding />;
}
