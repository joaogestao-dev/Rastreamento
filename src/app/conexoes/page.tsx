"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plug, Database, Globe, Key, Zap } from "lucide-react";
import { useState } from "react";

interface ConnectionCardProps {
  title: string;
  description: string;
  icon: typeof Plug;
  iconBg: string;
  fields: { label: string; placeholder: string; type?: string }[];
  connected?: boolean;
}

function ConnectionCard({ title, description, icon: Icon, iconBg, fields, connected }: ConnectionCardProps) {
  const [values, setValues] = useState<Record<string, string>>({});

  return (
    <Card className="border-zinc-200/60 bg-white/70 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] backdrop-blur-xl transition-all duration-400 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)]">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-[14px] ${iconBg}`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-[15px] font-semibold tracking-tight text-zinc-900">{title}</CardTitle>
              <p className="text-xs text-zinc-500">{description}</p>
            </div>
          </div>
          <Badge
            variant="secondary"
            className={`text-[10px] font-medium tracking-wider shadow-sm ${
              connected
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50 hover:bg-emerald-100/80"
                : "bg-zinc-100 text-zinc-600 border border-zinc-200 hover:bg-zinc-200"
            }`}
          >
            <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${connected ? "bg-emerald-500" : "bg-zinc-400"}`} />
            {connected ? "CONECTADO" : "OFFLINE"}
          </Badge>
        </div>
      </CardHeader>
      <Separator className="bg-zinc-200/60" />
      <CardContent className="space-y-4 pt-5">
        {fields.map((field) => (
          <div key={field.label} className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">{field.label}</label>
            <Input
              type={field.type || "text"}
              placeholder={field.placeholder}
              value={values[field.label] || ""}
              onChange={(e) => setValues({ ...values, [field.label]: e.target.value })}
              className="h-10 rounded-xl border-zinc-200 bg-zinc-50/50 px-3 text-sm font-mono text-zinc-700 shadow-sm transition-colors focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-zinc-400"
            />
          </div>
        ))}
        <Button className="h-10 w-full gap-2 rounded-xl bg-zinc-900 text-sm font-medium shadow-md transition-all hover:bg-zinc-800 hover:shadow-lg">
          <Zap className="h-4 w-4" />
          Testar Conexão
        </Button>
      </CardContent>
    </Card>
  );
}

export default function ConexoesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Conexões</h1>
        <p className="text-sm text-slate-500">Configure suas integrações com APIs externas</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ConnectionCard
          title="API de Rastreamento"
          description="Integração com API de rastreio logístico"
          icon={Globe}
          iconBg="bg-gradient-to-br from-blue-500 to-blue-600"
          fields={[
            { label: "Endpoint URL", placeholder: "https://api.tracking.com/v1" },
            { label: "API Key", placeholder: "tk_live_...", type: "password" },
          ]}
        />
        <ConnectionCard
          title="Supabase"
          description="Banco de dados e autenticação"
          icon={Database}
          iconBg="bg-gradient-to-br from-emerald-500 to-emerald-600"
          connected
          fields={[
            { label: "Project URL", placeholder: "https://xxx.supabase.co" },
            { label: "Anon Key", placeholder: "eyJhbG...", type: "password" },
          ]}
        />
        <ConnectionCard
          title="Webhook de Notificações"
          description="Receba alertas de mudanças de status"
          icon={Plug}
          iconBg="bg-gradient-to-br from-violet-500 to-violet-600"
          fields={[
            { label: "Webhook URL", placeholder: "https://hooks.slack.com/..." },
            { label: "Secret Token", placeholder: "whsec_...", type: "password" },
          ]}
        />
        <ConnectionCard
          title="API de Importação"
          description="Importação automática de planilhas"
          icon={Key}
          iconBg="bg-gradient-to-br from-amber-500 to-amber-600"
          fields={[
            { label: "Service URL", placeholder: "https://api.logistics.com/import" },
            { label: "Bearer Token", placeholder: "Bearer ...", type: "password" },
          ]}
        />
      </div>
    </div>
  );
}
