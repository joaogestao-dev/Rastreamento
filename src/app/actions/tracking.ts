"use server";

import { createAdminClient } from "@/utils/supabase/server";
import { Package, StatusType } from "@/lib/types";
import { revalidatePath } from "next/cache";

// 1. Fetch Packages (Read)
export async function getPackages(): Promise<Package[]> {
  const supabase = await createAdminClient();
  
  // Usando a admin key para bypassar RLS em leitura geral para MVP. 
  // Em prod, use `createClient()` se prender por user_id.
  const { data, error } = await supabase
    .from("packages")
    .select("*")
    .order("last_update", { ascending: false });

  if (error || !data) {
    console.error("Error fetching packages:", error);
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    tracking_code: row.tracking_code,
    order_id: row.order_id || "",
    current_status: row.current_status as StatusType,
    last_update: row.last_update,
    description: row.description || "",
  }));
}

// 2. Upsert Packages from CSV (Write)
export async function importCsvPackages(packages: Package[]) {
  const supabase = await createAdminClient();
  let successCount = 0;
  let errorCount = 0;

  // Em um cenário de produção real em massa, melhor usar RPC (Stored Function)
  // Para MVP seguro, iteramos os pacotes.
  for (const pkg of packages) {
    // A. Upsert o Meta-dado do Pacote
    const { data: packageRow, error: pkgError } = await supabase
      .from("packages")
      .upsert(
        {
          tracking_code: pkg.tracking_code,
          order_id: pkg.order_id || null,
          current_status: pkg.current_status,
          last_update: pkg.last_update,
          description: pkg.description,
        },
        { onConflict: "tracking_code" }
      )
      .select("id")
      .single();

    if (pkgError || !packageRow) {
      console.error("Error upserting package", pkgError);
      errorCount++;
      continue;
    }

    // B. Insert Histórico de Eventos (Ignorando se a tripla já existe)
    const { error: eventError } = await supabase
      .from("tracking_events")
      .insert({
        package_id: packageRow.id,
        status: pkg.current_status,
        description: pkg.description,
        event_date: pkg.last_update,
      });

    // Se violou unique (já existia), tudo bem, apenas pulamos
    // Se não for "violou unique" (23505), deu erro
    if (eventError && eventError.code !== "23505") {
      console.error("Error inserting event", eventError);
    }
    
    successCount++;
  }

  // C. Re-validar as rotas para o App Router baixar dados frescos
  revalidatePath("/");
  revalidatePath("/pedidos");

  return { successCount, errorCount };
}
