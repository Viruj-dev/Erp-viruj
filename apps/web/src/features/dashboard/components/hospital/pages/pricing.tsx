"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ArrowRight, BadgeCheck, Check, CreditCard, Download, FileText, Loader2, RefreshCw, RotateCcw, ShieldCheck, Sparkles, X } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { notificationEvents } from "@/features/notifications/lib/notification-events";
import { DashboardPageShell } from "@/features/dashboard/components/shared/dashboard-page-shell";
import { Badge } from "@/features/dashboard/components/ui/badge";
import { Button } from "@/features/dashboard/components/ui/button";
import { Card } from "@/features/dashboard/components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/features/dashboard/components/ui/sheet";
import { Skeleton } from "@/features/dashboard/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/features/dashboard/components/ui/tabs";
import { Textarea } from "@/features/dashboard/components/ui/textarea";
import { subscriptionBillingApi, type BillingCycle, type BillingProfile, type CheckoutResult, type Invoice, type PaymentMethod, type Subscription, type SubscriptionPlan } from "@/features/subscription/api/subscription.api";
import { labelFeatureCode } from "@/features/subscription/utils/feature-labels";
import { annualEquivalentMonthly, billingCycleLabel, cycleNoun, formatMinorMoney, hasAnnualSavings, priceForCycle } from "@/features/subscription/utils/money";
import { getBillingPermissionsFromMember, hasBillingPermission } from "@/features/subscription/utils/subscription-access";
import { canInvoiceBePaid, invoiceStatusLabels, subscriptionStatusMeta } from "@/features/subscription/utils/subscription-status";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void; on: (event: string, callback: (response: unknown) => void) => void };
  }
}

type SubscriptionTab = "plans" | "current" | "invoices";
type VerificationState = "idle" | "initiated" | "received" | "verifying" | "activated" | "pending" | "failed";

const tabLabels: Record<SubscriptionTab, string> = {
  plans: "Plans",
  current: "Current Subscription",
  invoices: "Invoices",
};

