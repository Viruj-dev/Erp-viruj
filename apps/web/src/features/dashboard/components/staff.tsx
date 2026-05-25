"use client";

import { orpc } from "@/lib/orpc";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  BadgeCheck,
  Clock,
  Mail,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

const roleOptions = [
  "APPOINTMENT_HANDLER",
  "COMMUNITY_MANAGER",
  "FINANCE_MANAGER",
  "ORG_ADMIN",
] as const;

const roleLabels: Record<(typeof roleOptions)[number], string> = {
  APPOINTMENT_HANDLER: "Appointment Handler",
  COMMUNITY_MANAGER: "Community Manager",
  FINANCE_MANAGER: "Finance Manager",
  ORG_ADMIN: "Organization Admin",
};

type StaffRole = (typeof roleOptions)[number];

export function ErpDemoStaff() {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<StaffRole>("APPOINTMENT_HANDLER");
  const [selectedRole, setSelectedRole] =
    useState<StaffRole>("APPOINTMENT_HANDLER");
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);

  const membersQuery = useQuery(orpc.staff.listMembers.queryOptions());
  const invitationsQuery = useQuery(orpc.staff.listInvitations.queryOptions());
  const auditQuery = useQuery(orpc.audit.recent.queryOptions());
  const invalidateStaffData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: orpc.audit.recent.key(),
      }),
      queryClient.invalidateQueries({
        queryKey: orpc.staff.listInvitations.key(),
      }),
      queryClient.invalidateQueries({
        queryKey: orpc.staff.listMembers.key(),
      }),
    ]);
  };
  const inviteMutation = useMutation(
    orpc.staff.invite.mutationOptions({
      onSuccess: async () => {
        setEmail("");
        await invalidateStaffData();
      },
    })
  );
  const updateRoleMutation = useMutation(
    orpc.staff.updateRole.mutationOptions({
      onSuccess: invalidateStaffData,
    })
  );
  const removeStaffMutation = useMutation(
    orpc.staff.remove.mutationOptions({
      onSuccess: async () => {
        setSelectedStaffId(null);
        await invalidateStaffData();
      },
    })
  );
  const cancelInvitationMutation = useMutation(
    orpc.staff.cancelInvitation.mutationOptions({
      onSuccess: invalidateStaffData,
    })
  );

  const members = membersQuery.data ?? [];
  const invitations = invitationsQuery.data ?? [];
  const auditLogs = auditQuery.data ?? [];
  const selectedStaff =
    members.find((member) => member.id === selectedStaffId) ??
    members[0] ??
    null;
  const pendingInvitations = invitations.filter(
    (invitation) => invitation.status === "pending"
  );

  useEffect(() => {
    if (selectedStaff?.role && isStaffRole(selectedStaff.role)) {
      setSelectedRole(selectedStaff.role);
    }
  }, [selectedStaff?.role]);

  const handleInvite = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || inviteMutation.isPending) {
      return;
    }

    inviteMutation.mutate({
      email,
      role,
    });
  };

  const handleUpdateRole = () => {
    if (!selectedStaff || updateRoleMutation.isPending) {
      return;
    }

    updateRoleMutation.mutate({
      memberId: selectedStaff.id,
      role: selectedRole,
    });
  };

  const handleRemoveStaff = () => {
    if (!selectedStaff || removeStaffMutation.isPending) {
      return;
    }

    removeStaffMutation.mutate({
      memberId: selectedStaff.id,
    });
  };

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricBadge
          icon={<Users size={16} />}
          label="Active staff"
          value={`${members.length}`}
        />
        <MetricBadge
          icon={<Clock size={16} />}
          label="Pending invites"
          tone="secondary"
          value={`${pendingInvitations.length}`}
        />
        <MetricBadge
          icon={<ShieldCheck size={16} />}
          label="Role model"
          value="MVP RBAC"
        />
      </div>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-headline text-2xl font-black text-on-surface">
                Staff Directory
              </h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                Organization-scoped ERP users and their operational roles.
              </p>
            </div>
          </div>

          {membersQuery.isPending ? (
            <EmptyState text="Loading staff accounts..." />
          ) : membersQuery.isError ? (
            <EmptyState text="Unable to load staff accounts." tone="error" />
          ) : members.length === 0 ? (
            <EmptyState text="No staff accounts have joined this organization yet." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {members.map((member) => (
                <button
                  className={`rounded-2xl border p-5 text-left transition-all ${
                    selectedStaff?.id === member.id
                      ? "border-primary bg-primary-container/10 ring-2 ring-primary/15"
                      : "border-outline-variant/20 bg-surface-container-low hover:border-primary/35 hover:shadow-lg"
                  }`}
                  key={member.id}
                  onClick={() => setSelectedStaffId(member.id)}
                  type="button"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-sm font-black uppercase text-white">
                        {getInitials(member.name, member.email)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate font-headline text-lg font-black text-on-surface">
                          {member.name}
                        </h3>
                        <p className="truncate text-sm text-on-surface-variant">
                          {member.email}
                        </p>
                      </div>
                    </div>
                    <StatusDot isActive={member.emailVerified} />
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <RolePill role={member.role} />
                    <span className="rounded-full bg-surface-container-high px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-on-surface-variant">
                      {member.emailVerified ? "Verified" : "Unverified"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-5">
          <form
            className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-5 shadow-sm"
            onSubmit={handleInvite}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
                <UserPlus size={18} />
              </div>
              <div>
                <h3 className="font-headline text-lg font-black text-on-surface">
                  Invite Staff
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Creates a pending organization invitation.
                </p>
              </div>
            </div>

            <label className="mt-5 block text-[11px] font-black uppercase tracking-[0.18em] text-on-surface-variant">
              Email
              <input
                className="mt-2 w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 text-sm font-semibold normal-case tracking-normal text-on-surface outline-none transition focus:border-primary"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="staff@organization.com"
                type="email"
                value={email}
              />
            </label>

            <label className="mt-4 block text-[11px] font-black uppercase tracking-[0.18em] text-on-surface-variant">
              Role
              <select
                className="mt-2 w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 text-sm font-semibold normal-case tracking-normal text-on-surface outline-none transition focus:border-primary"
                onChange={(event) => setRole(event.target.value as StaffRole)}
                value={role}
              >
                {roleOptions.map((roleOption) => (
                  <option key={roleOption} value={roleOption}>
                    {roleLabels[roleOption]}
                  </option>
                ))}
              </select>
            </label>

            {inviteMutation.isError ? (
              <p className="mt-4 rounded-xl bg-error-container/20 px-4 py-3 text-sm font-semibold text-error">
                {inviteMutation.error.message || "Unable to invite staff."}
              </p>
            ) : null}

            <button
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-black text-white shadow-md transition hover:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={inviteMutation.isPending}
              type="submit"
            >
              <Mail size={16} />
              {inviteMutation.isPending ? "Inviting..." : "Send Invitation"}
            </button>
          </form>

          <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-5 shadow-sm">
            <h3 className="font-headline text-lg font-black text-on-surface">
              Pending Invitations
            </h3>
            <div className="mt-4 space-y-3">
              {invitationsQuery.isPending ? (
                <EmptyState text="Loading invitations..." compact />
              ) : pendingInvitations.length === 0 ? (
                <EmptyState text="No pending invitations." compact />
              ) : (
                pendingInvitations.map((invitation) => (
                  <div
                    className="rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-4"
                    key={invitation.id}
                  >
                    <p className="truncate text-sm font-black text-on-surface">
                      {invitation.email}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <RolePill role={invitation.role} />
                      <span className="rounded-full bg-secondary-container/35 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-secondary">
                        {invitation.status}
                      </span>
                    </div>
                    <p className="mt-3 text-xs text-on-surface-variant">
                      Invitation ID: {invitation.id}
                    </p>
                    <button
                      className="mt-3 inline-flex items-center gap-2 rounded-lg border border-error/20 px-3 py-2 text-xs font-black text-error transition hover:bg-error-container/20 disabled:opacity-60"
                      disabled={cancelInvitationMutation.isPending}
                      onClick={() =>
                        cancelInvitationMutation.mutate({
                          invitationId: invitation.id,
                        })
                      }
                      type="button"
                    >
                      <Trash2 size={13} />
                      Cancel
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {selectedStaff ? (
            <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-5 shadow-sm">
              <h3 className="font-headline text-lg font-black text-on-surface">
                Selected Account
              </h3>
              <div className="mt-4 space-y-3 text-sm">
                <Detail label="Name" value={selectedStaff.name} />
                <Detail label="Email" value={selectedStaff.email} />
                <Detail label="Role" value={formatRole(selectedStaff.role)} />
                <Detail
                  label="Status"
                  value={selectedStaff.emailVerified ? "Verified" : "Unverified"}
                />
                <label className="block text-[11px] font-black uppercase tracking-[0.18em] text-on-surface-variant">
                  Change Role
                  <select
                    className="mt-2 w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 text-sm font-semibold normal-case tracking-normal text-on-surface outline-none transition focus:border-primary"
                    onChange={(event) =>
                      setSelectedRole(event.target.value as StaffRole)
                    }
                    value={selectedRole}
                  >
                    {roleOptions.map((roleOption) => (
                      <option key={roleOption} value={roleOption}>
                        {roleLabels[roleOption]}
                      </option>
                    ))}
                  </select>
                </label>
                {updateRoleMutation.isError || removeStaffMutation.isError ? (
                  <p className="rounded-xl bg-error-container/20 px-4 py-3 text-sm font-semibold text-error">
                    {updateRoleMutation.error?.message ||
                      removeStaffMutation.error?.message ||
                      "Unable to update staff access."}
                  </p>
                ) : null}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    className="rounded-xl bg-primary px-4 py-3 text-sm font-black text-white transition hover:scale-[0.99] disabled:opacity-60"
                    disabled={
                      updateRoleMutation.isPending ||
                      selectedRole === selectedStaff.role
                    }
                    onClick={handleUpdateRole}
                    type="button"
                  >
                    Save Role
                  </button>
                  <button
                    className="flex items-center justify-center gap-2 rounded-xl border border-error/20 px-4 py-3 text-sm font-black text-error transition hover:bg-error-container/20 disabled:opacity-60"
                    disabled={removeStaffMutation.isPending}
                    onClick={handleRemoveStaff}
                    type="button"
                  >
                    <Trash2 size={15} />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Activity size={16} />
              <h3 className="font-headline text-lg font-black text-on-surface">
                Recent Audit
              </h3>
            </div>
            <div className="mt-4 space-y-3">
              {auditQuery.isPending ? (
                <EmptyState text="Loading audit events..." compact />
              ) : auditLogs.length === 0 ? (
                <EmptyState text="No audit events yet." compact />
              ) : (
                auditLogs.slice(0, 5).map((log) => (
                  <div
                    className="rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-4"
                    key={log.id}
                  >
                    <p className="text-sm font-black text-on-surface">
                      {formatAuditAction(log.action)}
                    </p>
                    <p className="mt-1 truncate text-xs text-on-surface-variant">
                      {log.actorName || log.actorEmail || "ERP actor"} |{" "}
                      {formatDate(log.createdAt)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

function MetricBadge({
  icon,
  label,
  tone = "primary",
  value,
}: {
  icon: React.ReactNode;
  label: string;
  tone?: "primary" | "secondary";
  value: string;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        tone === "primary"
          ? "border-outline-variant/20 bg-surface-container-low"
          : "border-secondary/15 bg-secondary-container/35"
      }`}
    >
      <div className="flex items-center gap-2 text-sm font-black text-on-surface-variant">
        {icon}
        {label}
      </div>
      <p className="mt-3 font-headline text-3xl font-black text-on-surface">
        {value}
      </p>
    </div>
  );
}

function EmptyState({
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
      className={`rounded-2xl border border-dashed p-5 text-sm font-semibold ${
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

function RolePill({ role }: { role: string }) {
  return (
    <span className="rounded-full border border-primary/15 bg-primary-container/15 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-primary">
      {formatRole(role)}
    </span>
  );
}

function StatusDot({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`mt-1 h-3 w-3 rounded-full ${
        isActive ? "bg-secondary" : "bg-outline-variant"
      }`}
    />
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-surface-container-high px-4 py-3">
      <span className="text-on-surface-variant">{label}</span>
      <span className="truncate font-black text-on-surface">{value}</span>
    </div>
  );
}

function formatRole(role: string) {
  return roleLabels[role as StaffRole] ?? role.replace(/_/g, " ");
}

function formatAuditAction(action: string) {
  return action
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function isStaffRole(role: string): role is StaffRole {
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
