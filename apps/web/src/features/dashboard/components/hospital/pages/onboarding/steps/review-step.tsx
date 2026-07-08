import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, Clock3, Globe2, ShieldCheck, Sparkles } from "lucide-react";
import { publicOptions } from "../constants";
import { HealthcareLaunchIllustration } from "../healthcare-launch-illustration";
import type { OnboardingState } from "../types";

export function ReviewStep({
  completionPercentage,
  data,
  summary,
}: {
  completionPercentage: number;
  data: OnboardingState;
  summary: Array<{ label: string; value: string }>;
}) {
  const hospitalName = data.profile.hospitalName || "Your hospital";
  const primaryBranch = data.branches[0];
  const enabledDepartments = data.departments.filter(
    (department) => !data.disabledDepartments.includes(department.name)
  );
  const launchChecks = [
    {
      label: "Organization identity",
      meta: data.profile.email || "Profile details saved",
      ready: Boolean(data.profile.hospitalName && data.profile.email),
    },
    {
      label: "Primary branch",
      meta: primaryBranch?.city || primaryBranch?.name || "Branch configured",
      ready: Boolean(primaryBranch?.name && primaryBranch?.address),
    },
    {
      label: "Care departments",
      meta: `${enabledDepartments.length} enabled`,
      ready: enabledDepartments.length > 0,
    },
    {
      label: "Patient app profile",
      meta: data.publicProfile.showHospitalProfile ? "Visible on Viruj" : "Hidden from Viruj",
      ready: data.publicProfile.showHospitalProfile,
    },
  ];
  const visiblePatientFeatures = publicOptions
    .filter(([key]) => data.publicProfile[key])
    .map(([, label]) => label.replace("Show ", "").replace("Display ", ""));

  return (
    <div className="space-y-4">
      <section className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#062d4f,#075985_58%,#22d3ee)] p-5 text-white shadow-[0_24px_70px_rgba(7,89,133,0.24)] md:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.26),transparent_36%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_45%)]" />
        <div className="relative grid gap-5 md:grid-cols-[minmax(0,1fr)_220px] md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-50">
              <Sparkles size={13} />
              Launch readiness
            </div>
            <h3 className="mt-5 text-[30px] font-semibold leading-tight tracking-tight md:text-[36px]">
              {hospitalName} is ready for day one.
            </h3>
            <p className="mt-3 max-w-lg text-sm font-medium leading-6 text-sky-100">
              Every required setup section is saved. Launch ERP now to start managing day-to-day hospital operations.
            </p>
            <div className="mt-6">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-sky-100">
                <span>Setup completion</span>
                <span>{completionPercentage}%</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-white/12">
                <motion.div
                  animate={{ width: `${completionPercentage}%` }}
                  className="h-2 rounded-full bg-[#38bdf8]"
                  initial={false}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <HealthcareLaunchIllustration />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-[minmax(0,1fr)_240px]">
        <div className="rounded-[22px] border border-[#d8d8d2] bg-[#eeeeea] p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#77786f]">
                Configuration summary
              </p>
              <h4 className="mt-1 text-lg font-semibold text-[#171916]">
                Core workspace
              </h4>
            </div>
            <span className="flex size-9 items-center justify-center rounded-full bg-[#e0f2fe] text-[#0284c7]">
              <ShieldCheck size={17} />
            </span>
          </div>

          <div className="grid gap-2">
            {summary.map((item) => (
              <div
                className="flex items-center justify-between gap-4 rounded-xl border border-[#d9dad3] bg-[#f7f7f3] px-3.5 py-3"
                key={item.label}
              >
                <span className="text-sm font-medium text-[#6d6f66]">
                  {item.label}
                </span>
                <span className="max-w-[220px] truncate text-right text-sm font-semibold text-[#171916]">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[22px] border border-[#d8d8d2] bg-[#f7f7f3] p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#77786f]">
            Patient app
          </p>
          <h4 className="mt-1 text-lg font-semibold text-[#171916]">
            Public visibility
          </h4>
          <div className="mt-4 flex flex-wrap gap-2">
            {visiblePatientFeatures.length ? (
              visiblePatientFeatures.map((feature) => (
                <span
                  className="rounded-full border border-[#bae6fd] bg-[#e0f2fe] px-3 py-1.5 text-xs font-semibold text-[#0284c7]"
                  key={feature}
                >
                  {feature}
                </span>
              ))
            ) : (
              <span className="rounded-full border border-[#ddd8cc] bg-[#f4eee3] px-3 py-1.5 text-xs font-semibold text-[#8a652d]">
                Profile hidden
              </span>
            )}
          </div>
          <div className="mt-5 rounded-2xl bg-[linear-gradient(135deg,#062d4f,#075985)] p-4 text-white">
            <Globe2 size={20} />
            <p className="mt-3 text-sm font-semibold">
              {data.publicProfile.showHospitalProfile ? "Ready to publish" : "Private workspace"}
            </p>
            <p className="mt-1 text-xs font-medium leading-5 text-sky-100">
              {data.publicProfile.showHospitalProfile
                ? "Patients will see the enabled profile sections in Viruj."
                : "You can publish the hospital profile later from settings."}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[22px] border border-[#d8d8d2] bg-[#f7f7f3] p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#77786f]">
              Final checks
            </p>
            <h4 className="mt-1 text-lg font-semibold text-[#171916]">
              Launch checklist
            </h4>
          </div>
          <span className="text-xs font-semibold text-[#77786f]">
            {launchChecks.filter((check) => check.ready).length}/{launchChecks.length} ready
          </span>
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          {launchChecks.map((check) => (
            <div
              className="flex items-start gap-3 rounded-xl border border-[#d9dad3] bg-[#eeeeea] p-3"
              key={check.label}
            >
              <span
                className={cn(
                  "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full",
                  check.ready ? "bg-[#e0f2fe] text-[#0284c7]" : "bg-[#f1e7d8] text-[#8a652d]"
                )}
              >
                {check.ready ? <Check size={15} /> : <Clock3 size={14} />}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-[#171916]">
                  {check.label}
                </span>
                <span className="mt-0.5 block truncate text-xs font-medium text-[#77786f]">
                  {check.meta}
                </span>
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