export default function PricingPage({ organizationName = "Viruj Health" }: { organizationId?: string; organizationName?: string; role?: string | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const sessionState = authClient.useSession();
  const activeMemberState = authClient.useActiveMember();
  const sessionMember = getSessionMember(sessionState.data);
  const billingPermissions = getBillingPermissionsFromMember(
    sessionMember ?? activeMemberState.data
  );
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("MONTHLY");
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [verification, setVerification] = useState<{ paymentId?: string; startedAt?: number; state: VerificationState }>({ state: "idle" });

  const canRead = hasBillingPermission(billingPermissions, "subscription.read");
  const canChangePlan = hasBillingPermission(billingPermissions, "subscription.change_plan");
  const canCancel = hasBillingPermission(billingPermissions, "subscription.cancel");
  const canReactivate = hasBillingPermission(billingPermissions, "subscription.reactivate");
  const canManagePayment = hasBillingPermission(billingPermissions, "billing.payment_methods.manage");
  const canUpdateProfile = hasBillingPermission(billingPermissions, "billing.profile.update");
  const canReadInvoices = hasBillingPermission(billingPermissions, "billing.invoices.read");

  const plansQuery = useQuery({ queryFn: subscriptionBillingApi.plans, queryKey: subscriptionBillingApi.plansKey, retry: 1, staleTime: 60_000 });
  const subscriptionQuery = useQuery({ enabled: canRead, queryFn: subscriptionBillingApi.current, queryKey: subscriptionBillingApi.currentKey, retry: false, staleTime: 30_000 });
  const invoicesQuery = useQuery({ enabled: canReadInvoices, queryFn: subscriptionBillingApi.invoices, queryKey: subscriptionBillingApi.invoicesKey, retry: 1, staleTime: 30_000 });
  const paymentMethodsQuery = useQuery({ enabled: hasBillingPermission(billingPermissions, "billing.payment_methods.read"), queryFn: subscriptionBillingApi.paymentMethods, queryKey: subscriptionBillingApi.paymentMethodsKey, retry: 1, staleTime: 30_000 });
  const paymentsQuery = useQuery({ enabled: canReadInvoices, queryFn: subscriptionBillingApi.payments, queryKey: subscriptionBillingApi.paymentsKey, retry: 1, staleTime: 15_000 });
  const billingProfileQuery = useQuery({ enabled: canRead, queryFn: subscriptionBillingApi.getBillingProfile, queryKey: subscriptionBillingApi.billingProfileKey, retry: false, staleTime: 60_000 });
  const invoiceDetailQuery = useQuery({ enabled: Boolean(selectedInvoiceId), queryFn: () => subscriptionBillingApi.getInvoice(selectedInvoiceId as string), queryKey: subscriptionBillingApi.invoiceKey(selectedInvoiceId ?? undefined) });

  const subscription = subscriptionQuery.data ?? null;
  const plans = plansQuery.data ?? [];
  const currentPlan = subscription ? plans.find((plan) => plan.id === subscription.planId) ?? null : null;
  const defaultTab: SubscriptionTab = subscription ? "current" : "plans";
  const requestedTab = searchParams.get("tab") as SubscriptionTab | null;
  const activeTab: SubscriptionTab = requestedTab && requestedTab in tabLabels ? requestedTab : defaultTab;
  const latestInvoice = useMemo(() => newestInvoice(invoicesQuery.data ?? []), [invoicesQuery.data]);
  const latestPayment = useMemo(() => newestPayment(paymentsQuery.data ?? []), [paymentsQuery.data]);
  const defaultPaymentMethod = (paymentMethodsQuery.data ?? []).find((method) => method.defaultMethod) ?? paymentMethodsQuery.data?.[0] ?? null;

  const invalidateBilling = async () => {
    await queryClient.invalidateQueries({ queryKey: ["viruj-payment"] });
  };

  const startTrialMutation = useMutation({
    mutationFn: (plan: SubscriptionPlan) => subscriptionBillingApi.createSubscription({ billingCycle, planCode: plan.code, trial: true }),
    onSuccess: async () => {
      await invalidateBilling();
      notificationEvents.emit("toast.show", { title: "Trial started", description: "Your organization trial is active. Entitlements will refresh automatically.", tone: "success" });
      setTab("current");
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: () => subscriptionBillingApi.checkout(),
    onSuccess: async (checkout) => {
      setVerification({ paymentId: checkout.payment.id, startedAt: Date.now(), state: "initiated" });
      await openCheckout(checkout, organizationName, billingProfileQuery.data, () => {
        setVerification({ paymentId: checkout.payment.id, startedAt: Date.now(), state: "received" });
        notificationEvents.emit("toast.show", { title: "Payment received", description: "Waiting for secure backend confirmation before activating the subscription.", tone: "info" });
      });
    },
  });

  const purchaseMutation = useMutation({
    mutationFn: async (plan: SubscriptionPlan) => {
      if (!subscription) {
        await subscriptionBillingApi.createSubscription({ billingCycle, planCode: plan.code, trial: false });
        return "checkout" as const;
      }
      if (["INCOMPLETE", "PAST_DUE", "PAYMENT_PENDING"].includes(subscription.status)) return "checkout" as const;
      if (!currentPlan) return "checkout" as const;
      const currentPrice = priceForCycle(currentPlan.activeVersion, subscription.billingCycle);
      const targetPrice = priceForCycle(plan.activeVersion, subscription.billingCycle);
      if (targetPrice < currentPrice) {
        await subscriptionBillingApi.downgrade({ reason: `Scheduled from Plans & Subscription UI to ${plan.publicName}`, targetPlanCode: plan.code });
        return "scheduled" as const;
      }
      if (targetPrice > currentPrice) {
        await subscriptionBillingApi.upgrade({ reason: `Upgrade from Plans & Subscription UI to ${plan.publicName}`, targetPlanCode: plan.code });
        return "checkout" as const;
      }
      return "current" as const;
    },
    onSuccess: async (result) => {
      await invalidateBilling();
      if (result === "checkout") checkoutMutation.mutate();
      if (result === "scheduled") {
        notificationEvents.emit("toast.show", { title: "Downgrade scheduled", description: "Current features remain available until the effective date.", tone: "success" });
        setSelectedPlan(null);
        setTab("current");
      }
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => subscriptionBillingApi.cancel({ reason: cancelReason.trim() || undefined }),
    onSuccess: async () => {
      await invalidateBilling();
      setCancelOpen(false);
      setCancelReason("");
      notificationEvents.emit("toast.show", { title: "Cancellation scheduled", description: "Access remains available until the effective date shown on the subscription card.", tone: "warning" });
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: () => subscriptionBillingApi.reactivate({ reason: "Reactivated from Plans & Subscription UI" }),
    onSuccess: async () => {
      await invalidateBilling();
      notificationEvents.emit("toast.show", { title: "Subscription reactivated", description: "Entitlements are being refreshed for this organization.", tone: "success" });
    },
  });

  useEffect(() => {
    if (verification.state !== "received" && verification.state !== "verifying") return;
    const interval = window.setInterval(async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: subscriptionBillingApi.currentKey }),
        queryClient.invalidateQueries({ queryKey: subscriptionBillingApi.paymentsKey }),
        queryClient.invalidateQueries({ queryKey: subscriptionBillingApi.invoicesKey }),
      ]);
      const elapsed = Date.now() - (verification.startedAt ?? Date.now());
      const fresh = queryClient.getQueryData<Subscription>(subscriptionBillingApi.currentKey);
      if (fresh?.status === "ACTIVE" || fresh?.status === "TRIALING") {
        setVerification({ state: "activated" });
        notificationEvents.emit("toast.show", { title: "Subscription activated", description: "Billing is confirmed by the backend and ERP access can refresh.", tone: "success" });
        window.clearInterval(interval);
      } else if (elapsed > 45_000) {
        setVerification((value) => ({ ...value, state: "pending" }));
        window.clearInterval(interval);
      }
    }, 3_000);
    return () => window.clearInterval(interval);
  }, [queryClient, verification.startedAt, verification.state]);

  function setTab(value: SubscriptionTab) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  if (!canRead) {
    return (
      <DashboardPageShell eyebrow="Subscription" subtitle="Billing access is permission-controlled." title="Plans & Subscription">
        <EmptyState icon={<ShieldCheck size={20} />} title="Billing permissions required" description="Only users with subscription.read can view plans, subscription status, and invoices." />
      </DashboardPageShell>
    );
  }

  return (
    <DashboardPageShell
      actions={<Button disabled={subscriptionQuery.isFetching} onClick={() => void invalidateBilling()} size="sm" variant="outline"><RefreshCw className={cn(subscriptionQuery.isFetching && "animate-spin")} size={15} />Refresh</Button>}
      eyebrow="Subscription"
      subtitle="View plans, recover payments, manage the active subscription, and keep invoice access in one compact workspace."
      title="Plans & Subscription"
    >
      {verification.state !== "idle" ? <PaymentVerificationBanner state={verification.state} /> : null}
      <Tabs value={activeTab} onValueChange={(value) => setTab(value as SubscriptionTab)}>
        <TabsList className="grid h-auto w-full grid-cols-3 rounded-xl bg-slate-100 p-1 dark:bg-white/[0.06] sm:w-fit">
          {(Object.keys(tabLabels) as SubscriptionTab[]).map((tab) => <TabsTrigger className="rounded-lg px-3 py-2 text-xs sm:text-sm" key={tab} value={tab}>{tabLabels[tab]}</TabsTrigger>)}
        </TabsList>
        <TabsContent className="mt-4" value="plans">
          <PlansTab billingCycle={billingCycle} canChangePlan={canChangePlan} currentPlan={currentPlan} isLoading={plansQuery.isLoading} onBillingCycleChange={setBillingCycle} onSelectPlan={setSelectedPlan} onStartTrial={(plan) => startTrialMutation.mutate(plan)} plans={plans} subscription={subscription} trialPending={startTrialMutation.isPending} />
        </TabsContent>
        <TabsContent className="mt-4" value="current">
          <CurrentSubscriptionTab canCancel={canCancel} canManagePayment={canManagePayment} canReactivate={canReactivate} currentPlan={currentPlan} invoice={latestInvoice} isLoading={subscriptionQuery.isLoading} onCancel={() => setCancelOpen(true)} onChangePlan={() => setTab("plans")} onManagePayment={() => checkoutMutation.mutate()} onReactivate={() => reactivateMutation.mutate()} onRetryPayment={() => checkoutMutation.mutate()} paymentMethod={defaultPaymentMethod} subscription={subscription} />
        </TabsContent>
        <TabsContent className="mt-4" value="invoices">
          <InvoicesTab invoices={invoicesQuery.data ?? []} isLoading={invoicesQuery.isLoading} onPayNow={() => checkoutMutation.mutate()} onSelectInvoice={setSelectedInvoiceId} />
        </TabsContent>
      </Tabs>
      <ReviewPlanSheet billingCycle={billingCycle} canChangePlan={canChangePlan} currentPlan={currentPlan} invoice={latestInvoice} isPending={purchaseMutation.isPending || checkoutMutation.isPending} onConfirm={() => selectedPlan && purchaseMutation.mutate(selectedPlan)} onOpenChange={(open) => !open && setSelectedPlan(null)} plan={selectedPlan} subscription={subscription} />
      <InvoiceDetailSheet invoice={invoiceDetailQuery.data ?? null} isLoading={invoiceDetailQuery.isLoading} onOpenChange={(open) => !open && setSelectedInvoiceId(null)} onPayNow={() => checkoutMutation.mutate()} open={Boolean(selectedInvoiceId)} />
      <CancellationSheet canCancel={canCancel} isPending={cancelMutation.isPending} onConfirm={() => cancelMutation.mutate()} onOpenChange={setCancelOpen} open={cancelOpen} reason={cancelReason} setReason={setCancelReason} subscription={subscription} />
      <span className="sr-only">{canUpdateProfile ? "Billing profile updates available" : "Billing profile is read only"}</span>
      <span className="sr-only">Latest payment state: {latestPayment?.status ?? "none"}</span>
    </DashboardPageShell>
  );
}

