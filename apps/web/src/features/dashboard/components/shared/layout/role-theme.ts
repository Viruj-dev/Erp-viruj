export type WorkspaceRole = "hospital" | "doctor" | "clinic";

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
  hospital: {
    activeDot:
      "bg-[#0f6cbf] shadow-[0_0_10px_2px_rgba(15,108,191,0.62)]",
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
    activeDot:
      "bg-[#10b981] shadow-[0_0_10px_2px_rgba(16,185,129,0.58)]",
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
    activeDot:
      "bg-[#766cff] shadow-[0_0_10px_2px_rgba(118,108,255,0.62)]",
    activeIcon: "text-violet-700 dark:text-violet-200",
    activeNav:
      "bg-white text-violet-700 shadow-sm dark:bg-violet-400/[0.12] dark:text-violet-100 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
    avatar:
      "bg-violet-100 text-violet-900 dark:bg-violet-500/20 dark:text-violet-200",
    contentFrame:
      "border-violet-100/80 bg-white/88 ring-white/60 dark:border-violet-400/[0.12] dark:bg-[#111418] dark:ring-white/[0.03]",
    logoAura:
      "bg-[conic-gradient(from_150deg,#7cf4ff,#315bff,#c2a3ff,#7cf4ff)]",
    profileRing: "ring-violet-500/10",
    selection:
      "selection:bg-violet-500/15 selection:text-violet-700 dark:selection:bg-violet-400/20 dark:selection:text-violet-100",
  },
};

export function resolveWorkspaceRole(organizationLabel: string): WorkspaceRole {
  const normalized = organizationLabel.toLowerCase();

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
