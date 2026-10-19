"use client";
import type { DiagnosticOrder } from "@/features/dashboard/lib/diagnostics";
import { Button } from "@/components/ui/button";

export function DiagnosticReport({
  order,
  organizationName,
}: {
  order: DiagnosticOrder;
  organizationName?: string;
}) {
  if (order.status !== "released" || !order.releasedAt)
    return (
      <p className="text-sm text-muted-foreground">
        The report becomes available after a reporting doctor authorises it.
      </p>
    );
  return (
    <div className="space-y-4">
      <Button type="button" variant="outline" onClick={() => window.print()}>
        Print / save as PDF
      </Button>
      <style>{`@media print { body > *:not(:has(#diagnostic-report)) { display:none!important } [data-slot="dialog-overlay"], [data-slot="dialog-close"], [data-slot="dialog-content"] > :not(:has(#diagnostic-report)):not(#diagnostic-report) { display:none!important } [data-slot="dialog-content"] { position:static!important; transform:none!important; display:block!important; width:100%!important; max-width:none!important; max-height:none!important; overflow:visible!important; border:0!important; box-shadow:none!important; padding:0!important } [data-slot="dialog-content"] button {display:none!important} #diagnostic-report { color:#18181b!important; background:white!important; border:0!important; } #diagnostic-report table {break-inside:auto} #diagnostic-report tr {break-inside:avoid} }`}</style>
      <article
        id="diagnostic-report"
        className="space-y-6 rounded-xl border bg-white p-6 text-zinc-900"
      >
        <header className="border-b border-zinc-200 pb-5">
          <p className="text-xs uppercase tracking-widest text-zinc-500">
            {order.kind === "pathology"
              ? "Laboratory report"
              : "Imaging report"}
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
            {organizationName || "Diagnostic centre"}
          </h2>
          <p className="mt-1 text-sm">
            {order.serviceSnapshot.name} · {order.serviceSnapshot.code}
          </p>
        </header>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-zinc-500">Patient</dt>
            <dd className="font-semibold">{order.patientName}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Age / sex</dt>
            <dd>
              {order.patientAge ?? "Not provided"} /{" "}
              {order.patientSex || "Not provided"}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500">Referring doctor</dt>
            <dd>{order.referringDoctor || "Self-referred"}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Order reference</dt>
            <dd className="break-all">{order.id}</dd>
          </div>
          {order.barcode && (
            <div>
              <dt className="text-zinc-500">Sample identifier</dt>
              <dd className="break-all">{order.barcode}</dd>
            </div>
          )}
          <div>
            <dt className="text-zinc-500">Branch</dt>
            <dd>{order.branch || "Not specified"}</dd>
          </div>
        </dl>
        {order.kind === "pathology" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200">
                  <th scope="col" className="py-3">
                    Test
                  </th>
                  <th scope="col">Result</th>
                  <th scope="col">Unit</th>
                  <th scope="col">Reference / applicability</th>
                </tr>
              </thead>
              <tbody>
                {order.results.map((result) => (
                  <tr key={result.name} className="border-b border-zinc-100">
                    <td className="py-3">{result.name}</td>
                    <td className="font-semibold">{result.value}</td>
                    <td>{result.unit}</td>
                    <td>{result.reference || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <>
            <section>
              <h3 className="font-semibold">Findings</h3>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-7">
                {order.findings}
              </p>
            </section>
            <section>
              <h3 className="font-semibold">Impression</h3>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-7">
                {order.impression}
              </p>
            </section>
          </>
        )}
        {order.reportNote && (
          <section>
            <h3 className="font-semibold">Notes</h3>
            <p className="mt-2 whitespace-pre-wrap text-sm">
              {order.reportNote}
            </p>
          </section>
        )}
        <footer className="border-t border-zinc-200 pt-4 text-xs text-zinc-600">
          <p>
            Authorised on {new Date(order.releasedAt).toLocaleString("en-IN")}
          </p>
          <p className="mt-1 break-all">
            Authorising user: {order.releasedBy} · Record version{" "}
            {order.version}
          </p>
        </footer>
      </article>
    </div>
  );
}
