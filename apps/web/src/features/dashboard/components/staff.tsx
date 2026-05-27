"use client";

import { authClient } from "@/lib/auth-client";
import { virujBackend } from "@/lib/viruj-backend";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  BriefcaseMedical,
  Clock,
  Download,
  Edit3,
  Filter,
  Mail,
  MoreVertical,
  Search,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const roleOptions = [
  "APPOINTMENT_HANDLER",
  "COMMUNITY_MANAGER",
  "ORG_ADMIN",
] as const;

const roleLabels: Record<(typeof roleOptions)[number], string> = {
  APPOINTMENT_HANDLER: "Appointment Handler",
  COMMUNITY_MANAGER: "Community Manager",
  ORG_ADMIN: "Organization Admin",
};

type StaffRole = (typeof roleOptions)[number];
type StaffInviteResult = {
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

export function ErpDemoStaff() {
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [credentialPreview, setCredentialPreview] = useState<
    StaffInviteResult["onboarding"] | null
  >(null);
  const [role, setRole] = useState<StaffRole>("APPOINTMENT_HANDLER");
  const [selectedRole, setSelectedRole] = useState<StaffRole>(
    "APPOINTMENT_HANDLER"
  );
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);

  const membersQuery = useQuery({
    queryFn: virujBackend.staff.listMembers,
    queryKey: virujBackend.staff.membersKey,
  });
  const invitationsQuery = useQuery({
    queryFn: virujBackend.staff.listInvitations,
    queryKey: virujBackend.staff.invitationsKey,
  });
  const auditQuery = useQuery({
    queryFn: virujBackend.audit.recent,
    queryKey: virujBackend.audit.key,
  });
  const invalidateStaffData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: virujBackend.audit.key,
      }),
      queryClient.invalidateQueries({
        queryKey: virujBackend.staff.invitationsKey,
      }),
      queryClient.invalidateQueries({
        queryKey: virujBackend.staff.membersKey,
      }),
    ]);
  };
  const inviteMutation = useMutation(
    {
      mutationFn: virujBackend.staff.invite,
      onSuccess: async (result) => {
        const onboarding = (result as StaffInviteResult).onboarding ?? null;
        setCredentialPreview(onboarding);
        setName("");
        setEmail("");
        if (!onboarding?.temporaryCredentials) {
          setIsEntryDialogOpen(false);
        }
        await invalidateStaffData();
      },
    }
  );
  const updateRoleMutation = useMutation(
    {
      mutationFn: virujBackend.staff.updateRole,
      onSuccess: invalidateStaffData,
    }
  );
  const removeStaffMutation = useMutation(
    {
      mutationFn: virujBackend.staff.remove,
      onSuccess: async () => {
        setSelectedStaffId(null);
        await invalidateStaffData();
      },
    }
  );
  const cancelInvitationMutation = useMutation(
    {
      mutationFn: virujBackend.staff.cancelInvitation,
      onSuccess: invalidateStaffData,
    }
  );

  const members = membersQuery.data ?? [];
  const invitations = invitationsQuery.data ?? [];
  const auditLogs = auditQuery.data ?? [];

  const [editingStaff, setEditingStaff] = useState<
    (typeof members)[number] | null
  >(null);
  const [deletingStaff, setDeletingStaff] = useState<
    (typeof members)[number] | null
  >(null);
  const [editRole, setEditRole] = useState<StaffRole>("APPOINTMENT_HANDLER");

  const { data: session } = authClient.useSession();
  const currentUserId = session?.user?.id;

  const pendingInvitations = invitations.filter(
    (invitation) => invitation.status === "pending"
  );
  const filteredMembers = useMemo(
    () =>
      members.filter((member) => {
        const target = [member.name, member.email, member.role]
          .join(" ")
          .toLowerCase();

        return (
          (roleFilter === "all" || member.role === roleFilter) &&
          target.includes(query.toLowerCase().trim())
        );
      }),
    [members, query, roleFilter]
  );
  const selectedStaff =
    members.find((member) => member.id === selectedStaffId) ??
    members[0] ??
    null;
  const verifiedCount = members.filter((member) => member.emailVerified).length;

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
      name,
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
    <div className="space-y-7 p-5 lg:p-8">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_330px]">
        <div className="overflow-hidden rounded-xl bg-[#002a52] p-7 text-white shadow-sm">
          <p className="font-headline text-2xl font-black">
            Staff Workforce Overview
          </p>
          <p className="mt-2 max-w-2xl text-sm font-medium text-white/65">
            Real-time status of clinical and administrative personnel across all
            active departments.
          </p>
          <div className="mt-7 grid gap-5 sm:grid-cols-3">
            <HeroMetric label="Total active" value={members.length} />
            <HeroMetric label="Verified staff" value={verifiedCount} />
            <HeroMetric
              label="Pending invites"
              value={pendingInvitations.length}
            />
          </div>
        </div>

        <div className="rounded-xl border-l-4 border-secondary bg-surface-container-lowest p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
            <BriefcaseMedical size={20} />
          </div>
          <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-primary">
            Critical role
          </p>
          <h3 className="mt-2 font-headline text-lg font-black text-on-surface">
            Shift Coverage Gap
          </h3>
          <p className="mt-2 text-sm font-medium leading-6 text-on-surface-variant">
            {pendingInvitations.length > 0
              ? `${pendingInvitations.length} pending staff invitation${
                  pendingInvitations.length === 1 ? "" : "s"
                } require follow-up before roster close.`
              : "All invited staff have responded. Continue auditing roster coverage by role."}
          </p>
          <button
            className="mt-5 inline-flex items-center gap-2 text-xs font-black text-primary"
            type="button"
          >
            Resolve Staffing Alert
            <ArrowRight size={14} />
          </button>
        </div>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {["all", ...roleOptions].map((option) => (
            <button
              className={`rounded-lg px-3 py-2 text-xs font-black transition ${
                roleFilter === option
                  ? "bg-primary text-white"
                  : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
              }`}
              key={option}
              onClick={() => setRoleFilter(option)}
              type="button"
            >
              {option === "all" ? "All Staff" : formatRole(option)}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-outline"
              size={14}
            />
            <input
              className="w-72 rounded-lg border border-outline-variant/20 bg-white py-2 pl-9 pr-3 text-xs font-semibold text-on-surface outline-none focus:border-primary"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search staff members..."
              value={query}
            />
          </span>
          <button
            className="inline-flex items-center gap-2 rounded-lg bg-surface-container-low px-3 py-2 text-xs font-black text-on-surface transition hover:bg-surface-container-high"
            type="button"
          >
            <Filter size={14} />
            Advanced Filters
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-black text-white shadow-sm transition hover:scale-[0.99]"
            onClick={() => {
              setCredentialPreview(null);
              setIsEntryDialogOpen(true);
            }}
            type="button"
          >
            <UserPlus size={14} />
            New Entry
          </button>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <section className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest shadow-sm">
            <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr_auto] gap-4 border-t border-outline-variant/15 bg-surface-container-low px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-on-surface-variant">
              <span>Name & Identifier</span>
              <span>Department</span>
              <span>Access Level</span>
              <span>Last Activity</span>
              <span>Actions</span>
            </div>
            <div className="divide-y divide-outline-variant/12">
              {members.slice(0, 6).map((member) => (
                <div
                  className="grid grid-cols-[1.2fr_1fr_1fr_1fr_auto] items-center gap-4 px-5 py-4 text-sm"
                  key={member.id}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <StaffAvatar
                      email={member.email}
                      name={member.name}
                      small
                    />
                    <div className="min-w-0">
                      <p className="truncate font-black text-on-surface">
                        {member.name || member.email}
                      </p>
                      <p className="truncate text-xs text-on-surface-variant">
                        {member.email}
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-on-surface-variant">
                    {departmentFromRole(member.role)}
                  </span>
                  <RolePill role={member.role} />
                  <span className="text-xs font-semibold text-on-surface-variant">
                    {formatDate(member.createdAt)}
                  </span>
                  <div className="flex items-center justify-end gap-1">
                    {member.userId === currentUserId ? (
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-primary">
                        You
                      </span>
                    ) : (
                      <>
                        <button
                          aria-label={`Edit role for ${member.name || member.email}`}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-on-surface-variant transition hover:bg-primary/10 hover:text-primary"
                          onClick={() => {
                            setEditingStaff(member);
                            setEditRole(
                              isStaffRole(member.role)
                                ? member.role
                                : "APPOINTMENT_HANDLER"
                            );
                          }}
                          type="button"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          aria-label={`Delete ${member.name || member.email}`}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-on-surface-variant transition hover:bg-error/10 hover:text-error"
                          onClick={() => setDeletingStaff(member)}
                          type="button"
                        >
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <div className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <h3 className="font-headline text-lg font-black text-on-surface">
                Pending Invitations
              </h3>
            </div>
            <div className="mt-4 space-y-3">
              {invitationsQuery.isPending ? (
                <EmptyState text="Loading invitations..." compact />
              ) : pendingInvitations.length === 0 ? (
                <EmptyState text="No pending invitations." compact />
              ) : (
                pendingInvitations.map((invitation) => (
                  <div
                    className="rounded-lg border border-outline-variant/15 bg-surface-container-low p-4"
                    key={invitation.id}
                  >
                    <p className="truncate text-sm font-black text-on-surface">
                      {invitation.email}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <RolePill role={invitation.role} />
                      <span className="rounded-full bg-secondary-container/35 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-secondary">
                        {invitation.status}
                      </span>
                    </div>
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

          <div className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-sm">
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
                    className="rounded-lg border border-outline-variant/15 bg-surface-container-low p-4"
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

      {isEntryDialogOpen ? (
        <div className="erp-dialog-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            aria-modal="true"
            className="w-full max-w-lg rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-2xl"
            role="dialog"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white">
                  <UserPlus size={20} />
                </div>
                <div>
                  <h3 className="font-headline text-xl font-black text-on-surface">
                    Add Staff Entry
                  </h3>
                  <p className="mt-1 text-sm font-medium text-on-surface-variant">
                    Invite a person and assign their organization role.
                  </p>
                </div>
              </div>
              <button
                aria-label="Close staff entry dialog"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-container-low text-on-surface-variant transition hover:bg-surface-container-high"
                onClick={() => {
                  setCredentialPreview(null);
                  setIsEntryDialogOpen(false);
                }}
                type="button"
              >
                <X size={17} />
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleInvite}>
              <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-on-surface-variant">
                Staff Name
                <input
                  autoFocus
                  className="mt-2 w-full rounded-lg border border-outline-variant/25 bg-surface px-3 py-3 text-sm font-semibold normal-case tracking-normal text-on-surface outline-none transition focus:border-primary"
                  onChange={(event) => setName(event.target.value)}
                  placeholder="staff name"
                  type="text"
                  value={name}
                />
              </label>

              <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-on-surface-variant">
                Staff Email
                <input
                  className="mt-2 w-full rounded-lg border border-outline-variant/25 bg-surface px-3 py-3 text-sm font-semibold normal-case tracking-normal text-on-surface outline-none transition focus:border-primary"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="staff@organization.com"
                  type="email"
                  value={email}
                />
              </label>

              <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-on-surface-variant">
                Assign Role
                <select
                  className="mt-2 w-full rounded-lg border border-outline-variant/25 bg-surface px-3 py-3 text-sm font-semibold normal-case tracking-normal text-on-surface outline-none transition focus:border-primary"
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

              {credentialPreview?.temporaryCredentials ? (
                <div className="rounded-xl border border-secondary/20 bg-secondary/10 p-4 text-sm">
                  <p className="font-headline text-base font-black text-on-surface">
                    Staff login credentials generated
                  </p>
                  <p className="mt-1 font-medium text-on-surface-variant">
                    The invite email now asks the staff member to confirm access
                    first. After confirmation, their status changes from pending
                    to on duty.
                  </p>
                  <div className="mt-3 space-y-2 rounded-lg bg-white/70 p-3 font-mono text-xs font-bold text-on-surface">
                    <p>Email: {credentialPreview.temporaryCredentials.email}</p>
                    <p>
                      Password:{" "}
                      {credentialPreview.temporaryCredentials.password}
                    </p>
                    <p>Confirm: {credentialPreview.confirmationUrl}</p>
                    <p>Login: {credentialPreview.loginUrl}</p>
                  </div>
                </div>
              ) : null}

              {inviteMutation.isError ? (
                <p className="rounded-lg bg-error-container/30 px-3 py-2 text-sm font-semibold text-error">
                  {inviteMutation.error.message || "Unable to invite staff."}
                </p>
              ) : null}

              <div className="grid gap-3 pt-2 sm:grid-cols-2">
                <button
                  className="rounded-lg border border-outline-variant/25 px-4 py-3 text-sm font-black text-on-surface transition hover:bg-surface-container-low"
                  onClick={() => {
                    setCredentialPreview(null);
                    setIsEntryDialogOpen(false);
                  }}
                  type="button"
                >
                  {credentialPreview?.temporaryCredentials ? "Done" : "Cancel"}
                </button>
                <button
                  className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-black text-white shadow-md transition hover:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={
                    inviteMutation.isPending ||
                    !email.trim() ||
                    Boolean(credentialPreview?.temporaryCredentials)
                  }
                  type="submit"
                >
                  <Mail size={16} />
                  {inviteMutation.isPending ? "Adding..." : "Add Person"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* Edit Staff Dialog */}
      {editingStaff ? (
        <div className="erp-dialog-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            aria-modal="true"
            className="w-full max-w-lg rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            role="dialog"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white">
                  <Edit3 size={20} />
                </div>
                <div>
                  <h3 className="font-headline text-xl font-black text-on-surface">
                    Edit Staff Role
                  </h3>
                  <p className="mt-1 text-sm font-medium text-on-surface-variant">
                    Change access privileges and role assignment for this user.
                  </p>
                </div>
              </div>
              <button
                aria-label="Close edit staff dialog"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-container-low text-on-surface-variant transition hover:bg-surface-container-high"
                onClick={() => setEditingStaff(null)}
                type="button"
              >
                <X size={17} />
              </button>
            </div>

            <div className="mt-6 rounded-xl bg-surface-container-low p-4">
              <div className="flex items-center gap-3">
                <StaffAvatar
                  email={editingStaff.email}
                  name={editingStaff.name || ""}
                  small
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-on-surface">
                    {editingStaff.name || "Unnamed staff"}
                  </p>
                  <p className="truncate text-xs text-on-surface-variant">
                    {editingStaff.email}
                  </p>
                </div>
              </div>
            </div>

            <form
              className="mt-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (updateRoleMutation.isPending) return;
                updateRoleMutation.mutate(
                  {
                    memberId: editingStaff.id,
                    role: editRole,
                  },
                  {
                    onSuccess: () => {
                      setEditingStaff(null);
                    },
                  }
                );
              }}
            >
              <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-on-surface-variant">
                Select New Role
                <select
                  className="mt-2 w-full rounded-lg border border-outline-variant/25 bg-surface px-3 py-3 text-sm font-semibold normal-case tracking-normal text-on-surface outline-none transition focus:border-primary"
                  onChange={(event) =>
                    setEditRole(event.target.value as StaffRole)
                  }
                  value={editRole}
                >
                  {roleOptions.map((roleOption) => (
                    <option key={roleOption} value={roleOption}>
                      {roleLabels[roleOption]}
                    </option>
                  ))}
                </select>
              </label>

              {updateRoleMutation.isError ? (
                <p className="rounded-lg bg-error-container/30 px-3 py-2 text-sm font-semibold text-error">
                  {updateRoleMutation.error.message ||
                    "Unable to update staff role."}
                </p>
              ) : null}

              <div className="grid gap-3 pt-2 sm:grid-cols-2">
                <button
                  className="rounded-lg border border-outline-variant/25 px-4 py-3 text-sm font-black text-on-surface transition hover:bg-surface-container-low"
                  onClick={() => setEditingStaff(null)}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-black text-white shadow-md transition hover:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={updateRoleMutation.isPending}
                  type="submit"
                >
                  {updateRoleMutation.isPending
                    ? "Updating..."
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* Delete Staff Dialog */}
      {deletingStaff ? (
        <div className="erp-dialog-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            aria-modal="true"
            className="w-full max-w-lg rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            role="dialog"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-error/10 text-error">
                  <Trash2 size={20} />
                </div>
                <div>
                  <h3 className="font-headline text-xl font-black text-error">
                    Remove Staff Member
                  </h3>
                  <p className="mt-1 text-sm font-medium text-on-surface-variant">
                    This action is irreversible. All clinical access will be
                    revoked.
                  </p>
                </div>
              </div>
              <button
                aria-label="Close delete staff dialog"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-container-low text-on-surface-variant transition hover:bg-surface-container-high"
                onClick={() => setDeletingStaff(null)}
                type="button"
              >
                <X size={17} />
              </button>
            </div>

            <div className="mt-6 rounded-xl border border-error/15 bg-error-container/5 p-4">
              <p className="text-sm font-semibold text-on-surface">
                Are you sure you want to permanently remove this staff member?
              </p>
              <div className="mt-3 flex items-center gap-3 rounded-lg bg-white/50 p-3">
                <StaffAvatar
                  email={deletingStaff.email}
                  name={deletingStaff.name || ""}
                  small
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-on-surface">
                    {deletingStaff.name || "Unnamed staff"}
                  </p>
                  <p className="truncate text-xs text-on-surface-variant">
                    {deletingStaff.email}
                  </p>
                </div>
              </div>
            </div>

            {removeStaffMutation.isError ? (
              <p className="mt-4 rounded-lg bg-error-container/30 px-3 py-2 text-sm font-semibold text-error">
                {removeStaffMutation.error.message || "Unable to remove staff."}
              </p>
            ) : null}

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                className="rounded-lg border border-outline-variant/25 px-4 py-3 text-sm font-black text-on-surface transition hover:bg-surface-container-low"
                onClick={() => setDeletingStaff(null)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="flex items-center justify-center gap-2 rounded-lg bg-error px-4 py-3 text-sm font-black text-white shadow-md transition hover:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={removeStaffMutation.isPending}
                onClick={() => {
                  removeStaffMutation.mutate(
                    {
                      memberId: deletingStaff.id,
                    },
                    {
                      onSuccess: () => {
                        setDeletingStaff(null);
                      },
                    }
                  );
                }}
                type="button"
              >
                {removeStaffMutation.isPending ? "Removing..." : "Delete Staff"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function HeroMetric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/45">
        {label}
      </p>
      <p className="mt-1 font-headline text-4xl font-black text-white">
        {value}
      </p>
    </div>
  );
}

function StaffAvatar({
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
      className={`flex shrink-0 items-center justify-center rounded-full bg-primary/10 font-black uppercase text-primary ${
        small ? "h-9 w-9 text-xs" : "h-12 w-12 text-sm"
      }`}
    >
      {getInitials(name, email)}
    </div>
  );
}

function InfoBox({
  label,
  value,
  valueTone = "default",
}: {
  label: string;
  value: string;
  valueTone?: "default" | "good" | "muted";
}) {
  const tone =
    valueTone === "good"
      ? "text-secondary"
      : valueTone === "muted"
        ? "text-outline"
        : "text-on-surface";

  return (
    <div className="rounded-lg bg-surface-container-low px-3 py-2">
      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-on-surface-variant">
        {label}
      </p>
      <p className={`mt-1 truncate text-xs font-black ${tone}`}>{value}</p>
    </div>
  );
}

function SmallAction({ label }: { label: string }) {
  return (
    <span className="text-[10px] font-black uppercase tracking-[0.12em] text-primary">
      {label}
    </span>
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

function RolePill({ role }: { role: string }) {
  return (
    <span className="w-fit rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-primary">
      {formatRole(role)}
    </span>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-surface-container-low px-3 py-2.5">
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

function departmentFromRole(role: string) {
  if (role === "APPOINTMENT_HANDLER") {
    return "Appointments";
  }

  if (role === "COMMUNITY_MANAGER") {
    return "Community";
  }

  return "Administration";
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
