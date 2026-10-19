export type WorkspaceRole =
  | "hospital"
  | "doctor"
  | "clinic"
  | "pathology"
  | "radiology";

export type WorkspaceTheme = {
  activeDot: string;
  activeIcon: string;
  activeNav: string;
  avatar: string;
  contentFrame: string;
  logoAura: string;
  profileRing: string;
  selection: string;
};

export const workspaceThemes: Record<WorkspaceRole, WorkspaceTheme> = {
  pathology: {
    activeDot: "bg-orange-600 shadow-[0_0_10px_2px_rgba(234,88,12,0.4)]",
    activeIcon: "text-orange-700 dark:text-orange-200",
    activeNav:
      "bg-orange-50 text-orange-800 shadow-sm dark:bg-orange-400/10 dark:text-orange-100",
    avatar:
      "bg-orange-100 text-orange-900 dark:bg-orange-500/20 dark:text-orange-200",
    contentFrame:
      "border-orange-200/70 bg-white/90 ring-orange-50 dark:border-orange-400/10 dark:bg-[#181512] dark:ring-white/[0.03]",
    logoAura:
      "bg-[conic-gradient(from_150deg,#fed7aa,#ea580c,#c2410c,#fed7aa)]",
    profileRing: "ring-orange-500/10",
    selection:
      "selection:bg-orange-500/15 selection:text-orange-800 dark:selection:text-orange-100",
  },
  radiology: {
    activeDot: "bg-zinc-500 shadow-[0_0_10px_2px_rgba(113,113,122,0.4)]",
    activeIcon: "text-zinc-700 dark:text-zinc-200",
    activeNav:
      "bg-zinc-200/70 text-zinc-950 shadow-sm dark:bg-zinc-400/15 dark:text-zinc-100",
    avatar: "bg-zinc-200 text-zinc-900 dark:bg-zinc-500/20 dark:text-zinc-200",
    contentFrame:
      "border-zinc-300/70 bg-zinc-50/90 ring-white/60 dark:border-zinc-400/10 dark:bg-[#161618] dark:ring-white/[0.03]",
    logoAura:
      "bg-[conic-gradient(from_150deg,#e4e4e7,#71717a,#3f3f46,#e4e4e7)]",
    profileRing: "ring-zinc-500/10",
    selection:
      "selection:bg-zinc-500/20 selection:text-zinc-900 dark:selection:text-zinc-100",
  },
  hospital: {
    activeDot: "bg-[#0f6cbf] shadow-[0_0_10px_2px_rgba(15,108,191,0.62)]",
    activeIcon: "text-blue-700 dark:text-blue-200",
    activeNav:
      "bg-white text-blue-700 shadow-sm dark:bg-blue-400/[0.12] dark:text-blue-100 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
    avatar:
      "bg-[#d7e3ff] text-[#09203c] dark:bg-blue-500/20 dark:text-blue-200",
    contentFrame:
      "border-slate-200/80 bg-white/88 ring-white/60 dark:border-white/[0.08] dark:bg-[#111418] dark:ring-white/[0.03]",
    logoAura:
      "bg-[conic-gradient(from_150deg,#7cf4ff,#315bff,#93c5fd,#7cf4ff)]",
    profileRing: "ring-primary/10",
    selection:
      "selection:bg-primary/15 selection:text-primary dark:selection:bg-blue-400/20 dark:selection:text-blue-100",
  },
  doctor: {
    activeDot: "bg-[#10b981] shadow-[0_0_10px_2px_rgba(16,185,129,0.58)]",
    activeIcon: "text-emerald-700 dark:text-emerald-200",
    activeNav:
      "bg-white text-emerald-700 shadow-sm dark:bg-emerald-400/[0.12] dark:text-emerald-100 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
    avatar:
      "bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-200",
    contentFrame:
      "border-emerald-100/80 bg-white/88 ring-white/60 dark:border-emerald-400/[0.12] dark:bg-[#111418] dark:ring-white/[0.03]",
    logoAura:
      "bg-[conic-gradient(from_150deg,#bbf7d0,#10b981,#047857,#bbf7d0)]",
    profileRing: "ring-emerald-500/10",
    selection:
      "selection:bg-emerald-500/15 selection:text-emerald-700 dark:selection:bg-emerald-400/20 dark:selection:text-emerald-100",
  },
  clinic: {
    activeDot: "bg-[#766cff] shadow-[0_0_10px_2px_rgba(118,108,255,0.62)]",
    activeIcon: "text-violet-700 dark:text-violet-200",
    activeNav:
      "bg-white text-violet-700 shadow-sm dark:bg-violet-400/[0.12] dark:text-violet-100 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
    avatar:
      "bg-violet-100 text-violet-900 dark:bg-violet-500/20 dark:text-violet-200",
    contentFrame:
      "border-violet-100/80 bg-white/88 ring-white/60 dark:border-violet-400/[0.12] dark:bg-[#111418] dark:ring-white/[0.03]",
    logoAura:
      "bg-[conic-gradient(from_150deg,#a78bfa,#7c3aed,#34d399,#a78bfa)]",
    profileRing: "ring-violet-500/10",
    selection:
      "selection:bg-violet-500/15 selection:text-violet-700 dark:selection:bg-violet-400/20 dark:selection:text-violet-100",
  },
};

export function resolveWorkspaceRole(organizationLabel: string): WorkspaceRole {
  const normalized = organizationLabel.toLowerCase();

  if (normalized === "pathology" || normalized === "radiology") {
    return normalized;
  }

  if (normalized === "doctor") {
    return "doctor";
  }

  if (normalized === "clinic") {
    return "clinic";
  }

  return "hospital";
}

export function getWorkspaceTheme(organizationLabel: string) {
  return workspaceThemes[resolveWorkspaceRole(organizationLabel)];
}
