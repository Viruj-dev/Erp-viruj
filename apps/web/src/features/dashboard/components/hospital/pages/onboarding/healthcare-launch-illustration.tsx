import { Check, Hospital, Moon, Sun } from "lucide-react";

export function HealthcareLaunchIllustration() {
  return (
    <div className="relative mx-auto h-48 max-w-[280px]">
      <div className="absolute inset-x-8 bottom-0 h-24 rounded-[28px] bg-white/12" />
      <div className="absolute bottom-8 left-1/2 h-28 w-32 -translate-x-1/2 rounded-[26px] bg-white text-[var(--onboarding-accent-deep)] shadow-2xl">
        <div className="flex h-full flex-col items-center justify-center gap-3">
          <Hospital size={42} />
          <span className="h-2 w-16 rounded-full bg-cyan-200" />
          <span className="h-2 w-10 rounded-full bg-cyan-100/70" />
        </div>
      </div>
      <div className="absolute left-2 top-8 flex size-14 items-center justify-center rounded-2xl bg-cyan-200 text-[var(--onboarding-accent-deep)] shadow-xl">
        <Sun size={24} />
      </div>
      <div className="absolute right-5 top-2 flex size-14 items-center justify-center rounded-2xl bg-white/14 text-cyan-100 shadow-xl">
        <Moon size={24} />
      </div>
      <div className="absolute bottom-10 right-0 flex size-12 items-center justify-center rounded-2xl bg-cyan-300 text-sky-950 shadow-xl">
        <Check size={23} />
      </div>
    </div>
  );
}

