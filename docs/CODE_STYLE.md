# Code Style (frontend)

- TypeScript strict; no `any`. Components `PascalCase` in `kebab-case.tsx` files; hooks `useX` in `use-x.ts`.
- Every route page wraps its content in `<ScreenGuard screen="…">`.
- Server components by default; `"use client"` only where state, effects or browser APIs are needed.
- Styling: one co-located SCSS module per component (`foo.tsx` → `foo.module.scss`, imported last as `styles`). Start each module with `@use "styles/mixins" as *;`. Use token variables (`var(--color-surface-container-lowest)`), `@include text(label-xs)`, `space(n)` / `$space-md`, `@include up(lg)`, never raw hex. Semantic class names (`.kpiGrid`), not utility names. No Tailwind.
- Reuse `components/ui` (Radix primitives) and `components/common` rather than hand-rolling.
- Data: TanStack Query + `lib/api.ts` (openapi-fetch). Forms: React Hook Form + Zod. Tables: TanStack Table. Charts: Recharts.
- Copy: verb-first buttons ("Sign in", "Approve script"), no "OK/Submit", errors never blame the user.
- Comments explain why; known limits use `// shortcut: <limit>, <when to upgrade>`.
- Tooling: ESLint (`npm run lint`), `tsc` (`npm run typecheck`), `next build`. Exact versions in `package.json`.
- Don't: hand-edit `src/types/api.d.ts`, duplicate the access matrix, add a dependency for a few lines.
- Combine classes with `cn` from `@/lib/utils` (joins truthy class names). Parent overrides: pass `className={styles.x}`; no `!important`.
