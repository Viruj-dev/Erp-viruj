import { expect, mock, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { WorkspaceApprovalContext } from "@/features/dashboard/lib/workspace-approval";
let submissions = 0;
mock.module(
  "@/features/dashboard/components/shared/access-review-gate",
  () => ({
    SubmitAccessReview: () => {
      submissions++;
      return <p>Submitting application</p>;
    },
  })
);
mock.module("@/lib/auth-client", () => ({ authClient: {} }));
mock.module("@/lib/central-api-token", () => ({
  clearCentralApiToken: () => {},
}));
const { OnboardingSuccessScreen } = await import("./onboarding-success-screen");
const { OnboardingFrame } = await import("./onboarding-frame");
const { getOnboardingSteps, getStepDescriptions } = await import("./constants");

test("approved onboarding completion opens a dashboard action without submitting review", () => {
  submissions = 0;
  for (const id of ["hospital", "clinic", "doctor", "pathology", "radiology"]) {
    const html = renderToStaticMarkup(
      <WorkspaceApprovalContext.Provider value={id}>
        <OnboardingSuccessScreen
          completionPercentage={100}
          hospitalName="Practice"
          summary={[]}
          onContinue={() => {}}
        />
      </WorkspaceApprovalContext.Provider>
    );
    expect(html).toContain("Go to dashboard");
    expect(html).toContain("already approved");
    expect(html).not.toContain("Submitting application");
  }
  expect(submissions).toBe(0);
});

test("new applicants still submit their completed onboarding", () => {
  submissions = 0;
  renderToStaticMarkup(
    <OnboardingSuccessScreen
      completionPercentage={100}
      hospitalName="Practice"
      summary={[]}
      onContinue={() => {}}
    />
  );
  expect(submissions).toBe(1);
});

test("last onboarding button distinguishes approved changes from new applications", () => {
  const steps = getOnboardingSteps("hospital");
  for (const approved of [null, "workspace"]) {
    const html = renderToStaticMarkup(
      <WorkspaceApprovalContext.Provider value={approved}>
        <OnboardingFrame
          kind="hospital"
          organizationLabel="Hospital"
          entityLabel="hospital"
          userName="Owner"
          steps={steps}
          stepDescriptions={getStepDescriptions("hospital")}
          currentStepIndex={steps.length - 1}
          completedSteps={[]}
          completionPercentage={100}
          contentWidthClassName=""
          saveState="saved"
          launching={false}
          errorMessage=""
          setCurrentStepIndex={() => {}}
          handleContinue={() => {}}
          handleLaunch={() => {}}
        >
          <p>Review details</p>
        </OnboardingFrame>
      </WorkspaceApprovalContext.Provider>
    );
    expect(html).toContain(approved ? "Save changes" : "Submit for review");
    expect(html).not.toContain(approved ? "Submit for review" : "Save changes");
  }
});
