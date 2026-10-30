"use client";

import { useQuery } from "@tanstack/react-query";
import { Plug } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Pill } from "@/components/common/pill";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api, type Schemas, unwrap } from "@/lib/api";
import { formatDateTime } from "@/lib/format";

function IntegrationCard({ item }: { item: Schemas["IntegrationOut"] }) {
  const connected = item.status === "connected";
  return (
    <li className="flex flex-col gap-space-md rounded-lg border border-divider bg-surface-container-lowest p-space-lg shadow-card">
      <div className="flex items-start justify-between gap-space-sm">
        <div className="flex flex-col gap-0.5">
          <span className="text-label-xs tracking-wider text-on-surface-variant uppercase">{item.category}</span>
          <h3 className="text-headline-sm text-on-surface">{item.name}</h3>
        </div>
        {connected ? <Pill tone="success" pulse>Connected</Pill> : <Pill tone="warning">Pilot integration</Pill>}
      </div>
      <p className="flex-1 text-body-sm text-on-surface-variant">{item.description}</p>
      <p className="border-t border-divider pt-space-sm text-label-sm text-outline">
        {connected && item.last_sync_at ? `Last used ${formatDateTime(item.last_sync_at)}` : "Not connected in the sandbox"}
      </p>
    </li>
  );
}

export function IntegrationsList() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["integrations"],
    queryFn: () => unwrap(api.GET("/api/v1/integrations")),
  });
  const groups = [
    { title: "Connected", note: "Live in this sandbox.", items: data?.filter((i) => i.status === "connected") ?? [] },
    { title: "Pilot integrations", note: "Production connections shown for the roadmap; the sandbox simulates them locally.", items: data?.filter((i) => i.status === "pilot") ?? [] },
  ];

  return (
    <div className="flex flex-col gap-space-xl">
      <PageHeader title="Integrations" description="Systems AssureVoice connects to. Only the AI voice stack is live in the sandbox; the rest are pilot integrations with nothing sent to real systems." />
      {isLoading && <div className="grid grid-cols-3 gap-space-lg">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-44 rounded-lg bg-surface-container-lowest" />)}</div>}
      {error && (
        <div role="alert" className="flex flex-col items-start gap-space-sm rounded-lg border border-danger-border bg-danger-bg p-space-md text-body-sm text-danger-text">
          {error.message}
          <Button size="sm" variant="outline" onClick={() => refetch()}>Try again</Button>
        </div>
      )}
      {data?.length === 0 && <EmptyState icon={Plug} title="No integrations configured" description="Run make reset in bpo-backend to restore the sandbox integrations." />}
      {groups.filter((g) => g.items.length > 0).map((g) => (
        <section key={g.title} aria-label={g.title} className="flex flex-col gap-space-md">
          <div className="flex items-baseline gap-space-sm">
            <h2 className="text-headline-md text-on-surface">{g.title}</h2>
            <span className="text-body-sm text-on-surface-variant">{g.note}</span>
          </div>
          <ul className="grid grid-cols-1 gap-space-lg md:grid-cols-2 xl:grid-cols-3">
            {g.items.map((i) => <IntegrationCard key={i.key} item={i} />)}
          </ul>
        </section>
      ))}
    </div>
  );
}
