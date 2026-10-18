"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Building2,
  Clock3,
  FileCheck2,
  MapPin,
  Pencil,
  Search,
  Stethoscope,
  Users,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { virujBackend } from "@/lib/viruj-backend";
import { ProfileStep } from "../../hospital/pages/onboarding/steps/profile-step";
import { ContactStep } from "../../hospital/pages/onboarding/steps/contact-step";
import { WorkingHoursStep } from "../../hospital/pages/onboarding/steps/working-hours-step";
import { DepartmentsStep } from "../../hospital/pages/onboarding/steps/departments-step";
import { TextField, UploadField } from "../../hospital/pages/onboarding/fields";
import {
  OnboardingTheme,
  formatTime,
} from "../../hospital/pages/onboarding/time-picker";
import { validateStep } from "../../hospital/pages/onboarding/state";
import type {
  OnboardingKind,
  OnboardingState,
} from "../../hospital/pages/onboarding/types";
import { useWorkspaceProfile } from "./use-workspace-profile";
import { VerificationBadge } from "./verification-badge";

const panel =
  "rounded-2xl border border-[var(--onboarding-border)] bg-[var(--onboarding-panel)] p-5";
const button =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--onboarding-accent-deep)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50";
const identityFields = [
  ["legalBusinessName", "Legal business name"],
  ["hospitalType", "Practice type"],
  ["hospitalOwnershipType", "Ownership"],
  ["registrationNumber", "Registration number"],
  ["establishedYear", "Established"],
  ["gstNumber", "GST number"],
  ["panNumber", "PAN"],
] as const;
const contactFields = [
  ["phone", "Primary phone"],
  ["alternateMobile", "Alternate phone"],
  ["email", "Email"],
  ["whatsappNumber", "WhatsApp"],
  ["emergencyContact", "Emergency contact"],
  ["website", "Website"],
] as const;
const aboutFields = [
  ["description", "About"],
  ["mission", "Mission"],
  ["vision", "Vision"],
  ["languagesSpoken", "Languages spoken"],
] as const;

