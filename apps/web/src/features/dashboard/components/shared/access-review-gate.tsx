"use client";
import { WorkspaceApprovalContext } from "@/features/dashboard/lib/workspace-approval";
import { resolveReviewWorkspace } from "@/features/dashboard/lib/review-workspace";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  clearCentralApiToken,
  setCentralApiTokenIdentity,
} from "@/lib/central-api-token";
import { virujBackend, type AccessReview } from "@/lib/viruj-backend";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/erp/dialog";
import { ShieldCheck, Clock3 } from "lucide-react";
import {
  buildTenantDashboardPath,
  isDashboardOrganizationType,
} from "@/features/dashboard/lib/routing";

export function ReviewCard({
  review,
  error,
  onRetry,
  onReapply,
}: {
  review?: AccessReview | null;
  error?: string;
  onRetry: () => void;
  onReapply?: () => void;
}) {
  const rejected = review?.status === "rejected";
  async function signOut() {
    await authClient.signOut();
    clearCentralApiToken();
    window.location.assign("/auth");
  }
  return (
    <main className="grid min-h-svh place-items-center bg-[#f4f7f6] p-6 text-[#183b36]">
      <section
        className="w-full max-w-lg rounded-2xl border border-[#d5e2de] bg-white p-8 shadow-sm sm:p-12"
        aria-labelledby="review-title"
      >
        <p className="mb-8 text-xs font-semibold uppercase tracking-[0.22em]">
          Viruj Health · Workspace access
        </p>
        <Clock3 className="mb-5 size-9 text-[#3a7767]" aria-hidden="true" />
        <h1 id="review-title" className="text-3xl font-semibold tracking-tight">
          {error
            ? "Unable to check your request"
            : rejected
              ? "Please update your application"
              : review?.status === "pending"
                ? "Your request is under review"
                : "Submitting your application"}
        </h1>
        <p className="mt-5 text-sm leading-7 text-[#55706a]" role="status">
          {error ||
            (rejected
              ? "We have reviewed your submission and need you to correct some information before applying again."
              : "Your onboarding details are saved. Our team will review your information and documents. We’ll email you when a decision is available. Your ERP workspace will become available after approval.")}
        </p>
        {rejected && review.reason && (
          <p className="mt-5 whitespace-pre-wrap rounded-lg bg-[#f4f7f6] p-4 text-sm leading-6">
            <strong>Review notes</strong>
            <br />
            {review.reason}
          </p>
        )}
        <div className="mt-8 flex flex-wrap gap-3">
          {rejected && <Button onClick={onReapply}>Update application</Button>}
          <Button variant="outline" onClick={onRetry}>
            {error ? "Retry" : "Check status"}
          </Button>
          <Button variant="ghost" onClick={() => void signOut()}>
            Back to sign in
          </Button>
        </div>
        <p className="mt-8 border-t border-[#e3ece9] pt-5 text-xs leading-5 text-[#55706a]">
          No need to create another account. Your saved details stay with this
          application.
        </p>
      </section>
    </main>
  );
}

