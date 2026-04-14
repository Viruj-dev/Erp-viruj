# ERP Project Structure

## Main places to look

- `apps/web/src/app`: Next.js route entrypoints only.
- `apps/web/src/features/auth`: login and organization access UI.
- `apps/web/src/features/dashboard`: dashboard screens and ERP frontend components.
- `apps/web/src/features/shell`: shared app shell states like loading UI.
- `apps/server/src/routes`: Hono HTTP route registration.
- `apps/server/src/middleware`: server middleware and error handling.
- `apps/server/src/handlers`: oRPC/OpenAPI handlers.
- `packages/api/src/routes`: typed RPC route definitions.
- `packages/api/src/middleware`: API auth and organization middleware.
- `packages/auth/src`: Better Auth server setup and role logic.

## Where things live now

### Frontend

- Auth UI: `apps/web/src/features/auth/components/login-screen.tsx`
- Org chooser: `apps/web/src/features/auth/components/organization-access-screen.tsx`
- Main ERP screen: `apps/web/src/features/dashboard/screens/erp-home-screen.tsx`
- Dashboard widgets: `apps/web/src/features/dashboard/components/*`

### Backend

- HTTP auth endpoint: `apps/server/src/routes/auth.ts`
- HTTP health route: `apps/server/src/routes/health.ts`
- RPC/OpenAPI bridge: `apps/server/src/routes/rpc.ts`
- Test panel route: `apps/server/src/routes/test-panel.ts`
- API route definitions: `packages/api/src/routes/*`
- API permission middleware: `packages/api/src/middleware/auth.ts`
