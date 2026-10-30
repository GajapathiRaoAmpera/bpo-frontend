# UX Flows

## Flow 1: Sign in (Phase 1)
1. User opens any URL without a session → redirected to `/login?next=<url>`.
2. Enters work email + password (or picks a sandbox persona, which fills the email).
3. Client validation (Zod): valid email, password required. Errors appear on blur and clear as the user types.
4. "Sign in" → button shows "Signing in…" and is disabled.
5. **Success:** cookie set by API → redirect to `next` (if that screen is in the role's menu) else the role landing page.
6. **Failure:** inline alert "Email or password is incorrect" (401) or "Can't reach the AssureVoice service. Try again in a moment." (network/5xx). Fields keep their values.

## Flow 2: Navigate (Phase 1)
- Sidebar shows only screens in the role's menu; the current one is highlighted.
- Typing a URL for a screen outside the menu shows "No access" with a button back to the landing page.
- Header menu → "Sign out" → API logout (audited) → `/login`.

## Flow 3: Renewal call (Phase 2, built)
1. Divya opens Agent Console. Left: renewal queue (due soonest, skeletons while loading, empty state). Centre: "No call in progress". Right: customer card + AI actions.
2. She selects a policy (customer card previews it) → **Start renewal call** (or **Take inbound call**).
3. Browser asks for the microphone; status pill "Connecting" → "AI on call". Sandbox note: she speaks as the customer.
4. Transcript fills turn by turn (committed turns from the API every 1.5 s) with live captions of what the bot/customer is saying; tool calls appear inline and in the AI actions timeline; the customer card flips to **Verified**.
5. Outcomes: payment link sent / callback scheduled / escalation. If the AI escalates, a red banner offers **Take over now**.
6. **Take over call** (any time): AI leaves, status "You are on the call", wrap-up form: outcome (radio) + note → **End call**.
7. **End call** → summary card shows "Analysing" → outcome, sentiment, summary, next action and 5-point QA score (or "QA not scored automatically" if Gemini is unavailable). **Start next call** resets.
Errors: microphone blocked → explicit message; bot unreachable → error, call released so the next one can start; toasts on takeover and end.

## Later flows
Escalation claim & resolve (P3, built above), follow-up timer (P3, built above), campaign wizard → submit → approve → launch (P4), script edit → test call → submit → approve (P4), QA lock (P4), audit filter + export (P5, built below). Each will be written here before it is built, with loading, empty, success and error states.

## Flow 3b: Dashboard, calls, customers, escalations, follow-ups (Phase 3, built)
- **Dashboard** (SA, OM full; TL, CM, QA, CO view): 5 KPI cards + call volume, outcomes, collections, sentiment charts for the last 30 days; skeletons while loading, error + **Try again**.
- **Call History**: search (ref, name, policy) + outcome filter, 25 per page, row → `/calls/[id]` (summary, transcript, QA, policy, escalations, follow-ups). Human agents see only their own calls; others' IDs show "Call not found".
- **Customers**: search (masked roles can't search by mobile; banner says so) → Customer 360 (`/customers/[id]`): profile (masked where required), policy cards with **Schedule follow-up** (follow-up writers only), recent calls, follow-ups.
- **Escalation Queue**: queue cards ordered by priority then wait; select → caller card, hand-off reason, AI context brief, links to the call and Customer 360. TL/HA: **Claim escalation** → note (validated on blur) → **Resolve escalation**, toasts; claimed by someone else → read-only line (TL can still resolve). OM sees it view-only. Tabs: open & assigned / recently resolved.
- **Follow-ups**: status tabs (default Scheduled), table refreshes every 30 s. Writers: **Schedule follow-up** dialog (policy no., type, due in IST, reason; validated on blur), **Mark done**, **Cancel** (confirmation naming the customer). The 2-minute sandbox timer moves due items to *Sent (sandbox)* with the WhatsApp text.
- Header search: decided as customers only (PRD §12); the Customers page search is that scope.

## Flow 4: Live monitor, audit, admin (Phase 5, built)
- **Live monitor** (TL full, OM view): polls `/live/calls` every 5 s; KPI counts and one card per call in progress (customer, phone as the API returns it, call ref, agent, verification, AI/human status, latest line). TL: **Open call** shows the live transcript and takeover status (takeover itself stays with the call's agent). Empty: "No calls in progress" (+ link to Agent Console for TL).
- **Audit log** (SA, CO): filters (actor, action, entity, IST date range) → **Apply filters**; 25 per page; click a row for the full entry. **Export CSV** downloads the filtered log, toasts, and the new export entry appears.
- **Users & roles** (SA): table with **Add user** / **Edit** dialog (validated on blur) and **Deactivate** (confirmation naming the person; disabled for yourself) / **Reactivate**; toasts on success. Permission matrix read from `/rbac/matrix`.
- **Integrations** (SA): connected cards vs "Pilot integration" cards.
