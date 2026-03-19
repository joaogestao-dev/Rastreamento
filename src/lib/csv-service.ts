import Papa from "papaparse";
import { Package } from "./types";

// ──────────────────────────────────────────────────
// PRIORIDADE DE STATUS
// Grupos de cor e prioridade para o Dashboard
// ──────────────────────────────────────────────────
export type PriorityTier = "success" | "warning" | "danger" | "info" | "neutral";

export const STATUS_GROUPS: Record<string, { tier: PriorityTier; label: string }> = {
  "Entregue":                   { tier: "success", label: "Entregue" },
  "Retirada":                   { tier: "success", label: "Retirada" },
  "Liberado":                   { tier: "success", label: "Liberado" },
  "Pagamento Confirmado":       { tier: "success", label: "Pagamento Confirmado" },
  "Importação Autorizada":      { tier: "info",    label: "Importação Autorizada" },
  "Recebidos no Brasil":        { tier: "info",    label: "Recebidos no Brasil" },
  "Informações Enviadas":       { tier: "info",    label: "Informações Enviadas" },
  "Postado":                    { tier: "info",    label: "Postado" },
  "Transferências: BR e China": { tier: "info",    label: "Transferências BR/China" },
  "Em Trânsito":                { tier: "info",    label: "Em Trânsito" },
  "Objeto Selecionado":         { tier: "info",    label: "Objeto Selecionado" },
  "Carrier Update":             { tier: "neutral", label: "Carrier Update" },
  "Correção de Rota":           { tier: "neutral", label: "Correção de Rota" },
  "Fiscalização":               { tier: "warning", label: "Fiscalização" },
  "Taxados":                    { tier: "warning", label: "Taxados" },
  "Necessidade de Doc":         { tier: "warning", label: "Necessidade de Doc" },
  "Importação Suspensa":        { tier: "warning", label: "Importação Suspensa" },
  "Importação N Autorizada":    { tier: "warning", label: "Importação N. Autorizada" },
  "Ainda Não Chegou a Unid":    { tier: "warning", label: "Não Chegou à Unidade" },
  "Retido":                     { tier: "danger",  label: "Retido" },
  "Perdido":                    { tier: "danger",  label: "Perdido" },
  "Devolvido":                  { tier: "danger",  label: "Devolvido" },
  "Devolução Determinada":      { tier: "danger",  label: "Devolução Determinada" },
};

export function getStatusTier(status: string): PriorityTier {
  return STATUS_GROUPS[status]?.tier || "neutral";
}

export function getStatusLabel(status: string): string {
  return STATUS_GROUPS[status]?.label || status;
}

// ──────────────────────────────────────────────────
// MAPEAMENTO: Descrição/Evento → Status Padrão
// Normaliza e agrupa as centenas de descrições
// ──────────────────────────────────────────────────
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")  // remove acentos
    .replace(/[^a-z0-9\s]/g, " ")     // remove especiais
    .replace(/\s+/g, " ")             // normaliza espaços
    .trim();
}

