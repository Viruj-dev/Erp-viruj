import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErpDemoAppointments } from "../components/shared/modules/appointments";
import {
  canVerifyDiagnosticArrival,
  diagnosticBookingAppointment,
  type DiagnosticBooking,
} from "./diagnostic-bookings";
import type { ErpTenantContext } from "./erp-tenant";

test("pathology and radiology lists expose arrival verification and retain the verified flag", () => {
  const booking = {
    id: "booking-a",
    version: 1,
    status: "accepted",
    collectionMode: "centre",
    createdAt: "2026-10-21T00:00:00Z",
    note: "",
    slot: {
      startsAt: "2026-10-22T04:00:00Z",
      endsAt: "2026-10-22T04:30:00Z",
      branch: { name: "Main" },
    },
    order: {
      status: "ordered",
      patientName: "Patient A",
      patientPhone: "",
      serviceSnapshot: { name: "Test" },
    },
  } as DiagnosticBooking;
  for (const providerType of ["pathology", "radiology"] as const) {
    for (const verified of [false, true]) {
      const row = {
        ...booking,
        arrivalVerifiedAt: verified ? "2026-10-21T10:00:00Z" : null,
      };
      const html = renderToStaticMarkup(
        <QueryClientProvider client={new QueryClient()}>
          <ErpDemoAppointments
            tenant={
              {
                providerType,
                capabilities: { appointments: { enabled: true } },
              } as ErpTenantContext
            }
            source={{
              data: [diagnosticBookingAppointment(row)],
              isPending: false,
              isError: false,
              error: null,
              isFetching: false,
              refetch: () => {},
              onSelect: () => {},
              canVerifyArrival: () => canVerifyDiagnosticArrival(row),
            }}
          />
        </QueryClientProvider>
      );
      expect(html.includes(">Verify arrival<")).toBe(!verified);
      expect(html.includes("Arrival verified")).toBe(verified);
      expect(html.includes(">Confirmed<")).toBe(verified);
      expect(html.includes(">Awaiting verification<")).toBe(!verified);
    }
  }
});
