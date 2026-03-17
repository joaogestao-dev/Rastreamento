"use client";

import { Header } from "@/components/header";
import { MetricCards } from "@/components/metric-cards";
import { StatusChart } from "@/components/status-chart";
import { TrackingTable } from "@/components/tracking-table";
import { eventMetrics, chartData, mockPackages } from "@/lib/mock-data";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto max-w-7xl space-y-6 px-6 py-8">
        {/* KPI Metric Cards */}
        <section>
          <MetricCards metrics={eventMetrics} />
        </section>

        {/* Status Distribution Chart */}
        <section>
          <StatusChart data={chartData} />
        </section>

        {/* Tracking Table */}
        <section>
          <TrackingTable packages={mockPackages} />
        </section>
      </main>
    </div>
  );
}
