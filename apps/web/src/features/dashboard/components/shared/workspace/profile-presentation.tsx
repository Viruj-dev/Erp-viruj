"use client";
import Image from "next/image";
import { Building2 } from "lucide-react";
import type { ReactNode } from "react";

export function ProfileHero({
  name,
  logoUrl,
  coverUrl,
  subtitle,
  badge,
  children,
}: {
  name: string;
  logoUrl?: string;
  coverUrl?: string;
  subtitle?: string;
  badge?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-[var(--onboarding-accent-deep)] p-6 text-white sm:p-8">
      {coverUrl && (
        <Image
          src={coverUrl}
          alt=""
          fill
          unoptimized
          className="object-cover opacity-20"
          sizes="100vw"
        />
      )}
      <div className="relative flex flex-wrap items-center gap-5">
        <div className="relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-white/15 ring-1 ring-white/25">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={`${name} logo`}
              fill
              unoptimized
              className="object-cover"
              sizes="96px"
            />
          ) : (
            <Building2 size={40} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          {badge}
          <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">{name}</h2>
          <p className="mt-2 text-sm text-white/75">{subtitle}</p>
        </div>
        {children}
      </div>
    </section>
  );
}

export function ProfileDetailPanel({
  title,
  fields,
}: {
  title: string;
  fields: (readonly [string, string])[];
}) {
  return (
    <section className="rounded-2xl border border-[var(--onboarding-border)] bg-[var(--onboarding-panel)] p-5">
      <h2 className="mb-4 font-semibold">{title}</h2>
      <dl className="grid gap-4 sm:grid-cols-2">
        {fields.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs text-[var(--onboarding-muted)]">{label}</dt>
            <dd className="mt-1 break-words text-sm font-medium">
              {value || "Not provided"}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
