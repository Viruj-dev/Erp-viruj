export type ToastTone = "success" | "info" | "warning" | "error" | "loading";

export type ToastAction = {
  label: string;
  onClick: () => void;
};

export type ToastInput = {
  id?: string;
  title: string;
  description?: string;
  tone?: ToastTone;
  action?: ToastAction;
  dedupeKey?: string;
  durationMs?: number;
};

export type ManagedToast = Required<Pick<ToastInput, "id" | "title" | "tone">> &
  Omit<ToastInput, "durationMs" | "id" | "title" | "tone"> & {
    createdAt: number;
    durationMs: number | null;
  };

export type NotificationConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

export type ErpNotification = {
  id: string;
  tenantId: string | null;
  patientId?: string | null;
  recipientId: string | null;
  recipientType: string | null;
  workspaceType: string | null;
  workspaceId: string | null;
  category: string;
  type: string;
  priority: "LOW" | "NORMAL" | "HIGH" | "CRITICAL" | string;
  title: string;
  message: string;
  icon?: string | null;
  actionLabel?: string | null;
  actionUrl?: string | null;
  metadata?: Record<string, unknown>;
  channels?: string[];
  status: string;
  isRead: boolean;
  readAt?: string | null;
  isArchived: boolean;
  archivedAt?: string | null;
  deletedAt?: string | null;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type NotificationListResponse =
  | {
      data: ErpNotification[];
      total?: number;
      page?: number;
      limit?: number;
      pagination?: { total?: number; page?: number; limit?: number };
    }
  | ErpNotification[];

export type NotificationStoreState = {
  notifications: ErpNotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  connectionStatus: NotificationConnectionStatus;
};

export type ApiFeedbackPayload = {
  description?: string;
  method?: string;
  path?: string;
  status?: number;
  title?: string;
};
