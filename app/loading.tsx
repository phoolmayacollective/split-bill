import { LoadingState } from "@/components/feedback/loading-state";
import { PageShell } from "@/components/layout/page-shell";

export default function Loading() {
  return (
    <PageShell centered>
      <LoadingState message="Loading…" />
    </PageShell>
  );
}
