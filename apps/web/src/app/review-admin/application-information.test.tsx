import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import {
  ApplicationInformation,
  reviewSections,
} from "./application-information";

const submission = {
  profile: {
    hospitalName: "Test Hospital",
    email: "a.long.contact.address@example.test",
    phone: "9876543210",
    certificateUrl:
      "https://api.test/api/erp/directory/certificates/license.png",
    mission: "",
    logoPreviewUrl: "",
  },
  branches: [
    {
      id: "internal-branch",
      name: "Main branch",
      city: "Delhi",
      address: "A long address that must remain readable",
    },
  ],
  departments: Array.from({ length: 20 }, (_, i) => ({
    name: `Department ${i + 1}`,
    openTime: "09:00",
    closeTime: "18:00",
  })),
  services: [
    {
      name: "MRI",
      category: "Diagnostics and imaging",
      price: "",
      availableOnline: false,
    },
  ],
  workingHours: [
    { day: "Monday", isOpen: true, openingTime: "09:00", closingTime: "18:00" },
  ],
};
const snapshot = {
  doctor: null,
  tenant: {
    id: "internal-tenant",
    metadata: {
      onboardingSubmission: submission,
      onboarding: { profile: { hospitalName: "Duplicate normalized copy" } },
    },
  },
};
test("the review opens submitted sections rather than nesting database wrappers", () => {
  const sections = reviewSections(snapshot);
  expect(sections.map((section) => section.title)).toEqual([
    "Organization profile",
    "Documents & images",
    "Locations & branches",
    "Departments",
    "Services",
    "Working hours",
  ]);
  expect(sections[0]?.value).toMatchObject({
    hospitalName: "Test Hospital",
    email: submission.profile.email,
  });
  expect(sections[1]?.value).toMatchObject({
    certificateUrl: submission.profile.certificateUrl,
  });
  expect(submission.profile.certificateUrl).toContain("license.png");
});
test("long contact details remain together and large lists use compact tables", () => {
  const html = renderToStaticMarkup(
    <ApplicationInformation snapshot={snapshot} documentLink={() => {}} />
  );
  const primary = html.split("<details")[0]!;
  expect(primary).toContain("a.long.contact.address@example.test");
  expect(primary).toContain("9876543210");
  expect(primary).toContain("[overflow-wrap:anywhere]");
  expect(primary).not.toContain("180px");
  expect(primary).not.toContain("internal-tenant");
  expect(primary).not.toContain("internal-branch");
  expect(primary).not.toContain("Duplicate normalized copy");
  expect(primary.match(/<table/g)).toHaveLength(3);
  expect(primary).toContain("Department 20");
  expect(primary).toContain("View certificate");
  expect(primary).toContain("No</span>");
  expect(html).toContain("All saved data");
  expect(html).toContain("internal-tenant");
});
test("doctor, diagnostics and older submissions all retain their information", () => {
  expect(
    reviewSections({
      doctor: {
        profile: { fullName: "Doctor" },
        verification: { documents: [] },
        hours: [],
      },
    }).map((section) => section.title)
  ).toEqual([
    "Professional profile",
    "Documents & images",
    "Availability & fees",
    "Documents & verification",
  ]);
  expect(
    reviewSections({
      tenant: {
        metadata: {
          diagnosticOnboarding: {
            data: {
              centreName: "Lab",
              certificateUrl: "https://example.test/file.png",
            },
          },
        },
      },
    })[0]?.value
  ).toMatchObject({ centreName: "Lab" });
  expect(
    reviewSections({
      tenant: {
        metadata: {
          onboarding: { profile: { hospitalName: "Legacy" }, branches: [] },
        },
      },
    })[0]?.value
  ).toEqual({ hospitalName: "Legacy" });
});
