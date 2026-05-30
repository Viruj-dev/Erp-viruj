# Viruj ERP Auth And Organization Access Architecture

Viruj ERP is a multi-tenant healthcare ERP. Authentication must identify the person, while authorization must identify the active workspace and that person's permissions inside it.

The system must never infer provider access from a user role. A user with membership role `DOCTOR` inside a hospital is still operating a `HOSPITAL` organization. A user operating an independent doctor practice must have an active organization whose type is `doctor`.

## Core Concepts

### User

The logged-in person.

Owned by Better Auth tables:

- `users`
- `accounts`
- `sessions`
- `verifications`

Users do not carry provider type. Do not add fields such as `user.role = HOSPITAL` or `user.providerType = doctor`.

### Organization

The healthcare workspace being operated.

Current types:

- `hospital`
- `doctor`
- `clinic`
- `pathology`
- `radiology`

Provider dashboards and provider APIs are protected by organization type:

| Route family | Required active organization type |
| --- | --- |
| `/hospital/*` | `hospital` |
| `/doctor/*` | `doctor` |
| `/clinic/*` | `clinic` |
| `/pathology/*` | `pathology` |
| `/radiology/*` | `radiology` |

### OrganizationMember

The user's role inside one organization.

Current canonical roles:

- `OWNER`
- `ADMIN`
- `MANAGER`
- `DOCTOR`
- `STAFF`
- `RECEPTIONIST`
- `TECHNICIAN`

Legacy roles are still accepted and normalized for old data:

- `ORG_ADMIN` -> `ADMIN`
- `APPOINTMENT_HANDLER` -> `DOCTOR`
- `COMMUNITY_MANAGER` -> `MANAGER`
- `owner` -> `OWNER`
- `admin` -> `ADMIN`
- `manager` -> `MANAGER`
- `doctor` -> `DOCTOR`
- `receptionist` -> `RECEPTIONIST`
- `lab_tech` -> `TECHNICIAN`

## Session And Workspace Flow

1. User signs in with email/password.
2. Backend returns the authenticated user and all organizations where the user is a member.
3. If exactly one organization exists, the app can activate it automatically.
4. If multiple organizations exist, the user must select a workspace.
5. Better Auth stores the selected organization in `sessions.active_organization_id`.
6. Custom session data resolves:
   - `activeOrganization`
   - `activeMember`
7. Dashboard routing uses `activeOrganization.organizationType`.
8. Feature permissions use `activeMember.role`.

Example user shape:

```json
{
  "id": "user_1",
  "email": "dr@example.com"
}
```

Example organizations:

```json
[
  {
    "id": "org_hospital",
    "name": "ABC Hospital",
    "organizationType": "hospital"
  },
  {
    "id": "org_doctor",
    "name": "Dr Rao Practice",
    "organizationType": "doctor"
  }
]
```

Example active session context:

```json
{
  "sub": "user_1",
  "organizationId": "org_doctor",
  "organizationType": "doctor",
  "membershipRole": "OWNER"
}
```

## Authorization Rules

Provider checks must be organization checks:

```ts
requireOrganizationType("hospital");
requireOrganizationType("doctor");
```

Permission checks must be membership checks:

```ts
requirePermission({ appointment: ["read"] });
requirePermission({ consultation: ["create"] });
requirePermission({ prescription: ["create"] });
```

Do not write:

```ts
if (user.role === "HOSPITAL") {}
if (member.role === "doctor") router.push("/doctor");
```

Correct:

```ts
if (activeOrganization.organizationType === "doctor") {
  router.push("/doctor");
}
```

## RBAC Statements

Current ERP permission resources:

- `audit`
- `appointment`
- `billing`
- `community`
- `consultation`
- `doctorDirectory`
- `invitation`
- `member`
- `organization`
- `patient`
- `prescription`
- `project`
- `schedule`

High-level defaults:

| Role | Access intent |
| --- | --- |
| `OWNER` | Full organization control, staff, billing, settings, clinical operations |
| `ADMIN` | Operational admin without destructive ownership semantics |
| `MANAGER` | Staff and operational management |
| `DOCTOR` | Consultations, appointments, patients, prescriptions |
| `RECEPTIONIST` | Appointment desk, patient scheduling, front-office operations |
| `STAFF` | Basic operational read/update access |
| `TECHNICIAN` | Diagnostics-oriented operational access |

Permissions are organization-scoped because every request resolves through the active organization membership.

## Database Contract

Auth database tables:

```txt
users
  id
  name
  email
  email_verified
  image
  created_at
  updated_at

organizations
  id
  name
  slug
  logo
  organization_type
  metadata
  created_at
  updated_at

members
  id
  organization_id
  user_id
  role
  created_at

sessions
  id
  token
  user_id
  active_organization_id
  expires_at
  created_at
  updated_at
```

Important indexes:

- `organizations_slug_idx`
- `organizations_type_idx`
- `members_organization_id_idx`
- `members_user_id_idx`
- unique `members_organization_user_idx`
- `sessions_active_organization_id_idx`

## Frontend Routing Contract

Login does not collect provider type.

Organization creation collects organization type because that creates the workspace.

After login:

- If no active organization exists, show `OrganizationAccessScreen`.
- Selecting a workspace calls `setActiveOrganization({ organizationId })`.
- Route to `/${organizationType}` after the active organization is set.
- Do not route based on member role.

Examples:

- Active org type `hospital`, member role `DOCTOR` -> `/hospital`
- Active org type `doctor`, member role `OWNER` -> `/doctor`
- Active org type `clinic`, member role `ADMIN` -> `/clinic`

## Backend Route Contract

Every organization-scoped backend route must resolve:

```ts
const session = await auth.api.getSession({ headers });
const organization = session.activeOrganization;
const member = session.activeMember;
```

Then enforce:

```ts
if (!organization || !member) return 401;
if (organization.organizationType !== expectedType) return 403;
if (!hasOrganizationPermission(member.role, permission)) return 403;
```

Data queries must always include `organizationId`:

```ts
where(eq(resource.organizationId, session.activeOrganization.id))
```

## Migration Plan

1. Keep existing `users`, `organizations`, `members`, and `sessions.active_organization_id`.
2. Stop reading provider identity from user role or member role.
3. Normalize old member roles at the auth boundary.
4. Update new organization creation to create the owner as `OWNER`.
5. Update staff invitation UI to use canonical roles.
6. Replace dashboard role redirects with organization-type redirects.
7. Keep legacy role access control definitions until old rows are migrated.
8. Run a data migration later:

```sql
update members set role = 'ADMIN' where role = 'ORG_ADMIN';
update members set role = 'DOCTOR' where role = 'APPOINTMENT_HANDLER';
update members set role = 'MANAGER' where role = 'COMMUNITY_MANAGER';
update members set role = 'OWNER' where role = 'owner';
update members set role = 'ADMIN' where role = 'admin';
update members set role = 'MANAGER' where role = 'manager';
update members set role = 'DOCTOR' where role = 'doctor';
update members set role = 'RECEPTIONIST' where role = 'receptionist';
update members set role = 'TECHNICIAN' where role = 'lab_tech';
```

## Guardrails

- Never create a doctor workspace because a member role is `DOCTOR`.
- Never send a doctor-role hospital member to `/doctor`.
- Never let `/doctor/*` run against a hospital organization.
- Never query tenant data without `organizationId`.
- Keep provider-specific modules behind organization-type guards.
- Keep membership roles generic across all provider types.

