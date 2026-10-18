import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Mail,
  Phone,
  Clock3,
  Smartphone,
} from "lucide-react";
import { VirujLogo } from "@/components/brand/viruj-logo";
import { virujBrand } from "@/lib/viruj-brand";

export const metadata = { title: "About & support | Viruj Health" };

export default function AboutVirujPage() {
  return (
    <main className="min-h-screen bg-surface px-5 py-10 text-on-surface dark:bg-[#0b0d10] dark:text-slate-100">
      <div className="mx-auto max-w-4xl space-y-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:underline"
        >
          <ArrowLeft size={16} />
          Back to workspace
        </Link>
        <section className="rounded-3xl bg-white p-6 shadow-sm dark:bg-[#17191e] sm:p-10">
          <div className="flex items-center gap-3">
            <VirujLogo className="size-16" />
            <div>
              <p className="text-xl font-semibold">{virujBrand.name}</p>
              <p className="text-xs text-slate-500">{virujBrand.company}</p>
            </div>
          </div>
          <h1 className="mt-8 text-3xl font-semibold tracking-tight">
            Connected care. One Viruj.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500 dark:text-slate-400">
            Your ERP workspace brings practice operations together with the
            Viruj Health patient experience. Manage your organization, care
            team, services, and appointment requests while patients discover
            care through the Viruj app.
          </p>
        </section>
        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-3xl bg-white p-6 shadow-sm dark:bg-[#17191e]">
            <Mail className="mb-4 text-primary" size={24} />
            <h2 className="text-lg font-semibold">We’re here to help</h2>
            <p className="mt-2 text-sm text-slate-500">
              Contact the Viruj Health support team.
            </p>
            <div className="mt-6 space-y-5 text-sm">
              <a
                href={`mailto:${virujBrand.email}`}
                className="flex items-center gap-3 hover:underline"
              >
                <Mail size={17} />
                {virujBrand.email}
              </a>
              <a
                href={virujBrand.phoneHref}
                className="flex items-center gap-3 hover:underline"
              >
                <Phone size={17} />
                {virujBrand.phone}
              </a>
              <p className="flex items-start gap-3 text-slate-500">
                <Clock3 size={17} className="mt-0.5 shrink-0" />
                {virujBrand.supportHours}
              </p>
            </div>
          </section>
          <section className="rounded-3xl bg-white p-6 shadow-sm dark:bg-[#17191e]">
            <Smartphone className="mb-4 text-primary" size={24} />
            <h2 className="text-lg font-semibold">The Viruj patient app</h2>
            <p className="mt-2 text-sm leading-7 text-slate-500">
              Discover doctors, hospitals, and diagnostic labs. Request
              appointments, access health records, and explore the Viruj
              community.
            </p>
            <a
              href={virujBrand.patientApp}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white"
            >
              Open patient app
              <ArrowUpRight size={16} />
            </a>
          </section>
        </div>
        <section className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-white p-6 dark:bg-[#17191e]">
          <div>
            <h2 className="text-sm font-semibold">Privacy at Viruj Health</h2>
            <p className="mt-1 text-xs text-slate-500">
              Read the patient app’s privacy policy.
            </p>
          </div>
          <a
            href={virujBrand.privacy}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            Privacy policy
            <ArrowUpRight size={16} />
          </a>
        </section>
        <footer className="text-center text-xs text-slate-500">
          © {new Date().getFullYear()} {virujBrand.company} ·{" "}
          {virujBrand.location}
        </footer>
      </div>
    </main>
  );
}
