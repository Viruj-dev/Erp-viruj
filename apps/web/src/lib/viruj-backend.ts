 "use client";

const backendUrl =
  process.env.NEXT_PUBLIC_VIRUJ_BACKEND_URL || "http://localhost:4000";
const erpApiUrl = `${backendUrl.replace(/\/$/, "")}/api/erp`;
const commonApiUrl = `${backendUrl.replace(/\/$/, "")}/api/common`;
const erpToken = process.env.NEXT_PUBLIC_VIRUJ_BACKEND_ERP_TOKEN;
const erpServerUrl =
  typeof window !== "undefined"
    ? `${window.location.origin}/erp`
    : `${process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3002"}/erp`;

type RequestOptions = {
  body?: unknown;
  method?: "DELETE" | "GET" | "PATCH" | "POST";
  organizationId?: string;
};

async function request<T>(path: string, options: RequestOptions = {}) {
  const headers = new Headers({
    "Content-Type": "application/json",
  });

  if (erpToken) {
    headers.set("Authorization", `Bearer ${erpToken}`);
  }

  if (options.organizationId) {
    headers.set("X-Erp-Organization-Id", options.organizationId);
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

async function commonRequest<T>(path: string, options: RequestOptions = {}) {
  const headers = new Headers({
    "Content-Type": "application/json",
  });

  if (erpToken) {
    headers.set("Authorization", `Bearer ${erpToken}`);
  }

  const response = await fetch(`${commonApiUrl}${path}`, {
    body: options.body ? JSON.stringify(options.body) : undefined,
    headers,
    method: options.method ?? "GET",
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(
      payload?.message ||
        payload?.error ||
        `Viruj backend common request failed (${response.status})`
    );
  }

  return response.json() as Promise<T>;
}
async function erpServerRequest<T>(path: string, options: RequestOptions = {}) {
  const response = await fetch(`${erpServerUrl}${path}`, {
    body: options.body ? JSON.stringify(options.body) : undefined,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    method: options.method ?? "GET",
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(
      payload?.message ||
        payload?.error ||
        `ERP server request failed (${response.status})`
    );
  }

  return response.json() as Promise<T>;
}

export type VirujAppointmentStatus =
  | "pending_approval"
  | "approved"
  | "rejected"
  | "rescheduled"
  | "completed"
  | "cancelled"
  | "no_show";

export type VirujAppointment = {
  approvalNotes?: string | null;
  appointmentDate: string;
  appointmentMode: string;
  appointmentTime: string;
  createdAt?: string | Date;
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

export type VirujMobileAppointmentRequestInput = {
  mobileUserId?: string;
  patientAge?: number | null;
  patientGender?: string | null;
  patientName: string;
  patientPhone?: string;
  reason: string;
  requestedAt?: string;
};

export type VirujModuleSummary = {
  module: string;
  organizationId?: string;
  organizationType?: string;
  ready: boolean;
  source: "viruj-backend";
};

export type VirujStaffRole =
  | "ADMIN"
  | "APPOINTMENT_HANDLER"
  | "CLINIC_ADMIN"
  | "CLINIC_OWNER"
  | "CLINIC_STAFF"
  | "COMMUNITY_MANAGER"
  | "DOCTOR"
  | "MANAGER"
  | "RECEPTIONIST"
  | "STAFF"
  | "TECHNICIAN";

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

export type VirujHospitalGalleryMediaType = "IMAGE" | "VIDEO";

export type VirujHospitalGalleryInput = {
  altText?: string;
  caption?: string;
  isPublished?: boolean;
  mediaId?: string;
  mediaType?: VirujHospitalGalleryMediaType;
  sortOrder?: number;
  url: string;
};

export type VirujHospitalGalleryItem = {
  altText?: string;
  caption?: string;
  createdAt: string;
  createdBy: string;
  hospitalId: string;
  id: string;
  isPublished: boolean;
  mediaId?: string;
  mediaType: VirujHospitalGalleryMediaType;
  sortOrder: number;
  updatedAt: string;
  url: string;
};

export type VirujAnalyticsDateRange =
  | "TODAY"
  | "YESTERDAY"
  | "LAST_7_DAYS"
  | "LAST_30_DAYS"
  | "THIS_MONTH"
  | "LAST_MONTH"
  | "CUSTOM";

export type VirujAnalyticsMetricValue = string | number | null;

export type VirujAnalyticsComparison = {
  changePercentage?: number;
  direction?: "UP" | "DOWN" | "FLAT";
  label: string;
  value: VirujAnalyticsMetricValue;
};

export type VirujAnalyticsSummaryWidget = {
  id: string;
  order: number;
  payload: {
    comparison?: VirujAnalyticsComparison;
    formattedValue?: string;
    icon?: string;
    unit?: string;
    value: VirujAnalyticsMetricValue;
  };
  permissions: string[];
  title: string;
  type: "SUMMARY";
};

export type VirujAnalyticsChartWidget = {
  description?: string;
  id: string;
  order: number;
  payload: {
    changePercentage?: number;
    chartType:
      | "AREA"
      | "BAR"
      | "BUBBLE"
      | "DONUT"
      | "FUNNEL"
      | "GAUGE"
      | "HEATMAP"
      | "LINE"
      | "PIE"
      | "RADAR"
      | "SCATTER";
    comparison?: VirujAnalyticsComparison;
    datasets: Array<{
      color?: string;
      data: Array<number | { x: string | number; y: number }>;
      id: string;
      label: string;
      stack?: string;
    }>;
    labels: string[];
    period: string;
  };
  permissions: string[];
  title: string;
  type: "CHART";
};

export type VirujAnalyticsSignalWidget = {
  id: string;
  order: number;
  payload: {
    action?: {
      href: string;
      label: string;
      method?: "DELETE" | "GET" | "PATCH" | "POST";
    };
    description: string;
    severity: "CRITICAL" | "INFO" | "SUCCESS" | "WARNING";
    value?: VirujAnalyticsMetricValue;
  };
  permissions: string[];
  title: string;
  type: "SIGNAL";
};

export type VirujAnalyticsDashboard = {
  actions: unknown[];
  charts: VirujAnalyticsChartWidget[];
  insights: unknown[];
  leaderboards: unknown[];
  signals: VirujAnalyticsSignalWidget[];
  summary: VirujAnalyticsSummaryWidget[];
  trends: unknown[];
};
export const virujBackend = {
  analytics: {
    dashboard: (input: {
      dateRange?: VirujAnalyticsDateRange;
      entityId: string;
      role?: "clinic" | "doctor" | "hospital";
    }) => {
      const params = new URLSearchParams({
        dateRange: input.dateRange ?? "LAST_30_DAYS",
        entityId: input.entityId,
        role: input.role ?? "hospital",
      });

      return commonRequest<VirujAnalyticsDashboard>(
        `/analytics/dashboard?${params.toString()}`
      );
    },
    key: (input: {
      dateRange?: VirujAnalyticsDateRange;
      entityId?: string;
      role?: "clinic" | "doctor" | "hospital";
    }) =>
      [
        "viruj-backend",
        "common",
        "analytics",
        input.role ?? "hospital",
        input.entityId ?? "none",
        input.dateRange ?? "LAST_30_DAYS",
      ] as const,
  },
  audit: {
    key: (organizationId?: string) =>
      ["viruj-backend", "erp", "audit", "recent", organizationId ?? "none"] as const,
    recent: (input?: { organizationId?: string }) =>
      request<VirujAuditLog[]>("/audit/recent", {
        organizationId: input?.organizationId,
      }),
  },
  appointments: {
    key: ["viruj-backend", "erp", "appointments"] as const,
    createMobileRequest: (input: VirujMobileAppointmentRequestInput) =>
      request<VirujAppointment>("/appointments/mobile-request", {
        body: input,
        method: "POST",
      }),
    deleteAll: () =>
      request<{ deleted: number }>("/appointments", {
        method: "DELETE",
      }),
    list: () => request<VirujAppointment[]>("/appointments"),
    updateStatus: (input: {
      approvalNotes?: string | null;
      endsAt?: string | null;
      id: string;
      startsAt?: string | null;
      status: VirujAppointmentStatus;
    }) =>
      request<VirujAppointment>(`/appointments/${input.id}/status`, {
        body: {
          approvalNotes: input.approvalNotes,
          endsAt: input.endsAt,
          startsAt: input.startsAt,
          status: input.status,
        },
        method: "PATCH",
      }),
  },
  hospitalGallery: {
    create: (input: { gallery: VirujHospitalGalleryInput; organizationId?: string }) =>
      request<VirujHospitalGalleryItem>("/hospital/profile/gallery", {
        body: input.gallery,
        method: "POST",
        organizationId: input.organizationId,
      }),
    delete: (input: { id: string; organizationId?: string }) =>
      request<{ deleted: true; id: string }>(
        `/hospital/profile/gallery/${input.id}`,
        {
          method: "DELETE",
          organizationId: input.organizationId,
        }
      ),
    key: (organizationId?: string) =>
      ["viruj-backend", "erp", "hospital", "gallery", organizationId ?? "none"] as const,
    list: (input?: { organizationId?: string }) =>
      request<VirujHospitalGalleryItem[]>("/hospital/profile/gallery", {
        organizationId: input?.organizationId,
      }),
    update: (input: {
      gallery: Partial<VirujHospitalGalleryInput>;
      id: string;
      organizationId?: string;
    }) =>
      request<VirujHospitalGalleryItem>(
        `/hospital/profile/gallery/${input.id}`,
        {
          body: input.gallery,
          method: "PATCH",
          organizationId: input.organizationId,
        }
      ),
  },
  doctors: {
    create: (input: VirujDoctorInput) =>
      erpServerRequest<VirujDoctor>("/doctors", {
        body: input,
        method: "POST",
      }),
    delete: (input: { id: string }) =>
      erpServerRequest<{ success: true }>(`/doctors/${input.id}`, {
        method: "DELETE",
      }),
    key: ["viruj-backend", "erp", "doctors"] as const,
    list: () => erpServerRequest<VirujDoctor[]>("/doctors"),
    publish: (input: { id: string }) =>
      erpServerRequest<VirujDoctor>(`/doctors/${input.id}/publish`, {
        method: "POST",
      }),
    publishAll: () =>
      erpServerRequest<{
        count: number;
        doctors: VirujDoctor[];
        message: string;
      }>("/doctors/publish", {
        method: "POST",
      }),
    update: (input: { doctor: VirujDoctorInput; id: string }) =>
      erpServerRequest<VirujDoctor>(`/doctors/${input.id}`, {
        body: input.doctor,
        method: "PATCH",
      }),
  },
  patients: {
    deleteAll: () =>
      request<{ deleted: number }>("/patients", {
        method: "DELETE",
      }),
    key: ["viruj-backend", "erp", "patients"] as const,
  },
  modules: {
    key: (module: string) =>
      ["viruj-backend", "erp", "modules", module] as const,
    summary: (module: string) =>
      request<VirujModuleSummary>(`/modules/${module}/summary`),
  },
  staff: {
    cancelInvitation: (input: { invitationId: string; organizationId?: string }) =>
      request<VirujStaffInvitation>(
        `/staff/invitations/${input.invitationId}/cancel`,
        {
          method: "POST",
          organizationId: input.organizationId,
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
    invitationsKey: (organizationId?: string) =>
      ["viruj-backend", "erp", "staff", "invitations", organizationId ?? "none"] as const,
    invite: (input: { email: string; name?: string; organizationId?: string; role: VirujStaffRole }) =>
      request<VirujStaffInviteResult>("/staff/invitations", {
        body: input,
        method: "POST",
        organizationId: input.organizationId,
      }),
    listInvitations: (input?: { organizationId?: string }) =>
      request<VirujStaffInvitation[]>("/staff/invitations", {
        organizationId: input?.organizationId,
      }),
    listMembers: (input?: { organizationId?: string }) =>
      request<VirujStaffMember[]>("/staff/members", {
        organizationId: input?.organizationId,
      }),
    membersKey: (organizationId?: string) =>
      ["viruj-backend", "erp", "staff", "members", organizationId ?? "none"] as const,
    remove: (input: { memberId: string; organizationId?: string }) =>
      request<{ success: true }>(`/staff/members/${input.memberId}`, {
        method: "DELETE",
        organizationId: input.organizationId,
      }),
    updateRole: (input: { memberId: string; organizationId?: string; role: VirujStaffRole }) =>
      request<VirujStaffMember>(`/staff/members/${input.memberId}/role`, {
        body: { role: input.role },
        method: "PATCH",
        organizationId: input.organizationId,
      }),
  },
};
