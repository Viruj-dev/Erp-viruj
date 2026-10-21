"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/erp/input";
import type { ErpTenantContext } from "@/features/dashboard/lib/erp-tenant";
import type { DiagnosticBooking } from "@/features/dashboard/lib/diagnostic-bookings";
import { diagnosticPermissions } from "@/features/dashboard/lib/diagnostics";
import { virujBackend } from "@/lib/viruj-backend";

export function DiagnosticFileReports({
  tenant,
}: {
  tenant: ErpTenantContext;
}) {
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ["diagnostic-file-reports", tenant.organizationId, page],
    queryFn: () =>
      virujBackend.diagnostics.reports(tenant.organizationId, page),
  });
  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Patient reports
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Reports</h1>
          <p className="mt-2 text-muted-foreground">
            Send completed reports to confirmed test bookings in My Health.
          </p>
        </div>
        <Button
          variant="outline"
          disabled={query.isFetching}
          onClick={() => void query.refetch()}
        >
          <RefreshCw size={16} />
          Refresh
        </Button>
      </div>
      {query.isPending && <p role="status">Loading confirmed tests…</p>}
      {query.isError && (
        <p role="alert" className="text-destructive">
          Could not load confirmed tests. Refresh to try again.
        </p>
      )}
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full min-w-[960px] text-left text-sm">
          <caption className="sr-only">
            Confirmed pathology tests and patient report delivery
          </caption>
          <thead className="border-b bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              {[
                "Patient",
                "Test / branch",
                "Booked for",
                "Status",
                "Report / actions",
              ].map((label) => (
                <th key={label} scope="col" className="px-4 py-3 font-semibold">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {query.data?.data.map((booking) => (
              <ReportRow
                key={booking.id}
                booking={booking}
                organizationId={tenant.organizationId}
                canSend={diagnosticPermissions(tenant.role).results}
              />
            ))}
            {query.data && !query.data.data.length && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  No confirmed tests on this page.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-end gap-3">
        <Button
          variant="outline"
          disabled={page === 1 || query.isFetching}
          onClick={() => setPage((current) => current - 1)}
        >
          Previous
        </Button>
        <span className="text-sm">Page {page}</span>
        <Button
          variant="outline"
          disabled={!query.data?.hasMore || query.isFetching}
          onClick={() => setPage((current) => current + 1)}
        >
          Next
        </Button>
      </div>
    </section>
  );
}

function ReportRow({
  booking,
  organizationId,
  canSend,
}: {
  booking: DiagnosticBooking;
  organizationId: string;
  canSend: boolean;
}) {
  const client = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [prepared, setPrepared] = useState<File | null>(null);
  const [previewed, setPreviewed] = useState(false);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  useEffect(() => {
    if (!prepared) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(prepared);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [prepared]);
  const prepare = useMutation({
    mutationFn: async () => {
      if (
        !file ||
        !file.size ||
        file.size > 10_000_000 ||
        !/\.(pdf|doc|docx)$/i.test(file.name)
      )
        throw new Error("Choose a PDF, DOC or DOCX up to 10 MB.");
      const blob = await virujBackend.diagnostics.prepareReport(
        organizationId,
        file
      );
      if (!blob.size || blob.size > 3_000_000)
        throw new Error("Could not prepare a report under 3 MB.");
      const extension =
        blob.type === "application/pdf"
          ? "pdf"
          : blob.type === "application/msword"
            ? "doc"
            : "docx";
      return new File([blob], `report.${extension}`, { type: blob.type });
    },
    onSuccess: (value) => {
      setPrepared(value);
      setPreviewed(false);
    },
    onError: (failure) => setError(failure.message),
  });
  const send = useMutation({
    mutationFn: async () => {
      if (!prepared || !previewed)
        throw new Error("Preview the prepared report before sending.");
      await virujBackend.diagnostics.sendReport(
        organizationId,
        booking.id,
        prepared
      );
    },
    onSuccess: () => {
      setFile(null);
      setPrepared(null);
      void client.invalidateQueries({
        queryKey: ["diagnostic-file-reports", organizationId],
      });
      void client.invalidateQueries({
        queryKey: ["diagnostic-bookings", organizationId],
      });
    },
    onError: (failure) => setError(failure.message),
  });
  const download = useMutation({
    mutationFn: async () => {
      const { url } = await virujBackend.diagnostics.reportDownload(
        organizationId,
        booking.id
      );
      window.location.assign(url);
    },
    onError: (failure) => setError(failure.message),
  });
  const busy = prepare.isPending || send.isPending;
  return (
    <tr className="align-top hover:bg-muted/20">
      <td className="px-4 py-4">
        <p className="font-semibold">{booking.order.patientName}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {booking.order.patientPhone} · {booking.order.patientAge ?? "—"} ·{" "}
          {booking.order.patientSex}
        </p>
        <p className="mt-1 text-xs text-muted-foreground" title={booking.id}>
          #{booking.id.slice(0, 8)}
        </p>
      </td>
      <td className="px-4 py-4">
        <p className="font-medium">{booking.order.serviceSnapshot.name}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {booking.slot.branch.name}
        </p>
      </td>
      <td className="whitespace-nowrap px-4 py-4">
        <p>
          {new Date(booking.slot.startsAt).toLocaleDateString("en-IN", {
            timeZone: "Asia/Kolkata",
          })}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {new Date(booking.slot.startsAt).toLocaleTimeString("en-IN", {
            timeZone: "Asia/Kolkata",
            hour: "numeric",
            minute: "2-digit",
          })}{" "}
          IST
        </p>
      </td>
      <td className="px-4 py-4">
        <span className="whitespace-nowrap rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">
          {booking.reportFile || booking.order.status === "released"
            ? "Report sent"
            : "Confirmed"}
        </span>
      </td>
      <td className="w-[360px] px-4 py-3">
        {booking.reportFile ? (
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">
              {booking.reportFile.filename} ·{" "}
              {Math.ceil(booking.reportFile.size / 1000)} KB
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={download.isPending}
              onClick={() => {
                setError("");
                download.mutate();
              }}
            >
              Download
            </Button>
          </div>
        ) : booking.order.status === "released" ? (
          <span className="text-xs text-muted-foreground">
            Report already released
          </span>
        ) : !canSend ? (
          <span className="text-xs text-muted-foreground">
            A manager or clinical team member can upload.
          </span>
        ) : (
          <div className="space-y-2">
            <Input
              aria-label={`Report for ${booking.order.patientName}, booking ${booking.id}`}
              type="file"
              accept=".pdf,.doc,.docx"
              className="h-9 text-xs"
              disabled={busy}
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null);
                setPrepared(null);
                setPreviewed(false);
                setError("");
              }}
            />
            <div className="flex flex-wrap items-center gap-2">
              {!prepared && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!file || busy}
                  onClick={() => {
                    setError("");
                    prepare.mutate();
                  }}
                >
                  <Upload size={14} />
                  {prepare.isPending ? "Preparing…" : "Prepare report"}
                </Button>
              )}
              {prepared && (
                <>
                  <a
                    href={previewUrl || undefined}
                    download={
                      prepared.type === "application/pdf"
                        ? undefined
                        : prepared.name
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium underline"
                    onClick={() => setPreviewed(true)}
                  >
                    Preview · {(prepared.size / 1_000_000).toFixed(2)} MB
                  </a>
                  <Button
                    size="sm"
                    disabled={!previewed || busy}
                    onClick={() => {
                      setError("");
                      send.mutate();
                    }}
                  >
                    {send.isPending ? "Sending…" : "Send to patient"}
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
        {!!error && (
          <p role="alert" className="mt-2 max-w-sm text-xs text-destructive">
            {error}
          </p>
        )}
      </td>
    </tr>
  );
}
