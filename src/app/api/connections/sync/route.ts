import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/server";
import { importCsvPackages } from "@/app/actions/tracking";
import { Package, StatusType } from "@/lib/types";
import { mapStatus } from "@/lib/status-dictionary";

// Timeout para fetch externo (30 segundos)
const FETCH_TIMEOUT_MS = 30_000;

// ──────────────────────────────────────────────────
// BUSCAR CONFIG de uma integração
// ──────────────────────────────────────────────────
async function getIntegrationConfig(name: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("integrations")
    .select("config")
    .eq("name", name)
    .single();

  if (error || !data?.config) return null;
  return data.config as Record<string, string>;
}

// ──────────────────────────────────────────────────
// REGISTRAR LOG no banco
// ──────────────────────────────────────────────────
async function logSyncEvent(
  source: string,
  totalRows: number,
  successCount: number,
  errorCount: number,
) {
  try {
    const supabase = createAdminClient();

    await supabase.from("import_logs").insert({
      source,
      total_rows: totalRows,
      success_count: successCount,
      error_count: errorCount,
    });

    await supabase
      .from("integrations")
      .update({
        is_active: true,
        last_sync: new Date().toISOString(),
        error_count: errorCount,
      })
      .eq("name", source === "shopify" ? "Shopify" :
        source === "reportana" ? "Reportana" : "Unicodrop");
  } catch (err) {
    console.error("⚠️ [SYNC LOG]", err);
  }
}

// ──────────────────────────────────────────────────
// SYNC REPORTANA / UNICODROP — Autentica com Client ID + Secret
// ──────────────────────────────────────────────────
async function syncApiKey(source: "reportana" | "unicodrop"): Promise<{
  success: boolean;
  message: string;
  total?: number;
  imported?: number;
}> {
  const integrationName = source === "reportana" ? "Reportana" : "Unicodrop";
  const config = await getIntegrationConfig(integrationName);

  if (!config?.client_id || !config?.client_secret) {
    return { success: false, message: `Credenciais não configuradas para ${integrationName}. Preencha Client ID e Client Secret.` };
  }

  // URL da API — usa o campo api_url se configurado, ou tenta endpoint padrão
  const defaultUrls: Record<string, string> = {
    reportana: "https://api.reportana.com/2022-05/orders",
    unicodrop: "https://api.unicodrop.com/v1/orders",
  };
  const apiUrl = config.api_url || defaultUrls[source];

  // Basic Auth (base64 de client_id:client_secret)
  const basicAuth = Buffer.from(`${config.client_id}:${config.client_secret}`).toString("base64");

  let res: Response;
  try {
    res = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Authorization": `Basic ${basicAuth}`,
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro de conexão";
    return { success: false, message: `Falha ao conectar com ${integrationName}: ${msg}` };
  }

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    return { success: false, message: `API ${integrationName} retornou HTTP ${res.status}. ${errBody ? errBody.slice(0, 200) : "Verifique as credenciais."}` };
  }

  const data = await res.json();

  // Normalizar resposta flexível (aceita vários formatos)
  const items = Array.isArray(data) ? data :
    data.data ? (Array.isArray(data.data) ? data.data : [data.data]) :
    data.orders ? data.orders :
    data.trackings ? data.trackings :
    [data];

  const packages: Package[] = items
    .map((item: Record<string, string>, i: number) => {
      const trackingCode = item.tracking_code || item.tracking_number ||
        item.rastreio || item.codigo || item.tracking;
      if (!trackingCode) return null;

      const rawStatus = item.status || item.evento || item.event || "em trânsito";
      const mappedStatus: StatusType = mapStatus(rawStatus);

      return {
        id: `sync-${source}-${Date.now()}-${i}`,
        tracking_code: trackingCode.trim(),
        order_id: (item.order_id || item.pedido || item.order_name || "").trim(),
        current_status: mappedStatus,
        description: item.description || item.descricao || `Sync ${integrationName}`,
        last_update: item.event_date || item.date || item.data || item.updated_at || new Date().toISOString(),
      } as Package;
    })
    .filter((p: Package | null): p is Package => p !== null);

  if (packages.length === 0) {
    return { success: false, message: "Nenhum pacote com tracking_code encontrado na resposta." };
  }

  const result = await importCsvPackages(packages);
  await logSyncEvent(source, packages.length, result.successCount, result.errorCount);

  return {
    success: true,
    message: `${result.successCount} pacote(s) importado(s) com sucesso.`,
    total: packages.length,
    imported: result.successCount,
  };
}

