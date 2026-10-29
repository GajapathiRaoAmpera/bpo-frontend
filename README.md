 # AssureVoice AI · Frontend

Next.js UI for the AssureVoice AI sandbox: an AI contact centre for insurance renewals, premium reminders and policy service. All data is synthetic.
The API, RBAC, masking, audit log and voice agent live in the separate **bpo-backend** repo.

## Requirements
Node 24+, npm 11+. The backend running on `http://localhost:8000` (`make dev` in bpo-backend).

## Setup
```bash
npm install
cp .env.example .env.local        # BACKEND_URL defaults to http://localhost:8000
npm run gen:types                 # regenerate API types from BACKEND_URL/openapi.json
npm run dev                       # http://localhost:3000
```

## Commands
| Command | What it does |
|---|---|
| `npm run dev` | Dev server on port 3000 (`/api/*` is rewritten to `BACKEND_URL`) |
| `npm run gen:types` | Generate `src/types/api.d.ts` from the backend OpenAPI schema; never edit that file by hand |
| `npm run lint` · `npm run typecheck` · `npm run build` | Static checks and production build |
| `npm run e2e` | Playwright tests; needs both apps running and `E2E_PASSWORD` set to the backend `SEED_PASSWORD` |

Docker: `docker build --build-arg BACKEND_URL=http://<backend-host>:8000 -t assurevoice-frontend .` then `docker run -p 3000:3000 assurevoice-frontend`.

## Persona logins
Password for every persona = `SEED_PASSWORD` in bpo-backend `.env`. The sign-in page also lists the personas; clicking one fills the email.

| Persona | Role | Email | Lands on |
|---|---|---|---|
| Ravi Shankar | Super Admin | ravi.shankar@sandbox.assurevoice.in | Executive Dashboard |
| Anitha Raman | Operations Manager | anitha.raman@sandbox.assurevoice.in | Executive Dashboard |
| Karthik Subramanian | Team Lead | karthik.subramanian@sandbox.assurevoice.in | Live Monitor |
| Divya Krishnan | Human Agent | divya.krishnan@sandbox.assurevoice.in | Agent Console |
| Suresh Babu | Campaign Manager | suresh.babu@sandbox.assurevoice.in | Campaigns |
| Meera Iyer | Bot Designer | meera.iyer@sandbox.assurevoice.in | Bot Studio |
| Prakash Natarajan | QA Analyst | prakash.natarajan@sandbox.assurevoice.in | QA Review |
| Lakshmi Venkatesh | Compliance Officer | lakshmi.venkatesh@sandbox.assurevoice.in | Approvals |

## Walkthrough order (grows each phase)
1. **Phase 1:** sign in as each persona; each sees its own menu and landing page. Open a URL outside the role (e.g. `/audit` as Meera) to see "No access". Sign out from the header menu.
2. **Phase 2:** sign in as **Divya Krishnan** → Agent Console → pick the top policy → **Start renewal call** and allow the microphone. You play the customer: confirm your name, give the policy number and date of birth shown in the customer card, then ask for the payment link (or a callback tomorrow at 6 pm, or say you want to speak to a person). Watch the AI actions timeline, try **Take over call**, then **End call** to see the summary and QA score. Use headphones so the bot doesn't hear itself.

## Project docs
`AGENTS.md` (agent rules) · `docs/PRD.md` · `docs/DESIGN_SYSTEM.md` · `docs/ARCHITECTURE.md` · `docs/UX_FLOWS.md` · `docs/SECURITY.md` · `docs/CODE_STYLE.md` · `docs/TESTING.md` · designs in `design/stitch/`.
