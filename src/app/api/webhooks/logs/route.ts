import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/server";

// ──────────────────────────────────────────────────
// GET /api/webhooks/logs — Retorna últimos eventos de webhook
// Usado pela seção "Últimos Eventos" na UI de Conexões
// ──────────────────────────────────────────────────
export async function GET() {
  try {
    const supabase = createAdminClient();

    // Buscar últimos 20 logs
    const { data: logs, error: logsError } = await supabase
      .from("import_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (logsError) {
      console.error("🔴 [LOGS] Erro:", logsError.message);
      return NextResponse.json(
        { success: false, error: "Erro ao buscar logs." },
        { status: 500 }
      );
    }

    // Buscar status das integrações
    const { data: integrations, error: intError } = await supabase
      .from("integrations")
      .select("*")
      .order("name");

    if (intError) {
      console.error("🔴 [INTEGRATIONS] Erro:", intError.message);
    }

    return NextResponse.json({
      success: true,
      logs: logs || [],
      integrations: integrations || [],
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}