// ──────────────────────────────────────────────────
// SYNC SHOPIFY — Autentica e busca pedidos com tracking
// ──────────────────────────────────────────────────
async function syncShopify(): Promise<{
  success: boolean;
  message: string;
  total?: number;
  imported?: number;
}> {
  const config = await getIntegrationConfig("Shopify");

  if (!config?.domain || !config?.access_token) {
    return { success: false, message: "Preencha o domínio e o Admin API Access Token da Shopify." };
  }

  const domain = config.domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const accessToken = config.access_token;

  // Buscar pedidos com fulfillments
  try {
    const ordersRes = await fetch(
      `https://${domain}/admin/api/2026-01/orders.json?status=any&fulfillment_status=shipped&limit=250`,
      {
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      }
    );

    if (!ordersRes.ok) {
      return { success: false, message: `Erro ao buscar pedidos: HTTP ${ordersRes.status}` };
    }

    const ordersData = await ordersRes.json();
    const orders = ordersData.orders || [];

    // 3. Extrair tracking de cada fulfillment
    const packages: Package[] = [];

    for (const order of orders) {
      const fulfillments = order.fulfillments || [];
      for (const fulfillment of fulfillments) {
        const trackingNumber = fulfillment.tracking_number || (fulfillment.tracking_numbers?.[0]);
        if (!trackingNumber) continue;

        // Determinar status baseado no fulfillment
        let status: StatusType = "Em Trânsito";
        if (fulfillment.shipment_status === "delivered") status = "Entregue";
        else if (fulfillment.shipment_status === "in_transit") status = "Em Trânsito";
        else if (fulfillment.shipment_status === "out_for_delivery") status = "Em Trânsito";
        else if (fulfillment.shipment_status === "failure") status = "Perdido";

        packages.push({
          id: `shopify-${Date.now()}-${packages.length}`,
          tracking_code: trackingNumber.trim(),
          order_id: order.name || order.order_number?.toString() || "",
          current_status: status,
          description: `Shopify: ${fulfillment.tracking_company || ""}`.trim(),
          last_update: fulfillment.updated_at || order.updated_at || new Date().toISOString(),
        });
      }
    }

    if (packages.length === 0) {
      return { success: true, message: "Nenhum pedido com tracking encontrado na Shopify.", total: 0, imported: 0 };
    }

    const result = await importCsvPackages(packages);
    await logSyncEvent("shopify", packages.length, result.successCount, result.errorCount);

    return {
      success: true,
      message: `${result.successCount} pedido(s) importado(s) da Shopify.`,
      total: packages.length,
      imported: result.successCount,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido";
    return { success: false, message: `Erro ao buscar pedidos: ${msg}` };
  }
}

// ──────────────────────────────────────────────────
// POST /api/connections/sync
// Body: { source: "reportana" | "unicodrop" | "shopify" }
// ──────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { source } = body;

    if (!source || !["reportana", "unicodrop", "shopify"].includes(source)) {
      return NextResponse.json(
        { success: false, error: "Campo 'source' deve ser: reportana, unicodrop ou shopify." },
        { status: 400 }
      );
    }

    let result;
    if (source === "shopify") {
      result = await syncShopify();
    } else {
      result = await syncApiKey(source as "reportana" | "unicodrop");
    }

    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("🔴 [SYNC]", msg);
    return NextResponse.json(
      { success: false, message: `Erro interno: ${msg}` },
      { status: 500 }
    );
  }
}
