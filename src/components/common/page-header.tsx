// Stitch page header card: title (+ optional pill), description, actions on the right.
export function PageHeader({
  title,
  description,
  badge,
  actions,
}: {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between gap-space-md rounded-lg bg-surface-container-lowest p-space-lg shadow-card lg:flex-row lg:items-center">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-space-sm">
          <h1 className="text-headline-lg text-on-surface">{title}</h1>
          {badge}
        </div>
        {description && <p className="max-w-3xl text-body-sm text-on-surface-variant">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-space-sm">{actions}</div>}
    </div>
  );
}
