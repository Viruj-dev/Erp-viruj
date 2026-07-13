import type { InvoiceStatus, SubscriptionStatus } from "@/features/subscription/api/subscription.api";

export const subscriptionStatusMeta: Record<SubscriptionStatus, { label: string; tone: "danger" | "info" | "neutral" | "success" | "warning"; title: string; description: string }> = {
  ACTIVE: {
    description: "Your subscription is active and renews automatically.",
    label: "Active",
    title: "Subscription active",
    tone: "success",
  },
  CANCELLED: {
    description: "Your subscription has been cancelled. Reactivation is available when billing recovery is allowed.",
    label: "Cancelled",
    title: "Subscription cancelled",
    tone: "neutral",
  },
  EXPIRED: {
    description: "Choose a plan to restore access for this organization.",
    label: "Expired",
    title: "Subscription expired",
    tone: "danger",
  },
  INCOMPLETE: {
    description: "Complete payment to activate your selected plan.",
    label: "Incomplete",
    title: "Subscription setup is incomplete",
    tone: "warning",
  },
  PAST_DUE: {
    description: "Your renewal payment failed. Retry payment or update the payment method before the grace period ends.",
    label: "Past due",
    title: "Renewal payment failed",
    tone: "danger",
  },
  PAYMENT_PENDING: {
    description: "Your payment is being verified. The subscription will update after backend confirmation.",
    label: "Payment pending",
    title: "Payment verification in progress",
    tone: "info",
  },
  SUSPENDED: {
    description: "Billing recovery remains available and hospital data has not been deleted.",
    label: "Suspended",
    title: "Subscription suspended",
    tone: "danger",
  },
  TRIALING: {
    description: "Your free trial is active. Add payment details to continue without interruption.",
    label: "Trialing",
    title: "Free trial active",
    tone: "info",
  },
};

export const invoiceStatusLabels: Record<InvoiceStatus, string> = {
  DRAFT: "Draft",
  OPEN: "Open",
  PAID: "Paid",
  PARTIALLY_REFUNDED: "Partially Refunded",
  PAST_DUE: "Past Due",
  REFUNDED: "Refunded",
  VOID: "Void",
};

export function canInvoiceBePaid(status: InvoiceStatus) {
  return status === "OPEN" || status === "PAST_DUE";
}