function mapDescriptionToStatus(rawDesc: string): string {
  const d = normalizeText(rawDesc);

  // DANGER
  if (d.includes("perdido") || d.includes("extraviado")) return "Perdido";
  if (d.includes("retido") || d.includes("apreendido")) return "Retido";
  if (d.includes("devolucao determinada") || d.includes("devolvido a origem") || d.includes("devolvido ao rem")) return "Devolução Determinada";
  if (d.includes("devolv")) return "Devolvido";

  // WARNING
  if (d.includes("fiscalizacao aduaneira") || d.includes("fisc aduaneira")) return "Fiscalização";
  if (d.includes("fiscaliza")) return "Fiscalização";
  if (d.includes("taxa") || d.includes("tribut") || d.includes("taxado")) return "Taxados";
  if (d.includes("pagamento") && d.includes("aguard")) return "Taxados";
  if (d.includes("necessidade") || d.includes("cpf") || d.includes("cnpj") || d.includes("documento")) return "Necessidade de Doc";
  if (d.includes("import") && (d.includes("n autor") || d.includes("nao autor") || d.includes("n  autor"))) return "Importação N Autorizada";
  if (d.includes("suspens")) return "Importação Suspensa";
  if (d.includes("nao chegou") || d.includes("ainda n")) return "Ainda Não Chegou a Unid";

  // SUCCESS
  if (d.includes("entregue") || d.includes("entrega efetuada") || d.includes("delivered")) return "Entregue";
  if (d.includes("retirad") || d.includes("saiu para entrega") || d.includes("saiu entrega")) return "Retirada";
  if (d.includes("liberado") || d.includes("desembarac")) return "Liberado";
  if (d.includes("pagamento confirmado") || d.includes("pagamento efetuado") || d.includes("pago")) return "Pagamento Confirmado";

  // INFO
  if (d.includes("import") && d.includes("autoriz")) return "Importação Autorizada";
  if (d.includes("recebido") && (d.includes("correios") || d.includes("brasil") || d.includes("unidade"))) return "Recebidos no Brasil";
  if (d.includes("informac") && d.includes("enviada")) return "Informações Enviadas";
  if (d.includes("analise") && d.includes("autoridade")) return "Informações Enviadas";
  if (d.includes("transfere") || d.includes("transferi") || d.includes("encaminhado")) return "Transferências: BR e China";
  if (d.includes("destino de transfer")) return "Transferências: BR e China";
  if (d.includes("postado") || d.includes("postagem") || d.includes("objeto postado")) return "Postado";
  if (d.includes("selecionado")) return "Objeto Selecionado";
  if (d.includes("transit") || d.includes("aguard") || d.includes("em transito") || d.includes("por favor aguard")) return "Em Trânsito";

  // NEUTRAL
  if (d.includes("carrier") || d.includes("update")) return "Carrier Update";
  if (d.includes("correcao") || d.includes("rota")) return "Correção de Rota";
  if (d.includes("atraso")) return "Em Trânsito";
  if (d.includes("falha")) return "Retido";
  if (d.includes("cpf prestado") || d.includes("cpf informado")) return "Informações Enviadas";
  if (d.includes("codigo") && d.includes("rastreio")) return "Postado";
  if (d.includes("chegou") && d.includes("unidade")) return "Recebidos no Brasil";
  if (d.includes("pacote") && d.includes("liberado")) return "Liberado";
  if (d.includes("saindo") || d.includes("saiu")) return "Em Trânsito";
  if (d.includes("cancelado")) return "Devolução Determinada";
  if (d.includes("resumo")) return "Em Trânsito";
  if (d.includes("processo") && d.includes("desembara")) return "Fiscalização";
  if (d.includes("recebido") && d.includes("centro")) return "Recebidos no Brasil";
  if (d.includes("incognita") || d.includes("???")) return "Em Trânsito";
  if (d.includes("aviso")) return "Em Trânsito";

  // Fallback: "Em Trânsito" ao invés de usar a descrição como status
  return "Em Trânsito";
}

// Mapeamento direto para CSVs que já têm coluna Status
const directStatusMap: Record<string, string> = {
  "in_transit": "Em Trânsito",
  "delivered": "Entregue",
  "delivered_to_sender": "Devolução Determinada",
  "exception": "Perdido",
  "customs_hold": "Fiscalização",
  "customs_cleared": "Liberado",
  "customs_taxed": "Taxados",
  "arrived_at_destination_country": "Transferências: BR e China",
  "info_received": "Importação Autorizada",
  "em trânsito": "Em Trânsito",
  "entregue": "Entregue",
  "devolvido": "Devolvido",
  "perdido": "Perdido",
  "extraviado": "Perdido",
  "fiscalização": "Fiscalização",
  "liberado": "Liberado",
  "taxado": "Taxados",
  "postado": "Postado",
};

// ──────────────────────────────────────────────────
// LEITURA DO CSV COM DETECÇÃO DE ENCODING
// ──────────────────────────────────────────────────
async function readFileAsText(file: File): Promise<string> {
  // Tentar ler como UTF-8 primeiro
  const buffer = await file.arrayBuffer();

  // Tentar UTF-8
  const utf8Text = new TextDecoder("utf-8").decode(buffer);
  // Se tem caracteres de substituição (�), provavelmente é Windows-1252
  if (utf8Text.includes("\uFFFD") || utf8Text.includes("Ã§") || utf8Text.includes("Ã£") || utf8Text.includes("Ã©")) {
    // Fallback para Windows-1252 (Excel BR padrão)
    try {
      return new TextDecoder("windows-1252").decode(buffer);
    } catch {
      return utf8Text;
    }
  }
  return utf8Text;
}

