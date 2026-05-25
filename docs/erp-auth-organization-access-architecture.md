# Viruj ERP Authentication and Organization Access Architecture

## 1. Architecture Summary

Viruj ERP authentication is a separate, organization-centric auth system for operational users at hospitals, clinics, doctors, radiology centers, and pathology labs. Mobile users remain in the mobile auth domain. ERP users are staff members of an organization tenant, and every authenticated ERP request carries an actor context:

```ts
{
  organizationId: "org_123",
  organizationType: "HOSPITAL",
  userId: "user_456",
  role: "APPOINTMENT_HANDLER"
}
```

The ERP should stay a modular monolith:

- Hono handles HTTP transport and middleware.
- Route handlers only parse requests and call services.
- Services own business logic.
- Repositories or Prisma clients own database access.
- Middleware validates JWTs, resolves actor context, and enforces role gates.
- Organization ID is required on every tenant-owned query.

The MVP does not need enterprise IAM, SSO, ABAC, custom permission DSLs, or cross-organization role complexity.

## 2. Domains

### Auth Domain

Owns ERP login, password hashing, sessions, JWT issuance, JWT refresh, password reset, staff invitations, and staff status.

### Organization Domain

Owns organizations, organization type normalization, organization profile, staff membership, and organization onboarding.

### ERP Operational Domains

Appointment, patient, billing, community, and schedule modules depend on actor context. They should never independently parse JWTs or accept arbitrary organization IDs without validating against the actor.

## 3. Organization Model

Organizations are tenants.

Supported organization types:

```ts
enum OrganizationType {
  HOSPITAL
  CLINIC
  DOCTOR
  RADIOLOGY
  PATHOLOGY
}
```

Backend normalization should accept known lowercase frontend values and store uppercase enum values:

```ts
const normalizeOrganizationType = (value: string): OrganizationType => {
  const normalized = value.trim().toUpperCase();

  if (!["HOSPITAL", "CLINIC", "DOCTOR", "RADIOLOGY", "PATHOLOGY"].includes(normalized)) {
    throw new AppError("INVALID_ORGANIZATION_TYPE", 400);
  }

  return normalized as OrganizationType;
};
```

Important: organization type is not a role. A `HOSPITAL` can have `FINANCE_MANAGER` staff. A `PATHOLOGY` lab can have `ORG_ADMIN` staff.

Core organization fields:

- `id`: internal stable ID, for example `org_123`.
- `code`: human-entered login identifier, for example `APOLLO_DELHI`.
- `name`: display name.
- `type`: tenant category.
- `status`: active, suspended, archived.
- `primaryAdminUserId`: first admin account created by Viruj.
- `metadata`: flexible profile details for MVP.

## 4. Organization User Model

ERP staff accounts belong to exactly one organization for MVP simplicity. If a person later works for multiple organizations, add membership switching later instead of introducing it now.

Core fields:

- `id`: ERP user ID.
- `organizationId`: tenant owner.
- `email`: unique within organization.
- `passwordHash`: Argon2id or bcrypt hash.
- `name`, `phone`.
- `role`: operational ERP role.
- `status`: invited, active, suspended, disabled.
- `lastLoginAt`.
- `createdByUserId`: admin who created the staff account.

Recommended uniqueness:

- `Organization.code` is globally unique.
- `OrganizationUser.organizationId + email` is unique.

This allows two unrelated clinics to invite `billing@example.com`, while login still requires `organizationId/code + email + password`.

## 5. Role Model

Keep roles as a simple enum in code and database.

```ts
enum OrganizationRole {
  ORG_ADMIN
  APPOINTMENT_HANDLER
  COMMUNITY_MANAGER
  FINANCE_MANAGER
}
```

Role responsibilities:

| Role | Access |
| --- | --- |
| `ORG_ADMIN` | Full organization access, staff management, appointments, billing, community, schedules |
| `APPOINTMENT_HANDLER` | Appointment approval/rejection, lifecycle management, schedules, patient booking info |
| `COMMUNITY_MANAGER` | Community posts, organization public profile, engagement |
| `FINANCE_MANAGER` | Invoices, payments, billing operations |

