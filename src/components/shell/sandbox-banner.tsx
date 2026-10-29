// Stitch: fixed amber strip above the header on every page.
export function SandboxBanner() {
  return (
    <div role="note" className="fixed inset-x-0 top-0 z-50 border-b border-amber-200 bg-amber-50">
      <div className="flex h-7 items-center justify-center gap-space-sm px-gutter text-label-xs text-amber-900">
        <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-amber-500" />
        <span>Sandbox environment · synthetic data</span>
      </div>
    </div>
  );
}
