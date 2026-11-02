"use client";

import { Plug } from "lucide-react";

import { IntegrationGroup } from "@/components/admin/integrations/integration-group";
import { useIntegrations } from "@/components/admin/integrations/use-integrations";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorAlert } from "@/components/common/error-alert";
import { PageHeader } from "@/components/common/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { IS_SANDBOX } from "@/lib/personas";

import styles from "./integrations-page.module.scss";

export function IntegrationsPage() {
  const { data, isLoading, error, refetch } = useIntegrations();
  const groups = [
    { title: "Connected", note: IS_SANDBOX ? "Live in this sandbox." : "Live.", items: data?.filter((i) => i.status === "connected") ?? [] },
    { title: "Pilot integrations", note: IS_SANDBOX ? "Production connections shown for the roadmap; the sandbox simulates them locally." : "Shown for the roadmap; nothing is sent to these systems yet.", items: data?.filter((i) => i.status === "pilot") ?? [] },
  ];

  return (
    <div className={styles.page}>
      <PageHeader title="Integrations" description={IS_SANDBOX ? "Systems Ampera BPO connects to. Only the AI voice stack is live in the sandbox; the rest are pilot integrations with nothing sent to real systems." : "Systems Ampera BPO connects to. Only the AI voice stack is live; the rest are pilot integrations with nothing sent to real systems."} />
      {isLoading && <div className={styles.loadingGrid}>{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className={styles.loadingCard} />)}</div>}
      {error && <ErrorAlert layout="stacked" onRetry={() => refetch()}>{error.message}</ErrorAlert>}
      {data?.length === 0 && <EmptyState icon={Plug} title="No integrations configured" description={IS_SANDBOX ? "Run make reset in bpo-backend to restore the sandbox integrations." : "Run python -m app.bootstrap in bpo-backend to create the integration rows."} />}
      {groups.filter((g) => g.items.length > 0).map((g) => <IntegrationGroup key={g.title} {...g} />)}
    </div>
  );
}
