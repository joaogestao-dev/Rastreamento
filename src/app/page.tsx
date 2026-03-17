"use client";

import { useState, useMemo } from "react";
import { MetricCards } from "@/components/metric-cards";
import { StatusBarChart, StatusPieChart } from "@/components/status-chart";
import { StatusFilter } from "@/components/status-filter";
import { usePackages } from "@/lib/data-store";
import { StatusType, ChartDataItem, EventMetric, ALL_STATUSES } from "@/lib/types";
import { statusStyles } from "@/lib/mock-data";
import {
  Truck,
  PackageCheck,
  AlertTriangle,
  PackageX,
  RotateCcw,
  ShieldCheck,
  ArrowLeftRight,
  Search,
} from "lucide-react";

const iconMap: Record<string, typeof Truck> = {
  "Em Trânsito": Truck,
  Liberado: PackageCheck,
  Taxado: AlertTriangle,
  Perdido: PackageX,
  Devolvido: RotateCcw,
  "Importação Autorizada": ShieldCheck,
  "Transferência BR-China": ArrowLeftRight,
  "Fiscalização Aduaneira": Search,
};

const metricLabelMap: Record<string, string> = {
  "Em Trânsito": "Em Trânsito",
  Liberado: "Liberados",
  Taxado: "Taxados",
  Perdido: "Perdidos",
  Devolvido: "Devolvidos",
  "Importação Autorizada": "Importação Autorizada",
  "Transferência BR-China": "Transferência BR-China",
  "Fiscalização Aduaneira": "Fiscalização Aduaneira",
};

const chartFillMap: Record<string, string> = {
  "Em Trânsito": "#3b82f6",
  "Importação Autorizada": "#0ea5e9",
  Taxado: "#f59e0b",
  Liberado: "#10b981",
  Devolvido: "#f97316",
  Perdido: "#ef4444",
  "Transferência BR-China": "#8b5cf6",
  "Fiscalização Aduaneira": "#f43f5e",
};

const chartLabelMap: Record<string, string> = {
  "Em Trânsito": "Em Trânsito",
  "Importação Autorizada": "Importação Aut.",
  Taxado: "Taxados",
  Liberado: "Liberados",
  Devolvido: "Devolvidos",
  Perdido: "Perdidos",
  "Transferência BR-China": "Transf. BR-CN",
  "Fiscalização Aduaneira": "Fiscalização",
};

export default function DashboardPage() {
  const { packages } = usePackages();
  const [statusFilter, setStatusFilter] = useState<StatusType | "all">("all");

  const filtered = useMemo(() => {
    if (statusFilter === "all") return packages;
    return packages.filter((p) => p.current_status === statusFilter);
  }, [packages, statusFilter]);

  const metrics: EventMetric[] = useMemo(() => {
    return ALL_STATUSES.map((status) => {
      const style = statusStyles[status];
      return {
        label: metricLabelMap[status] || status,
        value: filtered.filter((p) => p.current_status === status).length,
        color: style.text.replace("700", "600"),
        bgColor: style.bg,
        icon: iconMap[status] || Truck,
      };
    });
  }, [filtered]);

  const chartData: ChartDataItem[] = useMemo(() => {
    return ALL_STATUSES.map((status) => ({
      status: chartLabelMap[status] || status,
      count: filtered.filter((p) => p.current_status === status).length,
      fill: chartFillMap[status] || "#94a3b8",
    })).filter((d) => d.count > 0);
  }, [filtered]);

  const primaryMetrics = metrics.slice(0, 4);
  const secondaryMetrics = metrics.slice(4);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">Visão geral do rastreamento logístico</p>
        </div>
        <StatusFilter value={statusFilter} onChange={setStatusFilter} />
      </div>

      {/* Bento Grid: Primary KPIs */}
      <MetricCards metrics={primaryMetrics} />

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <StatusBarChart data={chartData} />
        </div>
        <div className="lg:col-span-2">
          <StatusPieChart data={chartData} />
        </div>
      </div>

      {/* Secondary KPIs */}
      <MetricCards metrics={secondaryMetrics} />
    </div>
  );
}
