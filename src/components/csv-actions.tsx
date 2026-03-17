"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Download } from "lucide-react";
import { parseCSV, exportCSV } from "@/lib/csv-service";
import { usePackages } from "@/lib/data-store";
import { Package } from "@/lib/types";

export function CsvActions() {
  const fileRef = useRef<HTMLInputElement>(null);
  const { packages, upsertPackages } = usePackages();

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const parsed: Package[] = await parseCSV(file);
      upsertPackages(parsed);
    } catch {
      console.error("Erro ao importar CSV");
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="h-9 gap-2 border-slate-200 text-sm"
        onClick={() => fileRef.current?.click()}
      >
        <Upload className="h-4 w-4" />
        Importar CSV
      </Button>
      <input
        ref={fileRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleImport}
      />
      <Button
        variant="outline"
        size="sm"
        className="h-9 gap-2 border-slate-200 text-sm"
        onClick={() => exportCSV(packages)}
      >
        <Download className="h-4 w-4" />
        Exportar CSV
      </Button>
    </div>
  );
}
