"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Archive,
  BadgeIndianRupee,
  CalendarCheck,
  CheckCircle2,
  ChevronLeft,
  ClipboardList,
  Copy,
  Edit3,
  Eye,
  FileImage,
  Filter,
  ImagePlus,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  UploadCloud,
  X,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { DashboardPageShell } from "@/features/dashboard/components/shared/dashboard-page-shell";
import { Switch } from "@/features/dashboard/components/ui/switch";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import {
  virujBackend,
  type VirujFacility,
  type VirujFacilityCategory,
  type VirujFacilityInput,
  type VirujFacilityStatus,
  type VirujFacilityVisibility,
} from "@/lib/viruj-backend";

const facilityCategories: VirujFacilityCategory[] = [
  "Diagnostic",
  "Imaging",
  "Laboratory",
  "Emergency",
  "Treatment",
  "Surgery",
  "Intensive Care",
  "Rehabilitation",
  "Women's Health",
  "Children's Care",
  "Cardiology",
  "Orthopedics",
  "Neurology",
  "Oncology",
  "Pharmacy",
  "Dental",
  "Cosmetic",
  "Vaccination",
  "Home Care",
  "Wellness",
  "Health Packages",
  "Other",
];

type FacilityAction =
  | "archive"
  | "create"
  | "delete"
  | "publish"
  | "read"
  | "update";
type FacilityRoute =
  | { mode: "create" }
  | { id: string; mode: "detail" | "edit" }
  | { mode: "list" };
type SortKey =
  | "alphabetical"
  | "display-order"
  | "featured"
  | "newest"
  | "oldest"
  | "updated";
type FilterState = {
  availability: "all" | "available" | "unavailable";
  category: "all" | VirujFacilityCategory;
  featured: "all" | "featured" | "not-featured";
  quick: "all" | "appointment" | "emergency" | "online" | "twentyfour";
  status: "all" | VirujFacilityStatus;
};

const emptyFacilities: VirujFacility[] = [];

