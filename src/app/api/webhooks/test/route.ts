import { NextResponse } from "next/server";

// ──────────────────────────────────────────────────
// POST /api/webhooks/test — Testa se o token está correto
// Usado pelo botão "Testar Conexão" da UI
// ──────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const EXPECTED = process.env.WEBHOOK_SECRET || "vibecode-secret-123";

    // Aceitar token por vários métodos
    const secret = req.headers.get("x-webhook-secret");
    const apiKey = req.headers.get("x-api-key");
    const authHeader = req.headers.get("authorization");
    const bearer = authHeader?.replace("Bearer ", "");

    const url = new URL(req.url);
    const queryToken = url.searchParams.get("token");

    const isValid =
      secret === EXPECTED ||
      apiKey === EXPECTED ||
      bearer === EXPECTED ||
      queryToken === EXPECTED;

    if (!isValid) {
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
      server: "TrackFlow Webhook API v1.0",
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
