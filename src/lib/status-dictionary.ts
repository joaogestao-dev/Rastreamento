import { StatusType } from "./types";

// ──────────────────────────────────────────────────
// STATUS DICTIONARY — Tradução de status externos → internos
// Fonte única de verdade (usada por webhooks e sync)
// ──────────────────────────────────────────────────
export const statusDictionary: Record<string, StatusType> = {
  // Inglês (APIs internacionais)
  "in_transit": "Em Trânsito",
  "delivered": "Entregue",
  "delivered_to_sender": "Devolvido",
  "exception": "Perdido",
  "customs_hold": "Fiscalização",
  "customs_cleared": "Liberado",
  "customs_taxed": "Taxados",
  "arrived_at_destination_country": "Transferências: BR e China",
  "info_received": "Importação Autorizada",
  // Português (Reportana / Unicodrop / Correios)
  "em trânsito": "Em Trânsito",
  "entregue": "Entregue",
  "devolvido": "Devolvido",
  "perdido": "Perdido",
  "extraviado": "Perdido",
  "fiscalização": "Fiscalização",
  "fiscalização aduaneira": "Fiscalização",
  "liberado": "Liberado",
  "taxado": "Taxados",
  "aguardando pagamento": "Taxados",
  "transferência": "Transferências: BR e China",
  "autorizada": "Importação Autorizada",
  "postado": "Postado",
  "retido": "Retido",
  "importação autorizada": "Importação Autorizada",
  "pagamento confirmado": "Pagamento Confirmado",
  "devolução determinada": "Devolução Determinada",
};

/**
 * Mapeia um status externo para o status interno do sistema.
 * Retorna "Em Trânsito" como fallback se não reconhecido.
 */
export function mapStatus(rawStatus: string): StatusType {
  const normalized = rawStatus.toLowerCase().trim();
  return statusDictionary[normalized] || "Em Trânsito";
}
