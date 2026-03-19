import type { LucideIcon } from "lucide-react";

// Status é dinâmico — qualquer string. Novas categorias são criadas automaticamente.
export type StatusType = string;

export interface Package {
  id: string;
  tracking_code: string;
  order_id: string;
  current_status: StatusType;
  last_update: string;
  description: string;
}

export interface EventMetric {
  label: string;
  value: number;
  color: string;
  bgColor: string;
  icon: LucideIcon;
}

export interface ChartDataItem {
  status: string;
  count: number;
  fill: string;
}

export interface StatusCategory {
  name: string;
  color: string;
  sort_order: number;
}
