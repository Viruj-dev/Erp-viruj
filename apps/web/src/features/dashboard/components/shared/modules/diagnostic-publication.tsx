"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import type { DiagnosticBranch } from "@/features/dashboard/lib/diagnostic-bookings";
import { diagnosticPermissions } from "@/features/dashboard/lib/diagnostics";
import type { ErpTenantContext } from "@/features/dashboard/lib/erp-tenant";
import { virujBackend } from "@/lib/viruj-backend";

export function DiagnosticPublication({
  tenant,
}: {
  tenant: ErpTenantContext;
}) {
  const client = useQueryClient();
  const branchKey = [
    "diagnostic-availability",
    tenant.organizationId,
    "branches",
  ];
  const branches = useQuery({
    queryKey: branchKey,
    queryFn: () => virujBackend.diagnostics.branches(tenant.organizationId),
  });
  const services = useQuery({
    queryKey: virujBackend.diagnostics.key(tenant.organizationId, "services"),
    queryFn: () => virujBackend.diagnostics.services(tenant.organizationId),
  });
  const publication = useMutation({
    mutationFn: (branch: DiagnosticBranch) =>
      virujBackend.diagnostics.saveBranch(
        tenant.organizationId,
        { ...branch, published: !branch.published },
        branch.id
      ),
    onSuccess: () => client.invalidateQueries({ queryKey: branchKey }),
  });
  const activeServices =
    services.data?.filter((service) => service.active).length ?? 0;
  const manage = diagnosticPermissions(tenant.role).catalogue;

  return (
    <section
      aria-label="Mobile app publishing"
      className="space-y-4 rounded-2xl border border-[var(--onboarding-border)] bg-[var(--onboarding-panel)] p-5"
    >
      <h2 className="font-semibold">Mobile app publishing</h2>
      <p className="text-sm text-muted-foreground">
        Publish a branch to show your centre profile, contact details, and
        active tests with prices in the mobile app. Saved changes appear
        automatically while the branch is published. Add appointment slots for
        booking.
      </p>
      {branches.isPending || services.isPending ? (
        <p role="status">Loading publication status…</p>
      ) : branches.isError || services.isError ? (
        <div role="alert">
          <p>Unable to load publication status.</p>
          <Button
            variant="outline"
            onClick={() => {
              void branches.refetch();
              void services.refetch();
            }}
          >
            Try again
          </Button>
        </div>
      ) : (
        <>
          <p className="text-sm">
            Active tests in your catalogue: {activeServices}.
          </p>
          {!activeServices && (
            <p className="text-sm text-muted-foreground">
              Add or activate a test in Services before publishing. Branches
              without active tests do not appear in the app.
            </p>
          )}
          {!branches.data.length && (
            <p className="text-sm">
              Complete organization setup or add a branch before publishing.
            </p>
          )}
          {branches.data.map((branch) => (
            <div
              key={branch.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"
            >
              <div>
                <h3 className="text-sm font-semibold">{branch.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {branch.address}
                </p>
                <p className="text-sm">
                  {branch.published
                    ? "Published to mobile app"
                    : "Private · ERP only"}
                </p>
              </div>
              {manage && (
                <Button
                  variant={branch.published ? "outline" : "default"}
                  aria-label={`${branch.published ? "Unpublish" : "Publish"} ${branch.name} ${branch.published ? "from" : "to"} mobile app`}
                  disabled={
                    publication.isPending ||
                    (!branch.published && !activeServices)
                  }
                  onClick={() => publication.mutate(branch)}
                >
                  {publication.isPending &&
                  publication.variables.id === branch.id
                    ? "Saving…"
                    : branch.published
                      ? "Unpublish"
                      : "Publish to mobile app"}
                </Button>
              )}
            </div>
          ))}
        </>
      )}
      {publication.isError && (
        <p role="alert" className="text-sm text-destructive">
          {publication.error.message}
        </p>
      )}
      {publication.isSuccess && (
        <p role="status" className="text-sm">
          {publication.data.name}{" "}
          {publication.data.published
            ? "published to the mobile app."
            : "removed from mobile app discovery."}
        </p>
      )}
      {manage && (
        <Link
          href={tenant.buildRoute("availability")}
          className="inline-block text-sm underline"
        >
          Manage branches & appointment slots
        </Link>
      )}
    </section>
  );
}
