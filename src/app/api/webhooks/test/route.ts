import { NextResponse } from "next/server";
import { validateWebhookToken } from "@/lib/webhook-security";

// ──────────────────────────────────────────────────
// POST /api/webhooks/test — Testa se o token está correto
// ──────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    if (!validateWebhookToken(req)) {
      return NextResponse.json(
        {
          success: false,
          error: "Token inválido. Verifique o Secret Token configurado.",
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Conexão estabelecida com sucesso!",
      server: "TrackFlow Webhook API v2.0",
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json(
      { success: false, error: "Erro interno no teste.", details: msg },
      { status: 500 }
    );
  }
}
