import { NextResponse } from "next/server";
import { Package, StatusType } from "@/lib/types";
import { importCsvPackages } from "@/app/actions/tracking";

// Dicionário para traduzir status genéricos/inglês de plataformas externas
// para o nosso padrão exato (StatusType) para que os Badges fiquem na corerta.
const statusDictionary: Record<string, StatusType> = {
  // Padrões Comuns (Inglês)
  "in_transit": "Em Trânsito",
  "delivered": "Entregue",
  "delivered_to_sender": "Devolvido",
  "exception": "Perdido",
  "customs_hold": "Fiscalização Aduaneira",
  "customs_cleared": "Liberado",
  "customs_taxed": "Taxado",
  "arrived_at_destination_country": "Transferência BR-China",
  "info_received": "Importação Autorizada",
  
  // Padrões Textuais Correios/Pt-Br que as plataformas repassam
  "em trânsito": "Em Trânsito",
  "entregue": "Entregue",
  "devolvido": "Devolvido",
  "perdido": "Perdido",
  "extraviado": "Perdido",
  "fiscalização": "Fiscalização Aduaneira",
  "fiscalização aduaneira": "Fiscalização Aduaneira",
  "liberado": "Liberado",
  "taxado": "Taxado",
  "aguardando pagamento": "Taxado",
  "transferência": "Transferência BR-China",
  "autorizada": "Importação Autorizada",
  "postado": "Importação Autorizada"
};

// Exemplo de Payload Esperado (Adaptado para aceitar vários formatos comuns)
interface WebhookPayload {
  tracking_code?: string;
  tracking_number?: string;
  rastreio?: string;
  
  order_id?: string;
  pedido?: string;

  status?: string;
  evento?: string;
  
  description?: string;
  descricao?: string;
  
  event_date?: string;
  date?: string;
  data?: string;
}

export async function POST(req: Request) {
  try {
    // 1. Validação de Segurança Básica (API Key via URL ou Header)
    const url = new URL(req.url);
    const token = url.searchParams.get("token") || req.headers.get("x-api-key");
    const EXPECTED_TOKEN = process.env.WEBHOOK_SECRET || "vibecode-secret-123";

    if (token !== EXPECTED_TOKEN) {
      return NextResponse.json({ error: "Unauthorized. Invalid Token." }, { status: 401 });
    }

    // 2. Extração do Payload
    const body: WebhookPayload = await req.json();

    const trackingCode = body.tracking_code || body.tracking_number || body.rastreio;
    const rawStatus = (body.status || body.evento || "in_transit").toLowerCase().trim();
    
    if (!trackingCode) {
      return NextResponse.json({ error: "Missing tracking code" }, { status: 400 });
    }

    // 3. Tradução do Status
    const mappedStatus: StatusType = statusDictionary[rawStatus] || "Em Trânsito";

    // 4. Montagem do Objeto no formato da nossa Server Action
    const pkg: Package = {
      id: "generated-by-webhook", // será ignorado no upsert
      tracking_code: trackingCode,
      order_id: body.order_id || body.pedido || "",
      current_status: mappedStatus,
      description: body.description || body.descricao || `Status atualizado via integração para: ${mappedStatus}`,
      last_update: body.event_date || body.date || body.data || new Date().toISOString(),
    };

    // 5. Acionar a regra de negócio central (Upsert)
    // Usamos a mesma func que o CSV usa, o que garante a revalidação da UI
    // e o controle de não-duplicação na tabela 'tracking_events'.
    const result = await importCsvPackages([pkg]);

    return NextResponse.json({
      success: true,
      message: "Webhook recebido e processado com sucesso",
      data: result
    });

  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
