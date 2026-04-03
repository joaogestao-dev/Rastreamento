import { PackageOpen } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ 
  title = "Nenhum dado encontrado.", 
  description = "Ainda não há pacotes ou rastreios para exibir.",
  action 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center glass rounded-2xl px-6 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/[0.06] border border-white/[0.05]">
        <PackageOpen className="h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <h3 className="mb-2 text-[15px] font-semibold tracking-tight text-foreground">
        {title}
      </h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
