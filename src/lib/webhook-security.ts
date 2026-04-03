import { timingSafeEqual, createHmac } from "crypto";

// ──────────────────────────────────────────────────
// TIMING-SAFE COMPARE — Previne timing attacks
// Referência: Shopify safeCompare, Stripe secureCompare
// ──────────────────────────────────────────────────
export function timingSafeCompare(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;

  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);

  // timingSafeEqual exige mesmo tamanho — se diferente, já é inválido
  // mas fazemos HMAC de ambos para garantir mesmo tamanho e prevenir leak
  const hmacA = createHmac("sha256", "compare").update(bufA).digest();
  const hmacB = createHmac("sha256", "compare").update(bufB).digest();

  return timingSafeEqual(hmacA, hmacB);
}

// ──────────────────────────────────────────────────
// VALIDAÇÃO DE TOKEN — Aceita x-webhook-secret, x-api-key, Authorization
// NÃO aceita query string (exposição em logs)
// ──────────────────────────────────────────────────
export function validateWebhookToken(req: Request): boolean {
  const expected = process.env.WEBHOOK_SECRET;
  if (!expected) {
    console.error("🔴 [SECURITY] WEBHOOK_SECRET não definido no .env");
    return false;
  }

  // Fontes seguras de token (headers apenas)
  const candidates = [
    req.headers.get("x-webhook-secret"),
    req.headers.get("x-api-key"),
    extractBearerToken(req.headers.get("authorization")),
  ].filter(Boolean) as string[];

  // Pelo menos um header deve conter o token correto
  return candidates.some((candidate) => timingSafeCompare(candidate, expected));
}

function extractBearerToken(header: string | null): string | null {
  if (!header) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

// ──────────────────────────────────────────────────
// EXTRAIR SOURCE — reportana, unicodrop, ou genérico
// ──────────────────────────────────────────────────
export function extractSource(req: Request): string {
  const url = new URL(req.url);
  const source = url.searchParams.get("source");
  if (source) return `webhook_${source.toLowerCase()}`;

  const ua = req.headers.get("user-agent") || "";
  if (ua.toLowerCase().includes("reportana")) return "webhook_reportana";
  if (ua.toLowerCase().includes("unicodrop")) return "webhook_unicodrop";

  return "webhook";
}
