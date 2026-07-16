"use client";

import { shouldShowApiSuccess } from "@/features/notifications/lib/api-feedback";
import { notificationEvents } from "@/features/notifications/lib/notification-events";
import type { ErpNotification, NotificationListResponse } from "@/features/notifications";
import {
  getCentralApiToken,
  signOutAfterCentralApiUnauthorized,
} from "./central-api-token";

const erpApiUrl =
  typeof window !== "undefined"
    ? `${window.location.origin}/erp`
    : `${process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3002"}/erp`;
const commonApiUrl =
  typeof window !== "undefined"
    ? `${window.location.origin}/common`
    : `${process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3002"}/common`;

type RequestOptions = {
  body?: unknown;
  errorMessage?: string;
  method?: "DELETE" | "GET" | "PATCH" | "POST" | "PUT";
  successMessage?: string;
  suppressToast?: boolean;
  organizationId?: string;
};

async function request<T>(path: string, options: RequestOptions = {}) {
  return centralApiRequest<T>(`${erpApiUrl}${path}`, path, options, {
    fallbackMessage: "Viruj backend request failed",
    json: true,
    organizationId: options.organizationId,
  });
}

async function formRequest<T>(path: string, formData: FormData, options: RequestOptions = {}) {
  return centralApiRequest<T>(`${erpApiUrl}${path}`, path, options, {
    body: formData,
    fallbackMessage: "Viruj backend request failed",
    organizationId: options.organizationId,
  });
}

async function commonRequest<T>(path: string, options: RequestOptions = {}) {
  return centralApiRequest<T>(`${commonApiUrl}${path}`, path, options, {
    fallbackMessage: "Viruj backend common request failed",
    json: true,
  });
}


async function centralApiRequest<T>(
  url: string,
  path: string,
  options: RequestOptions,
  requestOptions: {
    body?: BodyInit;
    fallbackMessage: string;
    json?: boolean;
    organizationId?: string;
  },
) {
  const response = await fetchWithCentralApiToken(url, options, requestOptions);

  if (response.status === 401) {
    const retry = await fetchWithCentralApiToken(url, options, requestOptions, true);

    if (retry.ok) {
      emitApiSuccess(path, options);
      return retry.json() as Promise<T>;
    }

    await signOutAfterCentralApiUnauthorized();
    const payload = await retry.json().catch(() => null);
    const message = responseErrorMessage(payload, `${requestOptions.fallbackMessage} (${retry.status})`);
    emitApiError(path, options, retry.status, message);
    throw new Error(message);
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message = responseErrorMessage(payload, `${requestOptions.fallbackMessage} (${response.status})`);
    emitApiError(path, options, response.status, message);
    throw new Error(message);
  }

  emitApiSuccess(path, options);
  return response.json() as Promise<T>;
}

async function fetchWithCentralApiToken(
  url: string,
  options: RequestOptions,
  requestOptions: {
    body?: BodyInit;
    json?: boolean;
    organizationId?: string;
  },
  forceRefresh = false,
) {
  const headers = new Headers();
  headers.set("Authorization", `Bearer ${await getCentralApiToken(forceRefresh)}`);

  if (requestOptions.json) {
    headers.set("Content-Type", "application/json");
  }

  if (requestOptions.organizationId) {
    headers.set("X-Erp-Organization-Id", requestOptions.organizationId);
  }

  return fetch(url, {
    body: requestOptions.body ?? (options.body ? JSON.stringify(options.body) : undefined),
    credentials: "include",
    headers,
    method: options.method ?? "GET",
  });
}

function emitApiSuccess(path: string, options: RequestOptions) {
  const method = options.method ?? "GET";
  if (options.suppressToast || !shouldShowApiSuccess(method)) return;
  notificationEvents.emit("api.success", {
    description: undefined,
    method,
    path,
    title: options.successMessage,
  });
}

