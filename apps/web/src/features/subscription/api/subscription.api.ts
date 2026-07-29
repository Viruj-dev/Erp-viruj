"use client";

import { notificationEvents } from "@/features/notifications/lib/notification-events";

const paymentUrl = process.env.NEXT_PUBLIC_VIRUJ_PAYMENT_URL || "http://localhost:4100";
const paymentApiUrl = `${paymentUrl.replace(/\/$/, "")}/api/v1`;
const paymentAccessToken = process.env.NEXT_PUBLIC_VIRUJ_PAYMENT_ACCESS_TOKEN;

type RequestOptions = {
  body?: unknown;
  errorMessage?: string;
  idempotencyKey?: string;
  method?: "DELETE" | "GET" | "PATCH" | "POST" | "PUT";
  successMessage?: string;
  suppressToast?: boolean;
};

async function paymentRequest<T>(path: string, options: RequestOptions = {}) {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (paymentAccessToken) headers.set("Authorization", `Bearer ${paymentAccessToken}`);
  if (options.idempotencyKey) headers.set("Idempotency-Key", options.idempotencyKey);

  const response = await fetch(`${paymentApiUrl}${path}`, {
    body: options.body ? JSON.stringify(options.body) : undefined,
    headers,
    method: options.method ?? "GET",
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message = responseErrorMessage(payload, `Payment service request failed (${response.status})`);
    if (!options.suppressToast) {
      notificationEvents.emit("api.error", {
        description: options.errorMessage ?? friendlyBillingError(message),
        method: options.method ?? "GET",
        path,
        status: response.status,
      });
    }
    throw new Error(message);
  }

  if (!options.suppressToast && options.method && options.method !== "GET") {
    notificationEvents.emit("api.success", {
      method: options.method,
      path,
      title: options.successMessage ?? "Billing action completed",
    });
  }

  const payload = (await response.json()) as { data: T };
  return payload.data;
}

function responseErrorMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const details = record.details;
    if (typeof record.message === "string") return record.message;
    if (typeof record.error === "string") return record.error;
    if (details && typeof details === "object") {
      const detailRecord = details as Record<string, unknown>;
      if (typeof detailRecord.message === "string") return detailRecord.message;
    }
  }
  return fallback;
}

function friendlyBillingError(message: string) {
  const value = message.toLowerCase();
  if (value.includes("missing permission")) return "Your current role cannot perform this billing action.";
  if (value.includes("plan")) return "This plan is no longer available. Refresh the page and choose again.";
  if (value.includes("idempotency")) return "This checkout was already started. Please wait or try again.";
  if (value.includes("tenant") || value.includes("organization")) return "Billing access for this organization could not be verified.";
  if (value.includes("gateway") || value.includes("razorpay")) return "The payment gateway is temporarily unavailable.";
  if (value.includes("subscription")) return "Subscription state changed. Refresh the page and try again.";
  return "The billing service could not complete this request.";
}

export type BillingCycle = "MONTHLY" | "ANNUAL";
export type SubscriptionStatus = "INCOMPLETE" | "TRIALING" | "ACTIVE" | "PAYMENT_PENDING" | "PAST_DUE" | "SUSPENDED" | "CANCELLED" | "EXPIRED";
export type InvoiceStatus = "DRAFT" | "OPEN" | "PAID" | "PAST_DUE" | "VOID" | "REFUNDED" | "PARTIALLY_REFUNDED";
export type PaymentStatus = "INITIATED" | "PENDING" | "AUTHORIZED" | "CAPTURED" | "FAILED" | "CANCELLED" | "REFUNDED" | "PARTIALLY_REFUNDED";
export type ProviderType = "DOCTOR" | "CLINIC" | "LAB" | "RADIOLOGY" | "HOSPITAL";

