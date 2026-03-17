import Papa from "papaparse";
import { Package, StatusType, ALL_STATUSES } from "./types";

export function parseCSV(file: File): Promise<Package[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        const rows = results.data as Record<string, string>[];
        const packages: Package[] = rows
          .map((row) => {
            const status = (row.current_status || row.status || "").trim();
            const validStatus = ALL_STATUSES.includes(status as StatusType)
              ? (status as StatusType)
              : "Em Trânsito";

            return {
              id: String(Date.now() + Math.random()),
              tracking_code: (row.tracking_code || row.rastreio || "").trim(),
              order_id: (row.order_id || row.pedido || "").trim(),
              current_status: validStatus,
              last_update: (row.last_update || row.data || new Date().toISOString().slice(0, 10)).trim(),
              description: (row.description || row.descricao || "").trim(),
            } as Package;
          })
          .filter((p) => p.tracking_code.length > 0);
        resolve(packages);
      },
      error(err) {
        reject(err);
      },
    });
  });
}

export function exportCSV(packages: Package[]) {
  const csv = Papa.unparse(
    packages.map((p) => ({
      tracking_code: p.tracking_code,
      order_id: p.order_id,
      current_status: p.current_status,
      last_update: p.last_update,
      description: p.description,
    }))
  );
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `rastreamento_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
