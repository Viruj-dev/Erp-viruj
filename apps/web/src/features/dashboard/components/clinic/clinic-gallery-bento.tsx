"use client";

import { Camera } from "lucide-react";
import type { ReactNode } from "react";

export type ClinicGalleryBentoItem = {
  id: string;
  title: string;
  subtitle: string;
  featured?: boolean;
};

type ClinicGalleryBentoSlot =
  | "hero"
  | "middleTop"
  | "middleBottom"
  | "rightTop"
  | "rightBottom";

const slotOrder: ClinicGalleryBentoSlot[] = [
  "hero",
  "middleTop",
  "middleBottom",
  "rightTop",
  "rightBottom",
];

const slotFlexClass: Record<ClinicGalleryBentoSlot, string> = {
  hero: "h-full min-h-[280px] md:min-h-0",
  middleTop: "min-h-[160px] flex-[13]",
  middleBottom: "min-h-[120px] flex-[7]",
  rightTop: "min-h-[140px] flex-[8]",
  rightBottom: "min-h-[180px] flex-[12]",
};

const texturePatterns = [
  "radial-gradient(circle, rgba(15,23,42,0.16) 1px, transparent 1px)",
  "radial-gradient(circle, rgba(15,23,42,0.12) 1px, transparent 1px)",
  "linear-gradient(135deg, rgba(15,23,42,0.06) 25%, transparent 25%, transparent 50%, rgba(15,23,42,0.06) 50%, rgba(15,23,42,0.06) 75%, transparent 75%, transparent)",
] as const;

function assignBentoSlots(items: ClinicGalleryBentoItem[]): Partial<Record<ClinicGalleryBentoSlot, ClinicGalleryBentoItem>> {
  const slots: Partial<Record<ClinicGalleryBentoSlot, ClinicGalleryBentoItem>> = {};

  slotOrder.forEach((slot, index) => {
    const item = items[index];
    if (item) {
      slots[slot] = item;
    }
  });

  return slots;
}

function BentoCard({
  actions,
  index,
  item,
  slot,
}: {
  actions?: ReactNode;
  index: number;
  item: ClinicGalleryBentoItem;
  slot: ClinicGalleryBentoSlot;
}) {
  const texture = texturePatterns[index % texturePatterns.length];

  return (
    <article
      className={`group flex flex-col overflow-hidden border border-slate-900 bg-[#ececec] shadow-[4px_4px_0_0_#0f172a] dark:border-slate-200 dark:bg-[#1a1d22] dark:shadow-[4px_4px_0_0_#e2e8f0] ${slotFlexClass[slot]}`}
    >
      <header className="flex items-center justify-between gap-3 border-b border-slate-900 px-4 py-3 dark:border-slate-200">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-900 dark:text-slate-100">
          {item.title}
        </p>
        {item.featured ? (
          <span className="rounded-sm border border-slate-900 bg-white px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-slate-900 dark:border-slate-200 dark:bg-slate-900 dark:text-slate-100">
            Cover
          </span>
        ) : (
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            {item.subtitle}
          </span>
        )}
      </header>

      <div className="relative flex min-h-0 flex-1 flex-col justify-between p-4">
        <div
          className="absolute inset-3 border border-dashed border-slate-400/70 bg-[#f4f4f4] dark:border-slate-500/60 dark:bg-[#121519]"
          style={{
            backgroundImage: texture,
            backgroundSize: slot === "hero" ? "12px 12px" : "10px 10px",
          }}
        />
        <Camera
          className="relative z-10 text-slate-700 dark:text-slate-300"
          size={slot === "hero" ? 28 : 22}
        />

      </div>
    </article>
  );
}

export function ClinicGalleryBento({
  actionsForItem,
  extraItems = [],
  items,
}: {
  actionsForItem?: (item: ClinicGalleryBentoItem) => ReactNode;
  extraItems?: ClinicGalleryBentoItem[];
  items: ClinicGalleryBentoItem[];
}) {
  const slots = assignBentoSlots(items);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:h-[640px] md:grid-cols-3">
        <div className={slotFlexClass.hero}>
          {slots.hero ? (
            <BentoCard
              actions={actionsForItem?.(slots.hero)}
              index={0}
              item={slots.hero}
              slot="hero"
            />
          ) : null}
        </div>

        <div className="flex min-h-[280px] flex-col gap-4 md:min-h-0 md:h-full">
          {slots.middleTop ? (
            <BentoCard
              actions={actionsForItem?.(slots.middleTop)}
              index={1}
              item={slots.middleTop}
              slot="middleTop"
            />
          ) : null}
          {slots.middleBottom ? (
            <BentoCard
              actions={actionsForItem?.(slots.middleBottom)}
              index={2}
              item={slots.middleBottom}
              slot="middleBottom"
            />
          ) : null}
        </div>

        <div className="flex min-h-[280px] flex-col gap-4 md:min-h-0 md:h-full">
          {slots.rightTop ? (
            <BentoCard
              actions={actionsForItem?.(slots.rightTop)}
              index={3}
              item={slots.rightTop}
              slot="rightTop"
            />
          ) : null}
          {slots.rightBottom ? (
            <BentoCard
              actions={actionsForItem?.(slots.rightBottom)}
              index={4}
              item={slots.rightBottom}
              slot="rightBottom"
            />
          ) : null}
        </div>
      </div>

      {extraItems.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {extraItems.map((item, index) => (
            <article
              className="group flex flex-col overflow-hidden border border-slate-900 bg-[#ececec] shadow-[3px_3px_0_0_#0f172a] dark:border-slate-200 dark:bg-[#1a1d22] dark:shadow-[3px_3px_0_0_#e2e8f0]"
              key={item.id}
            >
              <header className="border-b border-slate-900 px-4 py-2.5 dark:border-slate-200">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-900 dark:text-slate-100">
                  {item.title}
                </p>
              </header>
              <div className="relative flex h-36 flex-col justify-between p-4">
                <div
                  className="absolute inset-3 border border-dashed border-slate-400/70 bg-[#f4f4f4] dark:border-slate-500/60 dark:bg-[#121519]"
                  style={{
                    backgroundImage: texturePatterns[(index + 2) % texturePatterns.length],
                    backgroundSize: "8px 8px",
                  }}
                />
                <Camera className="relative z-10 text-slate-700 dark:text-slate-300" size={18} />
                <p className="relative z-10 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {item.subtitle}
                </p>
                {actionsForItem ? (
                  <div className="relative z-10 mt-2 flex gap-2 opacity-0 transition group-hover:opacity-100">
                    {actionsForItem(item)}
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export const defaultClinicGalleryItems: ClinicGalleryBentoItem[] = [
  { id: "reception", title: "Cover Image", subtitle: "Reception area", featured: true },
  { id: "consultation", title: "Interior", subtitle: "Consultation room" },
  { id: "dental", title: "Service Area", subtitle: "Dental suite" },
  { id: "pharmacy", title: "Facility", subtitle: "Pharmacy counter" },
  { id: "front-desk", title: "Exterior", subtitle: "Front desk" },
];

export const extendedClinicGalleryItems: ClinicGalleryBentoItem[] = [
  ...defaultClinicGalleryItems,
  { id: "waiting", title: "Waiting Lounge", subtitle: "Interior" },
  { id: "lab", title: "Lab Desk", subtitle: "Diagnostics" },
  { id: "recovery", title: "Recovery Bay", subtitle: "Care area" },
];