export type PlanFeature = { code: string; enabled: boolean; limit?: number };
export type PlanVersion = {
  id: string;
  planId: string;
  version: number;
  monthlyPrice: number;
  annualPrice: number;
  currency: string;
  trialDurationDays: number;
  features: PlanFeature[];
  fixedLimits: Record<string, number>;
  active: boolean;
  createdAt: string;
};
export type SubscriptionPlan = {
  id: string;
  code: string;
  providerType?: ProviderType;
  publicName: string;
  description?: string;
  currency: string;
  enabled: boolean;
  publicVisible: boolean;
  customPricing?: boolean;
  contactSales?: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  activeVersion: PlanVersion;
};
export type Subscription = {
  id: string;
  tenantId: string;
  organizationId: string;
  planId: string;
  planVersionId: string;
  billingCycle: BillingCycle;
  currency: string;
  status: SubscriptionStatus;
  trialStart?: string;
  trialEnd?: string;
  currentBillingPeriodStart?: string;
  currentBillingPeriodEnd?: string;
  nextBillingDate?: string;
  nextRetryDate?: string;
  gracePeriodEnd?: string;
  cancellationRequestedAt?: string;
  cancellationEffectiveAt?: string;
  cancelAtPeriodEnd: boolean;
  suspensionDate?: string;
  reactivationDate?: string;
  gatewayProvider?: string;
  gatewayCustomerId?: string;
  gatewaySubscriptionId?: string;
  createdAt: string;
  updatedAt: string;
};
export type SubscriptionChange = {
  id: string;
  subscriptionId: string;
  type: "UPGRADE" | "DOWNGRADE" | "CANCELLATION" | "REACTIVATION" | "ADD_ON_ACTIVATION" | "ADD_ON_REMOVAL";
  status: "REQUESTED" | "SCHEDULED" | "PAYMENT_REQUIRED" | "COMPLETED" | "CANCELLED" | "REJECTED";
  previousPlanId?: string;
  targetPlanId?: string;
  effectiveAt: string;
  priceDifference: number;
  tax: number;
  creditApplied: number;
  paymentId?: string;
  reason?: string;
  createdAt: string;
  completedAt?: string;
};
export type BillingProfile = {
  id: string;
  tenantId: string;
  organizationId: string;
  legalName: string;
  billingAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  gstin?: string;
  taxId?: string;
  billingEmail: string;
  financeContactName?: string;
  financeContactEmail?: string;
  financeContactPhone?: string;
  purchaseOrderReference?: string;
  defaultCurrency: string;
  createdAt: string;
  updatedAt: string;
};
export type Invoice = {
  id: string;
  invoiceNumber: string;
  subscriptionId: string;
  billingProfileSnapshot: Pick<BillingProfile, "legalName" | "billingAddress" | "city" | "state" | "postalCode" | "country" | "gstin" | "taxId" | "billingEmail">;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  lineItems: Array<{ id: string; kind: "PLAN" | "ADD_ON" | "TAX" | "CREDIT" | "DISCOUNT" | "ADJUSTMENT"; description: string; quantity: number; unitAmount: number; amount: number }>;
  subtotal: number;
  discount: number;
  creditApplied: number;
  tax: number;
  finalTotal: number;
  amountPaid: number;
  amountDue: number;
  currency: string;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  status: InvoiceStatus;
  immutable: boolean;
};
export type Payment = {
  id: string;
  invoiceId: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  methodType?: string;
  gatewayProvider: string;
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  gatewayTransactionReference?: string;
  failureCode?: string;
  failureMessage?: string;
  initiatedAt: string;
  confirmedAt?: string;
  failedAt?: string;
  refundedAmount: number;
};
export type PaymentMethod = {
  id: string;
  methodType: string;
  maskedValue: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  defaultMethod: boolean;
  mandateStatus?: "PENDING" | "ACTIVE" | "REVOKED";
  createdAt: string;
  updatedAt: string;
};
const fallbackTimestamp = "2026-01-01T00:00:00.000Z";

