"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Filter, Loader2, Plus, RadioTower, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { DashboardPageShell } from "@/features/dashboard/components/shared/dashboard-page-shell";
import type { ErpTenantContext } from "@/features/dashboard/lib/erp-tenant";
import {
  DeleteDialog,
  EmptyFacilities,
  FacilitiesLoading,
  FacilityBentoCard,
  FacilityForm,
  FacilityMissing,
  FacilitySkeletonGrid,
  PrimaryButton,
  StatePanel,
  StatCard,
  Toolbar,
  buildFacilityStats,
  emptyFacilities,
  emptyFacilityForm,
  filterAndSortFacilities,
  getFacilityPermissions,
  parseFacilityRoute,
  toFacilityInput,
  type FilterState,
  type SortKey,
} from "@/features/dashboard/components/shared/facilties";
import { authClient } from "@/lib/auth-client";
import { virujBackend, type VirujFacility, type VirujFacilityInput } from "@/lib/viruj-backend";

export function FacilitiesPage({
  catalogKind = "facilities",
  routeBasePath,
  routeSegments,
  tenant,
}: {
  catalogKind?: "facilities" | "services";
  routeBasePath: string;
  routeSegments: string[];
  tenant?: ErpTenantContext | null;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const activeMemberState = authClient.useActiveMember();
  const permissions = getFacilityPermissions(activeMemberState.data?.role);
  const route = parseFacilityRoute(routeSegments, catalogKind);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    availability: "all",
    category: "all",
    featured: "all",
    quick: "all",
    status: "all",
  });
  const [sortKey, setSortKey] = useState<SortKey>("updated");
  const [deleteTarget, setDeleteTarget] = useState<VirujFacility | null>(null);

  const organizationId = tenant?.organizationId;
  const catalogApi = catalogKind === "services" ? virujBackend.services : virujBackend.facilities;
  const catalogLabel = catalogKind === "services" ? "Services" : "Facilities";
  const isClinicTone = tenant?.providerType === "clinic";
  const pageTone = isClinicTone ? "violet" : "blue";
  const publishAllClass = isClinicTone
    ? "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-violet-700 px-4 text-sm font-semi-bold text-white shadow-sm transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-violet-500 dark:hover:bg-violet-400"
    : "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semi-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50";
  const catalogSubtitle = catalogKind === "services"
    ? "A persisted service catalog for patient discovery and booking."
    : "A persisted facility catalog for infrastructure, amenities, and access.";
  const catalogQueryKey = catalogApi.key({ organizationId });

  const facilitiesQuery = useQuery({
    enabled: Boolean(organizationId),
    queryFn: () => catalogApi.list({ organizationId }),
    queryKey: catalogQueryKey,
  });
  const facilities = facilitiesQuery.data ?? emptyFacilities;

  const invalidateFacilities = () =>
    queryClient.invalidateQueries({ queryKey: catalogQueryKey });

  const createMutation = useMutation({
    mutationFn: (input: VirujFacilityInput) => catalogApi.create({ ...input, organizationId }),
    onSuccess: async () => {
      await invalidateFacilities();
      router.push(`${routeBasePath}/${catalogKind}`);
    },
  });
  const updateMutation = useMutation({
    mutationFn: (input: { facility: VirujFacilityInput; id: string }) => catalogApi.update({ ...input, organizationId }),
    onSuccess: async () => {
      await invalidateFacilities();
      router.push(`${routeBasePath}/${catalogKind}`);
    },
  });
  const statusMutation = useMutation({
    mutationFn: (input: { id: string; isAvailable?: boolean; status: VirujFacility["status"] }) => catalogApi.updateStatus({ ...input, organizationId }),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: catalogQueryKey });
      const previous = queryClient.getQueryData<VirujFacility[]>(catalogQueryKey);
      queryClient.setQueryData<VirujFacility[]>(catalogQueryKey, (current) =>
        current?.map((facility) =>
          facility.id === input.id
            ? {
                ...facility,
                isAvailable: input.isAvailable ?? facility.isAvailable,
                status: input.status,
              }
            : facility
        )
      );
      return { previous };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) queryClient.setQueryData(catalogQueryKey, context.previous);
    },
    onSettled: invalidateFacilities,
  });
  const deleteMutation = useMutation({
    mutationFn: (input: { id: string }) => catalogApi.delete({ ...input, organizationId }),
    onSuccess: async () => {
      setDeleteTarget(null);
      await invalidateFacilities();
      if (route.mode !== "list") router.push(`${routeBasePath}/${catalogKind}`);
    },
  });
  const publishAllMutation = useMutation({
    mutationFn: async (services: VirujFacility[]) => {
      await Promise.all(
        services.map((facility) =>
          catalogApi.update({
            facility: {
              ...toFacilityInput(facility),
              isAvailable: true,
              status: "active",
              visibility: "public",
            },
            id: facility.id,
            organizationId,
          })
        )
      );
    },
    onSuccess: invalidateFacilities,
  });

  const filteredFacilities = useMemo(
    () => filterAndSortFacilities(facilities, query, filters, sortKey),
    [facilities, filters, query, sortKey]
  );
  const routeFacility =
    route.mode === "edit"
      ? facilities.find((facility) => facility.id === route.id)
      : null;
  const stats = useMemo(() => buildFacilityStats(facilities), [facilities]);
  const publishableFacilities = useMemo(
    () => facilities.filter((facility) => !(facility.status === "active" && facility.isAvailable && facility.visibility === "public")),
    [facilities]
  );
  const isSaving = createMutation.isPending || updateMutation.isPending;

  function renderCatalog(dimmed = false) {
    return (
      <div aria-hidden={dimmed} className={dimmed ? "pointer-events-none select-none blur-[3px] transition duration-200" : undefined}>
        <DashboardPageShell
          actions={
            permissions.create || permissions.publish ? (
              <div className="flex flex-wrap gap-2">
                {permissions.publish ? (
                  <button
                    className={publishAllClass}
                    disabled={publishAllMutation.isPending || publishableFacilities.length === 0}
                    onClick={() => publishAllMutation.mutate(publishableFacilities)}
                    type="button"
                  >
                    {publishAllMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <RadioTower size={16} />}
                    Publish All
                  </button>
                ) : null}
                {permissions.create ? (
                  <PrimaryButton
                    icon={<Plus size={16} />}
                    label={`Add ${catalogKind === "services" ? "Service" : "Facility"}`}
                    onClick={() => router.push(`${routeBasePath}/${catalogKind}/new`)}
                    tone={isClinicTone ? "violet" : "slate"}
                  />
                ) : null}
              </div>
            ) : null
          }
          eyebrow={catalogLabel}
          framed
          subtitle={catalogSubtitle}
          title={catalogLabel}
          tone={pageTone}
        >
          <section className="space-y-5">
            <Toolbar
              filters={filters}
              onFilterChange={setFilters}
              onQueryChange={setQuery}
              onSortChange={setSortKey}
              query={query}
              sortKey={sortKey}
              tone={pageTone}
            />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <StatCard key={stat.label} tone={pageTone} {...stat} />
              ))}
            </div>
            <section className="min-h-96 overflow-hidden rounded-[1.65rem] border border-slate-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-[#111418]">
              {facilitiesQuery.isLoading ? (
                <FacilitySkeletonGrid />
              ) : facilitiesQuery.isError ? (
                <StatePanel
                  icon={<AlertTriangle size={26} />}
                  subtitle="Check the ERP server and retry from this page."
                  title="Facilities service is not reachable."
                />
              ) : facilities.length === 0 ? (
                <EmptyFacilities
                  onCreate={() => router.push(`${routeBasePath}/${catalogKind}/new`)}
                  permissions={permissions}
                  tone={pageTone}
                />
              ) : filteredFacilities.length === 0 ? (
                <StatePanel
                  icon={<Filter size={26} />}
                  subtitle="Adjust category, availability, status, or search terms."
                  title={`No ${catalogLabel.toLowerCase()} match these filters.`}
                />
              ) : (
                <div className="grid gap-4 p-4 md:grid-cols-2 2xl:grid-cols-3">
                  {filteredFacilities.map((facility) => (
                    <FacilityBentoCard
                      facility={facility}
                      isUpdating={(statusMutation.isPending && statusMutation.variables?.id === facility.id) || (updateMutation.isPending && updateMutation.variables?.id === facility.id)}
                      key={facility.id}
                      onActivate={() => statusMutation.mutate({ id: facility.id, isAvailable: true, status: "active" })}
                      onDeactivate={() => statusMutation.mutate({ id: facility.id, isAvailable: false, status: "draft" })}
                      onDelete={() => setDeleteTarget(facility)}
onEdit={() => router.push(`${routeBasePath}/${catalogKind}/${facility.id}/edit`)}
                      onPublish={() =>
                        updateMutation.mutate({
                          facility: {
                            ...toFacilityInput(facility),
                            isAvailable: true,
                            status: "active",
                            visibility: "public",
                          },
                          id: facility.id,
                        })
                      }
                      permissions={permissions}
                      tone={pageTone}
                    />
                  ))}
                </div>
              )}
            </section>
          </section>
          <DeleteDialog
            facility={deleteTarget}
            isDeleting={deleteMutation.isPending}
            onClose={() => setDeleteTarget(null)}
            onConfirm={() => deleteTarget && deleteMutation.mutate({ id: deleteTarget.id })}
          />
        </DashboardPageShell>
      </div>
    );
  }

  if (route.mode === "create") {
    return (
      <>
        {renderCatalog(true)}
        <FacilityEditorDialog
          onClose={() => router.push(`${routeBasePath}/${catalogKind}`)}
          subtitle={`Create a ${catalogKind === "services" ? "service" : "facility"} card for this ${tenant?.terminology.organizationLabel.toLowerCase() ?? "workspace"}.`}
          title={`Add ${catalogKind === "services" ? "Service" : "Facility"}`}
          tone={pageTone}
        >
          <FacilityForm
            existingFacilities={facilities}
            initialValue={{ ...emptyFacilityForm, displayOrder: facilities.length + 1 }}
            isSaving={isSaving}
            onCancel={() => router.push(`${routeBasePath}/${catalogKind}`)}
            onSubmit={(input) => createMutation.mutate(input)}
            saveError={createMutation.error}
            submitLabel="Create card"
          />
        </FacilityEditorDialog>
      </>
    );
  }

  if (route.mode === "edit") {
    if (facilitiesQuery.isLoading) return <FacilitiesLoading title={`Loading ${catalogKind === "services" ? "service" : "facility"} editor...`} />;
    if (!routeFacility) return <FacilityMissing onBack={() => router.push(`${routeBasePath}/${catalogKind}`)} />;

    return (
      <>
        {renderCatalog(true)}
        <FacilityEditorDialog
          onClose={() => router.push(`${routeBasePath}/${catalogKind}`)}
          subtitle={`Edit this ${catalogKind === "services" ? "service" : "facility"} card.`}
          title={`Edit ${catalogKind === "services" ? "Service" : "Facility"}`}
          tone={pageTone}
        >
          <FacilityForm
            existingFacilities={facilities.filter((facility) => facility.id !== routeFacility.id)}
            initialValue={toFacilityInput(routeFacility)}
            isSaving={isSaving}
            onCancel={() => router.push(`${routeBasePath}/${catalogKind}`)}
            onSubmit={(input) => updateMutation.mutate({ facility: input, id: routeFacility.id })}
            saveError={updateMutation.error}
            submitLabel="Save card"
          />
        </FacilityEditorDialog>
      </>
    );
  }

  return renderCatalog(false);
}

