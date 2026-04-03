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
import { Package } from "@/lib/types";
import { getStatusStyle } from "@/lib/mock-data";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

interface TrackingTableProps {
  packages: Package[];
  statusFilter?: string;
}

const PAGE_SIZE = 15;

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return dateStr;
  }
}

function diasDesde(dateStr: string): number {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  } catch { return 0; }
}

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
    // Ordenar por data mais recente primeiro
    result = [...result].sort((a, b) => new Date(b.last_update).getTime() - new Date(a.last_update).getTime());
    return result;
  }, [packages, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(page, totalPages - 1);
  const paged = filtered.slice(safeCurrentPage * PAGE_SIZE, (safeCurrentPage + 1) * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por rastreio, status ou pedido..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="h-10 rounded-xl pl-9 text-sm"
          />
        </div>
        <Badge variant="secondary" className="max-sm:hidden shrink-0 px-2.5 py-1 text-xs font-semibold">
          {filtered.length} pacotes
        </Badge>
      </div>

      <div className="overflow-hidden rounded-2xl glass">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.03]">
                <TableHead className="pl-6 h-10 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Rastreio</TableHead>
                <TableHead className="h-10 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Data</TableHead>
                <TableHead className="h-10 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Pedido</TableHead>
                <TableHead className="h-10 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</TableHead>
                <TableHead className="pr-6 h-10 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Descrição</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-sm font-medium text-muted-foreground">
                    Nenhum pacote encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                paged.map((pkg) => {
                  const style = getStatusStyle(pkg.current_status);
                  const days = diasDesde(pkg.last_update);

                  return (
                    <TableRow key={pkg.id} className="border-white/[0.04] transition-colors hover:bg-white/[0.03]">
                      <TableCell className="pl-6 font-mono text-[13px] font-semibold text-foreground tracking-tight">
                        {pkg.tracking_code}
                      </TableCell>
                      <TableCell className="text-[13px] text-muted-foreground">
                        <div className="flex flex-col">
                          <span className="font-medium">{formatDate(pkg.last_update)}</span>
                          {days > 0 && (
                            <span className={`text-[10px] ${days > 7 ? "text-red-400" : days > 3 ? "text-amber-400" : "text-muted-foreground/70"}`}>
                              há {days} {days === 1 ? "dia" : "dias"}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-[13px] font-semibold text-foreground/80">{pkg.order_id}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide ${style.bg} ${style.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                          {pkg.current_status}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-xs truncate pr-6 text-[13px] font-medium text-muted-foreground">
                        {pkg.description}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between border-t border-white/[0.06] bg-white/[0.02] px-6 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Página {safeCurrentPage + 1} de {totalPages} · {filtered.length} pacotes
          </p>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg" disabled={safeCurrentPage <= 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg" disabled={safeCurrentPage >= totalPages - 1} onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
