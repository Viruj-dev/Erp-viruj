# Phase 1 review

This review changes only the three staff/audit key contracts and the five staff mutation callbacks. No polling, token code, non-staff screen, dependency or formatting configuration was changed. Phase 2 has not started.

## Key callers

The entire web source, including tests, has six callers, all in `apps/web/src/features/dashboard/components/hospital/pages/staff.tsx`:

| Line | Caller | Purpose |
| --- | --- | --- |
| 84 | `staff.membersKey(currentUserId, activeOrganizationId)` | Members read |
| 92 | `staff.invitationsKey(currentUserId, activeOrganizationId)` | Invitations read |
| 98 | `audit.key(currentUserId, activeOrganizationId)` | Audit read |
| 104 | `audit.key(scope.userId, scope.orgId)` | Audit invalidation |
| 107 | `staff.invitationsKey(scope.userId, scope.orgId)` | Invitations invalidation |
| 110 | `staff.membersKey(scope.userId, scope.orgId)` | Members invalidation |

No old one-argument callers remain. All three key functions now require `(userId: string, organizationId: string)`. Unresolved identities use empty strings only for disabled staff queries. Both IDs must be truthy before a read runs.

## Every cache operation resolving to a viruj-backend prefix

Paths below are relative to `apps/web/src`. This includes local variables and factory calls, not just literal arrays. These **unmigrated non-staff resources** still have matching query definitions. None targets the old staff/audit keys. Changing their invalidations alone would break them; migrating those screens would exceed this phase's scope. No broad `["viruj-backend"]` invalidation was found.

| File | Each operation line | Method | Resolved key/factory |
| --- | --- | --- | --- |
| `features/dashboard/components/clinic/pages/clinic-marketplace-pages.tsx` | 1003, 1018, 1029 | invalidate each | `hospitalGallery.key(backendHospitalId)` |
| `features/dashboard/components/hospital/pages/doctors-management.tsx` | 84 | invalidate | `doctors.key(org)` |
| Same | 87 | invalidate | `["viruj-backend","workspace-profile",org]` |
| `features/dashboard/components/hospital/pages/facilities.tsx` | 109 | invalidate | `catalogApi.key({organizationId})`: facilities or services |
| Same | 136 | get | Same catalogue key |
| Same | 137 | set optimistic | Same catalogue key |
| Same | 152 | set rollback | Same catalogue key |
| `features/dashboard/components/hospital/pages/settings.tsx` | 1299 | set | `hospitalSettings.key("operational",org)` |
| Same | 1310 | set | `hospitalSettings.key("notifications",org)` |
| `features/dashboard/components/shared/modules/diagnostic-bookings.tsx` | 39 | invalidate | `diagnostics.key(org,"orders")` |
| `features/dashboard/components/shared/modules/diagnostic-catalogue.tsx` | 60, 67, 268 | invalidate each | `diagnostics.key(org,"services")` |
| `features/dashboard/components/shared/modules/diagnostic-orders.tsx` | 256, 281 | invalidate each | `diagnostics.key(org,"orders")` |
| `features/dashboard/components/shared/modules/pathology-workspace.test.tsx` | 27, 74, 84, 136 | set each | `diagnostics.key(org,"services")` |
| `features/dashboard/components/shared/workspace/use-workspace-profile.ts` | 67 | set | `["viruj-backend","workspace-profile",org]` |
| Same | 69 | invalidate | `["viruj-backend","directory-facility",org]` |
| Same | 72 | invalidate | `doctors.key(org)` |
| `features/dashboard/components/hospital/pages/patient-list/index.tsx` | 102 | invalidate | `appointments.key({organizationId})` |
| `features/dashboard/components/shared/modules/appointments/components/appointment-detail.tsx` | 133, 136 | invalidate each | `appointments.key({organizationId})` |

There are 28 matching operations including four fixture writes. The sole matching `getQueryData` call is in `facilities.tsx`. The accompanying raw cache-operation inventory includes all prefixes and source expressions for independent review.

## Mutation lifecycle

