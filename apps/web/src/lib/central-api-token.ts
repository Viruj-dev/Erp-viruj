"use client";

import { authClient } from "./auth-client";

type CachedCentralApiToken = {
  token: string;
  expiresAtMs: number;
  identity: string | null;
};

const refreshSkewMs = 60_000;
let cachedToken: CachedCentralApiToken | null = null;
let tokenRequest: Promise<CachedCentralApiToken> | null = null;
let tokenRequestGeneration = 0;
// Identity of the session the cached token was minted for. Callers report the
// current user id + active organization id so a cached token is never reused
// across users or workspaces.
let currentTokenIdentity: string | null = null;

export function setCentralApiTokenIdentity(identity: string | null) {
  if (currentTokenIdentity === identity) {
    return;
  }

  currentTokenIdentity = identity;
  clearCentralApiToken();
}

export async function getCentralApiToken(forceRefresh = false) {
  if (
    !forceRefresh &&
    cachedToken &&
    cachedToken.identity === currentTokenIdentity &&
    cachedToken.expiresAtMs - refreshSkewMs > Date.now()
  ) {
    return cachedToken.token;
  }

  const generation = tokenRequestGeneration;
  tokenRequest ??= fetchCentralApiToken();

  try {
    const result = await tokenRequest;

    if (generation !== tokenRequestGeneration) {
      throw new Error("Session changed while requesting an API token. Please retry.");
    }

    cachedToken = result;
    return cachedToken.token;
  } finally {
    if (generation === tokenRequestGeneration) {
      tokenRequest = null;
    }
  }
}

export function clearCentralApiToken() {
  tokenRequestGeneration += 1;
  cachedToken = null;
  tokenRequest = null;
}

export async function signOutAfterCentralApiUnauthorized() {
  setCentralApiTokenIdentity(null);
  clearCentralApiToken();
  await authClient.signOut().catch(() => null);

  if (typeof window !== "undefined" && window.location.pathname !== "/auth") {
    window.location.assign("/auth");
  }
}

async function fetchCentralApiToken(): Promise<CachedCentralApiToken> {
  const identityAtRequestTime = currentTokenIdentity;
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
    identity: identityAtRequestTime,
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
