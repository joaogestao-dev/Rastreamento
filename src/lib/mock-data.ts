import { StatusType } from "./types";
import {
  Truck,
  PackageCheck,
  AlertTriangle,
  PackageX,
  RotateCcw,
  ShieldCheck,
  ArrowLeftRight,
  Search,
  CheckCircle2,
  FileText,
  CreditCard,
  XCircle,
  Globe,
  Eye,
  Clock,
  AlertOctagon,
  MapPin,
  Send,
  Ban,
  Package,
  ArrowDown,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ── Status Style Map (com fallback para status desconhecidos) ──
const knownStyles: Record<string, { text: string; bg: string; dot: string }> = {
  "Importação Autorizada":      { text: "text-sky-400",     bg: "bg-sky-500/10",     dot: "bg-sky-400" },
  "Fiscalização":               { text: "text-rose-400",    bg: "bg-rose-500/10",    dot: "bg-rose-400" },
  "Taxados":                    { text: "text-amber-400",   bg: "bg-amber-500/10",   dot: "bg-amber-400" },
  "Pagamento Confirmado":       { text: "text-emerald-400", bg: "bg-emerald-500/10", dot: "bg-emerald-400" },
  "Importação N Autorizada":    { text: "text-red-400",     bg: "bg-red-500/10",     dot: "bg-red-400" },
  "Necessidade de Doc":         { text: "text-orange-400",  bg: "bg-orange-500/10",  dot: "bg-orange-400" },
  "Transferências: BR e China": { text: "text-violet-400",  bg: "bg-violet-500/10",  dot: "bg-violet-400" },
  "Informações Enviadas":       { text: "text-indigo-400",  bg: "bg-indigo-500/10",  dot: "bg-indigo-400" },
  "Objeto Selecionado":         { text: "text-cyan-400",    bg: "bg-cyan-500/10",    dot: "bg-cyan-400" },
  "Recebidos no Brasil":        { text: "text-teal-400",    bg: "bg-teal-500/10",    dot: "bg-teal-400" },
  "Postado":                    { text: "text-lime-400",    bg: "bg-lime-500/10",    dot: "bg-lime-400" },
  "Retido":                     { text: "text-red-500",     bg: "bg-red-500/10",     dot: "bg-red-500" },
  "Carrier Update":             { text: "text-purple-400",  bg: "bg-purple-500/10",  dot: "bg-purple-400" },
  "Devolução Determinada":      { text: "text-red-400",     bg: "bg-red-500/10",     dot: "bg-red-400" },
  "Importação Suspensa":        { text: "text-orange-400",  bg: "bg-orange-500/10",  dot: "bg-orange-400" },
  "Retirada":                   { text: "text-teal-400",    bg: "bg-teal-500/10",    dot: "bg-teal-400" },
  "Ainda Não Chegou a Unid":    { text: "text-yellow-400",  bg: "bg-yellow-500/10",  dot: "bg-yellow-400" },
  "Correção de Rota":           { text: "text-pink-400",    bg: "bg-pink-500/10",    dot: "bg-pink-400" },
  "Em Trânsito":                { text: "text-blue-400",    bg: "bg-blue-500/10",    dot: "bg-blue-400" },
  "Liberado":                   { text: "text-emerald-400", bg: "bg-emerald-500/10", dot: "bg-emerald-400" },
  "Perdido":                    { text: "text-red-400",     bg: "bg-red-500/10",     dot: "bg-red-400" },
  "Devolvido":                  { text: "text-orange-400",  bg: "bg-orange-500/10",  dot: "bg-orange-400" },
  "Entregue":                   { text: "text-green-400",   bg: "bg-green-500/10",   dot: "bg-green-400" },
};

const defaultStyle = { text: "text-slate-400", bg: "bg-slate-500/10", dot: "bg-slate-400" };

export function getStatusStyle(status: StatusType) {
  return knownStyles[status] || defaultStyle;
}

// Exportar como 'statusStyles' com Proxy para compatibilidade retroativa
export const statusStyles = new Proxy(knownStyles, {
  get(target, prop: string) {
    return target[prop] || defaultStyle;
  },
});

// ── Icon Map (com fallback) ──
const knownIcons: Record<string, LucideIcon> = {
  "Em Trânsito": Truck,
  "Liberado": PackageCheck,
  "Taxados": AlertTriangle,
  "Perdido": PackageX,
  "Devolvido": RotateCcw,
  "Entregue": CheckCircle2,
  "Importação Autorizada": ShieldCheck,
  "Transferências: BR e China": ArrowLeftRight,
  "Fiscalização": Search,
  "Pagamento Confirmado": CreditCard,
  "Importação N Autorizada": XCircle,
  "Necessidade de Doc": FileText,
  "Informações Enviadas": Send,
  "Objeto Selecionado": Eye,
  "Recebidos no Brasil": ArrowDown,
  "Postado": Globe,
  "Retido": Ban,
  "Carrier Update": Clock,
  "Devolução Determinada": AlertOctagon,
  "Importação Suspensa": Ban,
  "Retirada": MapPin,
  "Ainda Não Chegou a Unid": Clock,
  "Correção de Rota": MapPin,
};

export function getStatusIcon(status: StatusType): LucideIcon {
  return knownIcons[status] || Package;
}

// ── Chart Colors ──
const knownChartColors: Record<string, string> = {
  "Importação Autorizada":      "#38bdf8",
  "Fiscalização":               "#f43f5e",
  "Taxados":                    "#fbbf24",
  "Pagamento Confirmado":       "#22c55e",
  "Importação N Autorizada":    "#ef4444",
  "Necessidade de Doc":         "#f97316",
  "Transferências: BR e China": "#a78bfa",
  "Informações Enviadas":       "#818cf8",
  "Objeto Selecionado":         "#06b6d4",
  "Recebidos no Brasil":        "#34d399",
  "Postado":                    "#84cc16",
  "Retido":                     "#dc2626",
  "Carrier Update":             "#8b5cf6",
  "Devolução Determinada":      "#f87171",
  "Importação Suspensa":        "#fb923c",
  "Retirada":                   "#14b8a6",
  "Ainda Não Chegou a Unid":    "#eab308",
  "Correção de Rota":           "#ec4899",
  "Em Trânsito":                "#818cf8",
  "Liberado":                   "#34d399",
  "Perdido":                    "#f87171",
  "Devolvido":                  "#fb923c",
  "Entregue":                   "#4ade80",
};

// Gera cor baseada em hash para status desconhecidos
function hashColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 70%, 60%)`;
}

export function getChartColor(status: StatusType): string {
  return knownChartColors[status] || hashColor(status);
}
