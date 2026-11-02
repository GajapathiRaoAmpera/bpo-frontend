# Design System

**Visual source of truth:** `design/stitch/<screen>/code.html` + `screen.png`, and `design/stitch/amperabpo_precision_enterprise/DESIGN.md`. Before building a screen, read both files for it. Tokens are implemented once in `src/styles/_tokens.scss` (colours, radius, shadows as CSS variables) and `src/styles/_mixins.scss` (type scale, spacing); never hard-code a colour that has a token.

## 1. Direction
Corporate / modern, high information density, strict hierarchy, crisp borders over shadows, no decoration. Mood: institutional trust + live operational awareness.

## 2. Brand
Ampera BPO · "Enterprise AI Ops". Voice: plain, precise, verb-first buttons. No lorem ipsum, no "test"/"foo", no invented telemetry or vendor names.

## 3. Colour (Stitch roles → CSS variables, e.g. `var(--color-primary)`, `var(--color-on-surface-variant)`)
| Role | Hex | Use |
|---|---|---|
| primary | #00377d | primary buttons, links, key numbers |
| primary-container | #1f4e9c | active nav item, primary hover |
| secondary | #006a69 | AI / live indicators, positive deltas |
| secondary-container | #7df5f4 | live pills (at /40–/50) |
| surface / background | #f8f9ff | page canvas |
| surface-container-lowest | #ffffff | cards, header, sidebar |
| surface-container-low | #eff4ff | inputs in chrome, sub-panels |
| surface-container-high / highest | #dce9ff / #d3e4fe | hovers, secondary buttons, progress tracks |
| on-surface / on-surface-variant | #0b1c30 / #434751 | text / muted text |
| outline / outline-variant | #737782 / #c3c6d3 | icons, group labels / hairlines |
| divider | #e2e8f0 | card + table borders |
| error / error-container | #ba1a1a / #ffdad6 | errors, urgent badges |
Status pills (DESIGN.md): success `success-bg/-border/-text`, warning `warning-*`, danger `danger-*`, neutral `neutral-*`, language `lang-*`. Sandbox banner: `amber-50` / `amber-200` / `amber-900` + pulsing `amber-500` dot.

## 4. Typography (Inter, tabular figures on)
Mixin `@include text(<name>)`: `display` 28/34 700 · `headline-lg` 22/28 600 · `headline-md` 18/24 600 · `headline-sm` 16/22 600 · `body-lg` 15/22 · `body-md` 14/20 · `body-sm` 13/18 · `data-mono` 13/18 500 · `label-md` 13/18 600 · `label-sm` 12/16 500 · `label-xs` 11/14 600 (uppercase + `letter-spacing: 0.05em` for table headers and KPI labels).

## 5. Spacing
4px base. Named: `space-xs` 4 · `space-sm` 8 · `space-md` 12 · `space-lg` 16 · `space-xl` 24 · `gutter` 16 · `gutter-desktop` 24.

## 6. Radius / 7. Shadows
`rounded-lg` 8px for cards, inputs, buttons, modals · `rounded-sm` 4px chips · `rounded-full` pills. Shadows: `shadow-card` (cards), `shadow-chrome` (header/sidebar), `shadow-popover`, `shadow-modal`.

## 8. Buttons (`components/ui/button.tsx`)
`default` primary · `outline` white + divider border, primary text · `secondary` surface-container-highest · `ai` teal tint (AI actions) · `destructive` solid red · `ghost` · `link`. Sizes: default 36px, `lg` 40px. Focus: 2px teal outline, 2px offset. Loading: disable + spinner + verb ("Signing in…").

## 9. Inputs
40px, white, `divider` border, 8px radius; focus border `primary-container` + 3px ring at 12%; error border `danger` + message below; placeholder `#94a3b8` for format hints only; always a visible label.

## 10. Cards
`bg-surface-container-lowest rounded-lg shadow-card` (Stitch cards); header divided by a `divider` line when it hosts multiple sections. Padding `p-space-lg` (16) or `p-space-md` (12) for KPI cards.

## 11. Navigation (app shell)
- Banner 28px fixed top → header 64px fixed (`top-7`, white/90 + blur, `shadow-chrome`) → sidebar 240px fixed from `top-[5.75rem]` → content `pl-60 pt-[5.75rem] px-gutter-desktop`.
- Header: logo + "Ampera BPO / Enterprise AI Ops" (240px) · right: initials avatar, persona name, "job title · role", menu with Sign out.
- Sidebar: uppercase `label-xs` group labels; items `body-sm` with 18px icon; active `bg-primary-container text-on-primary font-label-md rounded-lg`; admin items in the bottom group (as the design's "Compliance Audit Log / Settings").
- Menu items come from `/auth/me`; only allowed screens are shown.

## 12. Page pattern
Page header card (title `headline-lg`, optional live pill, `body-sm` description, actions right) → KPI row (5 cards: `label-xs` label + icon chip, `display` value, 6px progress bar, footnote) → 8/4 or 7/5 grid of cards. Tables: header 36px `bg-table-head` `label-xs` uppercase; rows 48px, `divider` separators, hover `bg-table-head`; numbers right-aligned.

## 13. States
Loading: skeletons for anything >1s (tables always), no spinner flash <100ms. Empty: icon in a tinted circle, one-line reason, one action. Error: plain sentence + retry; never blame the user. Success: toast (sonner). Approve / reject / launch / delete: confirmation dialog naming the object.

## 14. Icons
lucide-react (approved substitute for Stitch's Material Symbols), outline, 16–18px in nav and buttons, 20px in header actions. Use the closest equivalent to the Material icon in the design.

## 15. Responsive
Target 1440px and 1920px. Below 1280px not designed (non-goal).

## 16. Accessibility
Semantic HTML, labelled inputs, visible focus, keyboard reachable menus/dialogs (Radix), status never by colour alone (text in every pill), `prefers-reduced-motion` respected.

## Screen → route → design
| Route | Design folder |
|---|---|
| `/login` | none (same language) |
| `/dashboard` | analytics_compliance_audit_suite |
| `/agent-console` | none (escalations + call inspector parts) |
| `/escalations` | escalations_human_handoff_queue |
| `/live-monitor` | live_operations_floor_cockpit |
| `/calls`, `/calls/[id]` | none (table) / call_inspector_audio_qa_analyzer |
| `/customers`, `/customers/[id]` | none (table / escalation caller card + history) |
| `/campaigns`, `/campaigns/new` | outbound_campaigns_dialler_engine |
| `/follow-ups` | none (table) |
| `/bot-studio` | voice_agent_studio_acoustic_engine |
| `/approvals` | none (diff + call-inspector checklist cards) |
| `/qa` | none (queue) → `/calls/[id]` QA card |
| `/audit` | compliance_audit_log_evidentiary_dossier |
| `/admin/users`, `/admin/integrations` | enterprise_settings_regulatory_governance (+ sip_telephony card style) |

**Deliberate differences from the mockups:** banner text is exactly "Sandbox environment · synthetic data" (no regulator ID); header shows the real persona; the designs' invented vendor names, SIP figures and "cryptographic ledger" are replaced by real stack names or labelled as simulated.
