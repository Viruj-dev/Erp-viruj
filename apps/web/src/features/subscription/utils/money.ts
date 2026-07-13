import type { BillingCycle, PlanVersion } from "@/features/subscription/api/subscription.api";

export function formatMinorMoney(amount: number | null | undefined, currency = "INR") {
  if (!Number.isSafeInteger(amount ?? 0)) return "--";
  return new Intl.NumberFormat("en-IN", {
    currency,
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
    style: "currency",
  }).format((amount ?? 0) / 100);
}

export function priceForCycle(version: PlanVersion, billingCycle: BillingCycle) {
  return billingCycle === "ANNUAL" ? version.annualPrice : version.monthlyPrice;
}

export function cycleNoun(billingCycle: BillingCycle) {
  return billingCycle === "ANNUAL" ? "year" : "month";
}

export function billingCycleLabel(billingCycle: BillingCycle) {
  return billingCycle === "ANNUAL" ? "Annual" : "Monthly";
}

export function annualEquivalentMonthly(version: PlanVersion) {
  if (!Number.isSafeInteger(version.annualPrice) || version.annualPrice <= 0) return null;
  return Math.floor(version.annualPrice / 12);
}

export function hasAnnualSavings(version: PlanVersion) {
  return Number.isSafeInteger(version.monthlyPrice) && version.monthlyPrice * 12 > version.annualPrice;
}

