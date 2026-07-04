"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type DashboardPageShellTone = "blue" | "slate" | "violet";

const eyebrowTone: Record<DashboardPageShellTone, string> = {
  blue: "text-blue-500 dark:text-blue-400",
  slate: "text-slate-400 dark:text-slate-600",
  violet: "text-violet-500",
};

export function DashboardPageShell({
  actions,
  children,
  className,
  eyebrow,
  framed = false,
  subtitle,
  title,
  tone = "blue",
}: {
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  eyebrow: string;
  framed?: boolean;
  subtitle: string;
  title: string;
  tone?: DashboardPageShellTone;
}) {
  const header = (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p
          className={cn(
            "text-[10px] font-semibold uppercase tracking-[0.22em]",
            eyebrowTone[tone]
          )}
        >
          {eyebrow}
        </p>
        <h1 className="mt-2 font-headline text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">
          {title}
        </h1>
        <p className="mt-1 max-w-2xl text-sm font-medium text-slate-500 dark:text-slate-500">
          {subtitle}
        </p>
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  );

  if (framed) {
    return (
      <div className={cn("p-6 lg:p-5", className)}>
        <section className="space-y-6 rounded-[2rem] border border-slate-200 bg-white/85 p-5 shadow-sm dark:border-white/[0.08] dark:bg-[#111418]">
          {header}
          {children}
        </section>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6 p-6 lg:p-5", className)}>
      {header}
      {children}
    </div>
  );
}

