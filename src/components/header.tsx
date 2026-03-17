import { Package } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900">
          <Package className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900">
            Rastreamento Logístico
          </h1>
          <p className="hidden text-xs text-slate-500 sm:block">
            Painel de controle e monitoramento de pacotes
          </p>
        </div>
      </div>
    </header>
  );
}
