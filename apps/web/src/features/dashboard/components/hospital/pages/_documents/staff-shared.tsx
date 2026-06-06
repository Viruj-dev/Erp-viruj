"use client";

export const roleOptions = [
  "CLINIC_OWNER",
  "CLINIC_ADMIN",
  "CLINIC_STAFF",
  "ADMIN",
  "APPOINTMENT_HANDLER",
  "COMMUNITY_MANAGER",
  "MANAGER",
  "DOCTOR",
  "STAFF",
  "RECEPTIONIST",
  "TECHNICIAN",
] as const;

export const roleLabels: Record<string, string> = {
  ADMIN: "Admin",
  APPOINTMENT_HANDLER: "Appointment Handler",
  CLINIC_ADMIN: "Clinic Admin",
  CLINIC_OWNER: "Clinic Owner",
  CLINIC_STAFF: "Clinic Staff",
  COMMUNITY_MANAGER: "Community Manager",
  DOCTOR: "Doctor",
  MANAGER: "Manager",
  ORG_ADMIN: "Organization Admin",
  OWNER: "Owner",
  RECEPTIONIST: "Receptionist",
  STAFF: "Staff",
  TECHNICIAN: "Technician",
};

export type StaffRole = (typeof roleOptions)[number];

export type StaffInviteResult = {
  onboarding?: StaffOnboarding | null;
};

export type StaffOnboarding = {
  confirmationUrl?: string;
  emailSent?: boolean;
  loginUrl?: string;
  temporaryCredentials?: {
    email: string;
    password: string;
  } | null;
};

export type StaffPerson = {
  email: string;
  id: string;
  name?: string | null;
  role: string;
  userId?: string | null;
};

export function HeroMetric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-[10px] font-semi-bold uppercase tracking-[0.2em] text-white/45">
        {label}
      </p>
      <p className="mt-1 font-headline text-4xl font-semi-bold text-white">
        {value}
      </p>
    </div>
  );
}

export function StaffAvatar({
  email,
  name,
  small = false,
}: {
  email: string;
  name: string;
  small?: boolean;
}) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-primary/10 font-semi-bold uppercase text-primary ${
        small ? "h-9 w-9 text-xs" : "h-12 w-12 text-sm"
      }`}
    >
      {getInitials(name, email)}
    </div>
  );
}

export function EmptyState({
  compact = false,
  text,
  tone = "neutral",
}: {
  compact?: boolean;
  text: string;
  tone?: "neutral" | "error";
}) {
  return (
    <div
      className={`rounded-xl border border-dashed p-5 text-sm font-semibold ${
        compact ? "py-4" : "min-h-32"
      } ${
        tone === "error"
          ? "border-error/30 bg-error-container/10 text-error"
          : "border-outline-variant/30 bg-surface-container-low text-on-surface-variant"
      }`}
    >
      {text}
    </div>
  );
}

export function RolePill({ role }: { role: string }) {
  return (
    <span className="w-fit rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-[10px] font-semi-bold uppercase tracking-[0.14em] text-primary">
      {formatRole(role)}
    </span>
  );
}

export function formatRole(role: string) {
  return roleLabels[role as StaffRole] ?? role.replace(/_/g, " ");
}

export function formatAuditAction(action: string) {
  return action
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function departmentFromRole(role: string) {
  if (
    role === "CLINIC_OWNER" ||
    role === "CLINIC_ADMIN" ||
    role === "CLINIC_STAFF"
  ) {
    return "Clinic Operations";
  }

  if (role === "APPOINTMENT_HANDLER" || role === "RECEPTIONIST") {
    return "Appointments";
  }

  if (role === "COMMUNITY_MANAGER" || role === "MANAGER") {
    return "Community";
  }

  if (role === "DOCTOR") {
    return "Clinical";
  }

  if (role === "TECHNICIAN" || role === "lab_tech") {
    return "Diagnostics";
  }

  return "Administration";
}

export function isStaffRole(role: string): role is StaffRole {
  return roleOptions.includes(role as StaffRole);
}

function getInitials(name: string, email: string) {
  const source = name.trim() || email.trim();
  const parts = source.split(/\s+|@/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
