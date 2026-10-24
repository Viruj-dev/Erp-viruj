"use client";
import { createContext, useContext } from "react";

export const WorkspaceApprovalContext = createContext<string | null>(null);
export function useWorkspaceApproved(
  organizationId: string | null | undefined
) {
  const approvedOrganizationId = useContext(WorkspaceApprovalContext);
  return Boolean(organizationId) && approvedOrganizationId === organizationId;
}