Invite, retry invite, update role, remove member and cancel invitation now all invalidate in `onSettled`, using the identity returned by `onMutate`. Success and failure refresh members, invitations and audit for the originating user/org. Invite result processing remains in `onSuccess`; existing error handling and dialog callbacks remain intact.

## Cache reset in providers.tsx (unchanged)

```tsx
const userId = session?.user?.id ?? null;
const organizationId =
  sessionOrganization?.id ?? activeOrganizationState.data?.id;
const identity =
  userId && organizationId ? `${userId}:${organizationId}` : null;

if (!initializedRef.current) {
  initializedRef.current = true;
  previousIdentityRef.current = identity;
} else if (previousIdentityRef.current !== identity) {
  previousIdentityRef.current = identity;
  queryClient.clear();
}
```

The effect depends on `session`, `activeOrganizationState.data`, and `queryClient`. Login changes null to user:org; logout changes it back; an org switch changes the org portion. A user switch within one org changes `user-a:org` to `user-b:org`, so it also clears. First mount establishes identity without clearing; a provider remount creates a fresh QueryClient. This is a post-render React effect, not a synchronous auth-action hook. Live browser account switching is unverified.

## Non-staff smoke-test inventory

All rows below have no polling for the listed queries and retain the default refetch-on-mount behavior: refetch when stale, not on every mount. Focus, reconnect and explicit mutation invalidation can also refetch them. Freshness alone never schedules a request while a screen stays open.

Paths are relative to `apps/web/src/features/dashboard`. Test shared screens in hospital/clinic and pathology/radiology workspaces as applicable.

| Screen/component | File and query lines | Freshness |
| --- | --- | --- |
| Doctor management | `components/hospital/pages/doctors-management.tsx:70,75` | New 60s default |
| Facilities/services catalogue | `components/hospital/pages/facilities.tsx:101` | New 60s |
| Clinic gallery | `components/clinic/pages/clinic-marketplace-pages.tsx:966` | New 60s |
| Billing module summary | `components/hospital/pages/billing.tsx:79` | New 60s |
| Community module summary | `components/hospital/pages/community.tsx:11` | New 60s |
| Activity logs | `components/shared/activity/activity-logs-page.tsx:85` | New 60s, each filter/page key |
| Diagnostic availability: branches/slots/services | `components/shared/modules/diagnostic-availability.tsx:24,28,32` | New 60s |
| Diagnostic service catalogue | `components/shared/modules/diagnostic-catalogue.tsx:49` | New 60s |
| Diagnostic file reports | `components/shared/modules/diagnostic-file-reports.tsx:23` | New 60s, each page |
| Diagnostic orders/services | `components/shared/modules/diagnostic-orders.tsx:48,52` | New 60s |
| Diagnostic onboarding | `components/shared/modules/diagnostic-onboarding.tsx:55` | New 60s |
| Diagnostic profile | `components/shared/modules/diagnostic-profile.tsx:21` | New 60s |
| Diagnostic publication: branches/services | `components/shared/modules/diagnostic-publication.tsx:24,28` | New 60s |
| Diagnostic dashboard: bookings/services/branches | `components/shared/modules/diagnostic-workspace.tsx:20,24,28` | New 60s. Bookings share a key with the polling bookings-list observer, if mounted elsewhere |
| Hospital/clinic profile editors: profile/departments/hours | `components/shared/workspace/use-workspace-profile.ts:17` | New 60s |
| Doctor credentials/verification | `components/doctor/pages/doctor-credentials.tsx:16` | New 60s |
| Doctor onboarding/profile/verification | `components/doctor/pages/doctor-onboarding.tsx:34,55` | New 60s |
| Doctor setup flow/completion gate | `components/doctor/pages/doctor-onboarding-flow.tsx:77,128,129,130,131` | New 60s; completion/profile/locations/hours/verification |
| Doctor profile/schedule pages | `components/doctor/pages/doctor-profile-pages.tsx:97,98` | New 60s; hours/locations |
| Doctor work locations | `components/doctor/pages/doctor-work-locations.tsx:9` | New 60s |
| Department pickers in doctor forms | `components/doctor/pages/doctor-professional-fields.tsx:26,76` | Five-minute department override |
| Complete-profile link | `components/shared/layout/complete-profile-option.tsx:28,34` | New 60s; diagnostic setup/workspace |
| Shared top bar | `components/shared/layout/top-bar.tsx:45,53,59` | New 60s; doctor profile/diagnostic setup/workspace |
| Diagnostic setup gate in ERP shell | `screens/erp-home-screen.tsx:276` | New 60s |

