"use client";
import { createContext, useContext } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { doctorWorkspaceRequest } from "@/lib/viruj-backend";
import { resourceKey } from "@/lib/query-cache";
import { authClient } from "@/lib/auth-client";
import { useAppointmentPollingInterval } from "@/lib/use-realtime-invalidation";
import type { ErpTenantContext } from "./erp-tenant";
export const DoctorWorkspaceContext = createContext<
  ErpTenantContext | undefined
>(undefined);
export type DoctorProfile = {
  id: string;
  profilePhoto?: string;
  fullName: string;
  gender?: string;
  dateOfBirth?: string;
  department?: string;
  phone?: string;
  email?: string;
  specialization?: string;
  qualification?: string;
  medicalRegistrationNumber?: string;
  medicalCouncil?: string;
  yearsOfExperience?: number;
  consultationFee?: number;
  consultationDurationMinutes?: number;
  languages: string[];
  bio?: string;
  isPublic: boolean;
  registry?: {
    checkedAt?: string;
    medicalCouncil: string;
    source?: string;
    status?: string;
  };
};
export type WorkingHours = {
  locationId: string;
  days: string[];
  startTime: string;
  endTime: string;
};
export type WorkLocation = {
  schedules?: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    timezone: string;
  }[];
  phone?: string;
  id: string;
  name: string;
  type: string;
  post?: string;
  position?: string;
  department?: string;
  currentlyWorking?: boolean;
  addressLine1: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  consultationFee?: number;
};
export type CalendarEvent = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  locationId: string;
  notes: string;
  pinned: boolean;
  highlight: string;
  reminderMinutes: number;
  patientsAttended: number;
};
export type DoctorAppointment = {
  id: string;
  startsAt: string;
  endsAt?: string;
  status: string;
  patient?: { name: string; phone?: string };
  clinic?: { name: string };
  provider?: { name: string };
  patientDetails?: {
    name?: string;
    fullName?: string;
    age?: number | string;
    gender?: string;
    phoneNumber?: string;
  };
  reason?: string;
};
export type Page<T> = {
  data: T[];
  summary?: { patientsAttended: number };
  pagination: { total: number; page: number; totalPages: number };
};
export function useDoctorTenant() {
  const tenant = useContext(DoctorWorkspaceContext);
  if (!tenant) throw new Error("Doctor workspace is required");
  return tenant;
}
export function useDoctorQuery<T>(path: string) {
  const tenant = useDoctorTenant();
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id ?? "";
  const appointmentPath = path.startsWith("/doctor/appointments");
  const interval = useAppointmentPollingInterval(tenant.organizationId, 30_000);
  return useQuery({
    queryKey: appointmentPath
      ? resourceKey(userId, tenant.organizationId, "appointments", "doctor", path)
      : ["doctor-workspace", tenant.organizationId, path],
    enabled: !appointmentPath || Boolean(userId),
    queryFn: () => doctorWorkspaceRequest<T>(path, tenant.organizationId),
    retry: false,
    refetchInterval:
      path === "/doctor/calendar"
        ? 60000
        : appointmentPath ? interval : path === "/doctor/dashboard"
          ? 30000
          : false,
  });
}
export function useDoctorSave() {
  const tenant = useDoctorTenant();
  const { data: session } = authClient.useSession();
  const client = useQueryClient();
  return useMutation({
    onMutate: () => ({ userId: session?.user?.id ?? "", orgId: tenant.organizationId }),
    mutationFn: ({
      path,
      body,
      method = "POST",
    }: {
      path: string;
      body?: unknown;
      method?: "POST" | "PATCH" | "DELETE";
    }) => doctorWorkspaceRequest(path, tenant.organizationId, body, method),
    onSuccess: async (_result, input, scope) => {
      await client.invalidateQueries({
        queryKey: ["doctor-workspace", tenant.organizationId],
      });
      if (input.path.startsWith("/doctor/appointments") && scope) {
        await client.invalidateQueries({ queryKey: resourceKey(scope.userId, scope.orgId, "appointments") });
      }
    },
  });
}
