"use client";

const backendUrl =
  process.env.NEXT_PUBLIC_VIRUJ_BACKEND_URL || "http://localhost:4000";
const erpApiUrl = `${backendUrl.replace(/\/$/, "")}/api/erp`;
const erpToken = process.env.NEXT_PUBLIC_VIRUJ_BACKEND_ERP_TOKEN;

type RequestOptions = {
  body?: unknown;
  method?: "DELETE" | "GET" | "PATCH" | "POST";
};

async function request<T>(path: string, options: RequestOptions = {}) {
  const headers = new Headers({
    "Content-Type": "application/json",
  });

  if (erpToken) {
    headers.set("Authorization", `Bearer ${erpToken}`);
  }

  const response = await fetch(`${erpApiUrl}${path}`, {
    body: options.body ? JSON.stringify(options.body) : undefined,
    headers,
    method: options.method ?? "GET",
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(
      payload?.message ||
        payload?.error ||
        `Viruj backend request failed (${response.status})`
    );
  }

  return response.json() as Promise<T>;
}

export type VirujAppointmentStatus =
  | "pending_approval"
  | "approved"
  | "rejected"
  | "completed"
  | "cancelled"
  | "no_show";

export type VirujAppointment = {
  approvalNotes?: string | null;
  appointmentDate: string;
  appointmentMode: string;
  appointmentTime: string;
  departmentName?: string | null;
  doctorName: string;
  id: string;
  patientEmail: string;
  patientAge?: number | null;
  patientGender?: string | null;
  patientName: string;
  patientPhone?: string | null;
  patientUserId?: string | null;
  reason?: string | null;
  status: VirujAppointmentStatus;
};

export type VirujModuleSummary = {
  module: string;
  organizationId?: string;
  organizationType?: string;
  ready: boolean;
  source: "viruj-backend";
};

export type VirujStaffRole =
  | "APPOINTMENT_HANDLER"
  | "COMMUNITY_MANAGER"
  | "ORG_ADMIN";

export type VirujStaffMember = {
  createdAt: string | Date;
  email: string;
  emailVerified: boolean;
  id: string;
  image: string | null;
  name: string;
  role: string;
  status: boolean;
  userId: string;
};

export type VirujStaffInvitation = {
  createdAt: string | Date;
  email: string;
  expiresAt?: string | Date | null;
  id: string;
  role: string;
  status: string;
};

export type VirujAuditLog = {
  action: string;
  actorEmail?: string | null;
  actorName?: string | null;
  actorUserId?: string | null;
  createdAt: string | Date;
  entityId?: string | null;
  entityType?: string | null;
  id: string;
  metadata?: Record<string, unknown> | null;
};

export type VirujStaffInviteResult = VirujStaffInvitation & {
  onboarding?: {
    confirmationUrl?: string;
    emailSent?: boolean;
    loginUrl?: string;
    temporaryCredentials?: {
      email: string;
      password: string;
    } | null;
  };
};

export type VirujDoctorInput = {
  availability: string;
  department: string;
  experience: string;
  fee: string;
  name: string;
  phone: string;
  qualification: string;
  specialty: string;
};

export type VirujDoctor = VirujDoctorInput & {
  appVisibility: "hidden" | "visible";
  createdAt: string;
  id: string;
  organizationId: string;
  published: boolean;
  publishedAt: string | null;
  updatedAt: string;
};

export const virujBackend = {
  audit: {
    key: ["viruj-backend", "erp", "audit", "recent"] as const,
    recent: () => request<VirujAuditLog[]>("/audit/recent"),
  },
  appointments: {
    key: ["viruj-backend", "erp", "appointments"] as const,
    list: () => request<VirujAppointment[]>("/appointments"),
    updateStatus: (input: {
      approvalNotes?: string | null;
      id: string;
      status: VirujAppointmentStatus;
    }) =>
      request<VirujAppointment>(`/appointments/${input.id}/status`, {
        body: {
          approvalNotes: input.approvalNotes,
          status: input.status,
        },
        method: "PATCH",
      }),
  },
  doctors: {
    create: (input: VirujDoctorInput) =>
      request<VirujDoctor>("/doctors", {
        body: input,
        method: "POST",
      }),
    delete: (input: { id: string }) =>
      request<{ success: true }>(`/doctors/${input.id}`, {
        method: "DELETE",
      }),
    key: ["viruj-backend", "erp", "doctors"] as const,
    list: () => request<VirujDoctor[]>("/doctors"),
    publish: (input: { id: string }) =>
      request<VirujDoctor>(`/doctors/${input.id}/publish`, {
        method: "POST",
      }),
    publishAll: () =>
      request<{
        count: number;
        doctors: VirujDoctor[];
        message: string;
      }>("/doctors/publish", {
        method: "POST",
      }),
    update: (input: { doctor: VirujDoctorInput; id: string }) =>
      request<VirujDoctor>(`/doctors/${input.id}`, {
        body: input.doctor,
        method: "PATCH",
      }),
  },
  modules: {
    key: (module: string) =>
      ["viruj-backend", "erp", "modules", module] as const,
    summary: (module: string) =>
      request<VirujModuleSummary>(`/modules/${module}/summary`),
  },
  staff: {
    cancelInvitation: (input: { invitationId: string }) =>
      request<VirujStaffInvitation>(
        `/staff/invitations/${input.invitationId}/cancel`,
        {
          method: "POST",
        }
      ),
    confirmInvitation: (input: { invitationId: string }) =>
      request<{
        email: string;
        loginUrl: string;
        role: string;
        status: string;
      }>(`/staff/invitations/${input.invitationId}/confirm`, {
        method: "POST",
      }),
    invitationsKey: ["viruj-backend", "erp", "staff", "invitations"] as const,
    invite: (input: { email: string; name?: string; role: VirujStaffRole }) =>
      request<VirujStaffInviteResult>("/staff/invitations", {
        body: input,
        method: "POST",
      }),
    listInvitations: () =>
      request<VirujStaffInvitation[]>("/staff/invitations"),
    listMembers: () => request<VirujStaffMember[]>("/staff/members"),
    membersKey: ["viruj-backend", "erp", "staff", "members"] as const,
    remove: (input: { memberId: string }) =>
      request<{ success: true }>(`/staff/members/${input.memberId}`, {
        method: "DELETE",
      }),
    updateRole: (input: { memberId: string; role: VirujStaffRole }) =>
      request<VirujStaffMember>(`/staff/members/${input.memberId}/role`, {
        body: { role: input.role },
        method: "PATCH",
      }),
  },
};
