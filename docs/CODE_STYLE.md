# Code Style (frontend)

- TypeScript strict; no `any`. Components `PascalCase` in `kebab-case.tsx` files; hooks `useX` in `use-x.ts`.
- Every route page wraps its content in `<ScreenGuard screen="…">`.
- Server components by default; `"use client"` only where state, effects or browser APIs are needed.
- Style with token classes from `globals.css` (`bg-surface-container-lowest`, `text-label-xs`…), not raw hex.
- Reuse `components/ui` (shadcn) and `components/common`; add a new shadcn primitive with `npx shadcn@4.23.0 add <name>` rather than hand-rolling.
- Data: TanStack Query + `lib/api.ts` (openapi-fetch). Forms: React Hook Form + Zod. Tables: TanStack Table. Charts: Recharts.
- Copy: verb-first buttons ("Sign in", "Approve script"), no "OK/Submit", errors never blame the user.
- Comments explain why; known limits use `// shortcut: <limit>, <when to upgrade>`.
- Tooling: ESLint (`npm run lint`), `tsc` (`npm run typecheck`), `next build`. Exact versions in `package.json`.
- Don't: hand-edit `src/types/api.d.ts`, duplicate the access matrix, add a dependency for a few lines.
- Import `cn` from `@/lib/utils` (configured with our tokens), never from `"cn"` directly. After `shadcn add`, fix the generated import. New type/spacing/shadow tokens in `globals.css` must also be registered in `lib/utils.ts`.
