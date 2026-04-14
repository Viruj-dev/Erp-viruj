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

const organizationActions = authClient as unknown as {
  acceptInvitation: (input: { invitationId: string }) => Promise<unknown>;
  createOrganization: (input: {
    name: string;
    organizationType: string;
    slug: string;
  }) => Promise<{
    error?: {
      message?: string;
    } | null;
    id?: string;
  } | null>;
  setActiveOrganization: (input: {
    organizationId: string;
  }) => Promise<unknown>;
};

export const acceptInvitation = organizationActions.acceptInvitation;
export const createOrganization = organizationActions.createOrganization;
export const setActiveOrganization = organizationActions.setActiveOrganization;
