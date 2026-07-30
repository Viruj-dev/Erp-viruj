# Clinic Appointment Reuse Slice

## 1. Existing appointment architecture found

- Web already had one shared appointment UI at `apps/web/src/features/dashboard/components/shared/modules/appointments`.
- Hospital routes used that shared UI for appointment dashboard, review, patient history, and settings.
- Clinic routes had no appointment pages wired and therefore did not use persisted appointment data.
- The web appointment client used persisted backend endpoints, but its React Query key was global.
- Backend common appointment repositories already list and read appointments by tenant id.
- One common backend transition path read by tenant but wrote by appointment id only.
- The ERP bulk delete route allowed an undefined tenant path through to helper logic.

## 2. Shared modules created

- Added `apps/web/src/features/dashboard/lib/erp-tenant.ts`.
- It defines shared tenant context, hospital/clinic capabilities, terminology, provider checks, and route building.

## 3. Hospital files refactored

- Hospital dashboard appointment counts now use organization-scoped appointment query keys and requests.
- Hospital appointment pages pass an `ErpTenantContext` into the shared appointment module.
- Hospital patient directory appointment reads and status mutations now carry the organization id.

## 4. Clinic files refactored

- Clinic tenant now exposes appointment pages in supported pages and sidebar navigation.
- Clinic appointment routes render the same shared appointment module used by hospital.
- Clinic appointment terminology uses `Specialty` instead of `Department` through provider config.

## 5. Backend routes and services changed

- `common/appointments.repository.ts` status transitions now update with `id + tenantId + version`.
- ERP appointment list, pending, and bulk delete routes now reject missing tenant context.
- The unused ERP appointment list helper with optional tenant scoping was removed.

## 6. Database or schema changes

- None.

## 7. Tenant-isolation enforcement

- Frontend appointment cache keys include active organization id.
- Frontend appointment requests send `X-Erp-Organization-Id` when the active org id is available.
- Backend list, pending, reads, writes, audits, and deletes stay tenant-scoped.

## 8. Permission mapping

- Existing shared appointment permissions are preserved: `appointment.read`, `appointment.approve`, `appointment.reject`, `appointment.reschedule`, `appointment.cancel`, `appointment.complete`, and `appointment.no_show`.
- Clinic roles were allowed to navigate to appointment pages.

## 9. Query-key and cache-isolation changes

- `virujBackend.appointments.key({ organizationId })` replaced the global appointment key.
- Shared appointment module, hospital dashboard, and hospital patient directory use organization-scoped keys.

## 10. Tests added

- Web test covers provider-aware routes, provider capability/terminology config, and appointment query-key isolation.
- Backend test guards the tenant-scoped transition write and ERP list/pending/delete tenant requirements.

## 11. Hospital behavior preserved

- Hospital continues using the existing shared appointment views.
- Hospital-only appointment capability flags remain enabled.

## 12. Clinic behavior enabled

- Clinic appointment dashboard/review/history/settings routes now render the shared appointment module.
- Clinic appointment data comes from the active organization-scoped backend request, not static demo arrays.

## 13. Known limitations

- This is not the full fixture-heavy tenant isolation suite from the brief.
- Clinic appointment creation/rescheduling form UX was not expanded in this slice.
- Appointment settings still use local UI state and need a persisted settings endpoint in a later slice.
- Backend provider-type validation is still mostly JWT/tenant-context based; explicit provider capability guards should be added when provider type is available in the central API token/session context.

## 14. Recommended next shared module

Facilities/services should be next. The backend already has an ERP facilities route, but it currently rejects non-hospital workspaces.