function FacilityEditorDialog({
  children,
  onClose,
  subtitle,
  title,
  tone = "blue",
}: {
  children: ReactNode;
  onClose: () => void;
  subtitle: string;
  title: string;
  tone?: "blue" | "violet";
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || typeof document === "undefined") return null;

  const eyebrowClass =
    tone === "violet"
      ? "text-[10px] font-semi-bold uppercase tracking-[0.22em] text-violet-500"
      : "text-[10px] font-semi-bold uppercase tracking-[0.22em] text-blue-500 dark:text-blue-400";

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/72 p-4 backdrop-blur-xl">
      <div className="flex min-h-full items-center justify-center py-8">
        <section
          aria-modal="true"
          className="w-full max-w-5xl rounded-[1.75rem] border border-white/15 bg-white/95 p-4 shadow-[0_30px_120px_rgba(0,0,0,0.45)] ring-1 ring-white/20 backdrop-blur-2xl dark:bg-[#0f1115]/95"
          role="dialog"
        >
          <header className="flex items-start justify-between gap-4 px-2 pb-4 pt-1">
            <div>
              <p className={eyebrowClass}>Facilities & Services</p>
              <h2 className="mt-2 font-headline text-2xl font-semi-bold text-slate-950 dark:text-slate-100">{title}</h2>
              <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-500">{subtitle}</p>
            </div>
            <button
              aria-label="Close service editor"
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-slate-300 dark:hover:bg-white/[0.10]"
              onClick={onClose}
              type="button"
            >
              <X size={17} />
            </button>
          </header>
          {children}
        </section>
      </div>
    </div>,
    document.body
  );
}