const emptyForm: VirujFacilityInput = {
  appointmentRequired: false,
  available247: false,
  bannerImage: "",
  category: "Diagnostic",
  currency: "INR",
  description: "",
  displayOrder: 0,
  emergencyService: false,
  galleryImages: [],
  isAvailable: true,
  isFeatured: false,
  keywords: [],
  name: "",
  onlineBooking: false,
  priceText: "",
  seoDescription: "",
  seoTitle: "",
  shortDescription: "",
  slug: "",
  startingPrice: null,
  status: "draft",
  visibility: "public",
};
export function FacilitiesPage({
  routeBasePath,
  routeSegments,
}: {
  routeBasePath: string;
  routeSegments: string[];
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const activeMemberState = authClient.useActiveMember();
  const permissions = getFacilityPermissions(activeMemberState.data?.role);
  const route = parseFacilityRoute(routeSegments);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    availability: "all",
    category: "all",
    featured: "all",
    quick: "all",
    status: "all",
  });
  const [sortKey, setSortKey] = useState<SortKey>("updated");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkCategory, setBulkCategory] =
    useState<VirujFacilityCategory>("Diagnostic");
  const [deleteTarget, setDeleteTarget] = useState<VirujFacility | null>(null);

  const facilitiesQuery = useQuery({
    queryFn: virujBackend.facilities.list,
    queryKey: virujBackend.facilities.key,
  });
  const invalidateFacilities = () =>
    queryClient.invalidateQueries({ queryKey: virujBackend.facilities.key });

  const createMutation = useMutation({
    mutationFn: virujBackend.facilities.create,
    onSuccess: async (facility) => {
      await invalidateFacilities();
      router.push(`${routeBasePath}/facilities/${facility.id}`);
    },
  });
  const updateMutation = useMutation({
    mutationFn: virujBackend.facilities.update,
    onSuccess: async (facility) => {
      await invalidateFacilities();
      router.push(`${routeBasePath}/facilities/${facility.id}`);
    },
  });
  const statusMutation = useMutation({
    mutationFn: virujBackend.facilities.updateStatus,
    onMutate: async (input) => {
      await queryClient.cancelQueries({
        queryKey: virujBackend.facilities.key,
      });
      const previous = queryClient.getQueryData<VirujFacility[]>(
        virujBackend.facilities.key
      );
      queryClient.setQueryData<VirujFacility[]>(
        virujBackend.facilities.key,
        (current) =>
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
      if (context?.previous)
        queryClient.setQueryData(virujBackend.facilities.key, context.previous);
    },
    onSettled: invalidateFacilities,
  });
  const deleteMutation = useMutation({
    mutationFn: virujBackend.facilities.delete,
    onSuccess: async () => {
      setDeleteTarget(null);
      await invalidateFacilities();
      if (route.mode !== "list") router.push(`${routeBasePath}/facilities`);
    },
  });
  const duplicateMutation = useMutation({
    mutationFn: (facility: VirujFacility) =>
      virujBackend.facilities.create({
        ...toFacilityInput(facility),
        name: `${facility.name} Copy`,
        slug: `${facility.slug}-copy`,
        status: "draft",
      }),
    onSuccess: invalidateFacilities,
  });
  const bulkMutation = useMutation({
    mutationFn: async (input: {
      action: "activate" | "archive" | "category" | "deactivate" | "delete";
      ids: string[];
    }) => {
      const allFacilities = facilitiesQuery.data ?? [];
      if (input.action === "delete") {
        await Promise.all(
          input.ids.map((id) => virujBackend.facilities.delete({ id }))
        );
        return;
      }
      if (input.action === "category") {
        await Promise.all(
          input.ids.map((id) => {
            const target = allFacilities.find((facility) => facility.id === id);
            return target
              ? virujBackend.facilities.update({
                  facility: {
                    ...toFacilityInput(target),
                    category: bulkCategory,
                  },
                  id,
                })
              : Promise.resolve();
          })
        );
        return;
      }
      const status: VirujFacilityStatus =
        input.action === "archive"
          ? "archived"
          : input.action === "activate"
            ? "active"
            : "draft";
      const isAvailable =
        input.action === "deactivate"
          ? false
          : input.action === "activate"
            ? true
            : undefined;
      await Promise.all(
        input.ids.map((id) =>
          virujBackend.facilities.updateStatus({ id, isAvailable, status })
        )
      );
    },
    onSuccess: async () => {
      setSelectedIds([]);
      await invalidateFacilities();
    },
  });

  const facilities = facilitiesQuery.data ?? emptyFacilities;
  const filteredFacilities = useMemo(
    () => filterAndSortFacilities(facilities, query, filters, sortKey),
    [facilities, filters, query, sortKey]
  );
  const routeFacility =
    route.mode === "detail" || route.mode === "edit"
      ? facilities.find((facility) => facility.id === route.id)
      : null;
  const stats = useMemo(() => buildFacilityStats(facilities), [facilities]);
  const isSaving = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    setSelectedIds((ids) => {
      const nextIds = ids.filter((id) =>
        facilities.some((facility) => facility.id === id)
      );

      return nextIds.length === ids.length ? ids : nextIds;
    });
  }, [facilities]);

  if (route.mode === "create") {
    return (
      <DashboardPageShell
        actions={
          <BackButton
            onClick={() => router.push(`${routeBasePath}/facilities`)}
          />
        }
        eyebrow="Facilities & Services"
        framed
        subtitle="Create a discoverable service for Viruj patient search and hospital profiles."
        title="Add Service"
      >
        <FacilityForm
          existingFacilities={facilities}
          initialValue={{ ...emptyForm, displayOrder: facilities.length + 1 }}
          isSaving={isSaving}
          onCancel={() => router.push(`${routeBasePath}/facilities`)}
          onSubmit={(input) => createMutation.mutate(input)}
          saveError={createMutation.error}
          submitLabel="Create service"
        />
      </DashboardPageShell>
    );
  }

  if (route.mode === "edit") {
    if (facilitiesQuery.isLoading)
      return <FacilitiesLoading title="Loading service editor..." />;
    if (!routeFacility)
      return (
        <FacilityMissing
          onBack={() => router.push(`${routeBasePath}/facilities`)}
        />
      );
    return (
      <DashboardPageShell
        actions={
          <BackButton
            onClick={() =>
              router.push(`${routeBasePath}/facilities/${routeFacility.id}`)
            }
          />
        }
        eyebrow="Facilities & Services"
        framed
        subtitle="Update catalog metadata, availability, media, pricing, and SEO fields."
        title="Edit Service"
      >
        <FacilityForm
          existingFacilities={facilities.filter(
            (facility) => facility.id !== routeFacility.id
          )}
          initialValue={toFacilityInput(routeFacility)}
          isSaving={isSaving}
          onCancel={() =>
            router.push(`${routeBasePath}/facilities/${routeFacility.id}`)
          }
          onSubmit={(input) =>
            updateMutation.mutate({ facility: input, id: routeFacility.id })
          }
          saveError={updateMutation.error}
          submitLabel="Save changes"
        />
      </DashboardPageShell>
    );
  }

  if (route.mode === "detail") {
    if (facilitiesQuery.isLoading)
      return <FacilitiesLoading title="Loading service details..." />;
    if (!routeFacility)
      return (
        <FacilityMissing
          onBack={() => router.push(`${routeBasePath}/facilities`)}
        />
      );
    return (
      <FacilityDetail
        facility={routeFacility}
        onArchive={() =>
          statusMutation.mutate({ id: routeFacility.id, status: "archived" })
        }
        onBack={() => router.push(`${routeBasePath}/facilities`)}
        onDelete={() => setDeleteTarget(routeFacility)}
        onDuplicate={() => duplicateMutation.mutate(routeFacility)}
        onEdit={() =>
          router.push(`${routeBasePath}/facilities/${routeFacility.id}/edit`)
        }
        permissions={permissions}
      >
        <DeleteDialog
          facility={deleteTarget}
          isDeleting={deleteMutation.isPending}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() =>
            deleteTarget && deleteMutation.mutate({ id: deleteTarget.id })
          }
        />
      </FacilityDetail>
    );
  }

  return (
    <DashboardPageShell
      actions={
        permissions.create ? (
          <PrimaryButton
            icon={<Plus size={16} />}
            label="Add Service"
            onClick={() => router.push(`${routeBasePath}/facilities/new`)}
          />
        ) : null
      }
      eyebrow="Facilities & Services"
      framed
      subtitle="A clean public service catalog for hospital discovery."
      title="Facilities & Services"
    >
      <section className="space-y-5">
        <Toolbar
          filters={filters}
          onFilterChange={setFilters}
          onQueryChange={setQuery}
          onSortChange={setSortKey}
          query={query}
          sortKey={sortKey}
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
        {selectedIds.length > 0 ? (
          <BulkActionBar
            bulkCategory={bulkCategory}
            disabled={bulkMutation.isPending}
            onBulkCategoryChange={setBulkCategory}
            onRun={(action) =>
              bulkMutation.mutate({ action, ids: selectedIds })
            }
            selectedCount={selectedIds.length}
          />
        ) : null}
        <section className="min-h-96 overflow-hidden rounded-[1.65rem] border border-slate-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-[#111418]">
          {facilitiesQuery.isLoading ? (
            <FacilitySkeletonGrid />
          ) : facilitiesQuery.isError ? (
            <StatePanel
              icon={<AlertTriangle size={26} />}
              title="Facilities service is not reachable."
              subtitle="Check the ERP server and retry from this page."
            />
          ) : facilities.length === 0 ? (
            <EmptyFacilities
              onCreate={() => router.push(`${routeBasePath}/facilities/new`)}
              permissions={permissions}
            />
          ) : filteredFacilities.length === 0 ? (
            <StatePanel
              icon={<Filter size={26} />}
              title="No services match these filters."
              subtitle="Adjust category, availability, status, or search terms."
            />
          ) : (
            <div className="grid gap-4 p-4 md:grid-cols-2 2xl:grid-cols-3">
              {filteredFacilities.map((facility, index) => (
                <FacilityBentoCard
                  checked={selectedIds.includes(facility.id)}
                  facility={facility}
                  index={index}
                  isArchiving={
                    statusMutation.isPending &&
                    statusMutation.variables?.id === facility.id
                  }
                  isDuplicating={
                    duplicateMutation.isPending &&
                    duplicateMutation.variables?.id === facility.id
                  }
                  key={facility.id}
                  onArchive={() =>
                    statusMutation.mutate({
                      id: facility.id,
                      status: "archived",
                    })
                  }
                  onDelete={() => setDeleteTarget(facility)}
                  onDuplicate={() => duplicateMutation.mutate(facility)}
                  onEdit={() =>
                    router.push(
                      `${routeBasePath}/facilities/${facility.id}/edit`
                    )
                  }
                  onSelect={(checked) =>
                    setSelectedIds((ids) =>
                      checked
                        ? [...new Set([...ids, facility.id])]
                        : ids.filter((id) => id !== facility.id)
                    )
                  }
                  onView={() =>
                    router.push(`${routeBasePath}/facilities/${facility.id}`)
                  }
                  permissions={permissions}
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
        onConfirm={() =>
          deleteTarget && deleteMutation.mutate({ id: deleteTarget.id })
        }
      />
    </DashboardPageShell>
  );
}
function Toolbar({
  filters,
  onFilterChange,
  onQueryChange,
  onSortChange,
  query,
  sortKey,
}: {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onQueryChange: (value: string) => void;
  onSortChange: (value: SortKey) => void;
  query: string;
  sortKey: SortKey;
}) {
  return (
    <section className="rounded-[1.65rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-white/[0.08] dark:bg-[#111418]">
      <div className="grid gap-3 xl:grid-cols-[minmax(260px,1fr)_180px_150px_180px_170px]">
        <label className="relative block">
          <span className="sr-only">Search services</span>
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={17}
          />
          <input
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white dark:border-white/[0.08] dark:bg-white/[0.055] dark:text-slate-100"
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search name, category, description..."
            value={query}
          />
        </label>
        <Select
          label="Category"
          onChange={(value) =>
            onFilterChange({
              ...filters,
              category: value as FilterState["category"],
            })
          }
          value={filters.category}
        >
          <option value="all">All categories</option>
          {facilityCategories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </Select>
        <Select
          label="Status"
          onChange={(value) =>
            onFilterChange({
              ...filters,
              status: value as FilterState["status"],
            })
          }
          value={filters.status}
        >
          <option value="all">All status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </Select>
        <Select
          label="Availability"
          onChange={(value) =>
            onFilterChange({ ...filters, quick: value as FilterState["quick"] })
          }
          value={filters.quick}
        >
          <option value="all">All availability</option>
          <option value="twentyfour">24x7</option>
          <option value="emergency">Emergency</option>
          <option value="online">Online booking</option>
          <option value="appointment">Appointment required</option>
        </Select>
        <Select
          label="Sort"
          onChange={(value) => onSortChange(value as SortKey)}
          value={sortKey}
        >
          <option value="updated">Recently Updated</option>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="alphabetical">Alphabetical</option>
          <option value="featured">Featured First</option>
          <option value="display-order">Display Order</option>
        </Select>
      </div>
    </section>
  );
}

function FacilityBentoCard({
  facility,
  index,
  isArchiving,
  isDuplicating,
  onArchive,
  onDelete,
  onDuplicate,
  onEdit,
  onView,
  permissions,
}: {
  checked: boolean;
  facility: VirujFacility;
  index: number;
  isArchiving: boolean;
  isDuplicating: boolean;
  onArchive: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onEdit: () => void;
  onSelect: (checked: boolean) => void;
  onView: () => void;
  permissions: Record<FacilityAction, boolean>;
}) {
  const isWide = facility.isFeatured || index === 0;

  return (
    <article
      className={cn(
        "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md dark:border-white/[0.08] dark:bg-[#15181d]",
        isWide && "2xl:col-span-2"
      )}
    >
      <div className={cn("grid h-full", isWide && "lg:grid-cols-[240px_minmax(0,1fr)]")}>
        <div className={cn("relative h-44 overflow-hidden bg-slate-100 dark:bg-white/[0.05]", isWide && "lg:h-full")}>
          {facility.bannerImage ? (
            <img alt="" className="h-full w-full object-cover" src={facility.bannerImage} />
          ) : (
            <div className="flex h-full items-center justify-center">
              <FileImage className="text-slate-400" size={36} />
            </div>
          )}
          <StatusPill status={facility.status} className="absolute left-3 top-3" />
          {facility.isFeatured ? (
            <span className="absolute right-3 top-3 inline-flex size-8 items-center justify-center rounded-full bg-white text-amber-500 shadow-sm dark:bg-[#111418]">
              <Star size={15} fill="currentColor" />
            </span>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-col p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <CategoryPill category={facility.category} />
              <h3 className="mt-2 truncate font-headline text-xl font-semi-bold text-slate-950 dark:text-slate-100">
                {facility.name}
              </h3>
            </div>
            <span className="shrink-0 rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600 dark:bg-white/[0.07] dark:text-slate-300">
              {facility.visibility === "public" ? "Public" : "Hidden"}
            </span>
          </div>

          <p className="mt-3 line-clamp-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
            {facility.shortDescription || facility.description || "No description added yet."}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {facility.available247 ? <Badge icon={<Zap size={12} />} label="24x7" /> : null}
            {facility.emergencyService ? <Badge icon={<AlertTriangle size={12} />} label="Emergency" tone="danger" /> : null}
            {facility.onlineBooking ? <Badge icon={<CalendarCheck size={12} />} label="Online" /> : null}
            {facility.appointmentRequired ? <Badge icon={<ClipboardList size={12} />} label="Appointment" /> : null}
          </div>

          <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Price</p>
              <p className="mt-1 text-sm font-bold text-slate-900 dark:text-slate-100">{formatPrice(facility)}</p>
            </div>
            <div className="flex gap-1.5">
              <button aria-label="View service" className="inline-flex size-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200 dark:bg-white/[0.07] dark:text-slate-300" onClick={onView} title="View" type="button"><Eye size={15} /></button>
              {permissions.update ? <button aria-label="Edit service" className="inline-flex size-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200 dark:bg-white/[0.07] dark:text-slate-300" onClick={onEdit} title="Edit" type="button"><Edit3 size={15} /></button> : null}
              {permissions.create ? <button aria-label="Duplicate service" className="inline-flex size-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200 dark:bg-white/[0.07] dark:text-slate-300" onClick={onDuplicate} title="Duplicate" type="button">{isDuplicating ? <Loader2 className="animate-spin" size={15} /> : <Copy size={15} />}</button> : null}
              {permissions.archive ? <button aria-label="Archive service" className="inline-flex size-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200 dark:bg-white/[0.07] dark:text-slate-300" onClick={onArchive} title="Archive" type="button">{isArchiving ? <Loader2 className="animate-spin" size={15} /> : <Archive size={15} />}</button> : null}
              {permissions.delete ? <button aria-label="Delete service" className="inline-flex size-9 items-center justify-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-100 dark:bg-red-400/10 dark:text-red-200" onClick={onDelete} title="Delete" type="button"><Trash2 size={15} /></button> : null}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
function ActionMenu({
  isArchiving,
  isDuplicating,
  onArchive,
  onDelete,
  onDuplicate,
  onEdit,
  onView,
  permissions,
}: {
  isArchiving: boolean;
  isDuplicating: boolean;
  onArchive: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onEdit: () => void;
  onView: () => void;
  permissions: Record<FacilityAction, boolean>;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative shrink-0">
      <button
        aria-expanded={open}
        aria-label="Open service actions"
        className="inline-flex size-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200 dark:bg-white/[0.07] dark:text-slate-300 dark:hover:bg-white/[0.12]"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <MoreHorizontal size={16} />
      </button>
      {open ? (
        <div className="absolute right-0 top-11 z-20 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-xl dark:border-white/[0.10] dark:bg-[#101318]">
          <MenuButton icon={<Eye size={14} />} label="View" onClick={onView} />
          {permissions.update ? (
            <MenuButton
              icon={<Edit3 size={14} />}
              label="Edit"
              onClick={onEdit}
            />
          ) : null}
          {permissions.create ? (
            <MenuButton
              icon={
                isDuplicating ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <Copy size={14} />
                )
              }
              label="Duplicate"
              onClick={onDuplicate}
            />
          ) : null}
          {permissions.archive ? (
            <MenuButton
              icon={
                isArchiving ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <Archive size={14} />
                )
              }
              label="Archive"
              onClick={onArchive}
            />
          ) : null}
          {permissions.delete ? (
            <MenuButton
              danger
              icon={<Trash2 size={14} />}
              label="Delete"
              onClick={onDelete}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
function FacilityForm({
  existingFacilities,
  initialValue,
  isSaving,
  onCancel,
  onSubmit,
  saveError,
  submitLabel,
}: {
  existingFacilities: VirujFacility[];
  initialValue: VirujFacilityInput;
  isSaving: boolean;
  onCancel: () => void;
  onSubmit: (input: VirujFacilityInput) => void;
  saveError: Error | null;
  submitLabel: string;
}) {
  const [form, setForm] = useState<VirujFacilityInput>(initialValue);
  const [slugTouched, setSlugTouched] = useState(Boolean(initialValue.slug));
  const [dirty, setDirty] = useState(false);
  const [galleryDraft, setGalleryDraft] = useState("");
  useEffect(() => {
    if (!dirty) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) =>
      event.preventDefault();
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty]);
  const validation = validateFacilityForm(form, existingFacilities);
  const canSubmit = validation.length === 0 && !isSaving;
  function updateField<TKey extends keyof VirujFacilityInput>(
    field: TKey,
    value: VirujFacilityInput[TKey]
  ) {
    setDirty(true);
    setForm((current) => ({ ...current, [field]: value }));
  }
  function updateName(value: string) {
    setDirty(true);
    setForm((current) => ({
      ...current,
      name: value,
      slug: slugTouched ? current.slug : slugify(value),
    }));
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    setDirty(false);
    onSubmit({ ...form, slug: form.slug || slugify(form.name) });
  }
  function cancel() {
    if (dirty && !window.confirm("Discard unsaved service changes?")) return;
    onCancel();
  }
  return (
    <form className="space-y-5" onSubmit={submit}>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <FormPanel
            title="Basic Information"
            subtitle="Patient-facing identity and description"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <TextField
                label="Service Name *"
                onChange={updateName}
                placeholder="MRI Scan"
                value={form.name}
              />
              <SelectField
                label="Category *"
                onChange={(value) =>
                  updateField("category", value as VirujFacilityCategory)
                }
                value={form.category}
              >
                {facilityCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </SelectField>
              <TextField
                className="md:col-span-2"
                label="Short Description"
                onChange={(value) => updateField("shortDescription", value)}
                placeholder="Advanced imaging with fast reporting."
                value={form.shortDescription}
              />
              <TextAreaField
                label="Full Rich Description"
                onChange={(value) => updateField("description", value)}
                placeholder="Describe patient benefits, preparation, reporting timeline, and care context."
                value={form.description}
              />
            </div>
          </FormPanel>
          <FormPanel
            title="Media"
            subtitle="Banner and gallery previews before upload"
          >
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
              <ImageDropZone
                image={form.bannerImage}
                label="Banner Image"
                onClear={() => updateField("bannerImage", "")}
                onImage={(value) => updateField("bannerImage", value)}
              />
              <div className="space-y-3">
                <label className="block">
                  <span className="text-[10px] font-semi-bold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-600">
                    Gallery Image URL
                  </span>
                  <div className="mt-1 flex gap-2">
                    <input
                      className="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold outline-none focus:border-slate-400 dark:border-white/[0.08] dark:bg-white/[0.055]"
                      onChange={(event) => setGalleryDraft(event.target.value)}
                      placeholder="https://..."
                      value={galleryDraft}
                    />
                    <button
                      className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-950 px-3 text-sm font-semi-bold text-white disabled:opacity-50 dark:bg-white dark:text-slate-950"
                      disabled={!galleryDraft.trim()}
                      onClick={() => {
                        updateField("galleryImages", [
                          ...form.galleryImages,
                          galleryDraft.trim(),
                        ]);
                        setGalleryDraft("");
                      }}
                      type="button"
                    >
                      Add
                    </button>
                  </div>
                </label>
                <FileImagePicker
                  onImages={(images) =>
                    updateField("galleryImages", [
                      ...form.galleryImages,
                      ...images,
                    ])
                  }
                />
                <div className="grid grid-cols-3 gap-2">
                  {form.galleryImages.map((image, index) => (
                    <div
                      className="group relative aspect-square overflow-hidden rounded-xl bg-slate-100 dark:bg-white/[0.06]"
                      key={`${image}-${index}`}
                    >
                      <img
                        alt=""
                        className="h-full w-full object-cover"
                        src={image}
                      />
                      <button
                        aria-label="Remove gallery image"
                        className="absolute right-1 top-1 hidden size-7 items-center justify-center rounded-lg bg-white text-slate-700 shadow group-hover:flex"
                        onClick={() =>
                          updateField(
                            "galleryImages",
                            form.galleryImages.filter(
                              (_, itemIndex) => itemIndex !== index
                            )
                          )
                        }
                        type="button"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FormPanel>
          <FormPanel title="SEO" subtitle="Future-ready search indexing fields">
            <div className="grid gap-4 md:grid-cols-2">
              <TextField
                label="SEO Title"
                onChange={(value) => updateField("seoTitle", value)}
                placeholder="MRI Scan in Mumbai"
                value={form.seoTitle}
              />
              <TextField
                label="Slug"
                onChange={(value) => {
                  setSlugTouched(true);
                  updateField("slug", slugify(value));
                }}
                placeholder="mri-scan"
                value={form.slug}
              />
              <TextAreaField
                compact
                label="SEO Description"
                onChange={(value) => updateField("seoDescription", value)}
                placeholder="Short search summary."
                value={form.seoDescription}
              />
              <TextField
                label="Keywords"
                onChange={(value) => updateField("keywords", splitComma(value))}
                placeholder="MRI, imaging, scan"
                value={form.keywords.join(", ")}
              />
            </div>
          </FormPanel>
        </div>
        <aside className="space-y-5">
          <FormPanel
            title="Availability"
            subtitle="Discovery and booking controls"
          >
            <div className="space-y-3">
              <SwitchRow
                checked={form.isAvailable}
                label="Available"
                onChange={(value) => updateField("isAvailable", value)}
              />
              <SwitchRow
                checked={form.isFeatured}
                label="Featured Service"
                onChange={(value) => updateField("isFeatured", value)}
              />
              <SwitchRow
                checked={form.appointmentRequired}
                label="Appointment Required"
                onChange={(value) => updateField("appointmentRequired", value)}
              />
              <SwitchRow
                checked={form.onlineBooking}
                label="Online Booking"
                onChange={(value) => updateField("onlineBooking", value)}
              />
              <SwitchRow
                checked={form.emergencyService}
                label="Emergency Service"
                onChange={(value) => updateField("emergencyService", value)}
              />
              <SwitchRow
                checked={form.available247}
                label="24x7 Available"
                onChange={(value) => updateField("available247", value)}
              />
            </div>
          </FormPanel>
          <FormPanel
            title="Pricing"
            subtitle="Optional patient-facing cost context"
          >
            <div className="space-y-4">
              <NumberField
                label="Starting Price"
                onChange={(value) => updateField("startingPrice", value)}
                value={form.startingPrice}
              />
              <SelectField
                label="Currency"
                onChange={(value) => updateField("currency", value)}
                value={form.currency}
              >
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="AED">AED</option>
              </SelectField>
              <TextField
                label="OR Price Text"
                onChange={(value) => updateField("priceText", value)}
                placeholder="Contact Hospital"
                value={form.priceText}
              />
            </div>
          </FormPanel>
          <FormPanel title="Visibility" subtitle="Catalog state and ordering">
            <div className="space-y-4">
              <SelectField
                label="Status"
                onChange={(value) =>
                  updateField("status", value as VirujFacilityStatus)
                }
                value={form.status}
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </SelectField>
              <NumberField
                label="Display Order"
                onChange={(value) => updateField("displayOrder", value ?? 0)}
                value={form.displayOrder}
              />
              <SelectField
                label="Visibility"
                onChange={(value) =>
                  updateField("visibility", value as VirujFacilityVisibility)
                }
                value={form.visibility}
              >
                <option value="public">Public</option>
                <option value="hidden">Hidden</option>
              </SelectField>
            </div>
          </FormPanel>
        </aside>
      </div>
      {validation.length > 0 ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200">
          {validation[0]}
        </div>
      ) : null}
      {saveError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-200">
          {saveError.message || "Unable to save service."}
        </div>
      ) : null}
      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 pt-5 dark:border-white/[0.08]">
        <button
          className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semi-bold text-slate-700 transition hover:bg-slate-50 dark:border-white/[0.08] dark:text-slate-200 dark:hover:bg-white/[0.06]"
          onClick={cancel}
          type="button"
        >
          Cancel
        </button>
        <button
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semi-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
          disabled={!canSubmit}
          type="submit"
        >
          {isSaving ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <ShieldCheck size={16} />
          )}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
function FacilityDetail({
  children,
  facility,
  onArchive,
  onBack,
  onDelete,
  onDuplicate,
  onEdit,
  permissions,
}: {
  children: ReactNode;
  facility: VirujFacility;
  onArchive: () => void;
  onBack: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onEdit: () => void;
  permissions: Record<FacilityAction, boolean>;
}) {
  return (
    <DashboardPageShell
      actions={
        <div className="flex flex-wrap gap-2">
          <BackButton onClick={onBack} />
          {permissions.create ? (
            <IconAction
              icon={<Copy size={15} />}
              label="Duplicate"
              onClick={onDuplicate}
            />
          ) : null}
          {permissions.archive ? (
            <IconAction
              icon={<Archive size={15} />}
              label="Archive"
              onClick={onArchive}
            />
          ) : null}
          {permissions.update ? (
            <IconAction
              icon={<Edit3 size={15} />}
              label="Edit"
              onClick={onEdit}
              primary
            />
          ) : null}
          {permissions.delete ? (
            <IconAction
              danger
              icon={<Trash2 size={15} />}
              label="Delete"
              onClick={onDelete}
            />
          ) : null}
        </div>
      }
      eyebrow="Facilities & Services"
      framed
      subtitle="Read-only catalog detail with patient-facing content, availability, pricing, and metadata."
      title={facility.name}
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-5">
          <div className="overflow-hidden rounded-[1.65rem] border border-slate-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-[#15181d]">
            <div className="h-72 bg-slate-100 dark:bg-white/[0.05]">
              {facility.bannerImage ? (
                <img
                  alt=""
                  className="h-full w-full object-cover"
                  src={facility.bannerImage}
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <FileImage className="text-slate-400" size={42} />
                </div>
              )}
            </div>
            <div className="p-5">
              <div className="flex flex-wrap items-center gap-2">
                <CategoryPill category={facility.category} />
                <StatusPill status={facility.status} />
                {facility.isFeatured ? (
                  <Badge icon={<Star size={12} />} label="Featured" />
                ) : null}
              </div>
              <p className="mt-4 text-sm font-medium leading-7 text-slate-600 dark:text-slate-400">
                {facility.description ||
                  facility.shortDescription ||
                  "No description added yet."}
              </p>
            </div>
          </div>
          <DetailPanel title="Gallery">
            {facility.galleryImages.length ? (
              <div className="grid gap-3 sm:grid-cols-3">
                {facility.galleryImages.map((image, index) => (
                  <img
                    alt=""
                    className="aspect-video rounded-xl object-cover"
                    key={`${image}-${index}`}
                    src={image}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm font-medium text-slate-500">
                No gallery images added.
              </p>
            )}
          </DetailPanel>
        </section>
        <aside className="space-y-5">
          <DetailPanel title="Availability">
            <InfoRow
              label="Available"
              value={facility.isAvailable ? "Yes" : "No"}
            />
            <InfoRow
              label="24x7"
              value={facility.available247 ? "Yes" : "No"}
            />
            <InfoRow
              label="Emergency"
              value={facility.emergencyService ? "Yes" : "No"}
            />
            <InfoRow
              label="Online Booking"
              value={facility.onlineBooking ? "Yes" : "No"}
            />
            <InfoRow
              label="Appointment Required"
              value={facility.appointmentRequired ? "Yes" : "No"}
            />
          </DetailPanel>
          <DetailPanel title="Pricing">
            <InfoRow label="Price" value={formatPrice(facility)} />
            <InfoRow label="Currency" value={facility.currency} />
          </DetailPanel>
          <DetailPanel title="Metadata">
            <InfoRow label="Slug" value={facility.slug} />
            <InfoRow label="Visibility" value={facility.visibility} />
            <InfoRow
              label="Display Order"
              value={String(facility.displayOrder)}
            />
            <InfoRow label="Created By" value={facility.createdBy} />
            <InfoRow label="Updated By" value={facility.updatedBy} />
            <InfoRow
              label="Created Date"
              value={formatDate(facility.createdAt)}
            />
            <InfoRow
              label="Last Updated"
              value={formatDate(facility.updatedAt)}
            />
          </DetailPanel>
          <DetailPanel title="SEO">
            <InfoRow label="SEO Title" value={facility.seoTitle || "Not set"} />
            <InfoRow
              label="SEO Description"
              value={facility.seoDescription || "Not set"}
            />
            <InfoRow
              label="Keywords"
              value={facility.keywords.join(", ") || "Not set"}
            />
          </DetailPanel>
        </aside>
      </div>
      {children}
    </DashboardPageShell>
  );
}

function BulkActionBar({
  bulkCategory,
  disabled,
  onBulkCategoryChange,
  onRun,
  selectedCount,
}: {
  bulkCategory: VirujFacilityCategory;
  disabled: boolean;
  onBulkCategoryChange: (category: VirujFacilityCategory) => void;
  onRun: (
    action: "activate" | "archive" | "category" | "deactivate" | "delete"
  ) => void;
  selectedCount: number;
}) {
  return (
    <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-950 p-3 text-white shadow-sm dark:border-white/[0.08]">
      <p className="text-sm font-semi-bold">{selectedCount} selected</p>
      <div className="flex flex-wrap gap-2">
        <BulkButton
          disabled={disabled}
          label="Activate"
          onClick={() => onRun("activate")}
        />
        <BulkButton
          disabled={disabled}
          label="Deactivate"
          onClick={() => onRun("deactivate")}
        />
        <BulkButton
          disabled={disabled}
          label="Archive"
          onClick={() => onRun("archive")}
        />
        <select
          className="h-9 rounded-lg border border-white/15 bg-white/10 px-3 text-xs font-semibold text-white outline-none"
          onChange={(event) =>
            onBulkCategoryChange(event.target.value as VirujFacilityCategory)
          }
          value={bulkCategory}
        >
          {facilityCategories.map((category) => (
            <option className="text-slate-950" key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <BulkButton
          disabled={disabled}
          label="Change Category"
          onClick={() => onRun("category")}
        />
        <BulkButton
          danger
          disabled={disabled}
          label="Delete"
          onClick={() => onRun("delete")}
        />
      </div>
    </section>
  );
}

function DeleteDialog({
  facility,
  isDeleting,
  onClose,
  onConfirm,
}: {
  facility: VirujFacility | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!facility || typeof document === "undefined") return null;
  return createPortal(
    <div className="erp-dialog-backdrop fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        aria-modal="true"
        className="w-full max-w-md rounded-[1.5rem] border border-red-100 bg-white p-5 shadow-2xl dark:border-red-400/20 dark:bg-[#111418]"
        role="dialog"
      >
        <div className="flex size-11 items-center justify-center rounded-2xl bg-red-100 text-red-700 dark:bg-red-400/15 dark:text-red-200">
          <Trash2 size={18} />
        </div>
        <h3 className="mt-4 font-headline text-xl font-semi-bold text-slate-950 dark:text-slate-100">
          Delete {facility.name}?
        </h3>
        <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
          This permanently removes the service from the hospital catalog and
          future patient discovery feeds.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semi-bold text-slate-700 transition hover:bg-slate-50 dark:border-white/[0.08] dark:text-slate-200 dark:hover:bg-white/[0.06]"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semi-bold text-white transition hover:bg-red-700 disabled:opacity-60"
            disabled={isDeleting}
            onClick={onConfirm}
            type="button"
          >
            {isDeleting ? (
              <Loader2 className="animate-spin" size={15} />
            ) : (
              <Trash2 size={15} />
            )}
            Delete
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function ImageDropZone({
  image,
  label,
  onClear,
  onImage,
}: {
  image: string;
  label: string;
  onClear: () => void;
  onImage: (value: string) => void;
}) {
  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) readImage(file, onImage);
  }
  return (
    <label
      className="flex min-h-72 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center transition hover:border-slate-400 hover:bg-white dark:border-white/[0.14] dark:bg-white/[0.04] dark:hover:bg-white/[0.07]"
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
    >
      <input
        accept="image/*"
        className="sr-only"
        onChange={(event) =>
          event.target.files?.[0] && readImage(event.target.files[0], onImage)
        }
        type="file"
      />
      {image ? (
        <span className="relative block h-full min-h-72 w-full">
          <img alt="" className="h-full w-full object-cover" src={image} />
          <button
            aria-label="Remove banner image"
            className="absolute right-3 top-3 inline-flex size-9 items-center justify-center rounded-xl bg-white text-slate-700 shadow"
            onClick={(event) => {
              event.preventDefault();
              onClear();
            }}
            type="button"
          >
            <X size={15} />
          </button>
        </span>
      ) : (
        <span className="p-6">
          <UploadCloud className="mx-auto text-slate-400" size={30} />
          <span className="mt-3 block font-headline text-lg font-semi-bold text-slate-950 dark:text-slate-100">
            {label}
          </span>
          <span className="mt-1 block text-sm font-medium text-slate-500">
            Drag and drop or choose an image
          </span>
        </span>
      )}
    </label>
  );
}

function FileImagePicker({
  onImages,
}: {
  onImages: (images: string[]) => void;
}) {
  return (
    <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-semi-bold text-slate-700 transition hover:bg-slate-50 dark:border-white/[0.08] dark:text-slate-200 dark:hover:bg-white/[0.06]">
      <ImagePlus size={14} />
      Upload gallery
      <input
        accept="image/*"
        className="sr-only"
        multiple
        onChange={async (event) => onImages(await readImages(event))}
        type="file"
      />
    </label>
  );
}
function StatCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/[0.08] dark:bg-[#111418]">
      <div className="flex items-center justify-between gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-white/[0.07] dark:text-slate-200">
          {icon}
        </span>
        <p className="font-headline text-2xl font-semi-bold text-slate-950 dark:text-slate-100">
          {value}
        </p>
      </div>
      <p className="mt-3 text-[10px] font-semi-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-500">
        {label}
      </p>
    </section>
  );
}
function EmptyFacilities({
  onCreate,
  permissions,
}: {
  onCreate: () => void;
  permissions: Record<FacilityAction, boolean>;
}) {
  return (
    <div className="flex min-h-[440px] flex-col items-center justify-center p-8 text-center">
      <div className="relative flex size-28 items-center justify-center rounded-[2rem] border border-slate-200 bg-slate-50 shadow-sm dark:border-white/[0.08] dark:bg-white/[0.05]">
        <Sparkles className="absolute left-5 top-5 text-blue-500" size={20} />
        <ClipboardList
          className="text-slate-800 dark:text-slate-100"
          size={42}
        />
        <BadgeIndianRupee
          className="absolute bottom-5 right-5 text-emerald-600"
          size={20}
        />
      </div>
      <h3 className="mt-6 font-headline text-2xl font-semi-bold text-slate-950 dark:text-slate-100">
        No services have been added yet.
      </h3>
      <p className="mt-2 max-w-md text-sm font-medium leading-6 text-slate-500">
        Create the first public-facing facility or service so patients can
        discover this hospital by capability.
      </p>
      {permissions.create ? (
        <button
          className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semi-bold text-white dark:bg-white dark:text-slate-950"
          onClick={onCreate}
          type="button"
        >
          <Plus size={16} />
          Add Your First Service
        </button>
      ) : null}
    </div>
  );
}
function FacilitySkeletonGrid() {
  return (
    <div className="grid gap-4 p-4 md:grid-cols-2 2xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          className="h-80 animate-pulse rounded-[1.35rem] bg-slate-100 dark:bg-white/[0.06]"
          key={index}
        />
      ))}
    </div>
  );
}
function FacilitiesLoading({ title }: { title: string }) {
  return (
    <DashboardPageShell
      eyebrow="Facilities & Services"
      framed
      subtitle="Preparing the service catalog."
      title={title}
    >
      <FacilitySkeletonGrid />
    </DashboardPageShell>
  );
}
function FacilityMissing({ onBack }: { onBack: () => void }) {
  return (
    <DashboardPageShell
      actions={<BackButton onClick={onBack} />}
      eyebrow="Facilities & Services"
      framed
      subtitle="The requested service was not found in this workspace."
      title="Service not found"
    >
      <StatePanel
        icon={<AlertTriangle size={26} />}
        title="Service not found"
        subtitle="It may have been deleted, archived by another user, or you may not have access."
      />
    </DashboardPageShell>
  );
}
function StatePanel({
  icon,
  subtitle,
  title,
}: {
  icon: ReactNode;
  subtitle: string;
  title: string;
}) {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center p-8 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-white/[0.07]">
        {icon}
      </span>
      <h3 className="mt-4 font-headline text-xl font-semi-bold text-slate-950 dark:text-slate-100">
        {title}
      </h3>
      <p className="mt-2 max-w-md text-sm font-medium text-slate-500">
        {subtitle}
      </p>
    </div>
  );
}
function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semi-bold text-slate-700 transition hover:bg-slate-50 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-slate-200 dark:hover:bg-white/[0.08]"
      onClick={onClick}
      type="button"
    >
      <ChevronLeft size={16} />
      Back
    </button>
  );
}
function PrimaryButton({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semi-bold text-white shadow-sm transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
      onClick={onClick}
      type="button"
    >
      {icon}
      {label}
    </button>
  );
}
function IconAction({
  danger,
  icon,
  label,
  onClick,
  primary,
}: {
  danger?: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semi-bold transition",
        primary &&
          "bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950",
        danger &&
          "bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-400/10 dark:text-red-200",
        !primary &&
          !danger &&
          "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-slate-200 dark:hover:bg-white/[0.08]"
      )}
      onClick={onClick}
      type="button"
    >
      {icon}
      {label}
    </button>
  );
}
function MenuButton({
  danger,
  icon,
  label,
  onClick,
}: {
  danger?: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "flex h-9 w-full items-center gap-2 rounded-lg px-3 text-left text-xs font-semi-bold transition hover:bg-slate-100 dark:hover:bg-white/[0.08]",
        danger
          ? "text-red-600 dark:text-red-300"
          : "text-slate-700 dark:text-slate-200"
      )}
      onClick={onClick}
      type="button"
    >
      {icon}
      {label}
    </button>
  );
}
function Select({
  children,
  label,
  onChange,
  value,
}: {
  children: ReactNode;
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <select
        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white dark:border-white/[0.08] dark:bg-white/[0.055] dark:text-slate-100"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {children}
      </select>
    </label>
  );
}
function FormPanel({
  children,
  subtitle,
  title,
}: {
  children: ReactNode;
  subtitle: string;
  title: string;
}) {
  return (
    <section className="rounded-[1.35rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-[#15181d]">
      <h2 className="font-headline text-lg font-semi-bold text-slate-950 dark:text-slate-100">
        {title}
      </h2>
      <p className="mt-1 text-xs font-medium text-slate-500">{subtitle}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}
function DetailPanel({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-[1.35rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-[#15181d]">
      <h2 className="font-headline text-base font-semi-bold text-slate-950 dark:text-slate-100">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
function TextField({
  className,
  label,
  onChange,
  placeholder,
  value,
}: {
  className?: string;
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="text-[10px] font-semi-bold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-600">
        {label}
      </span>
      <input
        className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-slate-400 dark:border-white/[0.08] dark:bg-white/[0.055] dark:text-slate-100"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </label>
  );
}
function NumberField({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: number | null) => void;
  value: number | null;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-semi-bold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-600">
        {label}
      </span>
      <input
        className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-slate-400 dark:border-white/[0.08] dark:bg-white/[0.055] dark:text-slate-100"
        min={0}
        onChange={(event) =>
          onChange(
            event.target.value === "" ? null : Number(event.target.value)
          )
        }
        type="number"
        value={value ?? ""}
      />
    </label>
  );
}
function TextAreaField({
  compact,
  label,
  onChange,
  placeholder,
  value,
}: {
  compact?: boolean;
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <label className="block md:col-span-2">
      <span className="text-[10px] font-semi-bold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-600">
        {label}
      </span>
      <textarea
        className={cn(
          "mt-1 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold leading-6 text-slate-800 outline-none transition focus:border-slate-400 dark:border-white/[0.08] dark:bg-white/[0.055] dark:text-slate-100",
          compact ? "min-h-24" : "min-h-36"
        )}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </label>
  );
}
function SelectField({
  children,
  label,
  onChange,
  value,
}: {
  children: ReactNode;
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-semi-bold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-600">
        {label}
      </span>
      <select
        className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-slate-400 dark:border-white/[0.08] dark:bg-white/[0.055] dark:text-slate-100"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {children}
      </select>
    </label>
  );
}
function SwitchRow({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-3 dark:bg-white/[0.055]">
      <span className="text-sm font-semi-bold text-slate-700 dark:text-slate-200">
        {label}
      </span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}
function BulkButton({
  danger,
  disabled,
  label,
  onClick,
}: {
  danger?: boolean;
  disabled: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "h-9 rounded-lg px-3 text-xs font-semi-bold transition disabled:opacity-50",
        danger
          ? "bg-red-500 text-white hover:bg-red-600"
          : "bg-white/10 text-white hover:bg-white/15"
      )}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}
function CategoryPill({ category }: { category: VirujFacilityCategory }) {
  return (
    <span className="inline-flex w-fit items-center rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-700 ring-1 ring-slate-200 dark:bg-white/[0.08] dark:text-slate-200 dark:ring-white/[0.10]">
      {category}
    </span>
  );
}
function StatusPill({
  className,
  status,
}: {
  className?: string;
  status: VirujFacilityStatus;
}) {
  const styles =
    status === "active"
      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/14 dark:text-emerald-200"
      : status === "archived"
        ? "bg-slate-200 text-slate-700 dark:bg-white/[0.10] dark:text-slate-300"
        : "bg-amber-100 text-amber-800 dark:bg-amber-400/14 dark:text-amber-200";
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-lg px-2.5 text-[10px] font-bold uppercase tracking-[0.12em]",
        styles,
        className
      )}
    >
      {status}
    </span>
  );
}
function Badge({
  icon,
  label,
  tone,
}: {
  icon: ReactNode;
  label: string;
  tone?: "danger";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semi-bold",
        tone === "danger"
          ? "bg-red-50 text-red-700 dark:bg-red-400/10 dark:text-red-200"
          : "bg-slate-100 text-slate-700 dark:bg-white/[0.07] dark:text-slate-200"
      )}
    >
      {icon}
      {label}
    </span>
  );
}
function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/[0.055]">
      <p className="text-[10px] font-semi-bold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-bold text-slate-900 dark:text-slate-100">
        {value}
      </p>
    </div>
  );
}
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-3 text-sm last:border-b-0 dark:border-white/[0.06]">
      <span className="font-semibold text-slate-500">{label}</span>
      <span className="max-w-[60%] text-right font-semi-bold text-slate-900 dark:text-slate-100">
        {value}
      </span>
    </div>
  );
}

function parseFacilityRoute(segments: string[]): FacilityRoute {
  const facilityIndex = segments.indexOf("facilities");
  const trailing = facilityIndex >= 0 ? segments.slice(facilityIndex + 1) : [];
  const first = trailing[0];
  const second = trailing[1];
  if (first === "new") return { mode: "create" };
  if (first && first !== "dashboard")
    return { id: first, mode: second === "edit" ? "edit" : "detail" };
  return { mode: "list" };
}
function filterAndSortFacilities(
  facilities: VirujFacility[],
  query: string,
  filters: FilterState,
  sortKey: SortKey
) {
  const normalizedQuery = query.trim().toLowerCase();
  return facilities
    .filter((facility) => {
      const matchesQuery =
        !normalizedQuery ||
        [
          facility.name,
          facility.category,
          facility.shortDescription,
          facility.description,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesCategory =
        filters.category === "all" || facility.category === filters.category;
      const matchesStatus =
        filters.status === "all" || facility.status === filters.status;
      const matchesFeatured =
        filters.featured === "all" ||
        (filters.featured === "featured"
          ? facility.isFeatured
          : !facility.isFeatured);
      const matchesQuick =
        filters.quick === "all" ||
        (filters.quick === "twentyfour" && facility.available247) ||
        (filters.quick === "emergency" && facility.emergencyService) ||
        (filters.quick === "online" && facility.onlineBooking) ||
        (filters.quick === "appointment" && facility.appointmentRequired);
      return (
        matchesQuery &&
        matchesCategory &&
        matchesStatus &&
        matchesFeatured &&
        matchesQuick
      );
    })
    .sort((first, second) => {
      switch (sortKey) {
        case "alphabetical":
          return first.name.localeCompare(second.name);
        case "display-order":
          return first.displayOrder - second.displayOrder;
        case "featured":
          return (
            Number(second.isFeatured) - Number(first.isFeatured) ||
            first.displayOrder - second.displayOrder
          );
        case "newest":
          return (
            new Date(second.createdAt).getTime() -
            new Date(first.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(first.createdAt).getTime() -
            new Date(second.createdAt).getTime()
          );
        case "updated":
        default:
          return (
            new Date(second.updatedAt).getTime() -
            new Date(first.updatedAt).getTime()
          );
      }
    });
}
function buildFacilityStats(facilities: VirujFacility[]) {
  return [
    {
      icon: <ClipboardList size={18} />,
      label: "Total Services",
      value: String(facilities.length),
    },
    {
      icon: <CheckCircle2 size={18} />,
      label: "Active",
      value: String(facilities.filter((item) => item.status === "active").length),
    },
    {
      icon: <Star size={18} />,
      label: "Featured",
      value: String(facilities.filter((item) => item.isFeatured).length),
    },
    {
      icon: <Zap size={18} />,
      label: "24x7",
      value: String(facilities.filter((item) => item.available247).length),
    },
  ];
}
function validateFacilityForm(
  form: VirujFacilityInput,
  existingFacilities: VirujFacility[]
) {
  const errors: string[] = [];
  if (!form.name.trim()) errors.push("Service Name is required.");
  if (!form.category) errors.push("Category is required.");
  if (form.startingPrice !== null && form.startingPrice < 0)
    errors.push("Price cannot be negative.");
  const slug = form.slug || slugify(form.name);
  if (slug && existingFacilities.some((facility) => facility.slug === slug))
    errors.push("Slug must be unique.");
  return errors;
}
function getFacilityPermissions(
  role?: string | null
): Record<FacilityAction, boolean> {
  const normalized = role?.toUpperCase();
  const all = {
    archive: true,
    create: true,
    delete: true,
    publish: true,
    read: true,
    update: true,
  };
  if (
    !normalized ||
    ["OWNER", "ADMIN", "ORG_ADMIN", "CLINIC_OWNER", "CLINIC_ADMIN"].includes(
      normalized
    )
  )
    return all;
  if (["MANAGER"].includes(normalized)) return { ...all, delete: false };
  if (["RECEPTIONIST", "APPOINTMENT_HANDLER"].includes(normalized))
    return {
      archive: false,
      create: false,
      delete: false,
      publish: false,
      read: true,
      update: true,
    };
  return {
    archive: false,
    create: false,
    delete: false,
    publish: false,
    read: true,
    update: false,
  };
}
function toFacilityInput(facility: VirujFacility): VirujFacilityInput {
  return {
    appointmentRequired: facility.appointmentRequired,
    available247: facility.available247,
    bannerImage: facility.bannerImage,
    category: facility.category,
    currency: facility.currency,
    description: facility.description,
    displayOrder: facility.displayOrder,
    emergencyService: facility.emergencyService,
    galleryImages: facility.galleryImages,
    isAvailable: facility.isAvailable,
    isFeatured: facility.isFeatured,
    keywords: facility.keywords,
    name: facility.name,
    onlineBooking: facility.onlineBooking,
    priceText: facility.priceText,
    seoDescription: facility.seoDescription,
    seoTitle: facility.seoTitle,
    shortDescription: facility.shortDescription,
    slug: facility.slug,
    startingPrice: facility.startingPrice,
    status: facility.status,
    visibility: facility.visibility,
  };
}
function formatPrice(facility: VirujFacility) {
  if (facility.priceText) return facility.priceText;
  if (facility.startingPrice !== null)
    return `${facility.currency === "INR" ? "Rs" : facility.currency} ${facility.startingPrice.toLocaleString("en-IN")}`;
  return "Optional";
}
function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
function splitComma(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
function readImage(file: File, onImage: (value: string) => void) {
  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result === "string") onImage(reader.result);
  };
  reader.readAsDataURL(file);
}
async function readImages(event: ChangeEvent<HTMLInputElement>) {
  const files = Array.from(event.target.files ?? []);
  const images = await Promise.all(
    files.map(
      (file) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () =>
            resolve(typeof reader.result === "string" ? reader.result : "");
          reader.readAsDataURL(file);
        })
    )
  );
  return images.filter(Boolean);
}
