"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import type { ErpTenantContext } from "@/features/dashboard/lib/erp-tenant";
import { diagnosticPermissions } from "@/features/dashboard/lib/diagnostics";
import { virujBackend } from "@/lib/viruj-backend";

export function DiagnosticPublishingStatus({
  tenant,
}: {
  tenant: ErpTenantContext;
}) {
  const branches = useQuery({
    queryKey: ["diagnostic-availability", tenant.organizationId, "branches"],
    queryFn: () => virujBackend.diagnostics.branches(tenant.organizationId),
  });
  const visible =
    branches.data?.filter(
      (branch) => branch.published && !branch.publicationIssues?.length
    ).length ?? 0;
  return (
    <section
      aria-label="Patient app publishing"
      className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card p-5"
    >
      <div className="space-y-1">
        <h2 className="font-semibold">Patient app publishing</h2>
        {branches.isPending ? (
          <p role="status" className="text-sm text-muted-foreground">
            Loading publication status…
          </p>
        ) : branches.isError ? (
          <p role="alert" className="text-sm text-destructive">
            Publication status could not be loaded.
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            {visible
              ? `${visible} ${visible === 1 ? "branch is" : "branches are"} published for nearby patients.`
              : "Your centre is not visible in the patient app yet. Complete setup, add active services, save the branch location, then publish."}
          </p>
        )}
      </div>
      {diagnosticPermissions(tenant.role).catalogue && (
        <Link
          href={tenant.buildRoute("facilities")}
          className="inline-flex min-h-11 items-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Manage app publishing
        </Link>
      )}
    </section>
  );
}