export function WorkspaceSection({
  organizationId,
  section,
  kind = "clinic",
}: {
  organizationId?: string;
  section: "profile" | "departments" | "workingHours" | "locations";
  kind?: OnboardingKind;
}) {
  const workspace = useWorkspaceProfile(organizationId, kind);
  const [draft, setDraft] = useState<OnboardingState | null>(null);
  const [editing, setEditing] = useState(false);
  const [query, setQuery] = useState("");
  const [actionPending, setActionPending] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    setDraft(workspace.workspace);
    setEditing(false);
    setError("");
    setNotice("");
  }, [workspace.workspace, organizationId]);
  const data = workspace.workspace;
  const theme = `vh-onboarding ${kind === "clinic" ? "vh-onboarding--clinic" : ""}`;
  const title = {
    profile: "Organization profile",
    departments: "Departments & specialties",
    workingHours: "Working hours",
    locations: "Locations",
  }[section];
  const save = async () => {
    if (!draft || section === "locations") return;
    const validation =
      section === "departments"
        ? validateStep("departments", draft, kind)
        : section === "workingHours"
          ? validateStep("workingHours", draft, kind)
          : !draft.profile.hospitalName.trim() ||
              (kind === "clinic" && !draft.profile.registrationNumber.trim())
            ? "Name and registration number are required."
            : "";
    if (validation) {
      setError(validation);
      return;
    }
    setError("");
    try {
      await workspace.save.mutateAsync({
        section,
        value:
          section === "departments"
            ? draft.departments.map((d) => ({
                ...d,
                published: d.published ?? true,
              }))
            : draft[section],
      });
      setEditing(false);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not save. Please retry."
      );
    }
  };
  const profileAction = async (action: "publish" | "verify") => {
    setActionPending(true);
    setError("");
    setNotice("");
    try {
      if (action === "publish") {
        await virujBackend.directory.publishFacility({
          organizationId,
          visibleOnPlatform: !data?.publicProfile.showHospitalProfile,
        });
        await workspace.refetch();
      } else {
        await virujBackend.directory.requestVerification(organizationId);
        setNotice(
          "Verification requested. Your badge will update after approval."
        );
      }
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not update the profile."
      );
    } finally {
      setActionPending(false);
    }
  };
  const updateProfile = (
    key: keyof OnboardingState["profile"],
    value: string
  ) =>
    setDraft((current) =>
      current
        ? { ...current, profile: { ...current.profile, [key]: value } }
        : current
    );
  const departmentRows =
    data?.departments.filter((d) =>
      `${d.name} ${d.description}`.toLowerCase().includes(query.toLowerCase())
    ) ?? [];
  return (
    <OnboardingTheme.Provider value={kind}>
      <div
        className={`${theme} mx-auto min-h-full w-[calc(100%-8px)] max-w-[1440px] space-y-6 rounded-[24px] bg-[var(--onboarding-shell)] p-5 text-[var(--onboarding-text)] sm:w-[calc(100%-16px)] lg:w-[calc(100%-24px)] lg:p-8`}
      >
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--onboarding-accent)]">
              {kind} workspace
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              {title}
            </h1>
            <p className="mt-2 text-sm text-[var(--onboarding-muted)]">
              Your practice details, kept in sync across this organization.
            </p>
          </div>
          {data && section !== "locations" && (
            <button
              className={button}
              type="button"
              onClick={() => {
                setDraft(data);
                setError("");
                setEditing(true);
              }}
            >
              <Pencil size={15} />
              {section === "departments"
                ? "Manage departments"
                : "Edit details"}
            </button>
          )}
        </header>
        {workspace.isPending ? (
          <p role="status">Loading organization details…</p>
        ) : workspace.isError ? (
          <div role="alert" className={panel}>
            <p>{workspace.error.message}</p>
            <button
              type="button"
              onClick={() => void workspace.refetch()}
              className="mt-3 underline"
            >
              Retry
            </button>
          </div>
        ) : !data ? (
          <p>No saved profile found for this organization.</p>
        ) : (
          <>
            {section === "profile" && (
              <>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    className={button}
                    disabled={actionPending}
                    onClick={() => void profileAction("publish")}
                  >
                    {data.publicProfile.showHospitalProfile
                      ? "Hide patient-app listing"
                      : "Publish to patient app"}
                  </button>
                  {workspace.verificationStatus !== "verified" &&
                    (kind === "hospital" || data.profile.certificateUrl) && (
                      <button
                        type="button"
                        className="rounded-xl border border-[var(--onboarding-border)] px-4 py-2.5 text-sm font-semibold"
                        disabled={actionPending}
                        onClick={() => void profileAction("verify")}
                      >
                        Request verification
                      </button>
                    )}
                  <span className="text-xs text-[var(--onboarding-muted)]">
                    {data.publicProfile.showHospitalProfile
                      ? "Patient-app listing enabled."
                      : "Listing hidden from patients."}
                  </span>
                </div>
                {error && !editing && (
                  <p role="alert" className="text-sm text-rose-600">
                    {error}
                  </p>
                )}
                {notice && (
                  <p
                    role="status"
                    className="text-sm text-[var(--onboarding-accent)]"
                  >
                    {notice}
                  </p>
                )}
                <section className="relative overflow-hidden rounded-3xl bg-[var(--onboarding-accent-deep)] p-6 text-white sm:p-8">
                  {data.profile.coverUrl && (
                    <Image
                      src={data.profile.coverUrl}
                      alt=""
                      fill
                      unoptimized
                      className="object-cover opacity-20"
                      sizes="100vw"
                    />
                  )}
                  <div className="relative flex flex-wrap items-center gap-5">
                    <div className="relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-white/15 ring-1 ring-white/25">
                      {data.profile.logoUrl ? (
                        <Image
                          src={data.profile.logoUrl}
                          alt={`${data.profile.hospitalName} logo`}
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
                      <VerificationBadge
                        status={workspace.verificationStatus}
                      />
                      <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">
                        {data.profile.hospitalName}
                      </h2>
                      <p className="mt-2 text-sm text-white/75">
                        {[data.profile.hospitalType, data.branches[0]?.city]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                    <div className="flex gap-5 text-sm">
                      <span className="flex items-center gap-2">
                        <Stethoscope size={18} />
                        {data.departments.length} departments
                      </span>
                      <span className="flex items-center gap-2">
                        <Users size={18} />
                        {data.doctors.length} doctors
                      </span>
                    </div>
                  </div>
                </section>
                <div className="grid gap-5 lg:grid-cols-2">
                  <DetailPanel
                    title="Practice identity"
                    fields={[
                      ...identityFields.map(
                        ([key, label]) => [label, data.profile[key]] as const
                      ),
                      ...(kind === "hospital"
                        ? [
                            [
                              "Number of beds",
                              data.profile.numberOfBeds,
                            ] as const,
                          ]
                        : []),
                    ]}
                  />
                  <DetailPanel
                    title="Contact information"
                    fields={contactFields.map(([key, label]) => [
                      label,
                      data.profile[key],
                    ])}
                  />
                  <DetailPanel
                    title="About your practice"
                    fields={aboutFields.map(([key, label]) => [
                      label,
                      data.profile[key],
                    ])}
                  />
                  <section className={panel}>
                    <h2 className="flex items-center gap-2 font-semibold">
                      <FileCheck2
                        size={18}
                        className="text-[var(--onboarding-accent)]"
                      />
                      Certification & license
                    </h2>
                    <div className="mt-4">
                      <VerificationBadge
                        status={workspace.verificationStatus}
                      />
                    </div>
                    <p className="mt-3 text-sm font-medium">
                      {data.profile.certificateName ||
                        (data.profile.certificateUrl
                          ? "Document uploaded"
                          : "No certificate or license uploaded")}
                    </p>
                    <p className="mt-2 text-sm text-[var(--onboarding-muted)]">
                      {workspace.verificationStatus === "verified"
                        ? "Your documentation has been reviewed and approved."
                        : data.profile.certificateUrl
                          ? "Document uploaded. Your profile remains unverified until platform approval."
                          : "Upload a certificate or license from Edit details to request verification. The patient app shows your profile as unverified."}
                    </p>
                  </section>
                </div>
                <section className={panel}>
                  <h2 className="mb-4 font-semibold">
                    Locations & opening hours
                  </h2>
                  <div className="grid gap-6 lg:grid-cols-2">
                    <LocationList data={data} />
                    <HoursList data={data} />
                  </div>
                </section>
              </>
            )}
            {section === "departments" && (
              <section className="overflow-hidden rounded-2xl border border-[var(--onboarding-border)] bg-[var(--onboarding-panel)]">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--onboarding-border)] p-4">
                  <p className="text-sm font-semibold">
                    {data.departments.length} care departments
                  </p>
                  <label className="flex items-center gap-2 rounded-xl bg-[var(--onboarding-panel-muted)] px-3 py-2">
                    <Search size={16} />
                    <input
                      aria-label="Search departments"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search departments"
                      className="w-full bg-transparent text-sm outline-none"
                    />
                  </label>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[var(--onboarding-panel-soft)] text-xs text-[var(--onboarding-muted)]">
                      <tr>
                        {[
                          "Department",
                          "Operating hours · IST",
                          "Doctors",
                          "Visibility",
                        ].map((h) => (
                          <th key={h} className="px-5 py-3 font-medium">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {departmentRows.map((d) => (
                        <tr
                          key={d.name}
                          className="border-t border-[var(--onboarding-border)]"
                        >
                          <td className="min-w-56 px-5 py-4">
                            <div className="flex items-center gap-3">
                              <span className="rounded-xl bg-[var(--onboarding-accent-soft)] p-2.5 text-[var(--onboarding-accent)]">
                                <Stethoscope size={18} />
                              </span>
                              <div>
                                <p className="font-semibold">{d.name}</p>
                                <p className="mt-1 max-w-sm text-xs text-[var(--onboarding-muted)]">
                                  {d.description || "Description not added"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-5 py-4">
                            {formatTime(d.openTime)} – {formatTime(d.closeTime)}
                          </td>
                          <td className="px-5 py-4">
                            {
                              data.doctors.filter(
                                (doctor) => doctor.department === d.name
                              ).length
                            }
                          </td>
                          <td className="px-5 py-4">
                            <span className="rounded-full bg-[var(--onboarding-accent-soft)] px-2.5 py-1 text-xs text-[var(--onboarding-accent)]">
                              {d.published ? "Public" : "Internal"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!departmentRows.length && (
                    <p className="p-8 text-center text-sm text-[var(--onboarding-muted)]">
                      No matching departments.
                    </p>
                  )}
                </div>
              </section>
            )}
            {section === "locations" && (
              <section className={panel}>
                <LocationList data={data} />
              </section>
            )}
            {section === "workingHours" && (
              <section className={panel}>
                <p className="mb-5 flex items-center gap-2 text-sm text-[var(--onboarding-accent)]">
                  <Clock3 size={17} />
                  Indian Standard Time · IST (UTC+05:30)
                </p>
                <HoursList data={data} />
              </section>
            )}
          </>
        )}
        <Dialog
          open={editing}
          onOpenChange={(open) => {
            if (!workspace.save.isPending) setEditing(open);
          }}
        >
          <DialogContent
            className={`${theme} max-h-[90dvh] overflow-y-auto bg-[var(--onboarding-shell)] text-[var(--onboarding-text)] sm:max-w-3xl`}
          >
            <DialogTitle>Edit {title.toLowerCase()}</DialogTitle>
            <DialogDescription>
              Changes apply to this organization only.
            </DialogDescription>
            {draft && (
              <>
                {section === "profile" && (
                  <>
                    <ProfileStep
                      data={draft}
                      kind={kind}
                      organizationId={organizationId}
                      updateProfile={updateProfile}
                    />
                    <ContactStep data={draft} updateProfile={updateProfile} />
                    <div className="grid gap-4 sm:grid-cols-2">
                      {aboutFields.map(([key, label]) => (
                        <TextField
                          key={key}
                          label={label}
                          value={draft.profile[key]}
                          onChange={(value) => updateProfile(key, value)}
                          placeholder={label}
                        />
                      ))}
                    </div>
                    {kind === "clinic" && (
                      <UploadField
                        label="Cover image"
                        name={draft.profile.coverName}
                        onChange={async ({ file, name, previewUrl }) => {
                          try {
                            const media =
                              await virujBackend.organizationProfile.uploadMedia(
                                { file, kind: "cover", organizationId }
                              );
                            updateProfile("coverUrl", media.url);
                            updateProfile("coverName", name);
                          } finally {
                            URL.revokeObjectURL(previewUrl);
                          }
                        }}
                      />
                    )}
                  </>
                )}
                {section === "departments" && (
                  <DepartmentsStep
                    data={draft}
                    kind={kind}
                    organizationId={organizationId}
                    setData={(action) =>
                      setDraft((current) =>
                        current
                          ? typeof action === "function"
                            ? action(current)
                            : action
                          : current
                      )
                    }
                  />
                )}
                {section === "workingHours" && (
                  <WorkingHoursStep
                    data={draft}
                    setData={(action) =>
                      setDraft((current) =>
                        current
                          ? typeof action === "function"
                            ? action(current)
                            : action
                          : current
                      )
                    }
                  />
                )}
                {error && (
                  <p role="alert" className="text-sm text-rose-600">
                    {error}
                  </p>
                )}
                <button
                  className={button}
                  disabled={workspace.save.isPending}
                  type="button"
                  onClick={() => void save()}
                >
                  {workspace.save.isPending ? "Saving…" : "Save changes"}
                </button>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </OnboardingTheme.Provider>
  );
}
function DetailPanel({
  title,
  fields,
}: {
  title: string;
  fields: (readonly [string, string])[];
}) {
  return (
    <section className={panel}>
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
function LocationList({ data }: { data: OnboardingState }) {
  return (
    <div className="space-y-5">
      {data.branches.map((b, index) => (
        <div key={b.id} className="flex gap-3">
          <MapPin
            size={19}
            className="mt-1 shrink-0 text-[var(--onboarding-accent)]"
          />
          <div>
            <h3 className="font-semibold">
              {b.name || `Location ${index + 1}`}
            </h3>
            <p className="mt-1 text-sm text-[var(--onboarding-muted)]">
              {[b.address, b.landmark, b.city, b.state, b.postalCode, b.country]
                .filter(Boolean)
                .join(", ")}
            </p>
            {b.latitude && b.longitude && (
              <a
                className="mt-2 inline-block text-xs font-semibold text-[var(--onboarding-accent)] underline"
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${b.latitude},${b.longitude}`)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View on map
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
function HoursList({ data }: { data: OnboardingState }) {
  return (
    <div className="divide-y divide-[var(--onboarding-border)]">
      {data.workingHours.map((h) => (
        <div
          key={h.day}
          className="flex flex-wrap justify-between gap-3 py-3 text-sm"
        >
          <span className="font-medium">{h.day}</span>
          <div className="text-right">
            <span
              className={
                h.isOpen
                  ? "text-[var(--onboarding-accent)]"
                  : "text-[var(--onboarding-muted)]"
              }
            >
              {h.isOpen
                ? `${formatTime(h.openingTime)} – ${formatTime(h.closingTime)}`
                : "Closed"}
            </span>
            {h.isOpen && h.lunchBreak && (
              <p className="mt-1 text-xs text-[var(--onboarding-muted)]">
                Break: {h.lunchBreak.split(" - ").map(formatTime).join(" – ")}
              </p>
            )}
            {h.isOpen && h.emergencyHours && (
              <p className="mt-1 text-xs text-[var(--onboarding-muted)]">
                Emergency: {h.emergencyHours}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