function PlansTab({ billingCycle, canChangePlan, currentPlan, isLoading, onBillingCycleChange, onSelectPlan, onStartTrial, plans, subscription, trialPending }: { billingCycle: BillingCycle; canChangePlan: boolean; currentPlan: SubscriptionPlan | null; isLoading: boolean; onBillingCycleChange: (cycle: BillingCycle) => void; onSelectPlan: (plan: SubscriptionPlan) => void; onStartTrial: (plan: SubscriptionPlan) => void; plans: SubscriptionPlan[]; subscription: Subscription | null; trialPending: boolean }) {
  if (isLoading) return <PlansSkeleton />;
  if (!plans.length) return <EmptyState icon={<Sparkles size={20} />} title="No active plans" description="No public subscription plans are available from the billing service." />;
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/80 p-4 dark:border-white/[0.08] dark:bg-white/[0.04] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-950 dark:text-white">Choose a fixed-price plan</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Prices and entitlements are loaded from the payment backend.</p>
        </div>
        <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1 dark:bg-white/[0.06]">
          {(["MONTHLY", "ANNUAL"] as BillingCycle[]).map((cycle) => (
            <button className={cn("rounded-lg px-4 py-2 text-sm font-semibold transition", billingCycle === cycle ? "bg-white text-slate-950 shadow-sm dark:bg-white dark:text-slate-950" : "text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white")} key={cycle} onClick={() => onBillingCycleChange(cycle)} type="button">
              {billingCycleLabel(cycle)}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {plans.map((plan) => <PlanCard billingCycle={billingCycle} canChangePlan={canChangePlan} currentPlan={currentPlan} key={plan.id} onSelectPlan={onSelectPlan} onStartTrial={onStartTrial} plan={plan} subscription={subscription} trialPending={trialPending} />)}
      </div>
    </div>
  );
}

function PlanCard({ billingCycle, canChangePlan, currentPlan, onSelectPlan, onStartTrial, plan, subscription, trialPending }: { billingCycle: BillingCycle; canChangePlan: boolean; currentPlan: SubscriptionPlan | null; onSelectPlan: (plan: SubscriptionPlan) => void; onStartTrial: (plan: SubscriptionPlan) => void; plan: SubscriptionPlan; subscription: Subscription | null; trialPending: boolean }) {
  const isCurrent = currentPlan?.id === plan.id;
  const isEnterprise = plan.code.toLowerCase().includes("enterprise");
  const action = planAction(plan, currentPlan, subscription, billingCycle);
  const price = priceForCycle(plan.activeVersion, billingCycle);
  const equivalentMonthly = annualEquivalentMonthly(plan.activeVersion);
  const popular = plan.code.toLowerCase().includes("professional") || plan.displayOrder === 2;
  const features = plan.activeVersion.features.filter((feature) => feature.enabled);
  return (
    <Card className={cn("relative flex h-full flex-col border p-5 shadow-sm transition hover:border-primary/35", popular ? "border-primary/50 bg-primary/[0.03]" : "border-slate-200 bg-white/86 dark:border-white/[0.08] dark:bg-white/[0.04]") }>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-semibold text-slate-950 dark:text-white">{plan.publicName}</h3>
            {isCurrent ? <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">Current</Badge> : null}
            {popular ? <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">Most popular</Badge> : null}
          </div>
          <p className="mt-2 min-h-10 text-sm leading-5 text-slate-500 dark:text-slate-400">{plan.description ?? "Fixed-price Viruj ERP subscription plan."}</p>
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/[0.07] dark:bg-white/[0.035]">
        {isEnterprise ? <p className="text-2xl font-semibold text-slate-950 dark:text-white">Contact sales</p> : (
          <div className="flex items-end gap-2"><span className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">{formatMinorMoney(price, plan.currency)}</span><span className="pb-1 text-sm font-medium text-slate-500">/ {cycleNoun(billingCycle)}</span></div>
        )}
        <p className="mt-2 text-xs font-semibold text-slate-500">{billingCycle === "ANNUAL" ? "Billed annually" : "Billed monthly"}{billingCycle === "ANNUAL" && hasAnnualSavings(plan.activeVersion) && equivalentMonthly ? ` · Equivalent to ${formatMinorMoney(equivalentMonthly, plan.currency)} / month` : ""}</p>
      </div>
      <div className="mt-5 flex-1 space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Included features</p>
        {features.length ? <ul className="space-y-2">{features.slice(0, 8).map((feature) => <li className="flex gap-2 text-sm text-slate-700 dark:text-slate-300" key={feature.code}><Check className="mt-0.5 shrink-0 text-emerald-500" size={15} /><span>{labelFeatureCode(feature.code)}{typeof feature.limit === "number" ? ` · ${feature.limit}` : ""}</span></li>)}</ul> : <p className="text-sm text-slate-500">Feature list is managed by the billing catalog.</p>}
        {plan.activeVersion.trialDurationDays > 0 ? <p className="text-xs font-semibold text-blue-600 dark:text-blue-300">{plan.activeVersion.trialDurationDays}-day trial available</p> : null}
      </div>
      <div className="mt-6 grid gap-2">
        <Button disabled={!canChangePlan || action.disabled || trialPending} onClick={() => { if (isEnterprise) return; if (!subscription && plan.activeVersion.trialDurationDays > 0 && action.label === "Start Free Trial") { onStartTrial(plan); return; } onSelectPlan(plan); }} variant={action.variant}>
          {trialPending ? <Loader2 className="animate-spin" size={15} /> : null}{action.label}{!action.disabled ? <ArrowRight size={15} /> : null}
        </Button>
        {action.reason ? <p className="text-xs text-slate-500">{action.reason}</p> : null}
      </div>
    </Card>
  );
}

function CurrentSubscriptionTab({ canCancel, canManagePayment, canReactivate, currentPlan, invoice, isLoading, onCancel, onChangePlan, onManagePayment, onReactivate, onRetryPayment, paymentMethod, subscription }: { canCancel: boolean; canManagePayment: boolean; canReactivate: boolean; currentPlan: SubscriptionPlan | null; invoice: Invoice | null; isLoading: boolean; onCancel: () => void; onChangePlan: () => void; onManagePayment: () => void; onReactivate: () => void; onRetryPayment: () => void; paymentMethod: PaymentMethod | null; subscription: Subscription | null }) {
  if (isLoading) return <CurrentSkeleton />;
  if (!subscription) return <EmptyState icon={<CreditCard size={20} />} title="No subscription" description="Choose a plan to activate Viruj for your organization." action={<Button onClick={onChangePlan}>View Plans</Button>} />;
  const meta = subscriptionStatusMeta[subscription.status];
  const nextAmount = currentPlan ? priceForCycle(currentPlan.activeVersion, subscription.billingCycle) : invoice?.finalTotal;
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <main className="space-y-4">
        <StatusBanner subscription={subscription} />
        <Card className="border border-slate-200 bg-white/86 p-5 shadow-sm dark:border-white/[0.08] dark:bg-white/[0.04]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Current subscription</p><h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{currentPlan?.publicName ?? "Selected plan"}</h2><div className="mt-2 flex flex-wrap gap-2"><StatusPill tone={meta.tone}>{meta.label}</StatusPill><Badge variant="outline">{billingCycleLabel(subscription.billingCycle)}</Badge></div></div>
            <div className="flex flex-wrap gap-2"><Button onClick={onChangePlan} size="sm" variant="outline">Change Plan</Button>{subscription.status === "PAST_DUE" || subscription.status === "INCOMPLETE" ? <Button disabled={!canManagePayment} onClick={onRetryPayment} size="sm">Retry Payment</Button> : null}{subscription.status === "SUSPENDED" || subscription.status === "CANCELLED" || subscription.cancelAtPeriodEnd ? <Button disabled={!canReactivate} onClick={onReactivate} size="sm"><RotateCcw size={14} /> Keep Subscription</Button> : null}</div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3"><Fact label="Current period" value={dateRange(subscription.currentBillingPeriodStart, subscription.currentBillingPeriodEnd)} /><Fact label="Renews on" value={formatDate(subscription.nextBillingDate)} /><Fact label="Next payment" value={formatMinorMoney(nextAmount, subscription.currency)} /><Fact label="Trial ends" value={formatDate(subscription.trialEnd)} /><Fact label="Grace period ends" value={formatDate(subscription.gracePeriodEnd)} /><Fact label="Cancellation effective" value={formatDate(subscription.cancellationEffectiveAt)} /></div>
        </Card>
      </main>
      <aside className="space-y-4">
        <Card className="border border-slate-200 bg-white/86 p-5 shadow-sm dark:border-white/[0.08] dark:bg-white/[0.04]"><div className="flex items-center justify-between gap-3"><h3 className="font-semibold text-slate-950 dark:text-white">Payment method</h3><CreditCard className="text-slate-400" size={18} /></div><PaymentMethodSummary method={paymentMethod} /><Button className="mt-4 w-full" disabled={!canManagePayment} onClick={onManagePayment} variant="outline">Manage Payment Method</Button></Card>
        <Card className="border border-slate-200 bg-white/86 p-5 shadow-sm dark:border-white/[0.08] dark:bg-white/[0.04]"><h3 className="font-semibold text-slate-950 dark:text-white">Latest invoice</h3>{invoice ? <div className="mt-4 space-y-3 text-sm"><Fact label="Invoice" value={invoice.invoiceNumber} /><Fact label="Status" value={invoiceStatusLabels[invoice.status]} /><Fact label="Amount due" value={formatMinorMoney(invoice.amountDue, invoice.currency)} /></div> : <p className="mt-4 text-sm text-slate-500">No invoices have been generated yet.</p>}</Card>
        {canCancel && subscription.status !== "CANCELLED" ? <Button className="w-full" onClick={onCancel} variant="outline"><X size={15} /> Cancel Subscription</Button> : null}
      </aside>
    </div>
  );
}

function InvoicesTab({ invoices, isLoading, onPayNow, onSelectInvoice }: { invoices: Invoice[]; isLoading: boolean; onPayNow: () => void; onSelectInvoice: (id: string) => void }) {
  if (isLoading) return <TableSkeleton />;
  if (!invoices.length) return <EmptyState icon={<FileText size={20} />} title="No invoices" description="No invoices have been generated yet." />;
  return (
    <Card className="overflow-hidden border border-slate-200 bg-white/86 shadow-sm dark:border-white/[0.08] dark:bg-white/[0.04]">
      <div className="hidden grid-cols-[1fr_1.1fr_0.8fr_0.8fr_0.75fr_1fr] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:border-white/[0.08] dark:bg-white/[0.04] lg:grid"><span>Invoice Number</span><span>Billing Period</span><span>Issue Date</span><span>Amount</span><span>Status</span><span>Actions</span></div>
      <div className="divide-y divide-slate-200 dark:divide-white/[0.07]">{invoices.map((invoice) => <div className="grid gap-3 px-5 py-4 text-sm lg:grid-cols-[1fr_1.1fr_0.8fr_0.8fr_0.75fr_1fr] lg:items-center" key={invoice.id}><button className="text-left font-semibold text-primary" onClick={() => onSelectInvoice(invoice.id)} type="button">{invoice.invoiceNumber}</button><span className="text-slate-600 dark:text-slate-300">{dateRange(invoice.billingPeriodStart, invoice.billingPeriodEnd)}</span><span>{formatDate(invoice.issueDate)}</span><span className="font-semibold">{formatMinorMoney(invoice.finalTotal, invoice.currency)}</span><StatusPill tone={invoice.status === "PAID" ? "success" : invoice.status === "PAST_DUE" ? "danger" : "neutral"}>{invoiceStatusLabels[invoice.status]}</StatusPill><div className="flex flex-wrap gap-2"><Button onClick={() => onSelectInvoice(invoice.id)} size="sm" variant="outline">View</Button><Button disabled size="sm" title="Requires invoice document endpoint" variant="ghost"><Download size={14} /> Invoice</Button>{canInvoiceBePaid(invoice.status) ? <Button onClick={onPayNow} size="sm">Pay Now</Button> : null}</div></div>)}</div>
    </Card>
  );
}

function ReviewPlanSheet({ billingCycle, canChangePlan, currentPlan, invoice, isPending, onConfirm, onOpenChange, plan, subscription }: { billingCycle: BillingCycle; canChangePlan: boolean; currentPlan: SubscriptionPlan | null; invoice: Invoice | null; isPending: boolean; onConfirm: () => void; onOpenChange: (open: boolean) => void; plan: SubscriptionPlan | null; subscription: Subscription | null }) {
  const price = plan ? priceForCycle(plan.activeVersion, billingCycle) : 0;
  const isDowngrade = Boolean(plan && currentPlan && priceForCycle(plan.activeVersion, subscription?.billingCycle ?? billingCycle) < priceForCycle(currentPlan.activeVersion, subscription?.billingCycle ?? billingCycle));
  return (
    <Sheet open={Boolean(plan)} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader><SheetTitle>Review Plan</SheetTitle><SheetDescription>Confirm the plan, billing cycle, billing details, and payment handoff before checkout.</SheetDescription></SheetHeader>
        {plan ? <div className="space-y-5 px-4"><section className="rounded-xl border border-slate-200 p-4 dark:border-white/[0.08]"><h3 className="text-lg font-semibold">{plan.publicName} {billingCycleLabel(billingCycle)} Plan</h3><div className="mt-4 space-y-3 text-sm"><AmountLine label="Plan price" value={formatMinorMoney(price, plan.currency)} />{invoice ? <AmountLine label="Latest invoice due" value={formatMinorMoney(invoice.amountDue, invoice.currency)} /> : null}<AmountLine label="Tax and proration" value="Calculated by backend during checkout" /><AmountLine strong label="Payable now" value={subscription && isDowngrade ? "No payment now" : "Confirmed by checkout"} /></div></section><section className="rounded-xl border border-slate-200 p-4 dark:border-white/[0.08]"><h3 className="font-semibold">Billing details</h3><p className="mt-2 text-sm text-slate-500">These details appear on future invoices. Existing issued invoices will not be changed.</p></section>{isDowngrade ? <section className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200"><p className="font-semibold">This downgrade will take effect at the next billing period.</p><p className="mt-2">Features in the current plan remain available until the effective date confirmed by the backend.</p></section> : null}</div> : null}
        <SheetFooter><Button disabled={!canChangePlan || isPending || !plan} onClick={onConfirm}>{isPending ? <Loader2 className="animate-spin" size={15} /> : null}{isDowngrade ? "Schedule Downgrade" : "Continue to Payment"}</Button></SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function InvoiceDetailSheet({ invoice, isLoading, onOpenChange, onPayNow, open }: { invoice: Invoice | null; isLoading: boolean; onOpenChange: (open: boolean) => void; onPayNow: () => void; open: boolean }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader><SheetTitle>Invoice details</SheetTitle><SheetDescription>Issued invoices are read-only.</SheetDescription></SheetHeader>
        <div className="px-4">{isLoading ? <CurrentSkeleton /> : invoice ? <div className="space-y-5"><section className="rounded-xl border border-slate-200 p-4 dark:border-white/[0.08]"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">{invoice.invoiceNumber}</h3><p className="mt-1 text-sm text-slate-500">{dateRange(invoice.billingPeriodStart, invoice.billingPeriodEnd)}</p></div><StatusPill tone={invoice.status === "PAID" ? "success" : invoice.status === "PAST_DUE" ? "danger" : "neutral"}>{invoiceStatusLabels[invoice.status]}</StatusPill></div><div className="mt-4 grid gap-3 text-sm sm:grid-cols-2"><Fact label="Legal organization" value={invoice.billingProfileSnapshot.legalName} /><Fact label="Billing email" value={invoice.billingProfileSnapshot.billingEmail} /><Fact label="GSTIN" value={invoice.billingProfileSnapshot.gstin} /><Fact label="Billing address" value={`${invoice.billingProfileSnapshot.billingAddress}, ${invoice.billingProfileSnapshot.state}`} /></div></section><section className="space-y-2 rounded-xl border border-slate-200 p-4 dark:border-white/[0.08]">{invoice.lineItems.map((item) => <AmountLine key={item.id} label={item.description} value={formatMinorMoney(item.amount, invoice.currency)} />)}<div className="border-t border-slate-200 pt-2 dark:border-white/[0.08]" /><AmountLine label="Subtotal" value={formatMinorMoney(invoice.subtotal, invoice.currency)} /><AmountLine label="Discount" value={formatMinorMoney(invoice.discount, invoice.currency)} /><AmountLine label="Credits" value={formatMinorMoney(invoice.creditApplied, invoice.currency)} /><AmountLine label="Tax" value={formatMinorMoney(invoice.tax, invoice.currency)} /><AmountLine strong label="Total" value={formatMinorMoney(invoice.finalTotal, invoice.currency)} /><AmountLine label="Paid amount" value={formatMinorMoney(invoice.amountPaid, invoice.currency)} /><AmountLine strong label="Amount due" value={formatMinorMoney(invoice.amountDue, invoice.currency)} /></section></div> : <EmptyState icon={<FileText size={20} />} title="Invoice unavailable" description="The invoice could not be loaded." />}</div>
        <SheetFooter><Button disabled={!invoice || !canInvoiceBePaid(invoice.status)} onClick={onPayNow}>Pay Now</Button><Button disabled title="Requires invoice document endpoint" variant="outline"><Download size={15} /> Download Invoice</Button></SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function CancellationSheet({ canCancel, isPending, onConfirm, onOpenChange, open, reason, setReason, subscription }: { canCancel: boolean; isPending: boolean; onConfirm: () => void; onOpenChange: (open: boolean) => void; open: boolean; reason: string; setReason: (value: string) => void; subscription: Subscription | null }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader><SheetTitle>Cancel subscription</SheetTitle><SheetDescription>Preferred default is cancellation at the end of the current billing period.</SheetDescription></SheetHeader>
        <div className="space-y-4 px-4"><section className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200"><p className="font-semibold">Access remains until {formatDate(subscription?.currentBillingPeriodEnd) ?? "the backend effective date"}.</p><p className="mt-2">This does not delete hospital data. Reactivation remains available when supported by billing state.</p></section><label className="grid gap-2 text-sm font-semibold">Cancellation reason<Textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Tell us why you are cancelling" /></label></div>
        <SheetFooter><Button disabled={!canCancel || isPending} onClick={onConfirm} variant="destructive">{isPending ? <Loader2 className="animate-spin" size={15} /> : null} Schedule Cancellation</Button></SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function StatusBanner({ subscription }: { subscription: Subscription }) {
  const meta = subscriptionStatusMeta[subscription.status];
  return <section className={cn("rounded-2xl border p-4", bannerTone(meta.tone))} role={meta.tone === "danger" ? "alert" : "status"}><div className="flex gap-3">{meta.tone === "danger" || meta.tone === "warning" ? <AlertTriangle className="mt-0.5 shrink-0" size={18} /> : <BadgeCheck className="mt-0.5 shrink-0" size={18} />}<div><h3 className="font-semibold">{meta.title}</h3><p className="mt-1 text-sm leading-6">{meta.description}</p>{subscription.status === "TRIALING" && subscription.trialEnd ? <p className="mt-2 text-sm font-semibold">Trial ends on {formatDate(subscription.trialEnd)}.</p> : null}{subscription.status === "PAST_DUE" && subscription.gracePeriodEnd ? <p className="mt-2 text-sm font-semibold">Grace period ends on {formatDate(subscription.gracePeriodEnd)}.</p> : null}{subscription.cancelAtPeriodEnd && subscription.cancellationEffectiveAt ? <p className="mt-2 text-sm font-semibold">Cancellation is scheduled for {formatDate(subscription.cancellationEffectiveAt)}.</p> : null}</div></div></section>;
}

function PaymentVerificationBanner({ state }: { state: VerificationState }) {
  const copy: Record<VerificationState, { description: string; title: string }> = {
    activated: { description: "The backend confirmed the subscription and ERP access can refresh.", title: "Subscription activated" },
    failed: { description: "Payment failed. Retry payment or update the payment method.", title: "Payment failed" },
    idle: { description: "", title: "" },
    initiated: { description: "Razorpay checkout is opening.", title: "Payment initiated" },
    pending: { description: "Payment verification is taking longer than expected. You can safely leave this page and check again later.", title: "Verification pending" },
    received: { description: "Browser callback received. Waiting for webhook-backed confirmation.", title: "Payment received" },
    verifying: { description: "Checking the authoritative subscription status from the backend.", title: "Verifying payment" },
  };
  if (state === "idle") return null;
  return <section className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-blue-900 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-200" role="status"><div className="flex gap-3">{state === "verifying" || state === "initiated" ? <Loader2 className="mt-0.5 shrink-0 animate-spin" size={18} /> : <ShieldCheck className="mt-0.5 shrink-0" size={18} />}<div><h3 className="font-semibold">{copy[state].title}</h3><p className="mt-1 text-sm">{copy[state].description}</p></div></div></section>;
}

function PaymentMethodSummary({ method }: { method: PaymentMethod | null }) {
  if (!method) return <p className="mt-4 text-sm text-slate-500">No payment method is currently authorized.</p>;
  return <div className="mt-4 space-y-2 text-sm"><p className="font-semibold text-slate-950 dark:text-white">{method.brand ?? method.methodType} {method.maskedValue}</p><p className="text-slate-500">Expires {method.expiryMonth ? String(method.expiryMonth).padStart(2, "0") : "--"}/{method.expiryYear ?? "--"}</p><StatusPill tone={method.mandateStatus === "ACTIVE" ? "success" : method.mandateStatus === "PENDING" ? "info" : "warning"}>Recurring authorization: {method.mandateStatus ?? "Pending"}</StatusPill></div>;
}

function EmptyState({ action, description, icon, title }: { action?: ReactNode; description: string; icon: ReactNode; title: string }) {
  return <section className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center dark:border-white/[0.12] dark:bg-white/[0.03]"><span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">{icon}</span><h2 className="mt-4 text-lg font-semibold text-slate-950 dark:text-white">{title}</h2><p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">{description}</p>{action ? <div className="mt-5">{action}</div> : null}</section>;
}

function Fact({ label, value }: { label: string; value?: string | null }) { return <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{label}</p><p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">{value || "--"}</p></div>; }
function AmountLine({ label, strong = false, value }: { label: string; strong?: boolean; value: string }) { return <div className={cn("flex items-center justify-between gap-4", strong && "text-base font-semibold")}><span className="text-slate-500 dark:text-slate-400">{label}</span><span className="text-right font-semibold text-slate-950 dark:text-white">{value}</span></div>; }
function StatusPill({ children, tone }: { children: ReactNode; tone: "danger" | "info" | "neutral" | "success" | "warning" }) { return <span className={cn("inline-flex w-fit items-center rounded-md px-2 py-1 text-xs font-bold", pillTone(tone))}>{children}</span>; }
function PlansSkeleton() { return <div className="grid gap-4 md:grid-cols-3">{[0, 1, 2].map((item) => <Skeleton className="h-96 rounded-2xl" key={item} />)}</div>; }
function CurrentSkeleton() { return <Skeleton className="h-72 rounded-2xl" />; }
function TableSkeleton() { return <Skeleton className="h-80 rounded-2xl" />; }

function planAction(plan: SubscriptionPlan, currentPlan: SubscriptionPlan | null, subscription: Subscription | null, billingCycle: BillingCycle) {
  if (plan.code.toLowerCase().includes("enterprise")) return { disabled: false, label: "Contact Sales", reason: "Enterprise subscriptions require sales approval.", variant: "outline" as const };
  if (!subscription) return plan.activeVersion.trialDurationDays > 0 ? { disabled: false, label: "Start Free Trial", variant: "default" as const } : { disabled: false, label: "Choose Plan", variant: "default" as const };
  if (subscription.status === "SUSPENDED") return { disabled: currentPlan?.id !== plan.id, label: "Reactivate", reason: currentPlan?.id !== plan.id ? "Recover the current subscription before changing plans." : undefined, variant: "default" as const };
  if (subscription.status === "PAST_DUE") return { disabled: currentPlan?.id !== plan.id, label: currentPlan?.id === plan.id ? "Resolve Payment" : "Change After Recovery", reason: currentPlan?.id !== plan.id ? "Resolve the failed renewal before changing plans." : undefined, variant: "default" as const };
  if (currentPlan?.id === plan.id) return { disabled: true, label: "Current Plan", variant: "outline" as const };
  if (!currentPlan) return { disabled: false, label: "Choose Plan", variant: "default" as const };
  const targetPrice = priceForCycle(plan.activeVersion, subscription.billingCycle ?? billingCycle);
  const currentPrice = priceForCycle(currentPlan.activeVersion, subscription.billingCycle ?? billingCycle);
  return targetPrice < currentPrice ? { disabled: false, label: "Schedule Downgrade", variant: "outline" as const } : { disabled: false, label: "Upgrade", variant: "default" as const };
}

async function openCheckout(checkout: CheckoutResult, organizationName: string, profile: BillingProfile | null | undefined, onReceived: () => void) {
  if (checkout.checkout.checkoutUrl && !checkout.checkout.publicKeyId) { window.open(checkout.checkout.checkoutUrl, "_blank", "noopener,noreferrer"); onReceived(); return; }
  if (!checkout.checkout.publicKeyId) throw new Error("Checkout configuration is incomplete");
  await loadRazorpayScript();
  if (!window.Razorpay) throw new Error("Razorpay checkout is unavailable");
  const razorpay = new window.Razorpay({ amount: checkout.checkout.amount ?? checkout.payment.amount, currency: checkout.checkout.currency ?? checkout.payment.currency, description: checkout.invoice.invoiceNumber, handler: onReceived, key: checkout.checkout.publicKeyId, name: organizationName, order_id: checkout.checkout.gatewayOrderId, prefill: { email: profile?.billingEmail }, theme: { color: "#2563eb" } });
  razorpay.on("payment.failed", () => notificationEvents.emit("toast.show", { title: "Payment failed", description: "Retry payment or update the payment method.", tone: "error" }));
  razorpay.open();
}

function loadRazorpayScript() {
  return new Promise<void>((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("Checkout cannot run on the server"));
    if (window.Razorpay) return resolve();
    const existing = document.querySelector<HTMLScriptElement>('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) { existing.addEventListener("load", () => resolve(), { once: true }); existing.addEventListener("error", () => reject(new Error("Unable to load Razorpay checkout")), { once: true }); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Unable to load Razorpay checkout"));
    document.body.appendChild(script);
  });
}

function getSessionMember(session: unknown) {
  if (
    session &&
    typeof session === "object" &&
    "activeMember" in session &&
    session.activeMember &&
    typeof session.activeMember === "object"
  ) {
    return session.activeMember as { permissions?: string[]; role?: string };
  }

  return null;
}
function newestInvoice(invoices: Invoice[]) { return [...invoices].sort((a, b) => Date.parse(b.issueDate) - Date.parse(a.issueDate))[0] ?? null; }
function newestPayment(payments: Array<{ initiatedAt: string; status?: string }>) { return [...payments].sort((a, b) => Date.parse(b.initiatedAt) - Date.parse(a.initiatedAt))[0] ?? null; }
function formatDate(value?: string | null) { if (!value) return null; return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value)); }
function dateRange(start?: string | null, end?: string | null) { const a = formatDate(start); const b = formatDate(end); return a && b ? `${a} - ${b}` : a ?? b ?? "--"; }
function pillTone(tone: "danger" | "info" | "neutral" | "success" | "warning") { return { danger: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300", info: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300", neutral: "bg-slate-100 text-slate-700 dark:bg-white/[0.08] dark:text-slate-300", success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300", warning: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300" }[tone]; }
function bannerTone(tone: "danger" | "info" | "neutral" | "success" | "warning") { return { danger: "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200", info: "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-200", neutral: "border-slate-200 bg-slate-50 text-slate-800 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-200", success: "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200", warning: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200" }[tone]; }