Use simple module/action permissions in application code:

```ts
const rolePermissions = {
  ORG_ADMIN: ["staff.manage", "appointments.manage", "patients.read", "billing.manage", "community.manage", "schedules.manage"],
  APPOINTMENT_HANDLER: ["appointments.manage", "patients.read", "schedules.manage"],
  COMMUNITY_MANAGER: ["community.manage", "profile.manage"],
  FINANCE_MANAGER: ["billing.manage", "payments.manage"],
} as const;
```

## 6. Prisma Schema

The current repo uses Drizzle, but this is the target Prisma model if Viruj standardizes ERP persistence on Prisma.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum OrganizationType {
  HOSPITAL
  CLINIC
  DOCTOR
  RADIOLOGY
  PATHOLOGY
}

enum OrganizationStatus {
  ACTIVE
  SUSPENDED
  ARCHIVED
}

enum OrganizationRole {
  ORG_ADMIN
  APPOINTMENT_HANDLER
  COMMUNITY_MANAGER
  FINANCE_MANAGER
}

enum OrganizationUserStatus {
  INVITED
  ACTIVE
  SUSPENDED
  DISABLED
}

enum SessionStatus {
  ACTIVE
  REVOKED
  EXPIRED
}

enum InvitationStatus {
  PENDING
  ACCEPTED
  EXPIRED
  REVOKED
}

enum AuditAction {
  LOGIN_SUCCESS
  LOGIN_FAILED
  LOGOUT
  STAFF_CREATED
  STAFF_INVITED
  STAFF_UPDATED
  STAFF_DISABLED
  APPOINTMENT_UPDATED
  BILLING_UPDATED
  COMMUNITY_UPDATED
  SCHEDULE_UPDATED
}

model Organization {
  id                 String             @id @default(cuid())
  code               String             @unique
  name               String
  type               OrganizationType
  status             OrganizationStatus @default(ACTIVE)
  primaryAdminUserId String?
  metadata           Json?
  createdAt          DateTime           @default(now())
  updatedAt          DateTime           @updatedAt

  users              OrganizationUser[]
  sessions           ErpSession[]
  invitations        StaffInvitation[]
  auditLogs          AuditLog[]

  @@index([type])
  @@index([status])
}

model OrganizationUser {
  id                String                 @id @default(cuid())
  organizationId    String
  email             String
  name              String
  phone             String?
  passwordHash      String
  role              OrganizationRole
  status            OrganizationUserStatus @default(ACTIVE)
  emailVerifiedAt   DateTime?
  lastLoginAt       DateTime?
  createdByUserId   String?
  createdAt         DateTime               @default(now())
  updatedAt         DateTime               @updatedAt

  organization      Organization           @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  createdBy         OrganizationUser?      @relation("CreatedStaff", fields: [createdByUserId], references: [id])
  createdStaff      OrganizationUser[]     @relation("CreatedStaff")
  sessions          ErpSession[]
  sentInvitations   StaffInvitation[]      @relation("InvitedBy")
  auditLogs         AuditLog[]

  @@unique([organizationId, email])
  @@index([organizationId, role])
  @@index([organizationId, status])
}

model ErpSession {
  id               String        @id @default(cuid())
  organizationId   String
  userId           String
  refreshTokenHash String        @unique
  status           SessionStatus @default(ACTIVE)
  ipAddress        String?
  userAgent        String?
  expiresAt        DateTime
  revokedAt        DateTime?
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt

  organization     Organization  @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  user             OrganizationUser @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([organizationId, userId])
  @@index([expiresAt])
}

model StaffInvitation {
  id              String           @id @default(cuid())
  organizationId  String
  email           String
  role            OrganizationRole
  tokenHash       String           @unique
  status          InvitationStatus @default(PENDING)
  invitedByUserId String
  expiresAt       DateTime
  acceptedAt      DateTime?
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  organization    Organization     @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  invitedBy       OrganizationUser @relation("InvitedBy", fields: [invitedByUserId], references: [id])

  @@index([organizationId, email])
  @@index([status, expiresAt])
}

