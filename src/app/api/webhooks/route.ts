import { NextResponse } from "next/server";
import { Package, StatusType } from "@/lib/types";
import { importCsvPackages } from "@/app/actions/tracking";
import { createAdminClient } from "@/utils/supabase/server";

// ──────────────────────────────────────────────────
// STATUS DICTIONARY — Tradução de status externos → internos
// ──────────────────────────────────────────────────
const statusDictionary: Record<string, StatusType> = {
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

// ──────────────────────────────────────────────────
// PAYLOAD INTERFACE — Aceita vários formatos de webhook
// ──────────────────────────────────────────────────
interface WebhookPayload {
  tracking_code?: string;
  tracking_number?: string;
  rastreio?: string;
  codigo?: string;

  order_id?: string;
  pedido?: string;

  status?: string;
  evento?: string;
  event?: string;

  description?: string;
  descricao?: string;

  event_date?: string;
  date?: string;
  data?: string;
}

// ──────────────────────────────────────────────────
// VALIDAÇÃO DE TOKEN — Aceita x-webhook-secret, x-api-key, Authorization
// ──────────────────────────────────────────────────
function validateToken(req: Request): boolean {
  const EXPECTED = process.env.WEBHOOK_SECRET || "vibecode-secret-123";

  const secret = req.headers.get("x-webhook-secret");
  const apiKey = req.headers.get("x-api-key");
  const authHeader = req.headers.get("authorization");
  const bearer = authHeader?.replace("Bearer ", "");

  // Também aceitar token via query string (?token=xxx)
  const url = new URL(req.url);
  const queryToken = url.searchParams.get("token");

  return (
    secret === EXPECTED ||
    apiKey === EXPECTED ||
    bearer === EXPECTED ||
    queryToken === EXPECTED
  );
}

// ──────────────────────────────────────────────────
// EXTRAIR SOURCE — reportana, unicodrop, ou genérico
// ──────────────────────────────────────────────────
function extractSource(req: Request): string {
  const url = new URL(req.url);
  const source = url.searchParams.get("source");
  if (source) return `webhook_${source.toLowerCase()}`;

  const ua = req.headers.get("user-agent") || "";
  if (ua.toLowerCase().includes("reportana")) return "webhook_reportana";
  if (ua.toLowerCase().includes("unicodrop")) return "webhook_unicodrop";

  return "webhook";
}

// ──────────────────────────────────────────────────
// NORMALIZAR PAYLOAD → Package[]
// ──────────────────────────────────────────────────
function normalizePayload(body: WebhookPayload | WebhookPayload[]): Package[] {
  const items = Array.isArray(body) ? body : [body];

  return items
    .map((item) => {
      const trackingCode = item.tracking_code || item.tracking_number || item.rastreio || item.codigo;
      if (!trackingCode) return null;

      const rawStatus = (item.status || item.evento || item.event || "in_transit").toLowerCase().trim();
      const mappedStatus: StatusType = statusDictionary[rawStatus] || "Em Trânsito";

      const lastUpdate = item.event_date || item.date || item.data || new Date().toISOString();

      return {
        id: "wh-" + Date.now(),
        tracking_code: trackingCode.trim(),
        order_id: (item.order_id || item.pedido || "").trim(),
        current_status: mappedStatus,
        description: item.description || item.descricao || `Atualizado via webhook: ${mappedStatus}`,
        last_update: lastUpdate,
      } as Package;
    })
    .filter((p): p is Package => p !== null);
}

// ──────────────────────────────────────────────────
// LOG NO BANCO — Registra em import_logs + atualiza integrations
// ──────────────────────────────────────────────────
async function logWebhookEvent(
  source: string,
  totalRows: number,
  successCount: number,
  errorCount: number,
  errors: string[] = []
) {
  try {
    const supabase = createAdminClient();

    // 1. Registrar log
    await supabase.from("import_logs").insert({
      source,
      total_rows: totalRows,
      success_count: successCount,
      error_count: errorCount,
      errors: JSON.stringify(errors),
    });

    // 2. Atualizar integração correspondente
    const integrationName =
      source === "webhook_reportana" ? "Webhook Reportana" :
      source === "webhook_unicodrop" ? "Webhook Unicodrop" :
      "API de Rastreamento";

    await supabase
      .from("integrations")
      .update({
        is_active: true,
        last_sync: new Date().toISOString(),
        error_count: errorCount,
      })
      .eq("name", integrationName);
  } catch (err) {
    console.error("⚠️ [LOG] Falha ao registrar log:", err);
  }
}

// ──────────────────────────────────────────────────
// POST /api/webhooks — Endpoint principal
// ──────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    // 1. Validar token
    if (!validateToken(req)) {
      return NextResponse.json(
        { success: false, error: "Token inválido ou ausente." },
        { status: 401 }
      );
    }

    // 2. Parsear body
    const body = await req.json();
    const source = extractSource(req);

    // 3. Normalizar payload (aceita objeto único ou array)
    const packages = normalizePayload(body);

    if (packages.length === 0) {
      return NextResponse.json(
        { success: false, error: "Nenhum pacote válido no payload. Campo tracking_code é obrigatório." },
        { status: 400 }
      );
    }

    // 4. Upsert no banco via importCsvPackages (mesma lógica do CSV)
    const result = await importCsvPackages(packages);

    // 5. Registrar log no banco
    await logWebhookEvent(source, packages.length, result.successCount, result.errorCount);

    // 6. Resposta
    return NextResponse.json({
      success: true,
      message: `${result.successCount} pacote(s) processado(s) com sucesso.`,
      source,
      data: {
        total: packages.length,
        success: result.successCount,
        errors: result.errorCount,
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("🔴 [WEBHOOK] Erro:", msg);

    return NextResponse.json(
      { success: false, error: "Erro interno ao processar webhook.", details: msg },
      { status: 500 }
    );
  }
}

// ──────────────────────────────────────────────────
// GET /api/webhooks — Health check
// ──────────────────────────────────────────────────
export async function GET() {
  return NextResponse.json({
    status: "online",
    service: "TrackFlow Webhook API v1.0",
    timestamp: new Date().toISOString(),
    endpoints: {
      receive: "POST /api/webhooks?source=reportana|unicodrop",
      test: "POST /api/webhooks/test",
      logs: "GET /api/webhooks/logs",
    },
  });
}