export const fallbackSubscriptionPlans: SubscriptionPlan[] = [
  createFallbackPlan({
    annualPrice: 9_000_000,
    code: "HOSPITAL_BASIC",
    providerType: "HOSPITAL",
    description: "Core hospital workflows for a single branch getting started with Viruj ERP.",
    displayOrder: 1,
    features: ["appointments", "patient_management", "inventory"],
    fixedLimits: { branches: 1, staffSeats: 50 },
    monthlyPrice: 750_000,
    publicName: "Hospital Basic",
  }),
  createFallbackPlan({
    annualPrice: 18_000_000,
    code: "HOSPITAL_COMPLETE",
    providerType: "HOSPITAL",
    description: "Expanded operations for hospitals with pharmacy, lab, radiology, telemedicine, and analytics modules.",
    displayOrder: 2,
    features: ["appointments", "patient_management", "inventory", "pharmacy", "laboratory", "radiology", "advanced_analytics", "telemedicine"],
    fixedLimits: { branches: 5, staffSeats: 250 },
    monthlyPrice: 1_500_000,
    publicName: "Hospital Complete",
  }),
  createFallbackPlan({
    annualPrice: 0,
    code: "HOSPITAL_ENTERPRISE",
    providerType: "HOSPITAL",
    customPricing: true,
    contactSales: true,
    description: "Multi-branch scale with custom integrations and priority support.",
    displayOrder: 3,
    features: ["appointments", "patient_management", "inventory", "pharmacy", "laboratory", "radiology", "advanced_analytics", "multi_branch", "telemedicine", "custom_integrations", "priority_support"],
    fixedLimits: { branches: 25, staffSeats: 1000 },
    monthlyPrice: 0,
    publicName: "Hospital Enterprise",
  }),
];
function createFallbackPlan(input: {
  annualPrice: number;
  code: string;
  providerType?: ProviderType;
  customPricing?: boolean;
  contactSales?: boolean;
  description: string;
  displayOrder: number;
  features: string[];
  fixedLimits: Record<string, number>;
  monthlyPrice: number;
  publicName: string;
}): SubscriptionPlan {
  const planId = `plan_${input.code.toLowerCase()}`;

  return {
    id: planId,
    code: input.code,
    providerType: input.providerType,
    publicName: input.publicName,
    description: input.description,
    currency: "INR",
    enabled: true,
    publicVisible: true,
    customPricing: input.customPricing,
    contactSales: input.contactSales,
    displayOrder: input.displayOrder,
    createdAt: fallbackTimestamp,
    updatedAt: fallbackTimestamp,
    activeVersion: {
      id: `plan_ver_${input.code.toLowerCase()}_1`,
      planId,
      version: 1,
      monthlyPrice: input.monthlyPrice,
      annualPrice: input.annualPrice,
      currency: "INR",
      trialDurationDays: 14,
      features: input.features.map((code) => ({ code, enabled: true })),
      fixedLimits: input.fixedLimits,
      active: true,
      createdAt: fallbackTimestamp,
    },
  };
}
export type CheckoutResult = {
  payment: Payment;
  invoice: Invoice;
  checkout: {
    provider: string;
    gatewayOrderId: string;
    checkoutUrl?: string;
    publicKeyId?: string;
    amount?: number;
    currency?: string;
  };
};

export const subscriptionBillingApi = {
  billingProfileKey: ["viruj-payment", "billing-profile"] as const,
  checkout: (input?: { idempotencyKey?: string }) =>
    paymentRequest<CheckoutResult>("/payments/checkout", {
      idempotencyKey: input?.idempotencyKey ?? `checkout-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      method: "POST",
      successMessage: "Checkout created",
    }),
  createSubscription: (input: { billingCycle: BillingCycle; planCode: string; trial?: boolean }) =>
    paymentRequest<Subscription>("/subscription", {
      body: input,
      method: "POST",
      successMessage: input.trial ? "Trial started" : "Subscription setup started",
    }),
  current: () => paymentRequest<Subscription>("/subscription", { suppressToast: true }),
  currentKey: ["viruj-payment", "subscription", "current"] as const,
  downgrade: (input: { reason?: string; targetPlanCode: string }) =>
    paymentRequest<SubscriptionChange>("/subscription/downgrade", {
      body: input,
      method: "POST",
      successMessage: "Downgrade scheduled",
    }),
  getBillingProfile: () => paymentRequest<BillingProfile>("/billing-profile", { suppressToast: true }),
  getInvoice: (invoiceId: string) => paymentRequest<Invoice>(`/invoices/${invoiceId}`, { suppressToast: true }),
  invoiceKey: (invoiceId?: string) => ["viruj-payment", "invoice", invoiceId ?? "none"] as const,
  invoices: () => paymentRequest<Invoice[]>("/invoices", { suppressToast: true }),
  invoicesKey: ["viruj-payment", "invoices"] as const,
  paymentMethods: () => paymentRequest<PaymentMethod[]>("/payment-methods", { suppressToast: true }),
  paymentMethodsKey: ["viruj-payment", "payment-methods"] as const,
  payments: () => paymentRequest<Payment[]>("/payments", { suppressToast: true }),
  paymentsKey: ["viruj-payment", "payments"] as const,
  plans: () => paymentRequest<SubscriptionPlan[]>("/plans", { suppressToast: true }),
  plansKey: ["viruj-payment", "plans"] as const,
  reactivate: (input?: { reason?: string }) =>
    paymentRequest<Subscription>("/subscription/reactivate", {
      body: input ?? {},
      method: "POST",
      successMessage: "Subscription reactivated",
    }),
  cancel: (input?: { reason?: string }) =>
    paymentRequest<Subscription>("/subscription/cancel", {
      body: input ?? {},
      method: "POST",
      successMessage: "Cancellation scheduled",
    }),
  updateBillingProfile: (input: Partial<BillingProfile>) =>
    paymentRequest<BillingProfile>("/billing-profile", {
      body: input,
      method: "PATCH",
      successMessage: "Billing profile updated",
    }),
  upgrade: (input: { reason?: string; targetPlanCode: string }) =>
    paymentRequest<SubscriptionChange>("/subscription/upgrade", {
      body: input,
      method: "POST",
      successMessage: "Upgrade requested",
    }),
};
