import {
  Package,
  EventMetric,
  ChartDataItem,
  StatusType,
} from "./types";
import {
  Truck,
  PackageCheck,
  AlertTriangle,
  PackageX,
  RotateCcw,
  ShieldCheck,
  ArrowLeftRight,
  Search,
} from "lucide-react";

// ── Mock Packages ──────────────────────────────────────────────
export const mockPackages: Package[] = [
  {
    id: "1",
    tracking_code: "LB123456789CN",
    order_id: "PED-2024-001",
    current_status: "Em Trânsito",
    last_update: "2024-12-15",
    description: "Pacote saiu do centro de distribuição de Shenzhen",
  },
  {
    id: "2",
    tracking_code: "LB987654321CN",
    order_id: "PED-2024-002",
    current_status: "Importação Autorizada",
    last_update: "2024-12-14",
    description: "Importação autorizada pela Receita Federal",
  },
  {
    id: "3",
    tracking_code: "LB456789123CN",
    order_id: "PED-2024-003",
    current_status: "Taxado",
    last_update: "2024-12-13",
    description: "Pacote taxado — aguardando pagamento de imposto",
  },
  {
    id: "4",
    tracking_code: "LB321654987CN",
    order_id: "PED-2024-004",
    current_status: "Liberado",
    last_update: "2024-12-13",
    description: "Pacote liberado para entrega ao destinatário",
  },
  {
    id: "5",
    tracking_code: "LB654321789CN",
    order_id: "PED-2024-005",
    current_status: "Perdido",
    last_update: "2024-12-12",
    description: "Pacote extraviado — investigação em andamento",
  },
  {
    id: "6",
    tracking_code: "LB789123456CN",
    order_id: "PED-2024-006",
    current_status: "Devolvido",
    last_update: "2024-12-12",
    description: "Pacote devolvido ao remetente por endereço incorreto",
  },
  {
    id: "7",
    tracking_code: "LB147258369CN",
    order_id: "PED-2024-007",
    current_status: "Transferência BR-China",
    last_update: "2024-12-11",
    description: "Em transferência entre centros logísticos BR-China",
  },
  {
    id: "8",
    tracking_code: "LB369258147CN",
    order_id: "PED-2024-008",
    current_status: "Fiscalização Aduaneira",
    last_update: "2024-12-11",
    description: "Pacote retido para fiscalização aduaneira",
  },
  {
    id: "9",
    tracking_code: "LB258147369CN",
    order_id: "PED-2024-009",
    current_status: "Em Trânsito",
    last_update: "2024-12-10",
    description: "Pacote em trânsito — previsão de chegada em 5 dias",
  },
  {
    id: "10",
    tracking_code: "LB963852741CN",
    order_id: "PED-2024-010",
    current_status: "Liberado",
    last_update: "2024-12-10",
    description: "Pacote liberado — saiu para entrega",
  },
  {
    id: "11",
    tracking_code: "LB741852963CN",
    order_id: "PED-2024-011",
    current_status: "Em Trânsito",
    last_update: "2024-12-09",
    description: "Pacote em trânsito internacional — etapa aérea",
  },
  {
    id: "12",
    tracking_code: "LB852963741CN",
    order_id: "PED-2024-012",
    current_status: "Importação Autorizada",
    last_update: "2024-12-09",
    description: "Documentação aprovada — importação autorizada",
  },
  {
    id: "13",
    tracking_code: "LB159357486CN",
    order_id: "PED-2024-013",
    current_status: "Taxado",
    last_update: "2024-12-08",
    description: "Taxa de importação gerada — R$ 87,50",
  },
  {
    id: "14",
    tracking_code: "LB486357159CN",
    order_id: "PED-2024-014",
    current_status: "Transferência BR-China",
    last_update: "2024-12-08",
    description: "Transferência em andamento — centro logístico Guangzhou",
  },
  {
    id: "15",
    tracking_code: "LB357159486CN",
    order_id: "PED-2024-015",
    current_status: "Fiscalização Aduaneira",
    last_update: "2024-12-07",
    description: "Em análise pela fiscalização — documentação complementar solicitada",
  },
];

// ── Status Style Map ───────────────────────────────────────────
export const statusStyles: Record<
  StatusType,
  { bg: string; text: string; dot: string }
> = {
  "Em Trânsito": {
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-500",
  },
  "Importação Autorizada": {
    bg: "bg-sky-50",
    text: "text-sky-700",
    dot: "bg-sky-500",
  },
  Taxado: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  Liberado: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  Perdido: {
    bg: "bg-red-50",
    text: "text-red-700",
    dot: "bg-red-500",
  },
  Devolvido: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    dot: "bg-orange-500",
  },
  "Transferência BR-China": {
    bg: "bg-violet-50",
    text: "text-violet-700",
    dot: "bg-violet-500",
  },
  "Fiscalização Aduaneira": {
    bg: "bg-rose-50",
    text: "text-rose-700",
    dot: "bg-rose-500",
  },
};

// ── Computed Metrics ───────────────────────────────────────────
function countByStatus(status: StatusType): number {
  return mockPackages.filter((p) => p.current_status === status).length;
}

export const eventMetrics: EventMetric[] = [
  {
    label: "Em Trânsito",
    value: countByStatus("Em Trânsito"),
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    icon: Truck,
  },
  {
    label: "Liberados",
    value: countByStatus("Liberado"),
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    icon: PackageCheck,
  },
  {
    label: "Taxados",
    value: countByStatus("Taxado"),
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    icon: AlertTriangle,
  },
  {
    label: "Perdidos",
    value: countByStatus("Perdido"),
    color: "text-red-600",
    bgColor: "bg-red-50",
    icon: PackageX,
  },
  {
    label: "Devolvidos",
    value: countByStatus("Devolvido"),
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    icon: RotateCcw,
  },
  {
    label: "Importação Autorizada",
    value: countByStatus("Importação Autorizada"),
    color: "text-sky-600",
    bgColor: "bg-sky-50",
    icon: ShieldCheck,
  },
  {
    label: "Transferência BR-China",
    value: countByStatus("Transferência BR-China"),
    color: "text-violet-600",
    bgColor: "bg-violet-50",
    icon: ArrowLeftRight,
  },
  {
    label: "Fiscalização Aduaneira",
    value: countByStatus("Fiscalização Aduaneira"),
    color: "text-rose-600",
    bgColor: "bg-rose-50",
    icon: Search,
  },
];

// ── Chart Data ─────────────────────────────────────────────────
export const chartData: ChartDataItem[] = [
  { status: "Em Trânsito", count: countByStatus("Em Trânsito"), fill: "#3b82f6" },
  { status: "Importação Aut.", count: countByStatus("Importação Autorizada"), fill: "#0ea5e9" },
  { status: "Taxados", count: countByStatus("Taxado"), fill: "#f59e0b" },
  { status: "Liberados", count: countByStatus("Liberado"), fill: "#10b981" },
  { status: "Devolvidos", count: countByStatus("Devolvido"), fill: "#f97316" },
  { status: "Perdidos", count: countByStatus("Perdido"), fill: "#ef4444" },
  { status: "Transf. BR-CN", count: countByStatus("Transferência BR-China"), fill: "#8b5cf6" },
  { status: "Fiscalização", count: countByStatus("Fiscalização Aduaneira"), fill: "#f43f5e" },
];
