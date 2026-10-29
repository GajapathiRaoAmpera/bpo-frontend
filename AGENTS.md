# AI Coding Agent Instructions (bpo-frontend)

**Project:** AssureVoice AI sandbox: Next.js UI for an Indian insurer's AI contact centre. The API, RBAC, masking, audit and voice agent live in `bpo-backend`; never put backend code here.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Source of truth (read before significant changes)
- `docs/PRD.md`: product, roles, screens, phases, definition of done
- `docs/DESIGN_SYSTEM.md` + `design/stitch/<screen>/code.html` and `screen.png`: read both files for a screen before building it
- `docs/ARCHITECTURE.md` · `docs/UX_FLOWS.md` · `docs/SECURITY.md` · `docs/CODE_STYLE.md` · `docs/TESTING.md`

If a request conflicts with these docs or the design, say so and ask; don't guess.

## Non-negotiables
- Reproduce the Stitch layout, spacing, colours and components faithfully with tokens from `globals.css`. Missing design → same visual language.
- API types only from `npm run gen:types` (`src/types/api.d.ts`). Never hand-copy types.
- The menu comes from `/api/v1/auth/me`; don't duplicate the access matrix.
- Every page: sandbox banner, persona header. Every table: skeleton + designed empty state. Confirm approve/reject/launch/delete. Toast on success.
- INR ₹1,25,000 · dates "29 Oct 2026" · IST times, via `src/lib/format.ts`.
- No lorem ipsum, no "test"/"foo", no invented telemetry.
- Work phase by phase; don't start the next phase until the user says so.

## Workflow
1. Read docs + design + existing components; list affected files.
2. Focused changes reusing existing patterns.
3. Validate: `npm run lint && npm run typecheck && npm run build`, `npm run e2e`, check the page in a browser against `screen.png`.
4. Update docs when behaviour changes. Report what changed, what was tested, what is simulated.

## Commands
`npm run dev` (port 3000; backend on 8000) · `npm run gen:types` · `npm run lint` · `npm run typecheck` · `npm run build` · `npm run e2e`
