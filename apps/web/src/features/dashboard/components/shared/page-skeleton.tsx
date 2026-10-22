import { Skeleton } from "@/components/ui/erp/skeleton";
import { cn } from "@/lib/utils";

export function SectionSkeleton({
  className,
  rows = 4,
}: {
  className?: string;
  rows?: number;
}) {
  return (
    <div
      role="status"
      aria-busy="true"
      className={cn("space-y-5 p-5", className)}
    >
      <span className="sr-only">Loading content…</span>
      <div aria-hidden="true" className="space-y-5">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="flex items-center gap-4">
            <Skeleton className="size-10 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3 w-2/5" />
              <Skeleton className="h-3 w-3/4" />
            </div>
            <Skeleton className="hidden h-6 w-20 rounded-full sm:block" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PageSkeleton({ dashboard = false }: { dashboard?: boolean }) {
  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-6 px-2 py-5 sm:px-3 lg:px-4">
      <div role="status" aria-busy="true" className="space-y-3">
        <span className="sr-only">Loading page…</span>
        <div aria-hidden="true" className="space-y-3">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-9 w-3/4 max-w-xl" />
          <Skeleton className="h-4 w-1/2 max-w-md" />
        </div>
      </div>
      {dashboard && (
        <div
          aria-hidden="true"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className="space-y-5 rounded-[22px] border border-slate-200/80 bg-white p-5 dark:border-white/10 dark:bg-[#17191e]"
            >
              <Skeleton className="size-10 rounded-2xl" />
              <Skeleton className="h-3 w-3/5" />
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          ))}
        </div>
      )}
      <div
        className={cn(
          "grid gap-5",
          dashboard && "xl:grid-cols-[minmax(0,1fr)_320px]"
        )}
      >
        <div className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-white dark:border-white/10 dark:bg-[#17191e]">
          {dashboard && <Skeleton aria-hidden="true" className="m-5 h-48" />}
          <SectionSkeleton rows={5} />
        </div>
        {dashboard && (
          <div className="rounded-[22px] border border-slate-200/80 bg-white dark:border-white/10 dark:bg-[#17191e]">
            <SectionSkeleton rows={3} />
          </div>
        )}
      </div>
    </div>
  );
}

export function WorkspaceSkeleton() {
  return (
    <div className="flex min-h-screen gap-5 bg-slate-50 p-3 dark:bg-[#101216]">
      <aside
        aria-hidden="true"
        className="hidden w-60 shrink-0 space-y-7 rounded-3xl bg-white p-5 dark:bg-[#17191e] lg:block"
      >
        <Skeleton className="h-10 w-4/5" />
        {Array.from({ length: 9 }, (_, index) => (
          <Skeleton key={index} className="h-8 w-full" />
        ))}
      </aside>
      <div className="min-w-0 flex-1">
        <div
          aria-hidden="true"
          className="mb-6 flex items-center justify-between rounded-3xl bg-white p-5 dark:bg-[#17191e]"
        >
          <Skeleton className="h-10 w-48" />
          <Skeleton className="size-10 rounded-full" />
        </div>
        <PageSkeleton dashboard />
      </div>
    </div>
  );
}