Mixed screens and existing overrides, also useful for smoke tests:

| Screen | Non-polling queries | Distinction |
| --- | --- | --- |
| Hospital/clinic dashboard | `components/hospital/pages/dashboard.tsx:56,70,77,84,91,102,218` | Analytics explicitly 60s; appointments/doctors/services/gallery/activity explicitly 30s. Facility at 218 inherits 60s. Ratings at 43 still polls every 30s |
| Analytics | `components/hospital/pages/analytics.tsx:106` | Existing explicit 60s |
| Settings | `components/hospital/pages/settings.tsx:1279,1280,1281,1282,1283,1284` | Existing explicit 30s |
| Subscription/pricing | `components/hospital/pages/pricing.tsx:68,69,77,78,79` | Existing billing 60s; focus/reconnect and retry-on-mount disabled. Checkout also runs conditional status checks |
| Analytics subscription gate | `screens/erp-home-screen.tsx:212,218` | Same billing options |
| Doctor overview | `components/doctor/pages/doctor-overview-pages.tsx:94,97,98` | Profile/locations/hours inherit 60s; dashboard/calendar separately poll |
| Doctor calendar | `components/doctor/pages/doctor-calendar.tsx:82` | Locations inherit 60s; calendar events separately poll |
| Patient-list permissions | `components/hospital/pages/patient-list/index.tsx:68` | Permissions inherit 60s; patient list still polls every 5s |
| Appointment-detail permissions | `components/shared/modules/appointments/components/appointment-detail.tsx:75` | Inherits 60s but gcTime 0 drops unobserved data; details still poll every 15s |

Doctor encounter/patient appointment screens use the polling branch for `/doctor/appointments...` and are excluded from the non-polling list. Plain fetch/useEffect forms, server components and static pages do not use this cache default. No non-staff screen above was edited.

## ESLint crash

The root's `eslint: "latest"` resolves locally to **10.0.1**. Loaded **eslint-plugin-react 7.37.5** declares ESLint peer compatibility with `^3 || ^4 || ^5 || ^6 || ^7 || ^8 || ^9.7`, excluding 10. Its `lib/util/version.js:31` calls `contextOrFilename.getFilename()`, the exact call that throws while loading `react/display-name`. The crash occurs before lint findings can be produced.

No dependencies or lockfile were changed. The narrow future fix is to pin the root ESLint to a compatible 9.x release (the web workspace already declares ^9) and update the install/lockfile, or upgrade the React plugin when it supports 10. Do not disable React rules to hide the compatibility failure.

## Composed screen coverage

The workspace-profile row covers hospital profile (`components/hospital/pages/hospital-profile.tsx:37`) and clinic profile, departments, working hours and locations (`components/clinic/pages/clinic-marketplace-pages.tsx:214,414,428,442`). All use `components/shared/workspace/workspace-sections.tsx:80`. Doctor management also uses this hook for department options at `doctors-management.tsx:663`.

Doctor profile management, verification vault, documents, practice locations, availability, leave and settings pages are exported by `doctor-profile-pages.tsx` and compose the doctor forms, credentials and location components listed in the inventory.

## Validation

TypeScript passes with the required signatures, including negative type checks rejecting missing or undefined IDs. All 12 focused tests pass. The mutation-contract test checks all five settlement callbacks and confirms the two invite-success callbacks contain no invalidation. `git diff --check` passes. ESLint remains blocked by the compatibility crash explained above. Live account switching and browser request counts were not tested.