model AuditLog {
  id              String       @id @default(cuid())
  organizationId  String
  actorUserId     String?
  action          AuditAction
  entityType      String?
  entityId        String?
  ipAddress       String?
  userAgent       String?
  metadata        Json?
  createdAt       DateTime     @default(now())

  organization    Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  actor           OrganizationUser? @relation(fields: [actorUserId], references: [id])

  @@index([organizationId, createdAt])
  @@index([organizationId, action])
  @@index([entityType, entityId])
}
```

Operational tables such as appointments, patient profiles, invoices, community posts, and schedules must include `organizationId` and index it.

## 7. JWT Strategy

Use short-lived access JWTs and longer-lived refresh sessions.

Access token:

- Lifetime: 10 to 15 minutes.
- Signed with `ERP_JWT_SECRET` or asymmetric private key.
- Sent in `Authorization: Bearer <token>`.
- Contains actor context and session ID.

Example claims:

```json
{
  "iss": "viruj-erp",
  "aud": "viruj-healthcare-backend",
  "sub": "user_456",
  "sid": "sess_789",
  "organization_id": "org_123",
  "organization_code": "APOLLO_DELHI",
  "organization_type": "HOSPITAL",
  "user_id": "user_456",
  "role": "APPOINTMENT_HANDLER",
  "iat": 1760000000,
  "exp": 1760000900
}
```

Refresh token:

- Random opaque token, not a JWT.
- Stored hashed in `ErpSession.refreshTokenHash`.
- Lifetime: 7 to 30 days.
- Rotated on refresh.
- Revoked on logout, password reset, staff disable, or suspicious activity.

## 8. Password Hashing

Use Argon2id if available in the Bun deployment target. Otherwise use bcrypt with cost 12 or higher.

Recommendations:

- Never store raw passwords.
- Never log passwords or invitation tokens.
- Hash password using per-password salt.
- Validate minimum length of 10 characters for staff.
- Add breached password checks later.
- Force password reset after Viruj manually creates the primary admin account.

Example:

```ts
const passwordHash = await argon2.hash(password, {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
});
```

## 9. Session Management

Session records are server-side and tenant-bound.

On login:

1. Normalize organization code.
2. Find active organization.
3. Find active user by `organizationId + email`.
4. Verify password.
5. Create `ErpSession`.
6. Issue access JWT.
7. Set refresh token as secure HTTP-only cookie or return it only to trusted clients.

On refresh:

1. Hash presented refresh token.
2. Find active, unexpired session.
3. Rotate refresh token.
4. Issue new access JWT.

On logout:

1. Revoke current session.
2. Clear refresh cookie.

For MVP, allow multiple sessions per user. Add session listing and revoke-other-sessions later.

## 10. Hono Route Structure

Use Hono for transport. Keep route handlers thin.

```txt
apps/server/src/routes/
  auth.ts
  organizations.ts
  staff.ts
  appointments.ts
  patients.ts
  billing.ts
  community.ts
  schedules.ts

packages/api/src/modules/
  auth/
    auth.service.ts
    auth.repository.ts
    auth.schemas.ts
  organizations/
    organization.service.ts
    organization.repository.ts
  staff/
    staff.service.ts
    staff.repository.ts
  appointments/
  patients/
  billing/
  community/
  schedules/

packages/api/src/middleware/
  actor.ts
  require-role.ts
  require-permission.ts
  tenant-scope.ts

packages/api/src/lib/
  errors.ts
  jwt.ts
  password.ts
  audit.ts
  redis.ts
```

Route example:

```ts
app.post("/erp/auth/login", async (c) => {
  const input = loginSchema.parse(await c.req.json());
  const result = await authService.login(input, requestMetaFrom(c));
  return c.json(result);
});

