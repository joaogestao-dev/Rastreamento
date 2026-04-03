"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { StatusBarChart, StatusPieChart } from "@/components/status-chart";
import { usePackages } from "@/lib/data-store";
import { ChartDataItem } from "@/lib/types";
import { getStatusStyle, getStatusIcon, getChartColor } from "@/lib/mock-data";
import { STATUS_GROUPS, getStatusTier, PriorityTier } from "@/lib/csv-service";
import { CsvActions } from "@/components/csv-actions";
import { EmptyState } from "@/components/empty-state";
import {
  Package,
  CheckCircle2,
  Truck,
  AlertTriangle,
  ChevronDown,
  ExternalLink,
} from "lucide-react";

const TIER_CONFIG: Record<PriorityTier, { label: string; borderColor: string; textColor: string }> = {
  danger:  { label: "Problemas",      borderColor: "border-l-red-500",     textColor: "text-red-400" },
  warning: { label: "Atenção",        borderColor: "border-l-amber-500",   textColor: "text-amber-400" },
  info:    { label: "Em Andamento",   borderColor: "border-l-blue-500",    textColor: "text-blue-400" },
  success: { label: "Concluídos",     borderColor: "border-l-emerald-500", textColor: "text-emerald-400" },
  neutral: { label: "Outros",         borderColor: "border-l-slate-500",   textColor: "text-slate-400" },
};

const KPI_ICONS = [Package, CheckCircle2, Truck, AlertTriangle];

function diasDesde(dateStr: string): number {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  } catch { return 0; }
}

export default function DashboardPage() {
  const { packages, isLoading } = usePackages();
  const [openTier, setOpenTier] = useState<PriorityTier | null>(null);
  const router = useRouter();

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    packages.forEach((p) => {
      counts[p.current_status] = (counts[p.current_status] || 0) + 1;
    });
    return counts;
  }, [packages]);

  // Data mais antiga por status (para indicar urgência)
  const statusOldestDate = useMemo(() => {
    const oldest: Record<string, string> = {};
    packages.forEach((p) => {
      if (!oldest[p.current_status] || p.last_update < oldest[p.current_status]) {
        oldest[p.current_status] = p.last_update;
      }
    });
    return oldest;
  }, [packages]);

  const tierData = useMemo(() => {
    const tiers: Record<PriorityTier, { status: string; count: number }[]> = {
      success: [], info: [], warning: [], danger: [], neutral: [],
    };
    Object.entries(statusCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([status, count]) => {
        const tier = getStatusTier(status);
        tiers[tier].push({ status, count });
      });
    return tiers;
  }, [statusCounts]);

  const kpis = useMemo(() => {
    const total = packages.length;
    const success = tierData.success.reduce((s, t) => s + t.count, 0);
    const inProgress = tierData.info.reduce((s, t) => s + t.count, 0);
    const problems = tierData.danger.reduce((s, t) => s + t.count, 0) + tierData.warning.reduce((s, t) => s + t.count, 0);
    return [
      { label: "Total de Pacotes",  value: total,      border: "border-l-primary",      color: "text-primary" },
      { label: "Concluídos",        value: success,    border: "border-l-emerald-500",  color: "text-emerald-400" },
      { label: "Em Andamento",      value: inProgress, border: "border-l-blue-500",     color: "text-blue-400" },
      { label: "Requer Atenção",    value: problems,   border: "border-l-red-500",      color: "text-red-400" },
    ];
  }, [packages, tierData]);

  const chartData: ChartDataItem[] = useMemo(() => {
    return Object.entries(statusCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([status, count]) => ({
        status: status.length > 18 ? status.slice(0, 16) + "…" : status,
        count,
        fill: getChartColor(status),
      }));
  }, [statusCounts]);

  // Navegar para Pedidos filtrado por status
  const handleStatusClick = (status: string) => {
    router.push(`/pedidos?status=${encodeURIComponent(status)}`);
  };

  if (isLoading && packages.length === 0) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Visão geral do rastreamento logístico</p>
        </div>
        <CsvActions />
      </div>

      {packages.length === 0 ? (
        <EmptyState
          title="Pronto para começar"
          description="Importe sua planilha CSV para começar a rastrear seus pedidos."
          action={<CsvActions />}
        />
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {kpis.map((kpi, i) => {
              const Icon = KPI_ICONS[i];
              return (
                <div key={kpi.label} className={`glass rounded-2xl p-5 border-l-4 ${kpi.border} transition-all duration-300 hover:bg-white/[0.07] hover:shadow-lg hover:shadow-black/10 hover:-translate-y-0.5`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{kpi.label}</p>
                      <p className={`mt-1 text-3xl font-extrabold tracking-tight ${kpi.color}`}>{kpi.value}</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] border border-white/[0.05]">
                      <Icon className={`h-5 w-5 ${kpi.color}`} strokeWidth={2} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Status Accordion por Prioridade */}
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-foreground">Detalhamento por Status</h2>
            <div className="space-y-2">
              {(["danger", "warning", "info", "success", "neutral"] as PriorityTier[]).map((tier) => {
                const config = TIER_CONFIG[tier];
                const items = tierData[tier];
                const tierTotal = items.reduce((s, t) => s + t.count, 0);
                if (tierTotal === 0) return null;
                const isOpen = openTier === tier;

                return (
                  <div key={tier} className="glass rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpenTier(isOpen ? null : tier)}
                      className={`flex w-full items-center justify-between px-5 py-3.5 border-l-4 ${config.borderColor} transition-colors hover:bg-white/[0.04]`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-bold ${config.textColor}`}>{config.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {items.length} status · {tierTotal} pacotes
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xl font-extrabold ${config.textColor}`}>{tierTotal}</span>
                        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                      </div>
                    </button>

                    {isOpen && (
                      <div className="border-t border-white/[0.06]">
                        {items.map(({ status, count }) => {
                          const style = getStatusStyle(status);
                          const Icon = getStatusIcon(status);
                          const oldest = statusOldestDate[status];
                          const days = oldest ? diasDesde(oldest) : 0;

                          return (
                            <button
                              key={status}
                              onClick={() => handleStatusClick(status)}
                              className="flex w-full items-center justify-between px-5 py-3 border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.03] transition-colors group"
                            >
                              <div className="flex items-center gap-3">
                                <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${style.bg}`}>
                                  <Icon className={`h-3.5 w-3.5 ${style.text}`} strokeWidth={2.5} />
                                </div>
                                <span className="text-sm font-medium text-foreground">{status}</span>
                                {days > 3 && (tier === "danger" || tier === "warning") && (
                                  <span className="rounded-md bg-red-500/10 px-1.5 py-0.5 text-[10px] font-bold text-red-400">
                                    há {days} dias
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${style.bg} ${style.text}`}>
                                  {count}
                                </span>
                                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Charts */}
          {chartData.length > 0 && (
            <div className="grid gap-4 lg:grid-cols-5">
              <div className="lg:col-span-3">
                <StatusBarChart data={chartData} />
              </div>
              <div className="lg:col-span-2">
                <StatusPieChart data={chartData} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
