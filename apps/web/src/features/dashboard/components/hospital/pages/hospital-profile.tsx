"use client";
import { useState } from "react";
import { WorkspaceSection } from "../../shared/workspace/workspace-sections";
const sections = [
  { id: "profile", label: "Overview" },
  { id: "departments", label: "Departments" },
  { id: "workingHours", label: "Working hours" },
  { id: "locations", label: "Locations" },
] as const;
export function HospitalProfilePage({
  organizationId,
}: {
  organizationId?: string;
  organizationLabel: string;
  organizationName?: string;
}) {
  const [section, setSection] =
    useState<(typeof sections)[number]["id"]>("profile");
  return (
    <div>
      <nav
        aria-label="Organization profile sections"
        className="flex flex-wrap gap-2 border-b p-4"
      >
        {sections.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-current={section === item.id ? "page" : undefined}
            onClick={() => setSection(item.id)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${section === item.id ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-blue-50 dark:hover:bg-blue-950"}`}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <WorkspaceSection
        key={`${organizationId}:${section}`}
        organizationId={organizationId}
        section={section}
        kind="hospital"
      />
    </div>
  );
}