export function AccessReviewGate({ children }: { children: ReactNode }) {
  const pathname = usePathname(),
    router = useRouter();
  const session = authClient.useSession(),
    organization = authClient.useActiveOrganization();
  const organizations = authClient.useListOrganizations();
  const org = resolveReviewWorkspace(session.data, organization.data);
  const [result, setResult] = useState<{
    id: string;
    review: AccessReview;
  } | null>(null);
  const [error, setError] = useState("");
  const type = org?.organizationType;
  const dashboardRoute =
    pathname === "/dashboard" ||
    /^\/(hospital|clinic|doctor|pathology|radiology)(\/|$)/.test(pathname);
  const routedOrganization = organizations.data?.find(
    (item) => item.slug === pathname.split("/")[2]
  );
  const matchesActive =
    !routedOrganization || routedOrganization.id === org?.id;
  const enabled =
    dashboardRoute && matchesActive && !!org?.id && !!session.data?.user;
  const refresh = useCallback(async () => {
    if (!enabled || !org?.id || !session.data?.user) return;
    setError("");
    setCentralApiTokenIdentity(`${session.data.user.id}:${org.id}`);
    try {
      let review = await virujBackend.accessReview.status(org.id);
      if (review.status === "unsubmitted" && review.completed)
        review = await virujBackend.accessReview.submit(org.id);
      setResult({ id: org.id, review });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    }
  }, [enabled, org?.id, session.data?.user?.id]);
  useEffect(() => {
    void refresh();
    window.addEventListener("access-review-changed", refresh);
    return () => window.removeEventListener("access-review-changed", refresh);
  }, [refresh, pathname]);
  const review = result?.id === org?.id ? result?.review : null;
  useEffect(() => {
    if (
      enabled &&
      review &&
      ["unsubmitted", "draft"].includes(review.status) &&
      !review.completed &&
      type &&
      isDashboardOrganizationType(type) &&
      org?.slug &&
      !pathname.includes("/onboarding/")
    )
      router.replace(buildTenantDashboardPath(type, org.slug, "onboarding"));
    if (
      enabled &&
      review?.status === "draft" &&
      type &&
      isDashboardOrganizationType(type) &&
      org?.slug &&
      !pathname.includes("/onboarding/")
    )
      router.replace(buildTenantDashboardPath(type, org.slug, "onboarding"));
  }, [enabled, review, type, org?.slug, pathname, router]);
  if (!enabled) return children;
  if (!review && !error)
    return (
      <main
        role="status"
        className="grid min-h-svh place-items-center bg-[#f4f7f6] text-sm text-[#183b36]"
      >
        Checking your workspace access…
      </main>
    );
  if (error || !review || ["pending", "rejected"].includes(review.status))
    return (
      <ReviewCard
        review={review}
        error={error}
        onRetry={() => void refresh()}
        onReapply={() => {
          if (!org) return;
          const orgType = org.organizationType ?? "";
          if (!isDashboardOrganizationType(orgType)) return;
          void virujBackend.accessReview
            .reapply(org.id)
            .then(() => {
              window.location.assign(
                buildTenantDashboardPath(orgType, org.slug, "onboarding")
              );
            })
            .catch((e) => setError(e.message));
        }}
      />
    );
  if (review.status === "approved")
    return (
      <WorkspaceApprovalContext.Provider value={org?.id ?? null}>
        {children}
      </WorkspaceApprovalContext.Provider>
    );
  return (
    <>
      <Dialog key={org?.id} defaultOpen>
        <DialogContent
          showCloseButton={false}
          className="rounded-2xl border-[#d5e2de] bg-white p-7 text-[#183b36] dark:border-[#2a4036] dark:bg-[#17241f] dark:text-[#e1eee8] sm:max-w-md"
        >
          <ShieldCheck
            className="size-8 text-emerald-700 dark:text-emerald-300"
            aria-hidden="true"
          />
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Before you start
            </DialogTitle>
            <DialogDescription className="leading-6 text-slate-600 dark:text-slate-300">
              Your details and documents will be saved and reviewed. Please fill
              them carefully. Incorrect details may lead to rejection. You can
              correct them and reapply.
            </DialogDescription>
          </DialogHeader>
          <DialogClose asChild>
            <Button className="mt-2 w-full">Got it, continue</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
      {children}
    </>
  );
}

export function SubmitAccessReview() {
  const organization = authClient.useActiveOrganization();
  const session = authClient.useSession();
  const org = resolveReviewWorkspace(session.data, organization.data);
  const [review, setReview] = useState<AccessReview | null>(null),
    [error, setError] = useState("");
  const submit = useCallback(async () => {
    if (!org?.id || !session.data?.user.id) return;
    setError("");
    setCentralApiTokenIdentity(`${session.data.user.id}:${org.id}`);
    try {
      setReview(await virujBackend.accessReview.submit(org.id));
      window.dispatchEvent(new Event("access-review-changed"));
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to submit. Please retry."
      );
    }
  }, [org?.id, session.data?.user.id]);
  useEffect(() => {
    void submit();
  }, [submit]);
  return (
    <ReviewCard review={review} error={error} onRetry={() => void submit()} />
  );
}
