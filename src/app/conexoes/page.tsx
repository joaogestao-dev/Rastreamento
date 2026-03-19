"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Globe, Webhook, Zap, Copy, Check, ExternalLink } from "lucide-react";
import { useState } from "react";

interface ConnectionCardProps {
  title: string;
  description: string;
  icon: typeof Globe;
  iconGradient: string;
  fields: { label: string; placeholder: string; type?: string; value?: string; readOnly?: boolean; help?: string }[];
  connected?: boolean;
  accentColor: string;
}

function ConnectionCard({ title, description, icon: Icon, iconGradient, fields, connected, accentColor }: ConnectionCardProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (label: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Card className="border-border bg-card transition-all duration-300 hover:shadow-lg hover:shadow-black/5">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconGradient} shadow-lg`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-[15px] font-semibold tracking-tight text-foreground">{title}</CardTitle>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </div>
          <Badge
            variant="secondary"
            className={`text-[10px] font-medium tracking-wider ${
              connected
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-muted text-muted-foreground border border-border"
            }`}
          >
            <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${connected ? "bg-emerald-400 animate-pulse" : "bg-muted-foreground/50"}`} />
            {connected ? "ATIVO" : "OFFLINE"}
          </Badge>
        </div>
      </CardHeader>
      <Separator className="bg-border" />
      <CardContent className="space-y-4 pt-5">
        {fields.map((field) => {
          const currentValue = values[field.label] !== undefined ? values[field.label] : (field.value || "");
          return (
            <div key={field.label} className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{field.label}</label>
              <div className="relative">
                <Input
                  type={field.type || "text"}
                  placeholder={field.placeholder}
                  readOnly={field.readOnly}
                  value={currentValue}
                  onChange={(e) => setValues({ ...values, [field.label]: e.target.value })}
                  className={`h-10 rounded-xl bg-input pr-10 text-sm font-mono text-foreground ${field.readOnly ? 'cursor-default opacity-80' : ''}`}
                />
                {field.readOnly && currentValue && (
                  <button
                    onClick={() => handleCopy(field.label, currentValue)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copied === field.label ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                )}
              </div>
              {field.help && (
                <p className="text-[10px] text-muted-foreground/70">{field.help}</p>
              )}
            </div>
          );
        })}
        <Button className={`h-10 w-full gap-2 rounded-xl text-sm font-medium shadow-md transition-all ${accentColor}`}>
          <Zap className="h-4 w-4" />
          Testar Conexão
        </Button>
      </CardContent>
    </Card>
  );
}

export default function ConexoesPage() {
  // O endpoint real é: https://[seu-dominio]/api/webhooks
  // Em localhost: http://localhost:3000/api/webhooks
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://seu-dominio.vercel.app";
  const webhookUrl = `${baseUrl}/api/webhooks`;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Conexões</h1>
        <p className="text-sm text-muted-foreground">Configure suas integrações com plataformas de logística</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* API de Rastreamento */}
        <ConnectionCard
          title="API de Rastreamento"
          description="Consulta ativa de status de encomendas"
          icon={Globe}
          iconGradient="bg-gradient-to-br from-blue-500 to-blue-600"
          accentColor="bg-blue-600 hover:bg-blue-700 text-white"
          fields={[
            { label: "Endpoint URL", placeholder: "https://api.tracking.com/v1" },
            { label: "API Key", placeholder: "Sua chave de API", type: "password" },
          ]}
        />

        {/* Webhook Reportana */}
        <ConnectionCard
          title="Webhook Reportana"
          description="Receba atualizações automáticas da Reportana"
          icon={Webhook}
          iconGradient="bg-gradient-to-br from-violet-500 to-purple-600"
          accentColor="bg-violet-600 hover:bg-violet-700 text-white"
          connected
          fields={[
            {
              label: "Seu Endpoint (cole na Reportana)",
              placeholder: "",
              value: webhookUrl,
              readOnly: true,
              help: "Copie esta URL e cole no campo 'Webhook URL' das configurações da Reportana."
            },
            {
              label: "Secret Token",
              placeholder: "Token de autenticação",
              type: "password",
              value: "vibecode-secret-123",
              help: "Cole este token no campo 'Secret' ou 'Header x-webhook-secret' da Reportana."
            },
          ]}
        />

        {/* Webhook Unicodrop */}
        <ConnectionCard
          title="Webhook Unicodrop"
          description="Receba atualizações automáticas da Unicodrop"
          icon={Webhook}
          iconGradient="bg-gradient-to-br from-amber-500 to-orange-600"
          accentColor="bg-amber-600 hover:bg-amber-700 text-white"
          connected
          fields={[
            {
              label: "Seu Endpoint (cole na Unicodrop)",
              placeholder: "",
              value: webhookUrl,
              readOnly: true,
              help: "Copie esta URL e cole no campo 'Webhook URL' das configurações da Unicodrop."
            },
            {
              label: "Secret Token",
              placeholder: "Token de autenticação",
              type: "password",
              value: "vibecode-secret-123",
              help: "Cole este token no campo 'Secret' da Unicodrop."
            },
          ]}
        />
      </div>

      {/* Instruções detalhadas */}
      <Card className="border-border bg-card">
        <CardContent className="pt-6 space-y-5">
          <h3 className="text-sm font-bold text-foreground">📋 Passo a passo: Como conectar</h3>

          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-semibold text-primary mb-2">Reportana</h4>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-xs font-bold text-violet-400">1</span>
                  Acesse <strong>app.reportana.com</strong> → Configurações → Webhooks
                </li>
                <li className="flex gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-xs font-bold text-violet-400">2</span>
                  No campo <strong>&quot;URL do Webhook&quot;</strong>, cole: <code className="rounded bg-muted px-1 font-mono text-xs text-foreground">{webhookUrl}</code>
                </li>
                <li className="flex gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-xs font-bold text-violet-400">3</span>
                  No campo <strong>&quot;Header de Autenticação&quot;</strong>, adicione: <code className="rounded bg-muted px-1 font-mono text-xs text-foreground">x-webhook-secret: vibecode-secret-123</code>
                </li>
                <li className="flex gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-xs font-bold text-violet-400">4</span>
                  Pronto! A cada atualização de status, os dados chegam aqui automaticamente.
                </li>
              </ol>
            </div>

            <Separator className="bg-border" />

            <div>
              <h4 className="text-xs font-semibold text-primary mb-2">Unicodrop</h4>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-xs font-bold text-amber-400">1</span>
                  Acesse o painel da Unicodrop → Integrações → Webhook de Rastreio
                </li>
                <li className="flex gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-xs font-bold text-amber-400">2</span>
                  Cole a mesma URL e o mesmo Secret Token mostrados acima.
                </li>
                <li className="flex gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-xs font-bold text-amber-400">3</span>
                  O formato do payload é idêntico — o TrackFlow entende ambos.
                </li>
              </ol>
            </div>
          </div>

          <div className="rounded-xl bg-muted/50 border border-border p-4">
            <div className="flex items-start gap-2">
              <ExternalLink className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">Importante:</strong> Se o sistema estiver rodando local (localhost), o Webhook só funcionará se você usar um serviço de tunnel como <strong>ngrok</strong>. Em produção (Vercel), o endpoint funciona diretamente.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
