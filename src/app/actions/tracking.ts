"use server";

import { createAdminClient } from "@/utils/supabase/server";
import { Package, StatusType } from "@/lib/types";
import { revalidatePath } from "next/cache";

// 1. Fetch Packages (Read)
export async function getPackages(): Promise<Package[]> {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("packages")
      .select("*")
      .order("last_update", { ascending: false });

    if (error) {
      console.error("🔴 [GET] Supabase error:", error.message, error.code);
      return [];
    }

    return (data || []).map((row) => ({
      id: row.id,
      tracking_code: row.tracking_code,
      order_id: row.order_id || "",
      current_status: row.current_status as StatusType,
      last_update: row.last_update,
      description: row.description || "",
    }));
  } catch (err) {
    console.error("🔴 [GET] Exception:", err);
    return [];
  }
}

// 2. Upsert Packages from CSV or Webhook (Write)
export async function importCsvPackages(packages: Package[]) {
  const supabase = createAdminClient();
  let successCount = 0;
  let errorCount = 0;

  for (const pkg of packages) {
    // Garantir que last_update seja um timestamp válido
    let lastUpdate = pkg.last_update;
    if (!lastUpdate || lastUpdate.trim() === "") {
      lastUpdate = new Date().toISOString();
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(lastUpdate)) {
      // Se for só data (YYYY-MM-DD), adicionar hora
      lastUpdate = `${lastUpdate}T00:00:00.000Z`;
    }

    // A. Upsert pacote
    const { data: packageRow, error: pkgError } = await supabase
      .from("packages")
      .upsert(
        {
          tracking_code: pkg.tracking_code,
          order_id: pkg.order_id || null,
          current_status: pkg.current_status,
          last_update: lastUpdate,
          description: pkg.description || null,
        },
        { onConflict: "tracking_code" }
      )
      .select("id")
      .single();

    if (pkgError || !packageRow) {
      console.error("🔴 [UPSERT]", pkgError?.message, "→", pkg.tracking_code);
      errorCount++;
      continue;
    }

    // B. Insert evento (ignorar duplicatas via unique constraint)
    const { error: eventError } = await supabase
      .from("tracking_events")
      .insert({
        package_id: packageRow.id,
        status: pkg.current_status,
        description: pkg.description || "Atualização de status",
        event_date: lastUpdate,
      });

    if (eventError && eventError.code !== "23505") {
      console.error("🔴 [EVENT]", eventError.message);
    }

    successCount++;
  }

  // Revalidar cache do Next.js
  revalidatePath("/");
  revalidatePath("/pedidos");

  return { successCount, errorCount };
}
