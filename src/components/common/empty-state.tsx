import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-space-md rounded-lg bg-surface-container-lowest px-space-xl py-16 text-center shadow-card">
      <span className="flex size-12 items-center justify-center rounded-full bg-surface-container-low text-primary-container">
        <Icon aria-hidden className="size-6" />
      </span>
      <div className="flex max-w-md flex-col gap-1">
        <h2 className="text-headline-sm text-on-surface">{title}</h2>
        <p className="text-body-sm text-on-surface-variant">{description}</p>
      </div>
      {action}
    </div>
  );
}
