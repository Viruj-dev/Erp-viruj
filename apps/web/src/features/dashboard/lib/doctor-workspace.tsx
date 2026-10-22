"use client";
import { createContext, useContext } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { doctorWorkspaceRequest } from "@/lib/viruj-backend";
import type { ErpTenantContext } from "./erp-tenant";
export const DoctorWorkspaceContext = createContext<
  ErpTenantContext | undefined
>(undefined);
export type DoctorProfile = {
  id: string;
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
  registry?: { checkedAt: string; medicalCouncil: string };
};
export type WorkLocation = {
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
  patient?: { name: string };
  clinic?: { name: string };
  provider?: { name: string };
  patientDetails?: { name?: string };
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
  return useQuery({
    queryKey: ["doctor-workspace", tenant.organizationId, path],
    queryFn: () => doctorWorkspaceRequest<T>(path, tenant.organizationId),
    retry: false,
    refetchInterval: path === "/doctor/calendar" ? 60000 : false,
  });
}
export function useDoctorSave() {
  const tenant = useDoctorTenant();
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      path,
      body,
      method = "POST",
    }: {
      path: string;
      body?: unknown;
      method?: "POST" | "PATCH" | "DELETE";
    }) => doctorWorkspaceRequest(path, tenant.organizationId, body, method),
    onSuccess: () =>
      client.invalidateQueries({
        queryKey: ["doctor-workspace", tenant.organizationId],
      }),
  });
}
