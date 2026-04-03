import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/server";

// ──────────────────────────────────────────────────
// GET /api/webhooks/logs — Retorna últimos eventos de webhook
// Usado pela seção "Últimos Eventos" na UI de Conexões
// ──────────────────────────────────────────────────
export async function GET() {
  try {
    const supabase = createAdminClient();

    // Buscar últimos 20 logs (graceful — retorna [] se falhar)
    let logs: Record<string, unknown>[] = [];
    let integrations: Record<string, unknown>[] = [];

    try {
      const { data, error } = await supabase
        .from("import_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (!error && data) logs = data;
      else if (error) console.warn("⚠️ [LOGS] Supabase:", error.message);
    } catch {
      console.warn("⚠️ [LOGS] Supabase offline — retornando vazio");
    }

    try {
      const { data, error } = await supabase
        .from("integrations")
        .select("*")
        .order("name");

      if (!error && data) integrations = data;
      else if (error) console.warn("⚠️ [INTEGRATIONS] Supabase:", error.message);
    } catch {
      console.warn("⚠️ [INTEGRATIONS] Supabase offline — retornando vazio");
    }

    return NextResponse.json({
      success: true,
      logs,
      integrations,
    });
  } catch (error: unknown) {
    // Fallback total — nunca retorna 500
    console.error("🔴 [LOGS] Erro crítico:", error);
    return NextResponse.json({
      success: true,
      logs: [],
      integrations: [],
    });
  }
}
