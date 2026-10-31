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
import { IS_SANDBOX } from "@/lib/personas";

import styles from "./integrations-list.module.scss";

function IntegrationCard({ item }: { item: Schemas["IntegrationOut"] }) {
  const connected = item.status === "connected";
  return (
    <li className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.titleBlock}>
          <span className={styles.category}>{item.category}</span>
          <h3 className={styles.name}>{item.name}</h3>
        </div>
        {connected ? <Pill tone="success" pulse>Connected</Pill> : <Pill tone="warning">Pilot integration</Pill>}
      </div>
      <p className={styles.description}>{item.description}</p>
      <p className={styles.status}>
        {connected && item.last_sync_at ? `Last used ${formatDateTime(item.last_sync_at)}` : IS_SANDBOX ? "Not connected in the sandbox" : "Not connected"}
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
    { title: "Connected", note: IS_SANDBOX ? "Live in this sandbox." : "Live.", items: data?.filter((i) => i.status === "connected") ?? [] },
    { title: "Pilot integrations", note: IS_SANDBOX ? "Production connections shown for the roadmap; the sandbox simulates them locally." : "Shown for the roadmap; nothing is sent to these systems yet.", items: data?.filter((i) => i.status === "pilot") ?? [] },
  ];

  return (
    <div className={styles.page}>
      <PageHeader title="Integrations" description={IS_SANDBOX ? "Systems AssureVoice connects to. Only the AI voice stack is live in the sandbox; the rest are pilot integrations with nothing sent to real systems." : "Systems AssureVoice connects to. Only the AI voice stack is live; the rest are pilot integrations with nothing sent to real systems."} />
      {isLoading && <div className={styles.loadingGrid}>{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className={styles.loadingCard} />)}</div>}
      {error && (
        <div role="alert" className={styles.error}>
          {error.message}
          <Button size="sm" variant="outline" onClick={() => refetch()}>Try again</Button>
        </div>
      )}
      {data?.length === 0 && <EmptyState icon={Plug} title="No integrations configured" description={IS_SANDBOX ? "Run make reset in bpo-backend to restore the sandbox integrations." : "Run python -m app.bootstrap in bpo-backend to create the integration rows."} />}
      {groups.filter((g) => g.items.length > 0).map((g) => (
        <section key={g.title} aria-label={g.title} className={styles.group}>
          <div className={styles.groupHeader}>
            <h2 className={styles.groupTitle}>{g.title}</h2>
            <span className={styles.groupNote}>{g.note}</span>
          </div>
          <ul className={styles.grid}>
            {g.items.map((i) => <IntegrationCard key={i.key} item={i} />)}
          </ul>
        </section>
      ))}
    </div>
  );
}
