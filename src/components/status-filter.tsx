"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ALL_STATUSES, StatusType } from "@/lib/types";
import { statusStyles } from "@/lib/mock-data";
import { Filter } from "lucide-react";

interface StatusFilterProps {
  value: StatusType | "all";
  onChange: (value: StatusType | "all") => void;
}

export function StatusFilter({ value, onChange }: StatusFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
        <Filter className="h-4 w-4 text-slate-500" />
      </div>
      <Select value={value} onValueChange={(v) => onChange(v as StatusType | "all")}>
        <SelectTrigger className="h-9 w-[220px] border-slate-200 bg-white text-sm">
          <SelectValue placeholder="Filtrar por status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os Status</SelectItem>
          {ALL_STATUSES.map((status) => {
            const style = statusStyles[status];
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
