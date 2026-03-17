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
    <Card className="border-white/20 bg-white/80 shadow-sm backdrop-blur-md transition-all duration-300 hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-slate-900">{title}</CardTitle>
              <p className="text-xs text-slate-500">{description}</p>
            </div>
          </div>
          <Badge
            variant="secondary"
            className={`text-xs ${
              connected
                ? "bg-emerald-50 text-emerald-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${connected ? "bg-emerald-500" : "bg-slate-400"}`} />
            {connected ? "Conectado" : "Desconectado"}
          </Badge>
        </div>
      </CardHeader>
      <Separator className="opacity-50" />
      <CardContent className="space-y-4 pt-4">
        {fields.map((field) => (
          <div key={field.label} className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">{field.label}</label>
            <Input
              type={field.type || "text"}
              placeholder={field.placeholder}
              value={values[field.label] || ""}
              onChange={(e) => setValues({ ...values, [field.label]: e.target.value })}
              className="h-9 border-slate-200 bg-white/60 text-sm placeholder:text-slate-400"
            />
          </div>
        ))}
        <Button className="h-9 w-full gap-2 bg-slate-900 text-sm font-medium hover:bg-slate-800">
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
