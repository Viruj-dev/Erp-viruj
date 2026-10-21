"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, RefreshCw, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/erp/input";
import type { ErpTenantContext } from "@/features/dashboard/lib/erp-tenant";
import type { DiagnosticBooking } from "@/features/dashboard/lib/diagnostic-bookings";
import { virujBackend } from "@/lib/viruj-backend";

export function DiagnosticFileReports({ tenant }: { tenant: ErpTenantContext }) {
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ["diagnostic-file-reports", tenant.organizationId, page],
    queryFn: () => virujBackend.diagnostics.reports(tenant.organizationId, page),
  });
  return <section className="space-y-6">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Patient reports</p>
        <h1 className="mt-2 text-3xl font-semibold">Reports</h1>
        <p className="mt-2 text-muted-foreground">Send a completed laboratory report to a confirmed test booking. Patients receive it in My Health with a notification.</p>
      </div>
      <Button variant="outline" disabled={query.isFetching} onClick={() => void query.refetch()}><RefreshCw size={16} /> Refresh</Button>
    </div>
    <p className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">PDF, DOC or DOCX · Maximum 2 MB. Check the patient and document before sending. Sent reports cannot be replaced.</p>
    {query.isPending && <p role="status">Loading confirmed tests…</p>}
    {query.isError && <p role="alert" className="text-destructive">Could not load confirmed tests. Refresh to try again.</p>}
    {query.data && !query.data.data.length && <div className="rounded-2xl border bg-card p-8 text-center"><FileText className="mx-auto mb-3 text-muted-foreground" /><h2 className="font-semibold">No confirmed tests on this page</h2><p className="mt-2 text-sm text-muted-foreground">Accepted test bookings will appear here for report delivery.</p></div>}
    <div className="space-y-4">{query.data?.data.map(booking => <ReportRow key={booking.id} booking={booking} organizationId={tenant.organizationId} />)}</div>
    <div className="flex items-center justify-end gap-3"><Button variant="outline" disabled={page === 1 || query.isFetching} onClick={() => setPage(current => current - 1)}>Previous</Button><span className="text-sm">Page {page}</span><Button variant="outline" disabled={!query.data?.hasMore || query.isFetching} onClick={() => setPage(current => current + 1)}>Next</Button></div>
  </section>;
}

function ReportRow({ booking, organizationId }: { booking: DiagnosticBooking; organizationId: string }) {
  const client = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const send = useMutation({
    mutationFn: async () => {
      if (!file || !file.size || file.size > 2_000_000 || !/\.(pdf|doc|docx)$/i.test(file.name))
        throw new Error("Choose a PDF, DOC or DOCX under 2 MB.");
      await virujBackend.diagnostics.sendReport(organizationId, booking.id, file);
    },
    onSuccess: () => {
      setFile(null);
      void client.invalidateQueries({ queryKey: ["diagnostic-file-reports", organizationId] });
      void client.invalidateQueries({ queryKey: ["diagnostic-bookings", organizationId] });
    },
    onError: failure => setError(failure.message),
  });
  const download = useMutation({
    mutationFn: async () => {
      const { url } = await virujBackend.diagnostics.reportDownload(organizationId, booking.id);
      window.location.assign(url);
    },
    onError: failure => setError(failure.message),
  });
  return <article className="rounded-2xl border bg-card p-5">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><h2 className="text-lg font-semibold">{booking.order.patientName}</h2><p className="mt-1 text-sm text-muted-foreground">{booking.order.patientPhone} · {booking.order.patientAge ?? "—"} years · {booking.order.patientSex}</p>
        <p className="mt-3 font-medium">{booking.order.serviceSnapshot.name}</p><p className="text-sm text-muted-foreground">{booking.slot.branch.name} · {new Date(booking.slot.startsAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</p><p className="mt-1 text-xs text-muted-foreground">Booking {booking.id}</p>
      </div>
      <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">{booking.reportFile ? "Report sent" : "Confirmed"}</span>
    </div>
    {booking.reportFile ? <div className="mt-4 flex flex-wrap items-center gap-4"><p className="text-sm">{booking.reportFile.filename} · {Math.ceil(booking.reportFile.size / 1000)} KB · Sent {new Date(booking.reportFile.createdAt).toLocaleDateString("en-IN")}</p><Button variant="outline" disabled={download.isPending} onClick={() => { setError(""); download.mutate(); }}>Download sent report</Button></div>
      : booking.order.status === "released" ? <p className="mt-4 text-sm">A report has already been released for this test.</p>
      : <div className="mt-4 flex flex-wrap items-end gap-3"><div className="min-w-0 flex-1"><label htmlFor={`report-${booking.id}`} className="mb-2 block text-sm font-medium">Completed report for {booking.order.patientName}</label><Input id={`report-${booking.id}`} type="file" accept=".pdf,.doc,.docx" disabled={send.isPending} onChange={event => { setFile(event.target.files?.[0] ?? null); setError(""); }} /></div><Button disabled={!file || send.isPending} onClick={() => { setError(""); send.mutate(); }}><Upload size={16} />{send.isPending ? "Sending…" : "Send report to patient"}</Button></div>}
    {!!error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
  </article>;
}
