"use client";

import {
  Building2,
  Clock,
  Globe2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
} from "lucide-react";
import { DashboardPageShell } from "@/features/dashboard/components/shared/dashboard-page-shell";

const facilities = [
  "24/7 Emergency",
  "ICU & HDU",
  "Digital radiology",
  "Pathology lab",
  "Cashless insurance",
  "Online appointments",
];

const departments = [
  { doctors: 14, name: "Cardiology" },
  { doctors: 9, name: "Orthopedics" },
  { doctors: 11, name: "General Medicine" },
  { doctors: 6, name: "Pediatrics" },
];

export function HospitalProfilePage({
  organizationLabel,
}: {
  organizationLabel: string;
}) {
  const isClinic = organizationLabel.toLowerCase() === "clinic";
  const theme = isClinic
    ? "from-[#35206f] via-[#5b32b4] to-[#8b5cf6]"
    : "from-blue-950 via-blue-800 to-cyan-700";

  return (
    <DashboardPageShell
      eyebrow={isClinic ? "Clinic Profile" : "Hospital Profile"}
      subtitle={`Manage the public ${isClinic ? "clinic" : "hospital"} profile patients see across Viruj.`}
      title={`${organizationLabel} Partner Profile`}
    >
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-[#14171b]">
        <div className={`bg-gradient-to-br ${theme} p-8 text-white`}>
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-3xl">
              <p className="text-xs font-semi-bold uppercase tracking-[0.28em] text-white/60">
                Public {isClinic ? "clinic" : "hospital"} profile
              </p>
              <h1 className="mt-4 font-headline text-4xl font-semi-bold leading-tight lg:text-5xl">
                {organizationLabel} partner profile
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75">
                This is the {isClinic ? "clinic" : "hospital"}-facing profile
                that powers patient app discovery, details, services, and
                doctors.
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <div className="flex items-center gap-2">
                <Star className="fill-amber-300 text-amber-300" size={18} />
                <span className="font-headline text-2xl font-semi-bold">
                  4.8
                </span>
              </div>
              <p className="mt-1 text-xs text-white/60">
                1,284 patient reviews
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <InfoRow
              icon={<Building2 size={18} />}
              label={isClinic ? "Clinic name" : "Hospital name"}
              value={isClinic ? "Viruj Family Clinic" : "Viruj Multispeciality Hospital"}
            />
            <InfoRow
              icon={<MapPin size={18} />}
              label="Address"
              value="Sector 18, Medical Avenue, New Delhi, India"
            />
            <InfoRow
              icon={<Phone size={18} />}
              label="Contact"
              value="+91 98765 43210"
            />
            <InfoRow
              icon={<Mail size={18} />}
              label="Email"
              value="care@virujhealth.com"
            />
            <InfoRow
              icon={<Globe2 size={18} />}
              label="Website"
              value="www.virujhealth.com"
            />
            <InfoRow
              icon={<Clock size={18} />}
              label="Hours"
              value="Open 24 hours, OPD 08:00 AM - 08:00 PM"
            />
          </div>

          <div className="rounded-2xl bg-slate-50 p-5 dark:bg-white/[0.045]">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-primary dark:text-blue-300" />
              <h2 className="font-headline text-xl font-semi-bold text-slate-950 dark:text-slate-100">
                App visibility
              </h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Profile is ready for patient app discovery. Doctors marked as
              published in the Doctors section will appear under this{" "}
              {isClinic ? "clinic" : "hospital"}.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Stat label="Published doctors" value="18" />
              <Stat label="Departments" value="12" />
              <Stat label="Monthly views" value="8.2k" />
              <Stat label="Bookings" value="1.4k" />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
        <Panel title="Facilities">
          <div className="grid gap-3 sm:grid-cols-2">
            {facilities.map((facility) => (
              <div
                className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 dark:bg-white/[0.055] dark:text-slate-200"
                key={facility}
              >
                {facility}
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Department coverage">
          <div className="space-y-3">
            {departments.map((department) => (
              <div
                className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-white/[0.055]"
                key={department.name}
              >
                <span className="font-bold text-slate-800 dark:text-slate-100">
                  {department.name}
                </span>
                <span className="text-sm font-semi-bold text-primary dark:text-blue-300">
                  {department.doctors} doctors
                </span>
              </div>
            ))}
          </div>
        </Panel>
      </section>
    </DashboardPageShell>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-4 rounded-2xl bg-slate-50 p-4 dark:bg-white/[0.045]">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm dark:bg-white/[0.08] dark:text-blue-300">
        {icon}
      </span>
      <div>
        <p className="text-[10px] font-semi-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-600">
          {label}
        </p>
        <p className="mt-1 font-bold text-slate-900 dark:text-slate-100">
          {value}
        </p>
      </div>
    </div>
  );
}

function Panel({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-[#14171b]">
      <h2 className="font-headline text-2xl font-semi-bold text-slate-950 dark:text-slate-100">
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-white/[0.06]">
      <p className="font-headline text-2xl font-semi-bold text-slate-950 dark:text-slate-100">
        {value}
      </p>
      <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-500">
        {label}
      </p>
    </div>
  );
}

