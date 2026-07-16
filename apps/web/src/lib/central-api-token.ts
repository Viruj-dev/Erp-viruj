"use client";

import { authClient } from "./auth-client";

type CachedCentralApiToken = {
  token: string;
  expiresAtMs: number;
};

const refreshSkewMs = 60_000;
let cachedToken: CachedCentralApiToken | null = null;
let tokenRequest: Promise<CachedCentralApiToken> | null = null;

export async function getCentralApiToken(forceRefresh = false) {
  if (!forceRefresh && cachedToken && cachedToken.expiresAtMs - refreshSkewMs > Date.now()) {
    return cachedToken.token;
  }

  tokenRequest ??= fetchCentralApiToken();

  try {
    cachedToken = await tokenRequest;
    return cachedToken.token;
  } finally {
    tokenRequest = null;
  }
}

export function clearCentralApiToken() {
  cachedToken = null;
  tokenRequest = null;
}

export async function signOutAfterCentralApiUnauthorized() {
  clearCentralApiToken();
  await authClient.signOut().catch(() => null);

  if (typeof window !== "undefined" && window.location.pathname !== "/auth") {
    window.location.assign("/auth");
  }
}

async function fetchCentralApiToken(): Promise<CachedCentralApiToken> {
  const response = await fetch(`${authBaseUrl()}/central-api-token`, {
    credentials: "include",
    method: "GET",
  });

  const payload = (await response.json().catch(() => null)) as {
    expiresAt?: string | number;
    token?: string;
  } | null;

  if (response.status === 401) {
    await signOutAfterCentralApiUnauthorized();
  }

  if (!response.ok || !payload?.token || !payload.expiresAt) {
    throw new Error("Unable to get central API token.");
  }

  const expiresAtMs =
    typeof payload.expiresAt === "number"
      ? payload.expiresAt
      : Date.parse(payload.expiresAt);

  if (!Number.isFinite(expiresAtMs)) {
    throw new Error("Invalid central API token expiry.");
  }

  return {
    token: payload.token,
    expiresAtMs,
  };
}

function authBaseUrl() {
  const origin =
    process.env.NEXT_PUBLIC_AUTH_URL ||
    (typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3002");

  return `${origin.replace(/\/$/, "")}/auth`;
}
