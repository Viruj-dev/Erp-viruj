"use client";
import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { virujBackend } from "@/lib/viruj-backend";
import { mergeOnboardingState } from "../../hospital/pages/onboarding/state";
import type {
  OnboardingKind,
  OnboardingState,
} from "../../hospital/pages/onboarding/types";

export function useWorkspaceProfile(
  organizationId?: string,
  kind: OnboardingKind = "clinic"
) {
  const client = useQueryClient();
  const queryKey = ["viruj-backend", "workspace-profile", organizationId];
  const query = useQuery({
    queryKey,
    queryFn: () => virujBackend.directory.workspace(organizationId),
    enabled: !!organizationId,
    retry: false,
  });
  const data = useMemo(() => {
    if (!query.data) return null;
    // Recover fields older releases only saved in this tenant's browser draft.
    // Never read another tenant or the unscoped "workspace" storage key.
    let legacy: Partial<OnboardingState> = {};
    if (typeof window !== "undefined" && organizationId) {
      try {
        const raw = window.localStorage.getItem(
          `viruj:${kind}-onboarding:completed:${organizationId}`
        );
        const parsed = raw ? JSON.parse(raw) : null;
        legacy = parsed?.data ?? parsed ?? {};
      } catch {
        legacy = {};
      }
    }
    const remote = query.data.data;
    return mergeOnboardingState(
      {
        ...legacy,
        ...remote,
        profile: {
          ...legacy.profile,
          ...remote.profile,
        } as OnboardingState["profile"],
      },
      undefined,
      kind
    );
  }, [query.data, organizationId, kind]);
  const save = useMutation({
    mutationFn: ({
      section,
      value,
    }: {
      section: "profile" | "departments" | "workingHours";
      value: unknown;
    }) =>
      virujBackend.directory.updateWorkspace({
        section,
        value,
        organizationId,
      }),
    onSuccess: async (result) => {
      client.setQueryData(queryKey, result);
      await Promise.all([
        client.invalidateQueries({
          queryKey: ["viruj-backend", "directory-facility", organizationId],
        }),
        client.invalidateQueries({
          queryKey: virujBackend.doctors.key(organizationId),
        }),
      ]);
    },
  });
  return {
    ...query,
    workspace: data,
    save,
    verificationStatus: query.data?.verificationStatus ?? "unverified",
  };
}
