"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getStatusStyle } from "@/lib/mock-data";
import { Filter } from "lucide-react";

interface StatusFilterProps {
  value: string;
  onChange: (value: string) => void;
  statuses: string[];
}

export function StatusFilter({ value, onChange, statuses }: StatusFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent">
        <Filter className="h-4 w-4 text-muted-foreground" />
      </div>
      <Select value={value} onValueChange={(v) => onChange(v ?? "all")}>
        <SelectTrigger className="h-9 w-[220px] text-sm">
          <SelectValue placeholder="Filtrar por status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os Status</SelectItem>
          {statuses.map((status) => {
            const style = getStatusStyle(status);
            return (
              <SelectItem key={status} value={status}>
                <span className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${style.dot}`} />
                  {status}
                </span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