app.post(
  "/erp/staff",
  requireErpAuth(),
  requireRole(["ORG_ADMIN"]),
  async (c) => {
    const actor = c.get("actor");
    const input = createStaffSchema.parse(await c.req.json());
    const result = await staffService.createStaff(actor, input);
    return c.json(result, 201);
  }
);
```

## 11. Middleware Structure

Recommended middleware order:

1. Request ID.
2. CORS.
3. Secure headers.
4. Error handler.
5. Body size limit.
6. ERP JWT validation for `/erp/*` protected routes.
7. Actor extraction.
8. Role or permission guard.
9. Audit capture for mutations.

Authentication middleware:

```ts
type ErpActor = {
  organizationId: string;
  organizationCode: string;
  organizationType: OrganizationType;
  userId: string;
  role: OrganizationRole;
  sessionId: string;
};

const requireErpAuth = () => async (c: Context, next: Next) => {
  const token = extractBearerToken(c.req.header("Authorization"));
  const claims = await verifyErpJwt(token);

  const actor: ErpActor = {
    organizationId: claims.organization_id,
    organizationCode: claims.organization_code,
    organizationType: claims.organization_type,
    userId: claims.user_id,
    role: claims.role,
    sessionId: claims.sid,
  };

  c.set("actor", actor);
  await next();
};
```

Role middleware:

```ts
const requireRole = (allowedRoles: OrganizationRole[]) => {
  return async (c: Context, next: Next) => {
    const actor = c.get("actor");

    if (!actor || !allowedRoles.includes(actor.role)) {
      throw new AppError("FORBIDDEN", 403);
    }

    await next();
  };
};
```

## 12. Actor Extraction Strategy

Every service receives actor explicitly:

```ts
await appointmentService.updateStatus(actor, appointmentId, status);
```

Services must use `actor.organizationId` as the tenant scope:

```ts
await prisma.appointment.update({
  where: {
    id_organizationId: {
      id: appointmentId,
      organizationId: actor.organizationId,
    },
  },
  data: { status },
});
```

Do not trust `organizationId` from request body for protected ERP actions. If an endpoint accepts it for admin tooling, it must match the actor or be restricted to internal Viruj super-admin operations.

## 13. Tenant Isolation Strategy

Tenant isolation rules:

- Every ERP-owned table has `organizationId`.
- Every ERP query filters by `actor.organizationId`.
- Composite unique constraints include `organizationId` where data is tenant-owned.
- Service methods require actor context.
- Background jobs include organization context in payloads.
- Audit logs include organization ID.
- Avoid global `findUnique({ id })` on tenant-owned records unless the ID is globally unguessable and the service still verifies organization ownership.

Recommended database constraints:

- `@@index([organizationId, createdAt])` on high-volume operational tables.
- Composite unique keys such as `[organizationId, invoiceNumber]`.
- Foreign keys back to `Organization`.

PostgreSQL row-level security can be added later, but it is not necessary for MVP if application-level tenant scoping is disciplined and tested.

## 14. Role-Based UI Access

The frontend should use the same role vocabulary as the backend. JWT/session response gives role and organization type. UI visibility is convenience only; backend remains authoritative.

Navigation:

| Module | Roles |
| --- | --- |
| Dashboard | All roles |
| Appointments | `ORG_ADMIN`, `APPOINTMENT_HANDLER` |
| Patients | `ORG_ADMIN`, `APPOINTMENT_HANDLER` |
| Billing | `ORG_ADMIN`, `FINANCE_MANAGER` |
| Community | `ORG_ADMIN`, `COMMUNITY_MANAGER` |
| Schedules | `ORG_ADMIN`, `APPOINTMENT_HANDLER` |
| Staff | `ORG_ADMIN` |
| Settings | `ORG_ADMIN` |

UI should hide inaccessible modules and show a 403 screen if a user navigates directly to a forbidden route.

## 15. Login Flow

Request:

```http
POST /erp/auth/login
Content-Type: application/json
```

```json
{
  "organizationId": "APOLLO_DELHI",
  "email": "admin@apollo.com",
  "password": "correct horse battery staple"
}
```

Response:

```json
{
  "accessToken": "jwt...",
  "expiresIn": 900,
  "actor": {
    "organizationId": "org_123",
    "organizationCode": "APOLLO_DELHI",
    "organizationType": "HOSPITAL",
    "userId": "user_456",
    "name": "Apollo Hospital IT Lead",
    "email": "admin@apollo.com",
    "role": "ORG_ADMIN"
  }
}
```

Errors:

```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid organization, email, or password."
  }
}
```

Use the same generic invalid credentials message for unknown organization, unknown email, wrong password, and disabled account where possible.

## 16. Organization Onboarding Flow

Initial MVP onboarding is manual by Viruj operations.

1. Viruj verifies the organization offline.
2. Viruj internal admin creates organization.
3. Viruj creates primary `ORG_ADMIN`.
4. System sends set-password invite to primary admin.
5. Primary admin logs in with `organizationId + email + password`.
6. Primary admin creates staff accounts and assigns operational roles.

Internal request:

```json
{
  "code": "APOLLO_DELHI",
  "name": "Apollo Hospital Delhi",
  "type": "hospital",
  "primaryAdmin": {
    "name": "Apollo Hospital IT Lead",
    "email": "admin@apollo.com",
    "phone": "+919999999999"
  }
}
```

Response:

```json
{
  "organization": {
    "id": "org_123",
    "code": "APOLLO_DELHI",
    "type": "HOSPITAL",
    "status": "ACTIVE"
  },
  "primaryAdmin": {
    "id": "user_456",
    "email": "admin@apollo.com",
    "role": "ORG_ADMIN",
    "status": "INVITED"
  }
}
```

## 17. Staff Invitation Flow

Only `ORG_ADMIN` can invite or create staff.

Invite request:

```http
POST /erp/staff/invitations
Authorization: Bearer <accessToken>
```

```json
{
  "email": "appointments@apollo.com",
  "name": "Appointment Desk",
  "role": "APPOINTMENT_HANDLER"
}
```

Response:

```json
{
  "invitationId": "inv_123",
  "email": "appointments@apollo.com",
  "role": "APPOINTMENT_HANDLER",
  "status": "PENDING",
  "expiresAt": "2026-06-01T10:00:00.000Z"
}
```

Accept invite:

```http
POST /erp/auth/invitations/accept
```

```json
{
  "token": "raw-invite-token-from-email",
  "password": "new secure password"
}
```

Response:

```json
{
  "userId": "user_789",
  "organizationId": "org_123",
  "status": "ACTIVE"
}
```

For MVP, staff invitation can also be simplified to direct staff creation with a temporary password reset link.

## 18. Module Request Examples

Approve appointment:

```http
PATCH /erp/appointments/apt_123/status
Authorization: Bearer <accessToken>
```

```json
{
  "status": "APPROVED",
  "notes": "Confirmed by front desk."
}
```

Service behavior:

- Require `ORG_ADMIN` or `APPOINTMENT_HANDLER`.
- Update only where `appointment.organizationId = actor.organizationId`.
- Write audit log.

Create community post:

```http
POST /erp/community/posts
Authorization: Bearer <accessToken>
```

```json
{
  "title": "Free diabetes screening camp",
  "body": "Available this Sunday from 9 AM.",
  "visibility": "PUBLIC"
}
```

Service behavior:

- Require `ORG_ADMIN` or `COMMUNITY_MANAGER`.
- Attach `organizationId` and `createdByUserId` from actor.

## 19. Authorization Middleware

Prefer permission names internally and role mapping at the boundary.

```ts
type Permission =
  | "staff.manage"
  | "appointments.manage"
  | "patients.read"
  | "billing.manage"
  | "payments.manage"
  | "community.manage"
  | "profile.manage"
  | "schedules.manage";

const hasPermission = (role: OrganizationRole, permission: Permission) => {
  return rolePermissions[role].includes(permission);
};

const requirePermission = (permission: Permission) => {
  return async (c: Context, next: Next) => {
    const actor = c.get("actor");

    if (!actor || !hasPermission(actor.role, permission)) {
      throw new AppError("FORBIDDEN", 403);
    }

    await next();
  };
};
```

This stays simple while avoiding scattered role checks in every route.

## 20. Security Recommendations

- Use HTTPS only in production.
- Store refresh tokens in secure, HTTP-only, same-site cookies where possible.
- Use short-lived access JWTs.
- Hash refresh tokens before storage.
- Rate-limit login by organization code, email, and IP.
- Lock or slow down repeated failed login attempts.
- Use generic login failure messages.
- Validate all payloads with Zod or equivalent.
- Keep ERP auth secret separate from mobile auth secret.
- Revoke sessions when staff role/status changes.
- Require current password for password changes.
- Add two-factor authentication later for `ORG_ADMIN`.
- Never expose password hash, refresh token hash, or invite token hash.
- Keep internal Viruj onboarding routes unavailable from the public ERP frontend.

## 21. Audit Logging

Audit logs are lightweight but important in healthcare operations.

Log:

- Login success and failure.
- Logout.
- Staff invitation, creation, update, disable.
- Appointment status changes.
- Billing/payment updates.
- Community post changes.
- Schedule changes.

Audit event shape:

```json
{
  "organizationId": "org_123",
  "actorUserId": "user_456",
  "action": "APPOINTMENT_UPDATED",
  "entityType": "Appointment",
  "entityId": "apt_123",
  "metadata": {
    "fromStatus": "PENDING",
    "toStatus": "APPROVED"
  }
}
```

Audit logging should be called from services after successful mutations, not from route handlers.

## 22. Suggested Redis Usage

Redis is useful but not mandatory on day one. Add it when operational load needs it.

Good MVP uses:

- Login rate limiting.
- OTP/password reset/invitation temporary token throttling.
- JWT session denylist for emergency revocation if access tokens are not short enough.
- Cache organization profile and role metadata.
- Queue lightweight background jobs such as email sending.

Avoid storing primary auth state only in Redis. PostgreSQL remains the source of truth.

## 23. Error Handling Strategy

Use a standard application error format.

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have access to this ERP action.",
    "requestId": "req_123"
  }
}
```

Recommended codes:

- `INVALID_REQUEST`: validation failed.
- `UNAUTHORIZED`: missing or invalid token.
- `FORBIDDEN`: valid actor but insufficient role.
- `INVALID_CREDENTIALS`: login failed.
- `ORGANIZATION_NOT_FOUND`: internal/admin route only.
- `STAFF_NOT_FOUND`: staff member not found in actor organization.
- `INVITATION_EXPIRED`: invite no longer valid.
- `CONFLICT`: duplicate staff or organization code.
- `RATE_LIMITED`: too many attempts.
- `INTERNAL_ERROR`: unexpected failure.

HTTP mapping:

| Code | HTTP |
| --- | --- |
| `INVALID_REQUEST` | 400 |
| `UNAUTHORIZED` | 401 |
| `FORBIDDEN` | 403 |
| `NOT_FOUND` | 404 |
| `CONFLICT` | 409 |
| `RATE_LIMITED` | 429 |
| `INTERNAL_ERROR` | 500 |

## 24. MVP Implementation Notes for Current Repo

The current codebase already has:

- Organization tables in `packages/db/src/schema/auth.ts`.
- Better Auth organization membership and active organization session.
- Permission middleware in `packages/api/src/middleware/auth.ts`.
- ERP dashboard components grouped by module.

Recommended next implementation steps:

1. Rename current generic roles to the MVP ERP roles: `ORG_ADMIN`, `APPOINTMENT_HANDLER`, `COMMUNITY_MANAGER`, `FINANCE_MANAGER`.
2. Add `DOCTOR` to organization types if individual doctors are first-class organizations.
3. Make appointment, billing, community, patient, and schedule queries tenant-scoped by `activeOrganization.id`.
4. Replace bootstrap organization behavior with Viruj-admin onboarding for production.
5. Add audit logging for all mutation services.
6. Introduce refresh-token-backed JWT sessions if moving away from Better Auth cookies for ERP APIs.

## 25. Final Direction

The right MVP architecture is simple:

- One tenant equals one organization.
- One ERP staff account belongs to one organization.
- One operational role controls module access.
- One actor context follows every request.
- PostgreSQL stores durable auth/session/audit state.
- JWTs carry signed actor context.
- Services enforce tenant scope and authorization.

This gives Viruj a production-grade SaaS foundation without pretending to be a full hospital operating system too early.
