# Clinic Facilities and Services Reuse Slice

## 1. Existing architecture found

- Hospital facilities UI lived at `apps/web/src/features/dashboard/components/hospital/pages/facilities.tsx` and already used the shared `components/shared/facilties` forms, cards, filters, drawers, and helpers.
- Clinic facilities and services routes were static clinic pages, so clinic catalog records did not persist through the shared backend flow.
- The web API client still targeted provider-shaped service paths for parts of the catalog surface.
- The central backend already had hospital service endpoints and clinic service/facility Prisma models, but no canonical ERP route that served both hospital and clinic.
- The central API token did not expose a trusted organization type to the associated backend, so provider guards could not safely distinguish clinic from hospital there.

## 2. Shared modules reused

- Reused the existing facilities page and shared facilities component set for both facility and service catalogs.
- Reused the existing ERP tenant context helper for provider capabilities, terminology, route building, and organization-scoped requests.
- Reused the existing `virujBackend` request helper so organization context still flows through the established `X-Erp-Organization-Id` mechanism.

## 3. Shared modules created

- Added provider capability fields for shared `facilities` and `services` in `apps/web/src/features/dashboard/lib/erp-tenant.ts`.
- Added `virujBackend.services` beside `virujBackend.facilities`, both using provider-neutral ERP paths.
- Added `apps/api/src/routes/erp/facilities-services.routes.ts` in `viruj-backend` as the minimal shared route adapter over existing hospital and clinic models.

## 4. Deprecated or replaced modules

- Clinic `services` and `facilities` routes now render the shared `FacilitiesPage` instead of static clinic-only pages.
- New web calls use `/erp/facilities` and `/erp/services` through the central client.
- Existing `/hospital/services` backend routes remain as compatibility routes; they are not the new frontend path for this slice.

## 5. Frontend routes changed

- `/clinic/:slug/facilities` uses the shared catalog UI with `catalogKind="facilities"`.
- `/clinic/:slug/services` uses the same shared catalog UI with `catalogKind="services"`.
- `/hospital/:slug/facilities` continues to use the same page, now with active tenant context passed in.
- Clinic sidebar exposes both `Services` and `Facilities` as first-level pages.

## 6. Backend routes changed

- Registered canonical ERP routes in `viruj-backend/apps/api/src/routes/erp/index.ts`:
  - `GET /erp/facilities`
  - `POST /erp/facilities`
  - `GET /erp/facilities/:id`
  - `PATCH /erp/facilities/:id`
  - `PATCH /erp/facilities/:id/status`
  - `DELETE /erp/facilities/:id`
  - Matching `/erp/services` routes.
- Central auth now includes `organization_type` in the backend access token.
- Backend token validation maps `organization_type` into trusted request actor context.

## 7. Provider guards changed

- The shared ERP catalog route accepts only trusted `hospital` and `clinic` organization types from the authenticated request context.
- Provider type is not read from request body or query params.
- The older ERP facilities route in `erp_virujhealth/apps/server/src/routes/facilities.ts` now allows hospital and clinic workspaces instead of hospital only.

## 8. Tenant-scoping enforcement

- Shared route requires `ctx.tenantId` before every catalog operation.
- Hospital reads and writes scope by `hospitalId + id` where applicable.
- Clinic facility reads and writes scope by `tenantId + id`.
- Clinic service reads and writes scope by `tenantId + id`.
- List queries include the active tenant id.
- Mutation audit logs write the same tenant/workspace id.

## 9. Query-key isolation

- Facility query keys are now `['viruj-backend', 'erp', 'facilities', organizationId]`.
- Service query keys are now `['viruj-backend', 'erp', 'services', organizationId]`.
- Shared catalog pages disable loading until an organization id is available.
- The dashboard facility count also uses organization-scoped keys and requests.

## 10. Permission mapping

- Hospital catalog access keeps existing hospital service permissions: `hospital_service.read`, `hospital_service.create`, and `hospital_service.update`.
- Clinic facilities use `clinic.facility.read/create/update/delete`.
- Clinic services use `clinic.service.read/create/update/delete`.
- Delete currently archives and maps hospital delete to update permission, matching the minimal compatibility model.

## 11. Facility functionality enabled for clinics

- Clinic users can list persisted clinic facilities.
- Clinic users can create, edit, publish/update status, and archive facilities through the shared UI.
- Empty clinic facility pages now reflect persisted state instead of hardcoded demo rows.

## 12. Service functionality enabled for clinics

- Clinic users can list persisted clinic services.
- Clinic users can create, edit, publish/update status, and archive services through the shared UI.
- Clinic service categories are created or reactivated by name within the active clinic scope.

## 13. Hospital behavior preserved

- Hospital facilities page still renders the existing catalog experience.
- Hospital catalog data still maps to the existing `hospitalService` model.
- Existing hospital-specific service routes were left intact for compatibility.
- Hospital capability flags remain enabled for beds, wards, emergency infrastructure, operating theatres, departments, locations, offerings, and practitioners.

## 14. Tests added

- Added `viruj-backend/apps/api/src/routes/erp/facilities-services.routes.test.ts` for canonical route registration, trusted provider context, tenant-scoped query patterns, permission mapping, and audit logging.
- Extended `apps/web/src/features/dashboard/lib/erp-tenant.test.ts` for facilities/services capabilities and organization-scoped cache keys.
- Verified the previous appointment tenant-scope guard test still passes.

## 15. Tests still missing

- Seeded cross-tenant integration tests are still missing for hospital A/B and clinic A/B isolation.
- No DB-backed tests yet prove cross-tenant facility or service updates/deletes are rejected at runtime.
- Location and practitioner cross-tenant assignment tests are not added because this minimal adapter does not wire those associations yet.
- Public marketplace projection tests are not added in this slice.

## 16. Known limitations

- This is not production-ready against the full brief because the seeded tenant-isolation suite is still missing.
- Facilities and services share the existing facility-shaped UI, so service terminology is improved but not fully domain-specific.
- Clinic service creation uses a minimal duration/default price mapping because offering and pricing redesign are out of scope.
- Hospital facilities and services still map onto the existing `hospitalService` model, so they are route-separated but not schema-separated on the hospital side.
- Version-based optimistic concurrency was not added because the current catalog models in use here do not expose the same version contract as appointments.

## 17. Recommended next reusable module

Offerings should be next. Services now identify what the clinic provides; offerings should define how those services are sold, priced, and booked without folding pricing back into the service entity.