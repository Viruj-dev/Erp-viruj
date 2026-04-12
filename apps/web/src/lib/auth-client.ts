"use client";

import { devtoolsClientPlugin } from "better-auth-devtools/plugin";
import {
  customSessionClient,
  organizationClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

const authBaseUrl =
  typeof window !== "undefined"
    ? `${window.location.origin}/api/auth`
    : `${process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3002"}/api/auth`;

export const authClient = createAuthClient({
  baseURL: authBaseUrl,
  plugins: [
    devtoolsClientPlugin(),
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
  acceptInvitation: (input: {
    invitationId: string;
  }) => Promise<unknown>;
  createOrganization: (input: {
    name: string;
    organizationType: string;
    slug: string;
  }) => Promise<unknown>;
  setActiveOrganization: (input: {
    organizationId: string;
  }) => Promise<unknown>;
};

export const acceptInvitation = organizationActions.acceptInvitation;
export const createOrganization = organizationActions.createOrganization;
export const setActiveOrganization = organizationActions.setActiveOrganization;
