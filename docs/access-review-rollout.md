# ERP application review rollout

The review UI is served at https://admin.virujhealth.com. Point that hostname at the ERP Next.js web deployment and provision HTTPS. The host rewrite opens `/review-admin` at the hostname root. No DNS or production infrastructure is changed by this implementation.

## Deploy in this order

1. Back up the ERP auth database. Apply `scripts/access-review.sql` to that database. The central API's `ERP_AUTH_DATABASE_URL` must point to the same database used by ERP auth's `DATABASE_URL`.
2. Configure the secrets below through the hosting provider's secret manager. Keep these values out of frontend variables, source control, logs and email.
3. Configure the reverse proxy and deploy the API, auth service and web app together. Run the smoke checks below before opening registration.

ERP auth service settings:

```dotenv
ERP_REVIEW_ADMIN_ORIGIN=https://admin.virujhealth.com
ERP_REVIEW_ADMIN_ID=<private-superuser-id>
ERP_REVIEW_ADMIN_PASSWORD_HASH=<argon2id-password-hash>
ERP_REVIEW_ADMIN_SECRET=<unique-random-secret-at-least-32-characters>
ERP_WEB_URL=https://erp.virujhealth.com
CENTRAL_API_URL=https://<central-api-origin>
ERP_CLIENT_IP_HEADER=x-real-ip
RESEND_API_KEY=<mail-provider-secret>
ERP_FROM_EMAIL=Viruj Health ERP <support@virujhealth.com>
```

Use `Bun.password.hash` with Argon2id to generate the password hash from a long, unique password. Store the password in your team's password manager. This is a single configured administrator identity, separate from all ERP accounts. Changing `ERP_REVIEW_ADMIN_SECRET` invalidates all admin sessions; sessions otherwise expire after 30 minutes. Login permits five attempts per IP per 15-minute window, enforced in the database.

`CENTRAL_API_JWT_SECRET` must match between ERP auth and the API, as in the existing setup. `ERP_WEB_URL` must also be in the existing auth trusted origins (`CORS_ORIGIN`). The admin origin is added automatically to auth-service CORS, and admin routes separately require the configured admin origin (or its browser referrer). The web build may keep its existing `NEXT_PUBLIC_AUTH_URL`; `/auth/*` is also proxied when this variable is absent. Both support the admin hostname.

The proxy **must overwrite** `ERP_CLIENT_IP_HEADER` with the actual client IP and prevent direct public access to the auth server. Never forward a user-supplied IP header unchanged. Use one normalized IP, not a comma-separated chain. Production signup fails closed if this header is missing or invalid. All signup attempts, including failed attempts, count toward 20 per IP per India calendar day. Shared office/NAT IPs share this quota. Configure any CDN or extra proxy hops to preserve the actual client IP safely.

Approval emails contain a labeled “Sign in to Viruj ERP” button linking to the normal `/auth` page. The plain-text fallback contains only that short login URL. There is no token, password or active-session link in the email. Legacy magic-link URLs redirect to normal login without creating a session; new magic-link requests are disabled.

## Expected behavior

Pending applicants cannot start a new email/password session. After verifying their password, sign-in returns `ACCESS_REVIEW_PENDING` and the login page shows a review popup. Accounts with an approved workspace can still sign in; pending workspaces remain protected. Rejected applicants can sign in to correct and resubmit their saved information.

New onboarding submissions for hospital, clinic, doctor, pathology and radiology workspaces require approval once. Approval is stored against the workspace and does not expire on logout or session expiry. Returning approved users sign in with their existing email/password and go straight to their saved ERP workspace, without repeating onboarding or submitting another request. Pending and rejected accounts still cannot enter ERP operations.

Pending and rejected workspaces cannot use ERP operations, staff/invitation controls, common ERP APIs, or publish to the mobile directory. Before submission, only wizard reads/writes and tenant-scoped uploads are permitted. Submitted onboarding data is frozen until rejection and reopening. Concurrent onboarding writes and submission are serialized across API instances. Approval restores the existing workspace, with saved data and permissions.

The admin queue contains up to 50 applications per page, with pending requests first. It displays the submitted snapshot, applicant identity, all saved onboarding fields and document links. Private clinic, hospital and diagnostic certificates are streamed through authenticated admin access. Doctor licenses use a separate short-lived authorization and storage URL. Both are scoped to a document in the selected submission. Other images retain their existing storage/access behavior.

Rejection requires notes. Applicants receive these notes by email. Their next sign-in automatically reopens their saved application in onboarding so they can correct it and resubmit using the same account. Reopening does not submit a new review request. Approval emails include guidelines and a short labeled link to the ERP login page. Successful normal sign-in opens the approved workspace. Decisions use a submission revision check so two reviewers cannot accidentally decide an outdated submission. Email/synchronization failures leave the decision saved, show a retry state, and can be retried with “Send email again”. No passwords appear in emails.

Run daily database maintenance to delete expired counters:

```sql
DELETE FROM erp_request_limits WHERE window_start < now() - interval '2 days';
```

## Smoke checks in staging

- Complete each of the five provider wizards. Confirm the pending card survives refresh. After logout, a correct-password login must show the review popup and return 403 without a session cookie. Incorrect passwords must show the normal credentials error. Deep-link to patients, appointments, settings and common APIs: expect 403.
- Inspect the same submission at the admin hostname, including image certificates and a private doctor license. Ordinary ERP credentials must not open the admin queue; writes or reads from the ERP origin must be refused.
- Reject with clear notes. Verify actual mail delivery, saved-data correction and a new revision after resubmission.
- Approve. Verify actual mail delivery and the button's regular login-page destination. Sign in with email/password, then log out and sign in again. Both visits must open the same workspace without onboarding or another request. Old magic-link URLs must not create a session.
- Verify pending providers do not enter the mobile directory. After approval, existing publication settings still control public visibility.
- Verify the twenty-first signup attempt is refused across auth instances, then verify the next India calendar day starts a fresh quota.

Local unit tests and TypeScript checks do not verify production DNS/TLS, proxy headers, database migration execution, Resend delivery or S3 signing. Those need the configured staging services.
