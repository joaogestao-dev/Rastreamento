import type { LucideIcon } from "lucide-react";

export type StatusType =
  | "Importação Autorizada"
  | "Em Trânsito"
  | "Taxado"
  | "Liberado"
  | "Devolvido"
  | "Perdido"
  | "Transferência BR-China"
  | "Fiscalização Aduaneira";

export const ALL_STATUSES: StatusType[] = [
  "Em Trânsito",
  "Importação Autorizada",
  "Taxado",
  "Liberado",
  "Devolvido",
  "Perdido",
  "Transferência BR-China",
  "Fiscalização Aduaneira",
];

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
