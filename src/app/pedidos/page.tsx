"use client";

import { useState } from "react";
import { TrackingTable } from "@/components/tracking-table";
import { StatusFilter } from "@/components/status-filter";
import { CsvActions } from "@/components/csv-actions";
import { usePackages } from "@/lib/data-store";
import { StatusType } from "@/lib/types";

export default function PedidosPage() {
  const { packages } = usePackages();
  const [statusFilter, setStatusFilter] = useState<StatusType | "all">("all");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Pedidos</h1>
          <p className="text-sm text-slate-500">Gerenciamento e rastreamento de pacotes</p>
        </div>
        <CsvActions />
      </div>

      <div className="flex items-center gap-3">
        <StatusFilter value={statusFilter} onChange={setStatusFilter} />
      </div>

      <TrackingTable packages={packages} statusFilter={statusFilter} />
    </div>
  );
}
