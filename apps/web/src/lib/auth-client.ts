"use client";

import {
  customSessionClient,
  organizationClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

const authBaseUrl =
  typeof window !== "undefined"
    ? `${window.location.origin}/auth`
    : `${process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3002"}/auth`;

export const authClient = createAuthClient({
  baseURL: authBaseUrl,
  plugins: [
    organizationClient({
      schema: {
        organization: {
          additionalFields: {
            organizationType: {
              type: "string",
            },
          },
        },
      },
    }),
    customSessionClient(),
  ],
});

type AuthActionResult<TData = unknown> = {
  data?: TData | null;
  error?: {
    message?: string;
  } | null;
};

type OrganizationRecord = {
  id: string;
  name?: string;
  organizationType?: string;
  slug?: string;
};

const organizationActions = authClient as unknown as {
  acceptInvitation?: (input: {
    invitationId: string;
  }) => Promise<AuthActionResult>;
  createOrganization: (input: {
    name: string;
    organizationType: string;
    slug: string;
  }) => Promise<AuthActionResult<OrganizationRecord> | OrganizationRecord>;
  organization?: {
    acceptInvitation?: (input: {
      invitationId: string;
    }) => Promise<AuthActionResult>;
    create?: (input: {
      name: string;
      organizationType: string;
      slug: string;
    }) => Promise<AuthActionResult<OrganizationRecord> | OrganizationRecord>;
    createOrganization?: (input: {
      name: string;
      organizationType: string;
      slug: string;
    }) => Promise<AuthActionResult<OrganizationRecord> | OrganizationRecord>;
    list?: () => Promise<AuthActionResult<OrganizationRecord[]> | OrganizationRecord[]>;
    listOrganizations?: () => Promise<AuthActionResult<OrganizationRecord[]> | OrganizationRecord[]>;
    setActive?: (input: {
      organizationId: string | null;
    }) => Promise<AuthActionResult<OrganizationRecord> | OrganizationRecord | null>;
    setActiveOrganization?: (input: {
      organizationId: string | null;
    }) => Promise<AuthActionResult<OrganizationRecord> | OrganizationRecord | null>;
  };
  setActiveOrganization?: (input: {
    organizationId: string | null;
  }) => Promise<AuthActionResult<OrganizationRecord> | OrganizationRecord | null>;
  listOrganizations?: () => Promise<AuthActionResult<OrganizationRecord[]> | OrganizationRecord[]>;
};

export const acceptInvitation =
  organizationActions.organization?.acceptInvitation ??
  organizationActions.acceptInvitation;

export const createOrganization =
  organizationActions.organization?.create ??
  organizationActions.organization?.createOrganization ??
  organizationActions.createOrganization;

export const listOrganizations =
  organizationActions.organization?.list ??
  organizationActions.organization?.listOrganizations ??
  organizationActions.listOrganizations;

export const setActiveOrganization =
  organizationActions.organization?.setActive ??
  organizationActions.organization?.setActiveOrganization ??
  organizationActions.setActiveOrganization;

export function getAuthActionError(result: unknown) {
  if (!result || typeof result !== "object" || !("error" in result)) {
    return null;
  }

  const error = (result as AuthActionResult).error;
  return error?.message ?? null;
}

export function getAuthActionData<TData>(result: unknown) {
  if (!result || typeof result !== "object") {
    return null;
  }

  if ("data" in result) {
    return ((result as AuthActionResult<TData>).data ?? null) as TData | null;
  }

  return result as TData;
}

export async function bootstrapOrganization(input: {
  name: string;
  organizationType: string;
  slug: string;
}) {
  const response = await fetch(`${authBaseUrl}/bootstrap-organization`, {
    body: JSON.stringify(input),
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  const payload = (await response.json().catch(() => null)) as
    | {
        error?: string;
        id?: string;
        organizationType?: string;
      }
    | null;

  if (!response.ok) {
    return {
      data: null,
      error: {
        message: payload?.error ?? "Unable to bootstrap organization.",
      },
    };
  }

  return {
    data: payload,
    error: null,
  };
}
