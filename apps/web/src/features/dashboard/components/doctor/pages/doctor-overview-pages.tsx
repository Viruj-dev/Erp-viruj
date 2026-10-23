"use client";
import {
  RoleDashboardPage,
  type RoleDashboardAnalytics,
} from "../../shared/role-dashboard-page";
import { DoctorOnboarding } from "./doctor-onboarding-flow";
import {
  useDoctorQuery,
  useDoctorTenant,
  type DoctorProfile,
  type DoctorAppointment,
  type Page,
} from "@/features/dashboard/lib/doctor-workspace";
import type { VirujAppointment } from "@/lib/viruj-backend";
export function DoctorDashboardPage() {
  const tenant = useDoctorTenant();
  const profile = useDoctorQuery<DoctorProfile>("/doctor/profile");
  const stats =
    useDoctorQuery<Record<string, number | string>>("/doctor/dashboard");
  const appointments = useDoctorQuery<Page<DoctorAppointment>>(
    "/doctor/appointments?pageSize=100"
  );
  const statusMap: Record<string, VirujAppointment["status"]> = {
    PENDING: "pending_approval",
    REQUESTED: "pending_approval",
    CONFIRMED: "approved",
    IN_PROGRESS: "approved",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
    NO_SHOW: "no_show",
    RESCHEDULED: "rescheduled",
  };
  const rows: VirujAppointment[] = (appointments.data?.data || []).map((a) => ({
    id: a.id,
    startsAt: a.startsAt,
    appointmentDate: a.startsAt,
    appointmentTime: new Date(a.startsAt).toLocaleTimeString("en-IN"),
    appointmentMode: a.clinic?.name || "Practice",
    doctorName: profile.data?.fullName || "Doctor",
    patientName: a.patient?.name || a.patientDetails?.name || "Patient",
    patientEmail: "",
    reason: a.reason,
    status: statusMap[a.status] || "pending_approval",
  }));
  const analytics: RoleDashboardAnalytics = {
    appointments: rows,
    heroStats: { upcoming: String(stats.data?.upcomingAppointments || 0) },
    charts: [
      {
        title: "Recent appointment activity (latest 100)",
        values: Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return rows.filter(
            (a) =>
              new Date(a.appointmentDate).toDateString() === date.toDateString()
          ).length;
        }),
        labels: Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return date.toLocaleDateString("en-IN", { weekday: "short" });
        }),
      },
    ],
    stats: [
      {
        label: "Appointment Requests",
        value: String(stats.data?.appointmentsToday ?? 0),
        note: "Appointments today across your organisations",
      },
      {
        label: "Patients",
        value: String(stats.data?.patientsSeenToday ?? 0),
        note: "Patients treated today",
      },
      {
        label: "Completed appointments",
        value: String(stats.data?.completedAppointments || 0),
        note: "Completed visits across your organisations",
      },
      {
        label: "Upcoming appointments",
        value: String(stats.data?.upcomingAppointments || 0),
        note: "Scheduled patient visits",
      },
    ],
    appointmentStatuses: [
      {
        label: "Completed",
        value: Number(stats.data?.completedAppointments || 0),
        color: "#278565",
      },
      {
        label: "Upcoming",
        value: Number(stats.data?.upcomingAppointments || 0),
        color: "#60a5fa",
      },
    ],
    activity: rows.slice(0, 5).map((a) => ({
      id: a.id,
      title: a.patientName,
      subtitle: `${a.appointmentMode} · ${a.status}`,
      meta: new Date(a.appointmentDate).toLocaleDateString("en-IN"),
    })),
  };
  return (
    <RoleDashboardPage
      tone="doctor"
      userName={profile.data?.fullName || "Doctor"}
      organizationId={tenant.organizationId}
      analytics={analytics}
      loading={stats.isPending || appointments.isPending}
      unavailable={[
        ...(stats.isError ? ["analytics"] : []),
        ...(appointments.isError ? ["appointments"] : []),
      ]}
      onRefresh={() => {
        void stats.refetch();
        void appointments.refetch();
      }}
      refreshing={stats.isFetching || appointments.isFetching}
      onAppointmentSelect={() => {
        window.location.href = tenant.buildRoute("consultations");
      }}
    />
  );
}
export function DoctorOnboardingCenterPage() {
  return <DoctorOnboarding />;
}