function emitApiError(path: string, options: RequestOptions, status: number, description: string) {
  if (options.suppressToast) return;
  notificationEvents.emit("api.error", {
    description: options.errorMessage ?? description,
    method: options.method ?? "GET",
    path,
    status,
  });
}

function responseErrorMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const details = record.details;
    if (typeof record.message === "string") return record.message;
    if (typeof record.error === "string") return record.error;
    if (details && typeof details === "object") {
      const detailRecord = details as Record<string, unknown>;
      if (typeof detailRecord.message === "string") return detailRecord.message;
    }
  }
  return fallback;
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

export type VirujActivity = {
  id: string;
  tenantId: string;
  workspaceType: string;
  workspaceId: string;
  actorId: string | null;
  actorName: string;
  actorRole: string | null;
  module: string;
  resource: string;
  resourceId: string | null;
  resourceName: string | null;
  action: string;
  title: string;
  description: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  dayLabel: string;
  display: {
    actor: string;
    resource: string;
    summary: string;
  };
};

export type VirujActivityResponse = {
  data: VirujActivity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
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


export type VirujFacilityCategory =
  | "Diagnostic"
  | "Imaging"
  | "Laboratory"
  | "Emergency"
  | "Treatment"
  | "Surgery"
  | "Intensive Care"
  | "Rehabilitation"
  | "Women's Health"
  | "Children's Care"
  | "Cardiology"
  | "Orthopedics"
  | "Neurology"
  | "Oncology"
  | "Pharmacy"
  | "Dental"
  | "Cosmetic"
  | "Vaccination"
  | "Home Care"
  | "Wellness"
  | "Health Packages"
  | "Other";

export type VirujFacilityStatus = "active" | "archived" | "draft";
export type VirujFacilityVisibility = "hidden" | "public";

export type VirujFacilityInput = {
  appointmentRequired: boolean;
  available247: boolean;
  bannerImage: string;
  category: VirujFacilityCategory;
  currency: string;
  description: string;
  displayOrder: number;
  emergencyService: boolean;
  galleryImages: string[];
  isAvailable: boolean;
  isFeatured: boolean;
  keywords: string[];
  name: string;
  onlineBooking: boolean;
  priceText: string;
  seoDescription: string;
  seoTitle: string;
  shortDescription: string;
  slug: string;
  startingPrice: number | null;
  status: VirujFacilityStatus;
  visibility: VirujFacilityVisibility;
};

export type VirujFacility = VirujFacilityInput & {
  createdAt: string;
  createdBy: string;
  id: string;
  organizationId: string;
  updatedAt: string;
  updatedBy: string;
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
      errorMessage?: string;
  method?: "DELETE" | "GET" | "PATCH" | "POST" | "PUT";
  successMessage?: string;
  suppressToast?: boolean;
    };
    description: string;
    severity: "CRITICAL" | "INFO" | "SUCCESS" | "WARNING";
    value?: VirujAnalyticsMetricValue;
  };
  permissions: string[];
  title: string;
  type: "SIGNAL";
};

