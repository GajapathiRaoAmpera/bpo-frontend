# Testing (frontend)

## Critical flows
1. Each of the 8 personas signs in and lands on its landing page with exactly its menu.
2. Anonymous access to a protected route redirects to `/login`.
3. A route outside the role's menu shows "No access".
4. Sign out returns to `/login` and the session is gone.
(Later phases add the renewal call, approvals, and export flows.)

## Tools
- E2E: Playwright (`e2e/`), runs against the real backend (`make dev` in `bpo-backend`) and `npm run dev`.
- Static: ESLint, `tsc --noEmit`, `next build`.

## Commands
`npm run lint` · `npm run typecheck` · `npm run build` · `npm run e2e` (needs both apps running and `E2E_PASSWORD` = backend `SEED_PASSWORD`).

## Definition of Done
- [ ] lint, typecheck, build pass · [ ] e2e pass · [ ] screens checked against `screen.png` · [ ] no console errors
