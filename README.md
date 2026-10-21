# College Place Audio

A minimal website for College Place Audio.

Built as a static HTML/CSS/JavaScript site with slide-in About, Work, and Contact panels.

## Automatic deployment

The site can deploy to cPanel automatically through GitHub Actions whenever `main` is pushed.

Add these GitHub repository secrets before enabling the workflow:

- `CPANEL_SSH_HOST` — the cPanel server/host, for example `6155903.refreshmobile.ca`
- `CPANEL_SSH_USERNAME` — the cPanel username, for example `collegeplace`
- `CPANEL_SSH_PASSWORD` — the cPanel account password
- `CPANEL_SSH_PORT` — the SSH/SFTP port, usually `22`
- `CPANEL_SSH_REMOTE_DIR` — the live site folder, usually `public_html`

The workflow uploads the static site files and assets only. It does not delete remote files.

## Local checks

Run `./scripts/check-site.sh` before pushing to confirm the core static files and deployment settings are present.

## Approved artist CRM transfer

Approved artist cards expose **Add to CRM** under Outreach & CRM. Discovery data and votes use the separate shared portal database after each browser completes its backed-up migration. Original browser storage is retained. The button opens an authenticated Avlen window; the user confirms the transfer there in the College Place Audio workspace. The window exchanges data only with the originating portal window using an origin/source/nonce-checked handshake; no contact data or credentials appear in the URL.

The CRM checks both Leads and Contacts, fills only blank fields, and retains a durable source link for retries. Exact email matches can link automatically; name-only or multiple matches require choosing an existing record. Unmatched artists become Leads. Existing notes are preserved; research text fills Notes only when blank. Only a successful CRM response sets the portal CRM link. Existing manual In CRM flags are retained.

Release the CRM endpoint, popup handler and migration `082_crm_external_record_links.sql` before publishing this portal change. This feature has local/provider tests but still needs an authenticated deployed end-to-end smoke check. Run `node --test scripts/test-crm-handoff.cjs` and `./scripts/check-site.sh`.

## Shared portal saving

The portal uses existing Avlen login, restricted to active CPA workspace members. Its data lives in the separate Neon Free project `cpa-portal` in organization `College Place Audio Portal`, not the CRM database. Avlen supplies the authenticated backend; its normal hosting usage still applies. No paid Neon plan or additional optional services were enabled. Compute is fixed at 0.25 CU and sleeps after five minutes of inactivity.

- Opening the portal prompts Avlen sign-in and loads the latest shared information. There is no polling.
- Edits are written locally immediately and sent after a 300ms typing pause. A visible status distinguishes pending/failed saves from confirmed shared saves. Refresh flushes pending edits before loading current shared data.
- A first-time browser migration preserves `college-place-audio-portal` untouched, stores a server-side original snapshot, and merges field-level changes against shipped defaults. Conflicting values are retained for review, not silently overwritten. Default seed UUID differences are normalized by artist name/source URL.
- Pending changes survive reloads. Refresh does not overwrite edits typed while its request was in flight. Only one shared portal tab can edit per browser origin, using Web Locks.
- Each teammate must open the portal in every browser/profile they used previously. Browser-only edits cannot be recovered remotely before that happens. Do not clear site data until each browser has migrated and its conflicts have been reviewed. Export backup is available before and after sign-in.
- Existing local uploaded documents are included in backups. Large migrations fail safely with original data intact; music should remain in DISCO and new large files should be linked rather than embedded.
- Backend source/schema lives in Corvo's `backend/server/cpa_portal/`; `CPA_PORTAL_DATABASE_URL` is server-only. The database secret and Avlen session cookies never enter portal URLs or static assets. Short-lived portal capabilities are bound to the originating browser window and rechecked against active Avlen membership/session on requests.

Verification: `node --test scripts/test-portal-sync.cjs scripts/test-crm-handoff.cjs`, `./scripts/check-site.sh`, and Corvo `tests/test_cpa_portal_store.py`. Release backend before static site.

Add artist always returns to the first (Pending) discovery view, clears search,
expands the new card and focuses its name by record ID. It never focuses the
first existing artist from the previous view. Regression checks:
`node --test scripts/test-add-artist.cjs`.
