# Cache phase 1

Scope: shared ERP cache policy and the staff list only. Mobile, token code and polling intervals are unchanged. Existing keys on other screens are not migrated.

- Default query freshness: 60 seconds. Scoped `departments` and `directory-catalogues` resources, plus the existing doctor department lookup, stay fresh for five minutes. Explicit query options still take precedence.
- Staff members, invitations and recent audit use `[userId, orgId, resource, ...params]`. Reads wait for both IDs.
- The existing provider clears the cache on login, logout and workspace changes. Query cancellation discards late results; new identities use different keys.
- Settled staff writes (success or failure) invalidate members, invitations and recent audit only for the identity captured when the mutation started.
- Freshness is not a timer: this phase does not introduce live updates.

## Compare requests in Chrome DevTools

Use a synthetic test account with staff permissions. Open Network, select Fetch/XHR, and filter with:

```text
/\/erp\/(staff\/(members|invitations)|audit\/recent)/
```

1. Clear the Network log and open Staff. A cold visit should make three data GETs: members, invitations and recent audit. Token/session requests are excluded by the filter.
2. Clear the log, navigate to another ERP page, then return within 60 seconds without reloading the browser. Expect zero additional staff GETs.
3. Return after 60 seconds. Expect three GETs when Staff mounts again.
4. Invite, change role, remove a test member, or cancel an invitation. After a successful write, the three related reads should refresh. No appointment or directory query is invalidated by that write.
5. Log out and log in as another user, then switch workspaces. Staff should load the new scope's data and never display the previous scope's cached members.

For the before comparison, repeat step 2 on the previous revision. Its default freshness was zero, so mounting Staff again normally issued those three reads. These are expected counts, not a measurement against a live account. Do not use a hard browser reload for the navigation comparison: it clears the memory cache.

## Phase 2 plan (not implemented)

Use separate public-directory and private-tenant event channels. Keep private channels authenticated and tenant-scoped. Events contain resource names only. Batch and deduplicate change events on the server before delivery, then refetch only the affected active queries. Recover missed events after reconnect/resume; keep native connections closed in the background. Do not remove existing polling until the corresponding live updates have been implemented and verified.
