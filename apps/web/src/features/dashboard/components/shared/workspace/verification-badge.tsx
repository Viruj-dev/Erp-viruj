import { BadgeCheck, ShieldQuestion } from "lucide-react";
export function VerificationBadge({ status }: { status?: string }) {
  const verified = status?.toLowerCase() === "verified";
  const Icon = verified ? BadgeCheck : ShieldQuestion;
  return (
    <span
      title={
        verified
          ? "Documentation reviewed and approved"
          : "Documentation is missing or awaiting approval"
      }
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${verified ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300" : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200"}`}
    >
      <Icon size={14} />
      {verified ? "Verified" : "Unverified"}
    </span>
  );
}