export async function parseCSV(file: File): Promise<Package[]> {
  const text = await readFileAsText(file);

  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        if (results.data.length === 0) {
          resolve([]);
          return;
        }

        const rawRows = results.data as Record<string, string>[];
        const headers = Object.keys(rawRows[0] || {});
        console.log("CSV Headers:", headers);

        const colMap = buildColumnMap(headers);
        console.log("Column Map:", colMap);

        if (!colMap.tracking) {
          console.error("Coluna de rastreio não encontrada. Headers:", headers);
          resolve([]);
          return;
        }

        const packages: Package[] = rawRows
          .map((row) => {
            const rawTracking = String(row[colMap.tracking] || "").trim();
            if (!rawTracking) return null;

            const rawDate = colMap.date ? String(row[colMap.date] || "").trim() : "";
            const rawOrder = colMap.order ? String(row[colMap.order] || "").trim() : "";
            const rawDesc = colMap.description ? String(row[colMap.description] || "").trim() : "";
            const rawStatus = colMap.status ? String(row[colMap.status] || "").trim() : "";

            // Determinar status
            let status: string;
            if (rawStatus) {
              const key = rawStatus.toLowerCase().trim();
              status = directStatusMap[key] || mapDescriptionToStatus(rawStatus);
            } else if (rawDesc) {
              status = mapDescriptionToStatus(rawDesc);
            } else {
              status = "Em Trânsito";
            }

            // Normalizar data
            let lastUpdate = rawDate;
            if (!lastUpdate) {
              lastUpdate = new Date().toISOString();
            } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(lastUpdate)) {
              const [d, m, y] = lastUpdate.split("/");
              lastUpdate = `${y}-${m}-${d}`;
            }

            return {
              id: String(Date.now() + Math.random()),
              tracking_code: rawTracking,
              order_id: rawOrder,
              current_status: status,
              last_update: lastUpdate,
              description: rawDesc,
            } as Package;
          })
          .filter((p): p is Package => p !== null);

        // Log de resumo
        const statusCounts: Record<string, number> = {};
        packages.forEach(p => { statusCounts[p.current_status] = (statusCounts[p.current_status] || 0) + 1; });
        console.log("Status distribuídos:", statusCounts);
        console.log(`Total: ${packages.length} pacotes válidos`);

        resolve(packages);
      },
      error(err: Error) {
        reject(err);
      },
    });
  });
}

// ──────────────────────────────────────────────────
// COLUMN MAP — Identifica as 4 colunas-chave
// ──────────────────────────────────────────────────
function buildColumnMap(headers: string[]) {
  const map = { tracking: "", date: "", order: "", description: "", status: "" };

  for (const h of headers) {
    const clean = normalizeText(h);

    if (!map.tracking && (clean.includes("rastrei") || clean.includes("rastreio") || clean.includes("tracking") || clean.includes("codigo") || clean.includes("objeto"))) {
      map.tracking = h;
    } else if (!map.date && (clean.includes("data") || clean.includes("date") || clean.includes("horario"))) {
      map.date = h;
    } else if (!map.order && (clean.includes("pedido") || clean.includes("order") || clean.includes("venda"))) {
      map.order = h;
    } else if (!map.status && (clean.includes("status") || clean.includes("situacao"))) {
      map.status = h;
    } else if (!map.description && (clean.includes("descri") || clean.includes("detalhe") || clean.includes("evento") || clean.includes("obs"))) {
      map.description = h;
    }
  }

  // Fallback: se não achou descrição nem status, pegar última coluna não usada
  if (!map.description && !map.status) {
    const used = [map.tracking, map.date, map.order].filter(Boolean);
    const remaining = headers.filter(h => !used.includes(h));
    if (remaining.length > 0) map.description = remaining[0];
  }

  return map;
}

// ──────────────────────────────────────────────────
// EXPORT CSV
// ──────────────────────────────────────────────────
export function exportCSV(packages: Package[]) {
  const csv = Papa.unparse(
    packages.map((p) => ({
      Rastreio: p.tracking_code,
      Data: p.last_update,
      Pedido: p.order_id,
      Status: p.current_status,
      Descrição: p.description,
    }))
  );
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `trackflow_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
