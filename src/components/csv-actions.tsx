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
  const { packages, refreshPackages } = usePackages();
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsImporting(true);
    try {
      const parsed: Package[] = await parseCSV(file);
      
      if (parsed.length === 0) {
        alert("Nenhum código de rastreio encontrado. Verifique se seu CSV tem uma coluna com código de rastreio.");
        setIsImporting(false);
        if (fileRef.current) fileRef.current.value = "";
        return;
      }

      const result = await importCsvPackages(parsed);
      console.log(`Importado: ${result.successCount} sucessos, ${result.errorCount} erros`);
      
      if (result.successCount > 0) {
        await refreshPackages();
      }
      
      if (result.errorCount > 0) {
        alert(`${result.successCount} importados com sucesso, ${result.errorCount} falharam.`);
      }
      
    } catch (err) {
      console.error("Erro ao importar CSV", err);
      alert("Erro ao importar CSV. Verifique o console para detalhes.");
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
        className="h-9 gap-2 text-sm"
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
        className="h-9 gap-2 text-sm"
        onClick={() => exportCSV(packages)}
      >
        <Download className="h-4 w-4" />
        Exportar CSV
      </Button>
    </div>
  );
}
