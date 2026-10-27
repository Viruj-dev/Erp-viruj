import { Button } from "@/components/ui/button";
import { FileText, ExternalLink } from "lucide-react";

type SavedObject = Record<string, unknown>;
type ReviewSection = { key: string; title: string; value: unknown };
function object(value: unknown): SavedObject {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as SavedObject)
    : {};
}
const sectionTitles: Record<string, string> = {
  profile: "Organization profile",
  branches: "Locations & branches",
  departments: "Departments",
  services: "Services",
  doctors: "Doctors",
  workingHours: "Working hours",
  publicProfile: "Patient app settings",
  disabledDepartments: "Disabled departments",
  hours: "Availability & fees",
  verification: "Documents & verification",
  locations: "Practice locations",
};
const fieldTitles: Record<string, string> = {
  hospitalName: "Hospital / clinic name",
  fullName: "Full name",
  email: "Email address",
  phone: "Phone number",
  gstNumber: "GST number",
  panNumber: "PAN number",
  certificateUrl: "License / certificate",
  additionalCertificateUrl: "Additional certificate / accreditation",
  additionalCertificateName: "Additional certificate filename",
  logoUrl: "Organization logo",
  coverUrl: "Cover image",
  fileUrl: "Uploaded document",
  mapsLocation: "Map location",
  isOpen: "Open",
  availableOnline: "Available online",
};
function title(key: string) {
  return (
    fieldTitles[key] ||
    key
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/_/g, " ")
      .replace(/^./, (letter) => letter.toUpperCase())
  );
}
const fieldOrder = [
  "hospitalName",
  "fullName",
  "legalBusinessName",
  "hospitalType",
  "hospitalOwnershipType",
  "registrationNumber",
  "medicalRegistrationNumber",
  "qualification",
  "specialization",
  "email",
  "phone",
  "alternateMobile",
  "whatsappNumber",
  "emergencyContact",
  "website",
  "address",
  "city",
  "state",
  "country",
  "postalCode",
];
const internalFields = new Set([
  "id",
  "tenantId",
  "organizationId",
  "userId",
  "sourceId",
  "storageKey",
  "verificationId",
]);

