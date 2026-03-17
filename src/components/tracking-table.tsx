"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, StatusType } from "@/lib/types";
import { statusStyles } from "@/lib/mock-data";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

interface TrackingTableProps {
  packages: Package[];
  statusFilter?: StatusType | "all";
}

const PAGE_SIZE = 10;

export function TrackingTable({ packages, statusFilter = "all" }: TrackingTableProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    let result = packages;
    if (statusFilter !== "all") {
      result = result.filter((p) => p.current_status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.tracking_code.toLowerCase().includes(q) ||
          p.current_status.toLowerCase().includes(q) ||
          p.order_id.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }
    return result;
  }, [packages, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(page, totalPages - 1);
  const paged = filtered.slice(safeCurrentPage * PAGE_SIZE, (safeCurrentPage + 1) * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Buscar por rastreio, status ou pedido..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="h-9 border-slate-200 bg-white/80 pl-9 text-sm backdrop-blur-md placeholder:text-slate-400 focus-visible:ring-slate-300"
          />
        </div>
        <Badge variant="secondary" className="shrink-0 bg-slate-100 text-xs font-medium text-slate-600">
          {filtered.length} pacotes
        </Badge>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/20 bg-white/80 shadow-sm backdrop-blur-md">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200/60 hover:bg-transparent">
                <TableHead className="pl-5 text-[11px] font-semibold uppercase tracking-widest text-slate-400">Rastreio</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Data</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Pedido</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Status</TableHead>
                <TableHead className="pr-5 text-[11px] font-semibold uppercase tracking-widest text-slate-400">Descrição</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-sm text-slate-400">
                    Nenhum pacote encontrado
                  </TableCell>
                </TableRow>
              ) : (
                paged.map((pkg) => {
                  const style = statusStyles[pkg.current_status];
                  return (
                    <TableRow key={pkg.id} className="border-slate-100/60 transition-colors hover:bg-slate-50/60">
                      <TableCell className="pl-5 font-mono text-sm font-medium text-slate-900">{pkg.tracking_code}</TableCell>
                      <TableCell className="text-sm text-slate-500">{new Date(pkg.last_update).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell className="text-sm font-medium text-slate-700">{pkg.order_id}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${style.bg} ${style.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                          {pkg.current_status}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-xs truncate pr-5 text-sm text-slate-500">{pkg.description}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-slate-200/60 px-5 py-3">
          <p className="text-xs text-slate-400">
            Página {safeCurrentPage + 1} de {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={safeCurrentPage <= 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={safeCurrentPage >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
