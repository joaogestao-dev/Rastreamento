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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "@/lib/types";
import { statusStyles } from "@/lib/mock-data";
import { Search, TableIcon } from "lucide-react";

interface TrackingTableProps {
  packages: Package[];
}

export function TrackingTable({ packages }: TrackingTableProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return packages;
    const q = search.toLowerCase();
    return packages.filter(
      (p) =>
        p.tracking_code.toLowerCase().includes(q) ||
        p.current_status.toLowerCase().includes(q) ||
        p.order_id.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }, [packages, search]);

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
              <TableIcon className="h-4 w-4 text-slate-600" />
            </div>
            <CardTitle className="text-base font-semibold text-slate-900">
              Rastreamento de Pacotes
            </CardTitle>
            <Badge
              variant="secondary"
              className="ml-2 bg-slate-100 text-xs font-medium text-slate-600"
            >
              {filtered.length} pacotes
            </Badge>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Buscar por rastreio, status ou pedido..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 border-slate-200 bg-slate-50 pl-9 text-sm placeholder:text-slate-400 focus-visible:ring-slate-300"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 hover:bg-transparent">
                <TableHead className="pl-6 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Rastreio
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Data
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Pedido
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Status
                </TableHead>
                <TableHead className="pr-6 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Descrição
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-32 text-center text-sm text-slate-500"
                  >
                    Nenhum pacote encontrado para &quot;{search}&quot;
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((pkg) => {
                  const style = statusStyles[pkg.current_status];
                  return (
                    <TableRow
                      key={pkg.id}
                      className="border-slate-100 transition-colors hover:bg-slate-50/80"
                    >
                      <TableCell className="pl-6 font-mono text-sm font-medium text-slate-900">
                        {pkg.tracking_code}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {new Date(pkg.last_update).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-slate-700">
                        {pkg.order_id}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${style.bg} ${style.text}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${style.dot}`}
                          />
                          {pkg.current_status}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-xs truncate pr-6 text-sm text-slate-600">
                        {pkg.description}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
