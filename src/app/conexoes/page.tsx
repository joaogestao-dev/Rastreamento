"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Globe, Webhook, Zap, Copy, Check, ExternalLink, RefreshCw,
  CheckCircle2, XCircle, Clock, Loader2, Info, Eye, EyeOff,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";

// ── Types ──
interface IntegrationStatus {
  name: string;
  is_active: boolean;
  last_sync: string | null;
  error_count: number;
}

interface ImportLog {
  id: string;
  source: string;
  total_rows: number;
  success_count: number;
  error_count: number;
  created_at: string;
}

// ── Connection Card ──
interface ConnectionCardProps {
  title: string;
  description: string;
  icon: typeof Globe;
  iconGradient: string;
  accentColor: string;
  endpointUrl: string;
  secretToken: string;
  integration: IntegrationStatus | null;
  onTestResult?: (result: { success: boolean; message: string }) => void;
}

function ConnectionCard({
  title, description, icon: Icon, iconGradient, accentColor,
  endpointUrl, secretToken, integration, onTestResult,
}: ConnectionCardProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [showToken, setShowToken] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const isActive = integration?.is_active ?? false;
  const lastSync = integration?.last_sync;

  const handleCopy = (label: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/webhooks/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-webhook-secret": secretToken,
        },
      });
      const data = await res.json();
      const result = {
        success: data.success,
        message: data.success ? "Conexão estabelecida com sucesso!" : (data.error || "Falha na conexão."),
      };
      setTestResult(result);
      onTestResult?.(result);
    } catch {
      const result = { success: false, message: "Erro de rede. Verifique se o servidor está rodando." };
      setTestResult(result);
      onTestResult?.(result);
    } finally {
      setTesting(false);
    }
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
              isActive
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-muted text-muted-foreground border border-border"
            }`}
          >
            <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-400 animate-pulse" : "bg-muted-foreground/50"}`} />
            {isActive ? "ATIVO" : "OFFLINE"}
          </Badge>
        </div>
        {lastSync && (
          <p className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground/70">
            <Clock className="h-3 w-3" />
            Último sync: {new Date(lastSync).toLocaleString("pt-BR")}
          </p>
        )}
      </CardHeader>
      <Separator className="bg-border" />
      <CardContent className="space-y-4 pt-5">
        {/* Endpoint URL */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Seu Endpoint (cole no serviço externo)
          </label>
          <div className="relative">
            <Input
              readOnly
              value={endpointUrl}
              className="h-10 rounded-xl bg-input pr-10 text-sm font-mono text-foreground cursor-default opacity-80"
            />
            <button
              onClick={() => handleCopy("endpoint", endpointUrl)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              {copied === "endpoint" ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground/70">
            Copie esta URL e cole no campo &quot;Webhook URL&quot; do serviço.
          </p>
        </div>

        {/* Secret Token */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Secret Token</label>
          <div className="relative">
            <Input
              readOnly
              type={showToken ? "text" : "password"}
              value={secretToken}
              className="h-10 rounded-xl bg-input pr-20 text-sm font-mono text-foreground cursor-default opacity-80"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                onClick={() => setShowToken(!showToken)}
                className="rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              <button
                onClick={() => handleCopy("token", secretToken)}
                className="rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                {copied === "token" ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground/70">
            Cole no campo &quot;Secret&quot; ou adicione o header: <code className="bg-muted px-1 rounded text-[10px]">x-webhook-secret: {secretToken}</code>
          </p>
        </div>

        {/* Testar Conexão */}
        <Button
          onClick={handleTest}
          disabled={testing}
          className={`h-10 w-full gap-2 rounded-xl text-sm font-medium shadow-md transition-all ${accentColor}`}
        >
          {testing ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Testando...</>
          ) : (
            <><Zap className="h-4 w-4" /> Testar Conexão</>
          )}
        </Button>

        {/* Resultado do teste */}
        {testResult && (
          <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium ${
            testResult.success
              ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
              : "border-red-500/20 bg-red-500/5 text-red-400"
          }`}>
            {testResult.success ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <XCircle className="h-4 w-4 shrink-0" />}
            {testResult.message}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Main Page ──
export default function ConexoesPage() {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://seu-dominio.vercel.app";
  const secretToken = process.env.NEXT_PUBLIC_WEBHOOK_SECRET || "vibecode-secret-123";

  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);
  const [logs, setLogs] = useState<ImportLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  const fetchLogs = useCallback(async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch("/api/webhooks/logs");
      const data = await res.json();
      if (data.success) {
        setIntegrations(data.integrations || []);
        setLogs(data.logs || []);
      }
    } catch {
      console.error("Erro ao buscar logs");
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const getIntegration = (name: string) =>
    integrations.find((i) => i.name === name) || null;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Conexões</h1>
          <p className="text-sm text-muted-foreground">Configure suas integrações de webhook</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchLogs} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loadingLogs ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {/* Connection Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ConnectionCard
          title="API de Rastreamento"
          description="Endpoint geral para consultas e atualizações"
          icon={Globe}
          iconGradient="bg-gradient-to-br from-blue-500 to-blue-600"
          accentColor="bg-blue-600 hover:bg-blue-700 text-white"
          endpointUrl={`${baseUrl}/api/webhooks`}
          secretToken={secretToken}
          integration={getIntegration("API de Rastreamento")}
        />

        <ConnectionCard
          title="Webhook Reportana"
          description="Receba atualizações automáticas da Reportana"
          icon={Webhook}
          iconGradient="bg-gradient-to-br from-violet-500 to-purple-600"
          accentColor="bg-violet-600 hover:bg-violet-700 text-white"
          endpointUrl={`${baseUrl}/api/webhooks?source=reportana`}
          secretToken={secretToken}
          integration={getIntegration("Webhook Reportana")}
        />

        <ConnectionCard
          title="Webhook Unicodrop"
          description="Receba atualizações automáticas da Unicodrop"
          icon={Webhook}
          iconGradient="bg-gradient-to-br from-amber-500 to-orange-600"
          accentColor="bg-amber-600 hover:bg-amber-700 text-white"
          endpointUrl={`${baseUrl}/api/webhooks?source=unicodrop`}
          secretToken={secretToken}
          integration={getIntegration("Webhook Unicodrop")}
        />
      </div>

      {/* Instruções rápidas */}
      <Card className="border-border bg-card">
        <CardContent className="pt-6 space-y-5">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            Como configurar
          </h3>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="text-xs font-semibold text-violet-400 mb-2">Reportana</h4>
              <ol className="space-y-1.5 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-xs font-bold text-violet-400">1</span>
                  Acesse <strong>app.reportana.com</strong> → Configurações → Webhooks
                </li>
                <li className="flex gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-xs font-bold text-violet-400">2</span>
                  Cole a URL: <code className="rounded bg-muted px-1 font-mono text-[10px] text-foreground">/api/webhooks?source=reportana</code>
                </li>
                <li className="flex gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-xs font-bold text-violet-400">3</span>
                  Header: <code className="rounded bg-muted px-1 font-mono text-[10px] text-foreground">x-webhook-secret: {secretToken}</code>
                </li>
              </ol>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-amber-400 mb-2">Unicodrop</h4>
              <ol className="space-y-1.5 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-xs font-bold text-amber-400">1</span>
                  Acesse o painel da Unicodrop → Integrações → Webhook
                </li>
                <li className="flex gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-xs font-bold text-amber-400">2</span>
                  Cole a URL: <code className="rounded bg-muted px-1 font-mono text-[10px] text-foreground">/api/webhooks?source=unicodrop</code>
                </li>
                <li className="flex gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-xs font-bold text-amber-400">3</span>
                  Mesmo Secret Token das instruções acima.
                </li>
              </ol>
            </div>
          </div>

          <div className="rounded-xl bg-muted/50 border border-border p-4">
            <div className="flex items-start gap-2">
              <ExternalLink className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">Dica:</strong> Em localhost use <strong>ngrok</strong> para expor o endpoint. Em produção (Vercel) funciona direto.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Últimos Eventos */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Últimos Eventos
            </CardTitle>
            <Badge variant="secondary" className="text-[10px]">{logs.length} registros</Badge>
          </div>
        </CardHeader>
        <Separator className="bg-border" />
        <CardContent className="pt-4">
          {loadingLogs ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">Nenhum evento registrado ainda.</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Envie um webhook ou importe um CSV para ver eventos aqui.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => {
                const isSuccess = log.error_count === 0;
                const sourceLabel =
                  log.source === "webhook_reportana" ? "Reportana" :
                  log.source === "webhook_unicodrop" ? "Unicodrop" :
                  log.source === "csv" ? "CSV Import" :
                  log.source === "webhook" ? "Webhook" :
                  log.source;

                return (
                  <div
                    key={log.id}
                    className="flex items-center justify-between rounded-lg border border-border/50 px-4 py-2.5 hover:bg-accent/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {isSuccess ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-400 shrink-0" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-foreground">{sourceLabel}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {log.success_count} processados
                          {log.error_count > 0 && <span className="text-red-400"> · {log.error_count} erros</span>}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleDateString("pt-BR")}
                      </p>
                      <p className="text-[10px] text-muted-foreground/60">
                        {new Date(log.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
