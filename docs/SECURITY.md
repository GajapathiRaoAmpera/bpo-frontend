# Security (frontend)

Authoritative rules live in `bpo-backend/docs/SECURITY.md`. Frontend responsibilities:

- Never store tokens in JS-readable storage. The session is the backend's httpOnly cookie, sent via the same-origin `/api` rewrite.
- `proxy.ts` gates routes for UX only; it never trusts the JWT for data. All authorisation is server-side.
- Never unmask data in the UI; render what the API returns.
- Environment: `NEXT_PUBLIC_APP_NAME` (public), `BACKEND_URL` (server-only, used by rewrites and `gen:types`). No secrets in `NEXT_PUBLIC_*`.
- Don't log personal data to the console. Error messages never echo raw server internals.
- Confirmation dialogs for approve, reject, launch and delete.
