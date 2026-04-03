import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/server";

// ──────────────────────────────────────────────────
// GET /api/connections — Lista conexões salvas
// ──────────────────────────────────────────────────
export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("integrations")
      .select("*")
      .order("name");

    if (error) {
      console.warn("⚠️ [CONNECTIONS] Supabase:", error.message);
      return NextResponse.json({ success: true, connections: [] });
    }

    return NextResponse.json({ success: true, connections: data || [] });
  } catch {
    console.warn("⚠️ [CONNECTIONS] Supabase offline");
    return NextResponse.json({ success: true, connections: [] });
  }
}

// ──────────────────────────────────────────────────
// PUT /api/connections — Salva/atualiza config (upsert)
// Body: { name: "Reportana", config: { client_id: "...", client_secret: "..." } }
// Body: { name: "Shopify", config: { domain: "...", client_id: "...", client_secret: "..." } }
// ──────────────────────────────────────────────────
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { name, config } = body;

    if (!name || !config) {
      return NextResponse.json(
        { success: false, error: "Campos 'name' e 'config' são obrigatórios." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Upsert: tenta inserir, se já existe atualiza
    const { error } = await supabase
      .from("integrations")
      .upsert(
        {
          name,
          type: "api",
          config,
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "name" }
      );

    if (error) {
      console.error("🔴 [CONNECTIONS] Erro ao salvar:", error.message);
      return NextResponse.json(
        { success: false, error: "Erro ao salvar configuração." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Conexão "${name}" salva com sucesso.`,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("🔴 [CONNECTIONS]", msg);
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}
