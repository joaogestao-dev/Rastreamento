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
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="Buscar por rastreio, status ou pedido..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="h-10 rounded-xl border-zinc-200 bg-white/70 pl-9 text-sm font-medium shadow-sm backdrop-blur-xl placeholder:font-normal placeholder:text-zinc-400 focus-visible:border-zinc-300 focus-visible:ring-1 focus-visible:ring-zinc-200"
          />
        </div>
        <Badge variant="secondary" className="max-sm:hidden shrink-0 border border-zinc-200/50 bg-white/70 px-2.5 py-1 text-xs font-semibold text-zinc-500 shadow-sm backdrop-blur-md">
          {filtered.length} pacotes
        </Badge>
      </div>

      <div className="overflow-hidden rounded-[16px] border border-zinc-200/60 bg-white/70 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] backdrop-blur-xl">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-zinc-200/60 bg-zinc-50/50 hover:bg-zinc-50/50">
                <TableHead className="pl-6 h-10 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Rastreio</TableHead>
                <TableHead className="h-10 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Data</TableHead>
                <TableHead className="h-10 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Pedido</TableHead>
                <TableHead className="h-10 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Status</TableHead>
                <TableHead className="pr-6 h-10 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Descrição</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-sm font-medium text-zinc-400">
                    Nenhum pacote encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                paged.map((pkg) => {
                  const style = statusStyles[pkg.current_status];
                  return (
                    <TableRow key={pkg.id} className="border-zinc-100/80 transition-colors hover:bg-white/80">
                      <TableCell className="pl-6 font-mono text-[13px] font-semibold text-zinc-900 tracking-tight">{pkg.tracking_code}</TableCell>
                      <TableCell className="text-[13px] font-medium text-zinc-500">{new Date(pkg.last_update).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell className="text-[13px] font-semibold text-zinc-700">{pkg.order_id}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide shadow-sm border border-white/20 ${style.bg} ${style.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                          {pkg.current_status}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-xs truncate pr-6 text-[13px] font-medium text-zinc-500">{pkg.description}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-zinc-200/60 bg-white/50 px-6 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Página {safeCurrentPage + 1} de {totalPages}
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 rounded-lg border-zinc-200 shadow-sm transition-all hover:bg-zinc-100"
              disabled={safeCurrentPage <= 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              <ChevronLeft className="h-4 w-4 text-zinc-600" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 rounded-lg border-zinc-200 shadow-sm transition-all hover:bg-zinc-100"
              disabled={safeCurrentPage >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            >
              <ChevronRight className="h-4 w-4 text-zinc-600" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
