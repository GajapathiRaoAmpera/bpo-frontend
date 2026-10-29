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

## Flow 3: Renewal call (Phase 2)
Divya opens Agent console → picks a due policy (renewal mode) or starts inbound → "Start call" → live transcript + AI action timeline + customer card → AI verifies, quotes figures from tools → outcome: payment link / callback / escalation → "Take over call" at any time → call ends → summary + QA score saved → appears in Call history.
Loading: connecting state on the call card. Error: microphone denied / bot unavailable message with retry.

## Later flows
Escalation claim & resolve (P3), follow-up timer (P3), campaign wizard → submit → approve → launch (P4), script edit → test call → submit → approve (P4), QA lock (P4), audit filter + export (P5). Each will be written here before it is built, with loading, empty, success and error states.
