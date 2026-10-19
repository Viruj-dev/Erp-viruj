"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Building2, MapPin, Clock3, Phone, ArrowUpRight } from "lucide-react";
import type { ErpTenantContext } from "@/features/dashboard/lib/erp-tenant";
import { diagnosticSetupKey } from "@/features/dashboard/lib/diagnostic-onboarding";
import { virujBackend } from "@/lib/viruj-backend";

export function PathologyProfile({ tenant }: { tenant: ErpTenantContext }) {
  const query = useQuery({
    queryKey: diagnosticSetupKey(tenant.organizationId),
    queryFn: () => virujBackend.diagnostics.onboarding(tenant.organizationId),
    retry: false,
  });
  if (query.isPending)
    return (
      <p role="status" className="p-8">
        Loading organization profile…
      </p>
    );
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
      ],
    },
    {
      title: "Branch & location",
      icon: MapPin,
      rows: [
        ["Branch", data.branchName],
        ["Address", data.address],
        ["City", data.city],
        ["State", data.state],
        ["PIN code", data.postalCode],
      ],
    },
    {
      title: "Contact details",
      icon: Phone,
      rows: [
        ["Phone", data.phone],
        ["Email", data.email],
      ],
    },
    {
      title: "Opening hours",
      icon: Clock3,
      rows: [
        ["Working days", data.workingDays.join(" · ")],
        ["Hours · Asia/Kolkata", `${data.openingTime} – ${data.closingTime}`],
        ["Home collection", data.homeCollection ? "Available" : "Unavailable"],
        [
          "Walk-in appointments",
          data.walkIns ? "Welcome" : "Appointment required",
        ],
      ],
    },
  ];
  const links = [
    ["Website", data.website],
    ["Instagram", data.instagram],
    ["Facebook", data.facebook],
    ["LinkedIn", data.linkedin],
    ["License / certificate", data.certificateUrl],
    ["Branch map", data.mapsLocation],
  ].filter(([, url]) => url && /^https?:\/\//i.test(url));
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-8">
      <header className="relative overflow-hidden rounded-3xl border border-orange-200 bg-orange-50 p-8 dark:border-orange-900 dark:bg-orange-950/30 sm:p-12">
        <div className="absolute -right-16 -top-24 size-80 rounded-full border-[40px] border-orange-200/40 dark:border-orange-800/20" />
        <div className="relative flex flex-wrap items-center gap-6">
          <div className="flex size-24 items-center justify-center overflow-hidden rounded-2xl border bg-white text-orange-700 shadow-sm">
            {data.logoUrl && /^https?:\/\//i.test(data.logoUrl) ? (
              <Image
                src={data.logoUrl}
                alt={`${data.centreName} logo`}
                width={96}
                height={96}
                unoptimized
                className="size-full object-contain"
              />
            ) : (
              <Building2 size={36} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-700 dark:text-orange-300">
              Pathology · Organization profile
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              {data.centreName}
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              {[
                data.city,
                data.state,
                data.establishedYear && `Established ${data.establishedYear}`,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          <Link
            href={tenant.buildRoute("onboarding")}
            className="rounded-xl bg-orange-700 px-5 py-3 text-sm font-medium text-white hover:bg-orange-800"
          >
            Edit profile
          </Link>
        </div>
      </header>
      <div className="grid gap-5 md:grid-cols-2">
        {sections.map(({ title, icon: Icon, rows }) => (
          <section key={title} className="rounded-2xl border bg-card p-6">
            <h2 className="flex items-center gap-3 text-lg font-semibold">
              <Icon
                size={19}
                className="text-orange-700 dark:text-orange-300"
              />
              {title}
            </h2>
            <dl className="mt-6 space-y-4">
              {rows
                .filter(([, value]) => value)
                .map(([label, value]) => (
                  <div
                    key={label}
                    className="grid grid-cols-[1fr_1.5fr] gap-4 border-b pb-3 last:border-0"
                  >
                    <dt className="text-sm text-muted-foreground">{label}</dt>
                    <dd className="break-words text-sm font-medium">{value}</dd>
                  </div>
                ))}
            </dl>
          </section>
        ))}
      </div>
      {links.length > 0 && (
        <section className="rounded-2xl border bg-card p-6">
          <h2 className="text-lg font-semibold">Online presence & documents</h2>
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
