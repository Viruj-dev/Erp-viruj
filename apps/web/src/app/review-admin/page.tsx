"use client";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Moon, ShieldCheck, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme-provider";
import { ApplicationInformation } from "./application-information";

type Application = {
  organization_id: string;
  applicant_name: string;
  email: string;
  organization_name: string;
  organization_type: string;
  status: string;
  submitted_at: string;
  reviewed_at: string | null;
  email_sent_at: string | null;
  snapshot: unknown;
  revision: number;
  reason: string | null;
};
const base = `${(process.env.NEXT_PUBLIC_AUTH_URL || "").replace(/\/$/, "")}/auth/review-admin`;
async function api(path: string, body?: unknown) {
  const response = await fetch(`${base}${path}`, {
    credentials: "include",
    referrerPolicy: "origin",
    cache: "no-store",
    method: body ? "POST" : "GET",
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(
      response.status === 401
        ? "Administrator sign-in required."
        : data.error || "Request failed."
    );
  return data;
}
export default function ReviewAdminPage() {
  const { toggleTheme } = useTheme();
  const [signedIn, setSignedIn] = useState(false),
    [requests, setRequests] = useState<Application[]>([]),
    [selected, setSelected] = useState<Application | null>(null);
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [reason, setReason] = useState(""),
    [offset, setOffset] = useState(0);
  const [view, setView] = useState<"requests" | "logs">("requests");
  const load = useCallback(async () => {
    try {
      const rows = await api(`/requests?offset=${offset}&view=${view}`);
      setRequests(rows);
      setSignedIn(true);
      setSelected(null);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Unable to load applications.";
      if (message.includes("sign-in required")) setSignedIn(false);
      else setError(message);
    }
  }, [offset, view]);
  useEffect(() => {
    void load();
  }, [load]);
  async function login(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    try {
      await api("/login", {
        id: form.get("id"),
        password: form.get("password"),
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-in failed.");
    } finally {
      setBusy(false);
    }
  }
  async function decision(status: "approved" | "rejected") {
    if (!selected) return;
    setBusy(true);
    setError("");
    try {
      await api(
        `/requests/${encodeURIComponent(selected.organization_id)}/decision`,
        { status, reason, revision: selected.revision }
      );
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save decision.");
      await load();
    } finally {
      setBusy(false);
    }
  }
  async function documentLink(id: string) {
    if (!selected) return;
    const viewer = window.open("about:blank", "_blank");
    if (!viewer) {
      setError("Allow popups to open the uploaded document.");
      return;
    }
    viewer.opener = null;
    try {
      const response = await fetch(
        `${base}/requests/${encodeURIComponent(selected.organization_id)}/documents/${encodeURIComponent(id)}`,
        {
          method: "POST",
          credentials: "include",
          referrerPolicy: "origin",
          headers: { "Content-Type": "application/json" },
          body: "{}",
        }
      );
      if (!response.ok)
        throw new Error(
          "Unable to open this document. Refresh the panel and sign in again if needed."
        );
      if (response.headers.get("Content-Type")?.includes("application/json")) {
        const result = await response.json();
        if (!["https:", "http:"].includes(new URL(result.url).protocol))
          throw new Error("Invalid document address.");
        viewer.location.replace(result.url);
      } else {
        const url = URL.createObjectURL(await response.blob());
        viewer.location.replace(url);
        window.setTimeout(() => URL.revokeObjectURL(url), 60000);
      }
    } catch (e) {
      viewer.close();
      setError(e instanceof Error ? e.message : "Unable to open document.");
    }
  }
  return (
    <main className="min-h-svh bg-[#f4f7f6] dark:bg-[#101916] px-5 py-10 text-[#183b36] dark:text-[#e1eee8] sm:px-10">
      <header className="mx-auto mb-10 flex max-w-7xl items-center justify-between gap-5 border-b border-[#d5e2de] dark:border-[#2a4036] pb-6">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em]">
            Viruj Health · Restricted access
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Application review
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
          >
            <Sun className="hidden dark:block" aria-hidden="true" />
            <Moon className="dark:hidden" aria-hidden="true" />
            <span className="hidden sm:inline dark:sm:hidden">Dark mode</span>
            <span className="hidden dark:sm:inline">Light mode</span>
          </Button>
          {signedIn && (
            <Button
              variant="outline"
              onClick={() =>
                void api("/logout", {}).then(() => {
                  setSignedIn(false);
                  setRequests([]);
                  setSelected(null);
                })
              }
            >
              Sign out
            </Button>
          )}
        </div>
      </header>
      {error && (
        <p
          role="alert"
          className="mx-auto mb-6 max-w-7xl rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/40 p-4 text-sm text-red-800 dark:text-red-300"
        >
          {error}
        </p>
      )}
      {!signedIn ? (
        <form
          onSubmit={login}
          className="mx-auto mt-16 max-w-md space-y-5 rounded-2xl border border-[#d5e2de] dark:border-[#2a4036] bg-white dark:bg-[#17241f] p-8"
        >
          <ShieldCheck className="size-8 text-emerald-700 dark:text-emerald-300" />
          <h2 className="text-xl font-semibold">Administrator sign in</h2>
          <label className="block text-sm">
            Superuser ID
            <input
              name="id"
              autoComplete="username"
              required
              maxLength={200}
              className="mt-2 block w-full rounded-md border border-[#d5e2de] bg-white p-3 dark:border-[#355347] dark:bg-[#101916]"
            />
          </label>
          <label className="block text-sm">
            Password
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              maxLength={512}
              className="mt-2 block w-full rounded-md border border-[#d5e2de] bg-white p-3 dark:border-[#355347] dark:bg-[#101916]"
            />
          </label>
          <Button disabled={busy} type="submit" className="w-full">
            {busy ? "Signing in…" : "Sign in securely"}
          </Button>
        </form>
      ) : (
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <section aria-label="Application list" className="space-y-3">
            <nav aria-label="Application views" className="flex gap-2">
              {(["requests", "logs"] as const).map((tab) => (
                <Button
                  key={tab}
                  variant={view === tab ? "default" : "outline"}
                  aria-pressed={view === tab}
                  disabled={busy}
                  onClick={() => {
                    setView(tab);
                    setOffset(0);
                    setRequests([]);
                    setSelected(null);
                    setError("");
                  }}
                >
                  {tab === "requests" ? "Requests" : "Logs"}
                </Button>
              ))}
            </nav>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium">
                {view === "logs"
                  ? "Approved organizations"
                  : "Applications · Pending first"}
              </p>
              <Button
                variant="ghost"
                onClick={() => void load()}
                disabled={busy}
              >
                Refresh
              </Button>
            </div>
            {!requests.length && (
              <p className="rounded-xl bg-white dark:bg-[#17241f] p-6 text-sm">
                {view === "logs"
                  ? "No approved organizations on this page."
                  : "No applications on this page."}
              </p>
            )}
            {requests.map((item) => (
              <button
                key={item.organization_id}
                onClick={() => {
                  setSelected(item);
                  setReason("");
                }}
                className={`w-full rounded-xl border bg-white dark:bg-[#17241f] p-5 text-left ${selected?.organization_id === item.organization_id ? "border-emerald-700 ring-1 ring-emerald-700 dark:border-emerald-400 dark:ring-emerald-400" : "border-[#d5e2de] dark:border-[#2a4036]"}`}
              >
                <span className="mb-3 block text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                  {item.status} · {item.organization_type}
                </span>
                <strong className="block">{item.organization_name}</strong>
                <span className="mt-1 block truncate text-sm text-slate-500 dark:text-slate-400">
                  {item.applicant_name} · {item.email}
                </span>
                <span className="mt-3 block text-xs text-slate-500 dark:text-slate-400">
                  {view === "logs" && item.reviewed_at
                    ? `Approved ${new Date(item.reviewed_at).toLocaleString()}`
                    : new Date(item.submitted_at).toLocaleString()}
                </span>
                {item.reviewed_at && !item.email_sent_at && (
                  <span className="mt-2 block text-xs text-red-700 dark:text-red-300">
                    Email delivery needs retry
                  </span>
                )}
              </button>
            ))}
            <div className="flex gap-3">
              <Button
                variant="outline"
                disabled={!offset}
                onClick={() => setOffset((n) => Math.max(0, n - 50))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={requests.length < 50}
                onClick={() => setOffset((n) => n + 50)}
              >
                Next
              </Button>
            </div>
          </section>
          <section
            aria-label="Application details"
            className="min-w-0 rounded-2xl border border-[#d5e2de] dark:border-[#2a4036] bg-white dark:bg-[#17241f] p-6 sm:p-8"
          >
            {!selected ? (
              <p className="py-24 text-center text-sm text-slate-500 dark:text-slate-400">
                Select an application to review its details and documents.
              </p>
            ) : (
              <>
                <h2 className="text-2xl font-semibold">
                  {selected.organization_name}
                </h2>
                <p className="mb-8 mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {selected.email} · Submission {selected.revision}
                  {selected.status === "approved" && selected.reviewed_at && (
                    <span className="mt-2 block text-emerald-700 dark:text-emerald-300">
                      Approved on{" "}
                      {new Date(selected.reviewed_at).toLocaleString()}
                    </span>
                  )}
                </p>
                <ApplicationInformation
                  snapshot={selected.snapshot}
                  documentLink={(id) => void documentLink(id)}
                />
                {selected.reason && (
                  <p className="mt-6 whitespace-pre-wrap text-sm">
                    Review notes: {selected.reason}
                  </p>
                )}
                {selected.status === "pending" ? (
                  <div className="mt-8 space-y-4 border-t border-[#d5e2de] pt-6 dark:border-[#2a4036]">
                    <label className="block text-sm font-medium">
                      Review notes for the applicant
                      <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        maxLength={2000}
                        className="mt-2 block min-h-28 w-full rounded-lg border border-[#d5e2de] bg-white p-3 placeholder:text-slate-500 dark:border-[#355347] dark:bg-[#101916] dark:placeholder:text-slate-400"
                        placeholder="Explain which details need correcting if declining this submission."
                      />
                    </label>
                    <div className="flex flex-wrap gap-3">
                      <Button
                        disabled={busy}
                        onClick={() => void decision("approved")}
                      >
                        Approve access & send email
                      </Button>
                      <Button
                        variant="outline"
                        disabled={busy || !reason.trim()}
                        onClick={() => void decision("rejected")}
                      >
                        Request corrections & send email
                      </Button>
                    </div>
                  </div>
                ) : (
                  ["approved", "rejected"].includes(selected.status) && (
                    <Button
                      className="mt-6"
                      variant="outline"
                      disabled={busy}
                      onClick={() => {
                        setBusy(true);
                        setError("");
                        void api(
                          `/requests/${encodeURIComponent(selected.organization_id)}/resend`,
                          {}
                        )
                          .then(load)
                          .catch((e) => setError(e.message))
                          .finally(() => setBusy(false));
                      }}
                    >
                      Send email again
                    </Button>
                  )
                )}
              </>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
