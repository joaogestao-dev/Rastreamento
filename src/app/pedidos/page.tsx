"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { TrackingTable } from "@/components/tracking-table";
import { StatusFilter } from "@/components/status-filter";
import { CsvActions } from "@/components/csv-actions";
import { usePackages } from "@/lib/data-store";
import { EmptyState } from "@/components/empty-state";

function PedidosContent() {
  const { packages, isLoading } = usePackages();
  const searchParams = useSearchParams();
  const urlStatus = searchParams.get("status") || "all";
  const [statusFilter, setStatusFilter] = useState<string>(urlStatus);

  // Sincronizar com mudanças de URL
  useEffect(() => {
    setStatusFilter(urlStatus);
  }, [urlStatus]);

  const allStatuses = useMemo(() => {
    const set = new Set(packages.map((p) => p.current_status));
    return Array.from(set).sort();
  }, [packages]);

  if (isLoading && packages.length === 0) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
        <div className="h-[400px] animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Pedidos</h1>
          <p className="text-sm text-muted-foreground">
            {statusFilter !== "all"
              ? `Filtrando: ${statusFilter}`
              : "Todos os pedidos rastreados"
            }
          </p>
        </div>
        <div className="flex items-center gap-3">
          {allStatuses.length > 0 && <StatusFilter value={statusFilter} onChange={setStatusFilter} statuses={allStatuses} />}
          <CsvActions />
        </div>
      </div>

      {packages.length === 0 ? (
        <EmptyState
          title="Nenhum pedido encontrado"
          description="Importe seus pedidos via CSV ou configure uma conexão para começar."
          action={<CsvActions />}
        />
      ) : (
        <TrackingTable packages={packages} statusFilter={statusFilter} />
      )}
    </div>
  );
}

export default function PedidosPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
        <div className="h-[400px] animate-pulse rounded-2xl bg-muted" />
      </div>
    }>
      <PedidosContent />
    </Suspense>
  );
}