export function reviewSections(snapshot: unknown): ReviewSection[] {
  const saved = object(snapshot),
    metadata = object(object(saved.tenant).metadata);
  const submitted = object(metadata.onboardingSubmission),
    onboarding = object(metadata.onboarding);
  const diagnostic = object(object(metadata.diagnosticOnboarding).data),
    doctor = object(saved.doctor);
  let source: SavedObject;
  if (Object.keys(submitted).length) source = submitted;
  else if (Object.keys(doctor).length) source = doctor;
  else if (Object.keys(diagnostic).length) source = { profile: diagnostic };
  else if (Object.keys(onboarding).length) source = onboarding;
  else source = saved;
  const ordered = [
    "profile",
    "branches",
    "locations",
    "departments",
    "doctors",
    "services",
    "workingHours",
    "hours",
    "verification",
  ];
  return Object.entries(source)
    .filter(
      ([key]) =>
        !["completedAt", "timeZone", "version", "disabledDepartments"].includes(
          key
        )
    )
    .sort(
      ([a], [b]) =>
        (ordered.indexOf(a) < 0 ? 99 : ordered.indexOf(a)) -
        (ordered.indexOf(b) < 0 ? 99 : ordered.indexOf(b))
    )
    .flatMap(([key, value]) => {
      if (key === "profile") {
        const documentFields = new Set([
          "logoUrl",
          "logoName",
          "coverUrl",
          "coverName",
          "certificateUrl",
          "certificateName",
          "additionalCertificateUrl",
          "additionalCertificateName",
          "profilePhoto",
          "photoUrl",
        ]);
        const fields = Object.entries(object(value));
        return [
          {
            key,
            title: Object.keys(doctor).length
              ? "Professional profile"
              : "Organization profile",
            value: Object.fromEntries(
              fields.filter(([field]) => !documentFields.has(field))
            ),
          },
          {
            key: "documents",
            title: "Documents & images",
            value: Object.fromEntries(
              fields.filter(([field]) => documentFields.has(field))
            ),
          },
        ];
      }
      return [{ key, title: sectionTitles[key] || title(key), value }];
    });
}
function provided(value: unknown): boolean {
  return (
    value !== null &&
    value !== undefined &&
    (typeof value !== "string" || value.trim() !== "")
  );
}
function Value({
  value,
  label,
  documentLink,
  showInternal = false,
}: {
  value: unknown;
  label: string;
  documentLink: (id: string) => void;
  showInternal?: boolean;
}) {
  if (!provided(value))
    return (
      <span className="text-slate-500 dark:text-slate-400">Not provided</span>
    );
  if (typeof value === "boolean")
    return (
      <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-white/10 dark:text-slate-200">
        {value ? "Yes" : "No"}
      </span>
    );
  if (Array.isArray(value)) {
    if (!value.length)
      return (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          None provided.
        </p>
      );
    if (
      ["departments", "services", "workingHours", "hours"].includes(label) &&
      value.every(
        (item) =>
          item &&
          typeof item === "object" &&
          !Array.isArray(item) &&
          Object.values(item).every(
            (field) => field === null || typeof field !== "object"
          )
      )
    ) {
      const columns = [
        ...new Set(value.flatMap((item) => Object.keys(object(item)))),
      ].filter(
        (key) =>
          (showInternal || !internalFields.has(key)) &&
          value.some((item) => provided(object(item)[key]))
      );
      const columnOrder = [
        "name",
        "category",
        "day",
        "isOpen",
        "openTime",
        "openingTime",
        "closeTime",
        "closingTime",
        "lunchBreak",
        "emergencyHours",
        "head",
        "description",
        "price",
        "duration",
        "availableOnline",
      ];
      columns.sort(
        (a, b) =>
          (columnOrder.indexOf(a) < 0 ? 99 : columnOrder.indexOf(a)) -
          (columnOrder.indexOf(b) < 0 ? 99 : columnOrder.indexOf(b))
      );
      return (
        <div className="min-w-0 overflow-x-auto rounded-xl border border-slate-200 dark:border-[#31473c]">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="bg-slate-50 text-xs text-slate-600 dark:bg-[#101c16] dark:text-slate-300">
              <tr>
                {columns.map((key) => (
                  <th key={key} scope="col" className="px-4 py-3 font-medium">
                    {title(key)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {value.map((item, index) => (
                <tr
                  key={index}
                  className="border-t border-slate-200 align-top dark:border-[#31473c]"
                >
                  {columns.map((key) => (
                    <td
                      key={key}
                      className="min-w-28 max-w-sm px-4 py-3 leading-6 text-slate-900 [overflow-wrap:anywhere] dark:text-emerald-50"
                    >
                      <Value
                        value={object(item)[key]}
                        label={key}
                        documentLink={documentLink}
                        showInternal={showInternal}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    return (
      <div className="space-y-3">
        {value.map((item, index) => (
          <div
            key={index}
            className="min-w-0 rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-[#31473c] dark:bg-[#101c16]"
          >
            {item && typeof item === "object" && (
              <h4 className="mb-4 text-sm font-semibold text-slate-900 dark:text-emerald-50">
                {String(
                  object(item).name ||
                    object(item).fullName ||
                    object(item).branchName ||
                    object(item).day ||
                    `${title(label)} ${index + 1}`
                )}
              </h4>
            )}
            <Value
              value={item}
              label={label}
              documentLink={documentLink}
              showInternal={showInternal}
            />
          </div>
        ))}
      </div>
    );
  }
  if (typeof value === "object") {
    const entries = Object.entries(object(value)).filter(
      ([key, item]) =>
        showInternal ||
        (provided(item) &&
          !internalFields.has(key) &&
          !/PreviewUrl(s)?$/.test(key) &&
          !(Array.isArray(item) && !item.length))
    );
    const rank = (key: string) =>
      fieldOrder.indexOf(key) < 0 ? 99 : fieldOrder.indexOf(key);
    entries.sort(([a], [b]) => rank(a) - rank(b));
    if (!entries.length)
      return (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No information provided.
        </p>
      );
    return (
      <dl className="grid min-w-0 grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
        {entries.map(([key, item]) => {
          const complex = item !== null && typeof item === "object";
          return (
            <div
              key={key}
              className={`min-w-0 ${complex || (typeof item === "string" && item.length > 140) ? "md:col-span-2" : ""}`}
            >
              <dt className="mb-1.5 text-xs font-medium text-slate-500 dark:text-slate-300">
                {title(key)}
              </dt>
              <dd className="min-w-0 whitespace-pre-wrap text-sm leading-6 text-slate-900 [overflow-wrap:anywhere] dark:text-emerald-50">
                <Value
                  value={item}
                  label={key}
                  documentLink={documentLink}
                  showInternal={showInternal}
                />
              </dd>
            </div>
          );
        })}
      </dl>
    );
  }
  const text = String(value);
  let url: URL | null = null;
  try {
    url = new URL(text);
  } catch {
    /* Submitted text is usually not a URL. */
  }
  if (url && ["https:", "http:"].includes(url.protocol)) {
    if (url.pathname.includes("/directory/certificates/"))
      return (
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            documentLink(`certificate:${url!.pathname.split("/").pop()}`)
          }
        >
          <FileText aria-hidden="true" />
          View certificate
        </Button>
      );
    return (
      <a
        href={text}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex max-w-full items-center gap-2 text-emerald-800 underline underline-offset-4 dark:text-emerald-300"
      >
        <span className="min-w-0 [overflow-wrap:anywhere]">
          {/logo|cover|photo|image/i.test(label)
            ? "View uploaded image"
            : url.hostname + (url.pathname === "/" ? "" : url.pathname)}
        </span>
        <ExternalLink className="size-3 shrink-0" aria-hidden="true" />
      </a>
    );
  }
  if (text.startsWith("/doctor/license/"))
    return (
      <Button
        type="button"
        variant="outline"
        onClick={() => documentLink(text.split("/").pop()!)}
      >
        <FileText aria-hidden="true" />
        View license
      </Button>
    );
  return (
    <span className="whitespace-pre-wrap [overflow-wrap:anywhere]">{text}</span>
  );
}
export function ApplicationInformation({
  snapshot,
  documentLink,
}: {
  snapshot: unknown;
  documentLink: (id: string) => void;
}) {
  return (
    <div className="min-w-0 space-y-5">
      {reviewSections(snapshot).map((section) => (
        <section
          key={section.key}
          aria-label={section.title}
          className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 dark:border-[#31473c] dark:bg-[#132219] sm:p-6"
        >
          <h3 className="mb-5 border-b border-slate-100 pb-3 text-base font-semibold text-slate-900 dark:border-[#31473c] dark:text-emerald-50">
            {section.title}
            {Array.isArray(section.value) && (
              <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-white/10 dark:text-slate-200">
                {section.value.length}
              </span>
            )}
          </h3>
          <Value
            value={section.value}
            label={section.key}
            documentLink={documentLink}
          />
        </section>
      ))}
      <details className="min-w-0 rounded-xl border border-slate-200 p-5 text-sm dark:border-[#31473c]">
        <summary className="cursor-pointer font-medium text-slate-600 dark:text-slate-300">
          All saved data
        </summary>
        <div className="mt-5 min-w-0">
          <Value
            value={snapshot}
            label="Saved data"
            documentLink={documentLink}
            showInternal
          />
        </div>
      </details>
    </div>
  );
}
