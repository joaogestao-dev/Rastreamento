"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Download, Loader2 } from "lucide-react";
import { parseCSV, exportCSV } from "@/lib/csv-service";
import { usePackages } from "@/lib/data-store";
import { Package } from "@/lib/types";
import { importCsvPackages } from "@/app/actions/tracking";

export function CsvActions() {
  const fileRef = useRef<HTMLInputElement>(null);
  const { packages } = usePackages();
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsImporting(true);
    try {
      const parsed: Package[] = await parseCSV(file);
      const result = await importCsvPackages(parsed);
      console.log(`Importado: ${result.successCount} sucessos, ${result.errorCount} erros`);
    } catch {
      console.error("Erro ao importar CSV");
    } finally {
      setIsImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={isImporting}
        className="h-9 gap-2 border-zinc-200 text-sm shadow-sm transition-all hover:bg-zinc-50"
        onClick={() => fileRef.current?.click()}
      >
        {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {isImporting ? "Importando..." : "Importar CSV"}
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
        className="h-9 gap-2 border-zinc-200 text-sm shadow-sm transition-all hover:bg-zinc-50"
        onClick={() => exportCSV(packages)}
      >
        <Download className="h-4 w-4" />
        Exportar CSV
      </Button>
    </div>
  );
}
