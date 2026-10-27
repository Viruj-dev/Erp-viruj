"use client";

import { useQueryUserId } from "@/lib/use-realtime-invalidation";
import { PageSkeleton } from "@/features/dashboard/components/shared/page-skeleton";

import {
  ProfileHero,
  ProfileDetailPanel
} from "../workspace/profile-presentation";
import { formatTime } from "../../hospital/pages/onboarding/time-picker";
import { canManageDiagnosticSetup } from "@/features/dashboard/lib/diagnostic-onboarding";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Building2, MapPin, Clock3, Phone, ArrowUpRight } from "lucide-react";
import type { ErpTenantContext } from "@/features/dashboard/lib/erp-tenant";
import { diagnosticSetupKey } from "@/features/dashboard/lib/diagnostic-onboarding";
import { virujBackend } from "@/lib/viruj-backend";
import { DiagnosticPublication } from "./diagnostic-publication";

export function DiagnosticProfile({ tenant }: { tenant: ErpTenantContext }) {
  const userId = useQueryUserId();
  const pathology = tenant.providerType === "pathology";
  const query = useQuery({
    queryKey: diagnosticSetupKey(userId, tenant.organizationId),
    queryFn: () => virujBackend.diagnostics.onboarding(tenant.organizationId),
    retry: false
  });
  if (query.isPending) return <PageSkeleton />;
  if (query.isError)
    return (
      <div role="alert" className="space-y-3 p-8">
        <p>Unable to load your profile.</p>
        <button onClick={() => void query.refetch()}>Try again</button>
      </div>
    );
  const data = query.data.data;
  if (!data)
    return (
      <div className="p-8">
        Complete your organization setup to create your profile.{" "}
        <Link className="underline" href={tenant.buildRoute("onboarding")}>
          Open setup
        </Link>
      </div>
    );
  const sections = [
    {
      title: "Organization identity",
      icon: Building2,
      rows: [
        ["Organization", data.centreName],
        ["Legal name", data.legalName],
        ["Registration number", data.registrationNumber],
        ["Issuing authority", data.registrationAuthority],
        ["Established", data.establishedYear],
        ["Accreditations", data.additionalCertificates],
        ["Additional certificate", data.additionalCertificateName]
      ]
    },
    {
      title: "Branch & location",
      icon: MapPin,
      rows: [
        ["Branch", data.branchName],
        ["Address", data.address],
        ["City", data.city],
        ["State", data.state],
        ["PIN code", data.postalCode]
      ]
    },
    {
      title: "Contact details",
      icon: Phone,
      rows: [
        ["Phone", data.phone],
        ["Email", data.email]
      ]
    },
    {
      title: "Opening hours",
      icon: Clock3,
      rows: [
        ["Working days", data.workingDays.join(" · ")],
        [
          "Hours · Asia/Kolkata",
          `${formatTime(data.openingTime)} – ${formatTime(data.closingTime)}`
        ],
        ...(pathology
          ? [
              [
                "Home collection",
                data.homeCollection ? "Available" : "Unavailable"
              ]
            ]
          : [["Visits", "In-person only"]]),
        [
          "Walk-in appointments",
          data.walkIns ? "Welcome" : "Appointment required"
        ]
      ]
    },
    ...(!pathology
      ? [
          {
            title: "Imaging operations",
            icon: Building2,
            rows: [
              ["Modalities", data.modalities.join(" · ")],
              ["Machines, rooms & capacity", data.equipment],
              ["Reporting radiologist", data.reportingName],
              ["Professional registration", data.reportingRegistration],
              ["Reporting email", data.reportingEmail],
              ["Referral policy", data.referralPolicy],
              ["Preparation & safety", data.screeningProcess],
              ["Image & reporting workflow", data.imageWorkflow]
            ]
          }
        ]
      : [])
  ];
  const links = [
    ["Website", data.website],
    ["Instagram", data.instagram],
    ["Facebook", data.facebook],
    ["LinkedIn", data.linkedin],
    ["License / certificate", data.certificateUrl],
    ["Branch map", data.mapsLocation]
  ].filter(([, url]) => url && /^https?:\/\//i.test(url));
  return (
    <div
      className={`vh-onboarding vh-onboarding--${pathology ? "pathology" : "radiology"} mx-auto min-h-full w-[calc(100%-8px)] max-w-[1440px] space-y-6 rounded-[24px] bg-[var(--onboarding-shell)] p-5 text-[var(--onboarding-text)] sm:w-[calc(100%-16px)] lg:w-[calc(100%-24px)] lg:p-8`}
    >
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--onboarding-accent)]">
            {pathology ? "Pathology" : "Radiology"} workspace
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Organization profile
          </h1>
          <p className="mt-2 text-sm text-[var(--onboarding-muted)]">
            Your practice details, kept in sync across this organization.
          </p>
        </div>
        {canManageDiagnosticSetup(tenant.role) && (
          <Link
            href={tenant.buildRoute("onboarding")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--onboarding-accent-deep)] px-4 py-2.5 text-sm font-semibold text-white"
          >
            Edit details
          </Link>
        )}
      </header>
      <ProfileHero
        name={data.centreName}
        logoUrl={
          data.logoUrl && /^https?:\/\//i.test(data.logoUrl)
            ? data.logoUrl
            : undefined
        }
        subtitle={[
          data.city,
          data.state,
          data.establishedYear && `Established ${data.establishedYear}`
        ]
          .filter(Boolean)
          .join(" · ")}
      />
      <DiagnosticPublication key={tenant.organizationId} tenant={tenant} />
      <div className="grid gap-5 lg:grid-cols-2">
        {sections.map(({ title, rows }) => (
          <ProfileDetailPanel
            key={title}
            title={title}
            fields={rows.map(([label, value]) => [label, value] as const)}
          />
        ))}
      </div>
      {links.length > 0 && (
        <section className="rounded-2xl border border-[var(--onboarding-border)] bg-[var(--onboarding-panel)] p-5">
          <h2 className="font-semibold">Online presence & documents</h2>
          <div className="mt-5 flex flex-wrap gap-3">
            {links.map(([label, url]) => (
              <a
                key={label}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border px-4 py-3 text-sm hover:bg-muted"
              >
                {label}
                <ArrowUpRight size={16} />
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