export type VirujOrganizationProfileMedia = {
  kind: "cover" | "logo";
  url: string;
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
  activity: {
    key: (input: {
      action?: string;
      from?: string;
      limit?: number;
      module?: string;
      organizationId?: string;
      page?: number;
      search?: string;
      to?: string;
    }) =>
      [
        "viruj-backend",
        "erp",
        "activity",
        input.organizationId ?? "none",
        input.page ?? 1,
        input.limit ?? 25,
        input.search ?? "",
        input.module ?? "",
        input.action ?? "",
        input.from ?? "",
        input.to ?? "",
      ] as const,
    list: (input: {
      action?: string;
      from?: string;
      limit?: number;
      module?: string;
      organizationId?: string;
      page?: number;
      search?: string;
      to?: string;
    }) => {
      const params = new URLSearchParams();
      if (input.page) params.set("page", String(input.page));
      if (input.limit) params.set("limit", String(input.limit));
      if (input.search) params.set("search", input.search);
      if (input.module) params.set("module", input.module);
      if (input.action) params.set("action", input.action);
      if (input.from) params.set("from", input.from);
      if (input.to) params.set("to", input.to);
      return request<VirujActivityResponse>(
        "/activities?" + params.toString(),
        { organizationId: input.organizationId }
      );
    },
  },
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

  organizationProfile: {
    uploadMedia: (input: { file: File; kind: "cover" | "logo"; organizationId?: string }) => {
      const formData = new FormData();
      formData.set("kind", input.kind);
      formData.set("file", input.file);
      return formRequest<VirujOrganizationProfileMedia>(
        "/hospital/profile/media",
        formData,
        {
          method: "POST",
          organizationId: input.organizationId,
          successMessage: "Organization media saved",
        }
      );
    },
  },
  facilities: {
    create: (input: VirujFacilityInput) =>
      request<VirujFacility>("/facilities", {
        body: input,
        method: "POST",
      }),
    delete: (input: { id: string }) =>
      request<{ success: true }>(`/facilities/${input.id}`, {
        method: "DELETE",
      }),
    get: (input: { id: string }) =>
      request<VirujFacility>(`/facilities/${input.id}`),
    key: ["viruj-backend", "erp", "facilities"] as const,
    list: () => request<VirujFacility[]>("/facilities"),
    reorder: (input: { items: Array<{ displayOrder: number; id: string }> }) =>
      request<{ success: true }>("/facilities/reorder", {
        body: input,
        method: "PATCH",
      }),
    update: (input: { facility: VirujFacilityInput; id: string }) =>
      request<VirujFacility>(`/facilities/${input.id}`, {
        body: input.facility,
        method: "PATCH",
      }),
    updateStatus: (input: {
      id: string;
      isAvailable?: boolean;
      status: VirujFacilityStatus;
    }) =>
      request<VirujFacility>(`/facilities/${input.id}/status`, {
        body: {
          isAvailable: input.isAvailable,
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
  patients: {
    deleteAll: () =>
      request<{ deleted: number }>("/patients", {
        method: "DELETE",
      }),
    key: ["viruj-backend", "erp", "patients"] as const,
  },
  notifications: {
    archive: (input: { id: string; organizationId?: string }) =>
      request<ErpNotification>(`/notifications/${input.id}/archive`, {
        method: "PATCH",
        organizationId: input.organizationId,
        suppressToast: true,
      }),
    delete: (input: { id: string; organizationId?: string }) =>
      request<{ deleted: true }>(`/notifications/${input.id}`, {
        method: "DELETE",
        organizationId: input.organizationId,
        suppressToast: true,
      }),
    key: (organizationId?: string) =>
      ["viruj-backend", "erp", "notifications", organizationId ?? "none"] as const,
    list: (input?: { limit?: number; organizationId?: string; page?: number }) => {
      const params = new URLSearchParams();
      params.set("limit", String(input?.limit ?? 30));
      params.set("page", String(input?.page ?? 1));
      return request<NotificationListResponse>(`/notifications?${params.toString()}`, {
        organizationId: input?.organizationId,
        suppressToast: true,
      });
    },
    markAllRead: (input?: { organizationId?: string }) =>
      request<{ updated: number }>("/notifications/read-all", {
        method: "PATCH",
        organizationId: input?.organizationId,
        suppressToast: true,
      }),
    markRead: (input: { id: string; organizationId?: string }) =>
      request<ErpNotification>(`/notifications/${input.id}/read`, {
        method: "PATCH",
        organizationId: input.organizationId,
        suppressToast: true,
      }),
    unreadCount: (input?: { organizationId?: string }) =>
      request<{ count: number }>("/notifications/unread/count", {
        organizationId: input?.organizationId,
        suppressToast: true,
      }),
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
