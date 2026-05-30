"use client";

import { OrganizationAccessScreen } from "@/features/auth/components/organization-access-screen";
import { ErpDemoAppointments } from "@/features/dashboard/components/appointments";
import { ErpEnterpriseModule } from "@/features/dashboard/components/enterprise-module";
import { ErpDemoPatients } from "@/features/dashboard/components/patients";
import { ErpUserProfilePage } from "@/features/dashboard/components/profile-page";
import { ErpDemoSidebar } from "@/features/dashboard/components/sidebar";
import { ErpDemoTopBar } from "@/features/dashboard/components/top-bar";
import type { ErpDemoPage } from "@/features/dashboard/components/types";
import {
  buildDashboardPath,
  buildTenantDashboardPath,
  isDashboardOrganizationType,
  isDashboardPage,
  organizationTypeLabels,
  resolveAccessibleDashboardPage,
} from "@/features/dashboard/lib/routing";
import { LoadingScreen } from "@/features/shell/components/loading-screen";
import {
  authClient,
  setActiveOrganization,
} from "@/lib/auth-client";
import { AnimatePresence, motion } from "framer-motion";
import {
  BadgeIndianRupee,
  CalendarCheck,
  Clock3,
  FileText,
  MessageSquareText,
  Stethoscope,
  UserRoundCheck,
  Video,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";

const doctorAllowedPages: ErpDemoPage[] = [
  "dashboard",
  "appointments",
  "appointments-dashboard",
  "appointments-review",
  "patients",
  "reports",
  "profile",
];

export function DoctorHomeScreen({
  currentPage: requestedPage,
}: {
  currentPage: string;
  routeOrganizationType?: string;
}) {
  const router = useRouter();
  const [isActivatingOnlyOrganization, setIsActivatingOnlyOrganization] =
    useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const sessionState = authClient.useSession();
  const activeMemberState = authClient.useActiveMember();
  const activeOrganizationState = authClient.useActiveOrganization();
  const organizationsState = authClient.useListOrganizations();
  const isAuthPending =
    sessionState.isPending ||
    organizationsState.isPending ||
    activeOrganizationState.isPending ||
    activeMemberState.isPending;

  useEffect(() => {
    const activeOrganizationId = activeOrganizationState.data?.id;
    const organizations = organizationsState.data ?? [];

    if (
      !sessionState.data?.user ||
      activeOrganizationId ||
      organizations.length !== 1 ||
      isActivatingOnlyOrganization ||
      !setActiveOrganization
    ) {
      return;
    }

    setIsActivatingOnlyOrganization(true);
    void setActiveOrganization({
      organizationId: organizations[0].id,
    })
      .then(() =>
        Promise.all([
          sessionState.refetch(),
          activeOrganizationState.refetch(),
          activeMemberState.refetch(),
        ])
      )
      .finally(() => setIsActivatingOnlyOrganization(false));
  }, [
    activeMemberState,
    activeOrganizationState.data?.id,
    activeOrganizationState,
    isActivatingOnlyOrganization,
    organizationsState.data,
    sessionState.data?.user,
    sessionState,
  ]);

  const currentPage = isErpDemoPage(requestedPage)
    ? requestedPage
    : "dashboard";
  const activeMember = activeMemberState.data;
  const activeOrganization = activeOrganizationState.data;
  const activeOrganizationType =
    activeOrganization?.organizationType &&
    isDashboardOrganizationType(activeOrganization.organizationType)
      ? activeOrganization.organizationType
      : null;
  const activeOrganizationSlug = getOrganizationSlug(activeOrganization);
  const resolvedPage = resolveDoctorPage(
    resolveAccessibleDashboardPage(currentPage, activeMember?.role)
  );
  const userName =
    sessionState.data?.user?.name ||
    sessionState.data?.user?.email ||
    "Doctor";
  const roleLabel = activeMember?.role
    ? activeMember.role.replace(/_/g, " ")
    : "doctor";
  const organizationLabel = organizationTypeLabels.doctor;

  useEffect(() => {
    if (!isHydrated || isAuthPending) {
      return;
    }

    if (!sessionState.data?.user) {
      router.replace("/auth");
    }
  }, [isAuthPending, isHydrated, router, sessionState.data?.user]);

  useEffect(() => {
    if (!isHydrated || isAuthPending || !activeOrganization || !activeMember) {
      return;
    }

    if (activeOrganizationType && activeOrganizationType !== "doctor") {
      router.replace(buildDashboardPath(activeOrganizationType));
      return;
    }

    const expectedPath = activeOrganizationSlug
      ? buildTenantDashboardPath("doctor", activeOrganizationSlug, resolvedPage)
      : buildDashboardPath("doctor", resolvedPage);

    if (requestedPage !== resolvedPage) {
      router.replace(expectedPath);
    }
  }, [
    activeMember,
    activeOrganization,
    activeOrganizationSlug,
    activeOrganizationType,
    isAuthPending,
    isHydrated,
    requestedPage,
    resolvedPage,
    router,
  ]);

  if (!isHydrated || isAuthPending) {
    return <LoadingScreen />;
  }

  if (!sessionState.data?.user) {
    return <LoadingScreen />;
  }

  if (activeOrganizationType && activeOrganizationType !== "doctor") {
    return <LoadingScreen />;
  }

  if (!activeOrganizationState.data || !activeMemberState.data) {
    return (
      <OrganizationAccessScreen
        isLoading={organizationsState.isPending}
        onRefresh={async () => {
          await organizationsState.refetch();
          await sessionState.refetch();
          await activeOrganizationState.refetch();
          await activeMemberState.refetch();
        }}
        onSelectOrganization={async (organizationId) => {
          if (!setActiveOrganization) {
            return;
          }

          const selectedOrganization = organizationsState.data?.find(
            (organization) => organization.id === organizationId
          );

          await setActiveOrganization({ organizationId });
          await sessionState.refetch();
          await activeOrganizationState.refetch();
          await activeMemberState.refetch();

          if (
            selectedOrganization?.organizationType &&
            isDashboardOrganizationType(selectedOrganization.organizationType)
          ) {
            router.replace(
              buildDashboardPath(selectedOrganization.organizationType)
            );
          }
        }}
        onSignOut={async () => {
          setIsSigningOut(true);
          try {
            await authClient.signOut();
            await sessionState.refetch();
            await activeOrganizationState.refetch();
            await activeMemberState.refetch();
          } finally {
            setIsSigningOut(false);
          }
        }}
        organizations={organizationsState.data ?? []}
        signingOut={isSigningOut}
        userEmail={sessionState.data.user?.email ?? ""}
      />
    );
  }

  return (
    <div className="flex h-screen min-h-screen bg-surface text-on-surface selection:bg-primary/15 selection:text-primary transition-colors dark:bg-[#0b0d10] dark:text-slate-100">
      <ErpDemoSidebar
        allowedPages={doctorAllowedPages}
        currentPage={resolvedPage}
        isCollapsed={isSidebarCollapsed}
        onLogout={async () => {
          setIsSigningOut(true);
          try {
            await authClient.signOut();
            await sessionState.refetch();
            await activeOrganizationState.refetch();
            await activeMemberState.refetch();
          } finally {
            setIsSigningOut(false);
          }
        }}
        onPageChange={(page) => {
          const doctorPage = resolveDoctorPage(page);
          router.push(
            activeOrganizationSlug
              ? buildTenantDashboardPath("doctor", activeOrganizationSlug, doctorPage)
              : buildDashboardPath("doctor", doctorPage)
          );
        }}
        onToggle={() => setIsSidebarCollapsed((value) => !value)}
        organizationLabel={organizationLabel}
      />
      <main
        className={`flex h-screen min-w-0 flex-1 flex-col overflow-hidden transition-all duration-300 ${
          isSidebarCollapsed ? "lg:ml-28" : "lg:ml-80"
        }`}
      >
        <ErpDemoTopBar
          currentPage={resolvedPage}
          organizationLabel={organizationLabel}
          roleLabel={roleLabel}
          userName={userName}
          onNavigateToProfile={() => {
            router.push(
              activeOrganizationSlug
                ? buildTenantDashboardPath("doctor", activeOrganizationSlug, "profile")
                : buildDashboardPath("doctor", "profile")
            );
          }}
          onLogout={async () => {
            setIsSigningOut(true);
            try {
              await authClient.signOut();
              await sessionState.refetch();
              await activeOrganizationState.refetch();
              await activeMemberState.refetch();
            } finally {
              setIsSigningOut(false);
            }
          }}
        />
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={resolvedPage}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto flex min-h-full w-full max-w-full p-5 lg:p-8"
              exit={{ opacity: 0, y: -12 }}
              initial={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex min-h-full w-full flex-col overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/88 shadow-sm ring-1 ring-white/60 backdrop-blur dark:border-white/[0.08] dark:bg-[#111418] dark:ring-white/[0.03]">
                <DoctorPageContent
                  currentPage={resolvedPage}
                  roleLabel={roleLabel}
                  userName={userName}
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function DoctorPageContent({
  currentPage,
  roleLabel,
  userName,
}: {
  currentPage: ErpDemoPage;
  roleLabel: string;
  userName: string;
}) {
  switch (currentPage) {
    case "appointments":
    case "appointments-dashboard":
      return <ErpDemoAppointments section="dashboard" />;
    case "appointments-review":
      return <ErpDemoAppointments section="review" />;
    case "patients":
      return <ErpDemoPatients />;
    case "reports":
      return <ErpEnterpriseModule module="reports" roleLabel={roleLabel} />;
    case "profile":
      return <ErpUserProfilePage />;
    case "dashboard":
    default:
      return <DoctorDashboard userName={userName} roleLabel={roleLabel} />;
  }
}

function DoctorDashboard({
  roleLabel,
  userName,
}: {
  roleLabel: string;
  userName: string;
}) {
  return (
    <div className="space-y-8 p-6 lg:p-10">
      <section className="grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
        <div className="overflow-hidden rounded-[2rem] bg-[#0f766e] p-8 text-white shadow-[0_24px_80px_rgba(15,118,110,0.24)]">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/70">
            Individual doctor workspace
          </p>
          <h1 className="mt-4 max-w-3xl font-headline text-4xl font-semibold leading-tight lg:text-5xl">
            {userName}, your consultations, patients, and earnings are in one place.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/78">
            Manage independent practice operations today, while staying ready
            to work across clinics and hospitals later.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <MetricChip label="Consults today" value="12" />
            <MetricChip label="Open follow-ups" value="08" />
            <MetricChip label="Available slots" value="26" />
          </div>
        </div>

        <div className="rounded-[2rem] border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-sm dark:border-white/[0.08] dark:bg-[#14171b]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-on-surface-variant">
                Verification
              </p>
              <h2 className="mt-2 font-headline text-2xl font-semibold text-on-surface dark:text-slate-100">
                Practice readiness
              </h2>
            </div>
            <Stethoscope className="text-primary" size={24} />
          </div>
          <div className="mt-6 space-y-3">
            <ReadinessRow label="Profile published" value="Ready" />
            <ReadinessRow label="KYC status" value="Pending review" />
            <ReadinessRow label="Consultation fee" value="INR 900" />
            <ReadinessRow label="Session role" value={formatRole(roleLabel)} />
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <DoctorStatCard
          icon={<CalendarCheck size={18} />}
          label="Appointments"
          note="5 waiting for confirmation"
          value="34"
        />
        <DoctorStatCard
          icon={<Video size={18} />}
          label="Online consults"
          note="Next session at 11:30 AM"
          value="09"
        />
        <DoctorStatCard
          icon={<BadgeIndianRupee size={18} />}
          label="Earnings"
          note="Available for payout"
          value="INR 18.4k"
        />
        <DoctorStatCard
          icon={<UserRoundCheck size={18} />}
          label="Patient panel"
          note="12 new this month"
          value="248"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <DoctorPanel
          eyebrow="Today"
          title="Consultation queue"
          description="Focused view for independent doctor operations."
        >
          <div className="space-y-3">
            <ActivityRow
              badge="11:30"
              detail="Online consultation | Fever and fatigue"
              title="Amit Verma"
            />
            <ActivityRow
              badge="12:15"
              detail="Clinic consultation | Follow-up for hypertension"
              title="Sunita Iyer"
            />
            <ActivityRow
              badge="02:00"
              detail="Online consultation | Prescription renewal"
              title="Neha Sharma"
            />
          </div>
        </DoctorPanel>

        <DoctorPanel
          eyebrow="Clinical work"
          title="Open actions"
          description="Prescriptions, follow-ups, and patient messages that need attention."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <QuickAction icon={<FileText size={18} />} label="Prescription" />
            <QuickAction icon={<Clock3 size={18} />} label="Follow-up" />
            <QuickAction icon={<MessageSquareText size={18} />} label="Messages" />
            <QuickAction icon={<BadgeIndianRupee size={18} />} label="Payouts" />
          </div>
        </DoctorPanel>
      </section>
    </div>
  );
}

function resolveDoctorPage(page: ErpDemoPage): ErpDemoPage {
  if (doctorAllowedPages.includes(page)) {
    return page;
  }

  return "dashboard";
}

function isErpDemoPage(page: string): page is ErpDemoPage {
  return isDashboardPage(page);
}

function getOrganizationSlug(organization: unknown) {
  if (
    organization &&
    typeof organization === "object" &&
    "slug" in organization &&
    typeof organization.slug === "string"
  ) {
    return organization.slug;
  }

  return null;
}

function formatRole(role: string) {
  return role
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function MetricChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/65">
        {label}
      </p>
      <p className="mt-2 font-headline text-2xl font-semibold">{value}</p>
    </div>
  );
}

function ReadinessRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-surface-container-low px-4 py-3 text-sm dark:bg-white/[0.06]">
      <span className="font-medium text-on-surface-variant dark:text-slate-400">
        {label}
      </span>
      <span className="font-semibold text-on-surface dark:text-slate-100">
        {value}
      </span>
    </div>
  );
}

function DoctorStatCard({
  icon,
  label,
  note,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  note: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-outline-variant/25 bg-surface-container-lowest p-5 shadow-sm dark:border-white/[0.08] dark:bg-[#14171b]">
      <div className="w-fit rounded-2xl bg-emerald-50 p-3 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200">
        {icon}
      </div>
      <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-on-surface-variant dark:text-slate-500">
        {label}
      </p>
      <p className="mt-2 font-headline text-3xl font-semibold text-on-surface dark:text-slate-100">
        {value}
      </p>
      <p className="mt-2 text-sm text-on-surface-variant dark:text-slate-400">
        {note}
      </p>
    </div>
  );
}

function DoctorPanel({
  children,
  description,
  eyebrow,
  title,
}: {
  children: React.ReactNode;
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="rounded-[2rem] border border-outline-variant/25 bg-surface-container-lowest p-6 shadow-sm dark:border-white/[0.08] dark:bg-[#14171b]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-on-surface-variant dark:text-slate-500">
        {eyebrow}
      </p>
      <h3 className="mt-3 font-headline text-2xl font-semibold text-on-surface dark:text-slate-100">
        {title}
      </h3>
      <p className="mt-2 text-sm text-on-surface-variant dark:text-slate-400">
        {description}
      </p>
      <div className="mt-8">{children}</div>
    </div>
  );
}

function ActivityRow({
  badge,
  detail,
  title,
}: {
  badge: string;
  detail: string;
  title: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-[1.25rem] bg-surface-container-low p-4 dark:bg-white/[0.055]">
      <div>
        <p className="font-semibold text-on-surface dark:text-slate-100">
          {title}
        </p>
        <p className="mt-1 text-sm text-on-surface-variant dark:text-slate-400">
          {detail}
        </p>
      </div>
      <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200">
        {badge}
      </span>
    </div>
  );
}

function QuickAction({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      className="flex flex-col items-center justify-center gap-3 rounded-[1.25rem] bg-surface-container-low px-4 py-5 text-sm font-bold text-on-surface transition-transform hover:-translate-y-0.5 hover:bg-surface-container-high dark:bg-white/[0.055] dark:text-slate-100 dark:hover:bg-white/[0.09]"
      type="button"
    >
      <span className="rounded-2xl bg-white p-3 text-emerald-700 shadow-sm dark:bg-white/[0.09] dark:text-emerald-200">
        {icon}
      </span>
      {label}
    </button>
  );
}
