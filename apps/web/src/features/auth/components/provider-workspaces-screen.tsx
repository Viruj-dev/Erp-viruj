"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ErpSelect } from "@/components/ui/erp/select";
import {
  activateOrganization,
  authClient,
  bootstrapOrganization,
  getAuthActionError,
} from "@/lib/auth-client";
import { clearCentralApiToken } from "@/lib/central-api-token";
import {
  buildTenantDashboardPath,
  isDashboardOrganizationType,
  organizationTypeLabels,
  organizationTypeOptions,
  type DashboardOrganizationType,
} from "@/features/dashboard/lib/routing";
import { OrganizationAccessScreen } from "./organization-access-screen";

export function ProviderWorkspacesScreen() {
  const router = useRouter();
  const session = authClient.useSession();
  const organizations = authClient.useListOrganizations();
  const [providerType, setProviderType] =
    useState<DashboardOrganizationType>("hospital");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session.isPending && !session.data?.user) router.replace("/auth");
  }, [session.isPending, session.data?.user, router]);

  async function openWorkspace(organizationId: string) {
    setBusy(true);
    setError("");
    try {
      const workspace = organizations.data?.find(
        (item) => item.id === organizationId
      );
      const type = workspace?.organizationType ?? "";
      if (!workspace || !isDashboardOrganizationType(type))
        throw new Error("This workspace has an unsupported provider role.");
      const result = await activateOrganization({ organizationId });
      const message = getAuthActionError(result);
      if (message) throw new Error(message);
      // Reload to discard queries and session state belonging to the previous workspace.
      window.location.assign(
        buildTenantDashboardPath(type, workspace.slug, "dashboard")
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to open workspace.");
      setBusy(false);
    }
  }

  async function createWorkspace() {
    setBusy(true);
    setError("");
    try {
      const result = await bootstrapOrganization({
        name: name.trim(),
        organizationType: providerType,
        slug: `${providerType}-${crypto.randomUUID()}`,
      });
      const message = getAuthActionError(result);
      if (message) throw new Error(message);
      if (!result.data?.id)
        throw new Error("Workspace could not be created. Please retry.");
      window.location.assign("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to add provider role.");
      setBusy(false);
    }
  }

  if (session.isPending || !session.data?.user)
    return (
      <main className="grid min-h-svh place-items-center" role="status">
        Loading your workspaces…
      </main>
    );

  return (
    <OrganizationAccessScreen
      isLoading={busy || organizations.isPending}
      organizations={organizations.data ?? []}
      userEmail={session.data.user.email}
      signingOut={signingOut}
      onRefresh={async () => {
        await organizations.refetch();
      }}
      onSelectOrganization={openWorkspace}
      onSignOut={async () => {
        setBusy(true);
        setSigningOut(true);
        try {
          const result = await authClient.signOut();
          const message = getAuthActionError(result);
          if (message) throw new Error(message);
          clearCentralApiToken();
          window.location.assign("/auth");
        } catch (e) {
          setError(e instanceof Error ? e.message : "Unable to sign out.");
          setBusy(false);
          setSigningOut(false);
        }
      }}
    >
      <form
        className="mt-8 border-t border-outline-variant/30 pt-7"
        onSubmit={(event) => {
          event.preventDefault();
          void createWorkspace();
        }}
      >
        <h2 className="font-headline text-xl font-semibold text-on-surface">
          Add a provider role
        </h2>
        <p className="mt-2 text-sm leading-6 text-on-surface-variant">
          Use your existing account. Complete onboarding for each provider role;
          our admin team reviews every workspace separately. Already have this
          role? We’ll reopen your linked workspace.
        </p>
        <fieldset
          disabled={busy || organizations.isPending}
          className="mt-5 grid gap-4 sm:grid-cols-2"
        >
          <div className="grid gap-2 text-sm font-semibold">
            <label htmlFor="provider-role">Provider role</label>
            <ErpSelect
              id="provider-role"
              value={providerType}
              onChange={(event) => {
                if (isDashboardOrganizationType(event.target.value))
                  setProviderType(event.target.value);
              }}
            >
              {organizationTypeOptions.map((type) => (
                <option key={type} value={type}>
                  {organizationTypeLabels[type]}
                </option>
              ))}
            </ErpSelect>
          </div>
          <label className="grid gap-2 text-sm font-semibold">
            Workspace name
            <input
              className="rounded-lg border border-outline-variant/40 bg-surface px-3 py-2 font-normal"
              required
              maxLength={150}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <Button
            className="sm:col-span-2"
            disabled={!name.trim()}
            type="submit"
          >
            {busy ? "Please wait…" : "Add provider role"}
          </Button>
        </fieldset>
        {organizations.error && (
          <div className="mt-4">
            <p className="text-sm text-error" role="alert">
              Unable to load your workspaces.
            </p>
            <Button
              variant="outline"
              type="button"
              onClick={() => void organizations.refetch()}
            >
              Retry loading workspaces
            </Button>
          </div>
        )}
        {error && (
          <p className="mt-4 text-sm text-error" role="alert">
            {error}
          </p>
        )}
      </form>
    </OrganizationAccessScreen>
  );
}
