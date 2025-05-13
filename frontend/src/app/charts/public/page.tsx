"use client";

import ChartGrid from "@/components/charts/ChartGrid";
import AppLayout from "@/components/layout/AppLayout";

export default function PublicChartsPage() {
  return (
    <AppLayout>
      <ChartGrid
        showPublic={true}
        title="Public Charts"
        emptyMessage="No public charts available yet"
      />
    </AppLayout>
  );
}
