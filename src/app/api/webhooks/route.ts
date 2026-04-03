import { NextResponse } from "next/server";
import { Package } from "@/lib/types";
import { importCsvPackages } from "@/app/actions/tracking";
import { createAdminClient } from "@/utils/supabase/server";
import { mapStatus } from "@/lib/status-dictionary";
import { validateWebhookToken, extractSource } from "@/lib/webhook-security";

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
// NORMALIZAR PAYLOAD → Package[]
// ──────────────────────────────────────────────────
function normalizePayload(body: WebhookPayload | WebhookPayload[]): Package[] {
  const items = Array.isArray(body) ? body : [body];

  return items
    .map((item, i) => {
      const trackingCode = item.tracking_code || item.tracking_number || item.rastreio || item.codigo;
      if (!trackingCode) return null;

      const rawStatus = item.status || item.evento || item.event || "in_transit";
      const mappedStatus = mapStatus(rawStatus);

      const lastUpdate = item.event_date || item.date || item.data || new Date().toISOString();

      return {
        id: `wh-${Date.now()}-${i}`,
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
// LOG NO BANCO — Fire-and-forget (não bloqueia response)
// ──────────────────────────────────────────────────
function logWebhookEvent(
  source: string,
  totalRows: number,
  successCount: number,
  errorCount: number,
  errors: string[] = []
) {
  // Fire-and-forget — não retorna Promise para não bloquear
  (async () => {
    try {
      const supabase = createAdminClient();

      await supabase.from("import_logs").insert({
        source,
        total_rows: totalRows,
        success_count: successCount,
        error_count: errorCount,
        errors: JSON.stringify(errors),
      });

      const integrationName =
        source === "webhook_reportana" ? "Reportana" :
        source === "webhook_unicodrop" ? "Unicodrop" :
        "Shopify";

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
  })();
}

// ──────────────────────────────────────────────────
// POST /api/webhooks — Endpoint principal
// Pattern: Validate → Acknowledge → Process (inspirado no Stripe)
// ──────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    // 1. Validar token (timing-safe comparison)
    if (!validateWebhookToken(req)) {
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

    // 4. Upsert no banco (mantém síncrono pois importCsvPackages precisa do resultado)
    const result = await importCsvPackages(packages);

    // 5. Log em background (fire-and-forget — não atrasa response)
    logWebhookEvent(source, packages.length, result.successCount, result.errorCount);

    // 6. Resposta imediata
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
    service: "TrackFlow Webhook API v2.0",
    timestamp: new Date().toISOString(),
    endpoints: {
      receive: "POST /api/webhooks?source=reportana|unicodrop",
      test: "POST /api/webhooks/test",
      logs: "GET /api/webhooks/logs",
    },
  });
}
