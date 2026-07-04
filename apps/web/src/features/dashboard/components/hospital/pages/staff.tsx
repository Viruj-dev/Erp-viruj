"use client";

import { DashboardPageShell } from "@/features/dashboard/components/shared/dashboard-page-shell";
import { authClient } from "@/lib/auth-client";
import { virujBackend } from "@/lib/viruj-backend";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  Clock,
  Edit3,
  Filter,
  Search,
  Trash2,
  UserPlus,
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  AddStaffEntryDialog,
  DeleteStaffDialog,
  departmentFromRole,
  EmptyState,
  EditStaffRoleDialog,
  formatAuditAction,
  formatDate,
  formatRole,
  HeroMetric,
  isStaffRole,
  RolePill,
  StaffAvatar,
  type StaffInviteResult,
  type StaffOnboarding,
  type StaffRole,
} from "./_documents";

export function ErpDemoStaff({
  organizationLabel,
}: {
  organizationLabel: string;
}) {
  const queryClient = useQueryClient();
  const theme = getStaffWorkspaceTheme(organizationLabel);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [credentialPreview, setCredentialPreview] =
    useState<StaffOnboarding | null>(null);
  const [role, setRole] = useState<StaffRole>("DOCTOR");
  const [roleFilter, setRoleFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
  const activeOrganizationState = authClient.useActiveOrganization();
  const { data: session } = authClient.useSession();
  const activeOrganizationId =
    getSessionOrganizationId(session) ?? activeOrganizationState.data?.id;
  const activeOrganizationType =
    getSessionOrganizationType(session) ??
    activeOrganizationState.data?.organizationType;
  const availableRoleOptions = useMemo(
    () => getRoleOptionsForOrganization(activeOrganizationType),
    [activeOrganizationType]
  );

  useEffect(() => {
    if (!availableRoleOptions.includes(role)) {
      setRole(availableRoleOptions[0] ?? "STAFF");
    }

    if (roleFilter !== "all" && !availableRoleOptions.includes(roleFilter as StaffRole)) {
      setRoleFilter("all");
    }
  }, [availableRoleOptions, role, roleFilter]);

  const membersQuery = useQuery({
    enabled: Boolean(activeOrganizationId),
    queryFn: () =>
      virujBackend.staff.listMembers({ organizationId: activeOrganizationId }),
    queryKey: virujBackend.staff.membersKey(activeOrganizationId),
  });
  const invitationsQuery = useQuery({
    enabled: Boolean(activeOrganizationId),
    queryFn: () =>
      virujBackend.staff.listInvitations({
        organizationId: activeOrganizationId,
      }),
    queryKey: virujBackend.staff.invitationsKey(activeOrganizationId),
  });
  const auditQuery = useQuery({
    enabled: Boolean(activeOrganizationId),
    queryFn: () => virujBackend.audit.recent({ organizationId: activeOrganizationId }),
    queryKey: virujBackend.audit.key(activeOrganizationId),
  });
  const invalidateStaffData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: virujBackend.audit.key(activeOrganizationId),
      }),
      queryClient.invalidateQueries({
        queryKey: virujBackend.staff.invitationsKey(activeOrganizationId),
      }),
      queryClient.invalidateQueries({
        queryKey: virujBackend.staff.membersKey(activeOrganizationId),
      }),
    ]);
  };
  const inviteMutation = useMutation({
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
  });
  const updateRoleMutation = useMutation({
    mutationFn: virujBackend.staff.updateRole,
    onSuccess: invalidateStaffData,
  });
  const removeStaffMutation = useMutation({
    mutationFn: virujBackend.staff.remove,
    onSuccess: invalidateStaffData,
  });
  const cancelInvitationMutation = useMutation({
    mutationFn: virujBackend.staff.cancelInvitation,
    onSuccess: invalidateStaffData,
  });

  const members = membersQuery.data ?? [];
  const invitations = invitationsQuery.data ?? [];
  const auditLogs = auditQuery.data ?? [];

  const [editingStaff, setEditingStaff] = useState<
    (typeof members)[number] | null
  >(null);
  const [deletingStaff, setDeletingStaff] = useState<
    (typeof members)[number] | null
  >(null);
  const [editRole, setEditRole] = useState<StaffRole>("DOCTOR");

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
  const verifiedCount = members.filter((member) => member.emailVerified).length;

  const handleInvite = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !activeOrganizationId || inviteMutation.isPending) {
      return;
    }

    inviteMutation.mutate({
      email,
      name,
      organizationId: activeOrganizationId,
      role,
    });
  };

  return (
    <DashboardPageShell
      eyebrow="Staff"
      subtitle="Invite team members, manage role access, and monitor onboarding activity."
      title="Staff Directory"
    >
      <section>
        <div
          className={`overflow-hidden rounded-xl ${theme.hero} p-7 text-white ${theme.shadow}`}
        >
          <p className="font-headline text-2xl font-semibold">
            {theme.title}
          </p>
          <p className="mt-2 max-w-2xl text-sm font-medium text-white/65">
            {theme.description}
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
      </section>

      <section className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
        <div className="flex min-w-0 gap-2 overflow-x-auto pb-1">
          {["all", ...availableRoleOptions].map((option) => (
            <button
              className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semi-bold transition ${
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
        <div className="flex flex-wrap gap-2 xl:justify-end">
          <span className="relative min-w-[min(18rem,100%)] sm:w-72">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-outline"
              size={14}
            />
            <input
              className="h-10 w-full rounded-lg border border-outline-variant/20 bg-white py-2 pl-9 pr-3 text-xs font-semibold text-on-surface outline-none focus:border-primary"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search staff members..."
              value={query}
            />
          </span>
          <button
            className="inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-surface-container-low px-3 py-2 text-xs font-semi-bold text-on-surface transition hover:bg-surface-container-high"
            type="button"
          >
            <Filter size={14} />
            Advanced Filters
          </button>
          <button
            className="inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-primary px-3 py-2 text-xs font-semi-bold text-white shadow-sm transition hover:scale-[0.99]"
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

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
        <div className="space-y-5">
          <section className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest shadow-sm">
            <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr_auto] gap-4 border-t border-outline-variant/15 bg-surface-container-low px-5 py-3 text-[10px] font-semi-bold uppercase tracking-[0.18em] text-on-surface-variant">
              <span>Name & Identifier</span>
              <span>Department</span>
              <span>Access Level</span>
              <span>Last Activity</span>
              <span>Actions</span>
            </div>
            <div className="divide-y divide-outline-variant/12">
              {filteredMembers.slice(0, 6).map((member) => (
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
                      <p className="truncate font-semi-bold text-on-surface">
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
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[9px] font-semi-bold uppercase tracking-[0.14em] text-primary">
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
                              isStaffRole(member.role) &&
                                availableRoleOptions.includes(member.role)
                                ? member.role
                                : (availableRoleOptions[0] ?? "STAFF")
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
              <h3 className="font-headline text-lg font-semi-bold text-on-surface">
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
                    <p className="truncate text-sm font-semi-bold text-on-surface">
                      {invitation.email}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <RolePill role={invitation.role} />
                      <span className="rounded-full bg-secondary-container/35 px-3 py-1 text-[10px] font-semi-bold uppercase tracking-[0.14em] text-secondary">
                        {invitation.status}
                      </span>
                    </div>
                    <button
                      className="mt-3 inline-flex items-center gap-2 rounded-lg border border-error/20 px-3 py-2 text-xs font-semi-bold text-error transition hover:bg-error-container/20 disabled:opacity-60"
                      disabled={cancelInvitationMutation.isPending}
                      onClick={() =>
                        cancelInvitationMutation.mutate({
                          invitationId: invitation.id,
                          organizationId: activeOrganizationId,
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
              <h3 className="font-headline text-lg font-semi-bold text-on-surface">
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
                    <p className="text-sm font-semi-bold text-on-surface">
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
        <AddStaffEntryDialog
          credentialPreview={credentialPreview}
          email={email}
          inviteError={inviteMutation.isError ? inviteMutation.error : null}
          isInvitePending={inviteMutation.isPending}
          name={name}
          onClose={() => {
            setCredentialPreview(null);
            setIsEntryDialogOpen(false);
          }}
          onEmailChange={setEmail}
          onNameChange={setName}
          onRoleChange={setRole}
          onSubmit={handleInvite}
          role={role}
          roleOptions={availableRoleOptions}
        />
      ) : null}

      {editingStaff ? (
        <EditStaffRoleDialog
          editRole={editRole}
          error={updateRoleMutation.isError ? updateRoleMutation.error : null}
          isPending={updateRoleMutation.isPending}
          onClose={() => setEditingStaff(null)}
          onRoleChange={setEditRole}
          roleOptions={availableRoleOptions}
          onSubmit={(event) => {
            event.preventDefault();
            if (updateRoleMutation.isPending) return;
            updateRoleMutation.mutate(
              {
                memberId: editingStaff.id,
                organizationId: activeOrganizationId,
                role: editRole,
              },
              {
                onSuccess: () => setEditingStaff(null),
              }
            );
          }}
          staff={editingStaff}
        />
      ) : null}

      {deletingStaff ? (
        <DeleteStaffDialog
          error={removeStaffMutation.isError ? removeStaffMutation.error : null}
          isPending={removeStaffMutation.isPending}
          onClose={() => setDeletingStaff(null)}
          onDelete={() => {
            removeStaffMutation.mutate(
              {
                memberId: deletingStaff.id,
                organizationId: activeOrganizationId,
              },
              {
                onSuccess: () => setDeletingStaff(null),
              }
            );
          }}
          staff={deletingStaff}
        />
      ) : null}
    </DashboardPageShell>
  );
}

function getSessionOrganizationId(session: unknown) {
  if (
    session &&
    typeof session === "object" &&
    "activeOrganization" in session &&
    session.activeOrganization &&
    typeof session.activeOrganization === "object" &&
    "id" in session.activeOrganization &&
    typeof session.activeOrganization.id === "string"
  ) {
    return session.activeOrganization.id;
  }

  return undefined;
}

function getSessionOrganizationType(session: unknown) {
  if (
    session &&
    typeof session === "object" &&
    "activeOrganization" in session &&
    session.activeOrganization &&
    typeof session.activeOrganization === "object" &&
    "organizationType" in session.activeOrganization &&
    typeof session.activeOrganization.organizationType === "string"
  ) {
    return session.activeOrganization.organizationType;
  }

  return undefined;
}

function getRoleOptionsForOrganization(
  organizationType: string | undefined
): readonly StaffRole[] {
  if (organizationType === "clinic") {
    return [
      "CLINIC_OWNER",
      "CLINIC_ADMIN",
      "CLINIC_STAFF",
      "DOCTOR",
      "RECEPTIONIST",
    ];
  }

  if (organizationType === "doctor") {
    return ["DOCTOR", "RECEPTIONIST", "STAFF"];
  }

  if (organizationType === "pathology" || organizationType === "radiology") {
    return ["ADMIN", "MANAGER", "TECHNICIAN", "RECEPTIONIST", "STAFF"];
  }

  return [
    "ADMIN",
    "APPOINTMENT_HANDLER",
    "COMMUNITY_MANAGER",
    "MANAGER",
    "DOCTOR",
    "STAFF",
    "RECEPTIONIST",
    "TECHNICIAN",
  ];
}

function getStaffWorkspaceTheme(organizationLabel: string) {
  if (organizationLabel.toLowerCase() === "clinic") {
    return {
      description:
        "Real-time status of clinic owners, admins, doctors, reception, and front-desk coverage.",
      hero: "bg-gradient-to-br from-[#35206f] via-[#5b32b4] to-[#8b5cf6]",
      shadow: "shadow-[0_20px_60px_rgba(91,50,180,0.22)]",
      title: "Clinic Staff Overview",
    };
  }

  return {
    description:
      "Real-time status of clinical and administrative personnel across all active departments.",
    hero: "bg-[#002a52]",
    shadow: "shadow-sm",
    title: "Staff Workforce Overview",
  };
}
