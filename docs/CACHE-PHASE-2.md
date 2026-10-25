# Appointments SSE pilot

Scope: ERP web appointment lists/details and the private tenant channel only. Appointment keys start with `[userId, orgId, "appointments", ...]`, including doctor appointment queries. No public-directory channel or mobile SSE client.

## Behavior

- `POST /events/session?org=<orgId>` uses the existing bearer JWT to set an HttpOnly cookie scoped to `/events` and that organization. Browser EventSource then connects directly to `GET /events?org=<orgId>` with credentials. Native/API clients can instead send `Authorization: Bearer <JWT>` to that GET. Tokens never go in URLs. Both paths validate signature, expiry, ERP platform, appointment-read permission and an exact tenant match. There is no development auth bypass.
- One persistent connection per signed-in browser tab; the server caps each user at five connections. Heartbeat comments every 25 seconds. Disconnect, slow readers and token expiry release the subscription and timers. Expiry causes a reconnect with a refreshed token/cookie.
- Committed appointment creation/status/arrival changes publish through the existing appointment notification path. Appointment deletion and reservation expiry also publish after commit. Only the resource name is sent: `{"resource":"appointments"}`. Repeated events in a tenant are deduplicated over a two-second window. Patient notification delivery failure does not block live invalidation. Normal API reads still enforce data access.
- On an appointment event, invalidate only that user's tenant appointment keys. On connection/reconnection and foreground, invalidate all queries to recover missed changes. Hidden tabs disconnect; returning reconnects. Logout, user/org switches and unmount close the old connection. Reconnect waits 1, 2, 4, 8, 16, then at most 30 seconds.
- List/detail polling remains 15 seconds when disconnected, slowing to 60 seconds only with SSE open. The patient-list appointment table keeps its requested **5-second disconnected fallback**; doctor appointment queries keep their existing 30-second fallback. Both slow to 60 seconds with SSE open. Existing calendar/dashboard polling and all other resource policies are unchanged.

## Manual test

1. Run a single backend process with `API_SURFACE=all` so ERP writes and patient bookings share the in-process publisher. Set web `NEXT_PUBLIC_API_URL` to its direct origin and allow the ERP origin in backend `CORS_ORIGINS`. HTTPS is needed for production cookies; localhost HTTP works in development. Restart the web server after changing its environment.
2. Sign in with a synthetic appointment-enabled ERP account. In DevTools Network, verify `/events/session?org=...` succeeds and `/events?org=...` stays open with `text/event-stream`. Inspect EventStream: only resource-name messages and heartbeat comments should appear. The connection is direct to the backend, not a Vercel/Next.js proxy.
3. Open the same tenant's appointments in two tabs. Mutate a synthetic appointment in one tab; the other should refresh within about two seconds plus API latency. Make several changes within two seconds: expect one event per tenant/window. Verify requests continue at the 60-second fallback while SSE is open.
4. Block `/events` and `/events/session` in DevTools. Verify reconnect backoff and polling returns to 15 seconds (patient list: 5; doctor appointments: 30). Unblock; verify the open connection invalidates cached queries and catches up.
5. Hide the tab, change an appointment elsewhere, then return. Verify recovery. Log out, change user within the same organization, and switch organizations: old connections must close and old appointment data must not appear.
6. Use two separately authenticated browser profiles for tenants A and B. Change A: B must receive no event. A bearer token for A with `?org=B` must get 403; a forged/missing token gets 401. Open more than five connections for one user: the extra GET gets 429, and closing a connection frees a slot.

Automated checks:

```sh
# viruj-backend
bun test apps/api/src/routes/events.routes.test.ts
bun run typecheck

# erp_virujhealth/apps/web
bun test src/lib/appointment-realtime.test.ts
node ../../node_modules/typescript/bin/tsc --noEmit --incremental false
node ../../node_modules/eslint/bin/eslint.js src/lib/appointment-realtime.ts src/lib/appointment-realtime.test.ts src/lib/use-realtime-invalidation.tsx
```

## Limits and remaining work

- In-process publication works only within one API process. Redis/shared pub/sub must replace the publisher interface before multiple replicas or separate ERP/mobile backend processes can deliver each other's events. Polling remains the safety net meanwhile; there is no event replay log.
- Public directory updates, other resources and native mobile event consumption remain unimplemented. This pilot does not make newly published doctors appear live in the patient app. Patient purge/cascading deletion is outside the pilot; its appointment effects still rely on polling.
- Browser cookie policies or an incorrect direct API URL/CORS configuration can prevent SSE; polling continues. No deployment, live database mutations or production cross-browser verification was performed.
- ESLint was pinned separately to `^9` in commit `32718c0`; installed version is 9.39.3. Web lint now runs instead of crashing. The full web lint reports existing errors/warnings; the root Ultracite config also has a missing `eslint-config-prettier` dependency. This pilot does not repair unrelated lint findings or configuration dependencies.
