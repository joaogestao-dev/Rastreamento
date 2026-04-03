"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingBag, Copy, Check, RefreshCw,
  CheckCircle2, XCircle, Clock, Loader2, Save,
  Eye, EyeOff, Link2, AlertCircle,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";

// ── Types ──
interface IntegrationStatus {
  name: string;
  is_active: boolean;
  last_sync: string | null;
  error_count: number;
  config: Record<string, string> | null;
}

interface ImportLog {
  id: string;
  source: string;
  total_rows: number;
  success_count: number;
  error_count: number;
  created_at: string;
}

// ── Shopify Card ──
function ShopifyCard({
  integration,
  onSave,
  onSync,
}: {
  integration: IntegrationStatus | null;
  onSave: (name: string, config: Record<string, string>) => Promise<boolean>;
  onSync: (source: string) => Promise<{ success: boolean; message: string }>;
}) {
  const [domain, setDomain] = useState(integration?.config?.domain || "");
  const [accessToken, setAccessToken] = useState(integration?.config?.access_token || "");
  const [showToken, setShowToken] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const isActive = integration?.is_active ?? false;
  const lastSync = integration?.last_sync;

  useEffect(() => {
    if (integration?.config) {
      if (integration.config.domain && !domain) setDomain(integration.config.domain);
      if (integration.config.access_token && !accessToken) setAccessToken(integration.config.access_token);
    }
  }, [integration, domain, accessToken]);

  const handleSave = async () => {
    if (!domain.trim() || !accessToken.trim()) {
      setFeedback({ success: false, message: "Preencha domínio e access token." });
      return;
    }
    setSaving(true);
    setFeedback(null);
    const ok = await onSave("Shopify", {
      domain: domain.trim(),
      access_token: accessToken.trim(),
    });
    setFeedback(ok
      ? { success: true, message: "Credenciais salvas!" }
      : { success: false, message: "Erro ao salvar." }
    );
    setSaving(false);
  };

  const handleSync = async () => {
    setSyncing(true);
    setFeedback(null);
    const result = await onSync("shopify");
    setFeedback(result);
    setSyncing(false);
  };

  const isComplete = domain.trim() && accessToken.trim();

  return (
    <Card className="border-border bg-card transition-all duration-300 hover:shadow-lg hover:shadow-black/5 md:col-span-2 lg:col-span-3">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-700 shadow-lg">
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-[15px] font-semibold tracking-tight text-foreground">Shopify</CardTitle>
              <p className="text-xs text-muted-foreground">Importar pedidos com rastreamento</p>
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
            {isActive ? "CONECTADO" : "OFFLINE"}
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
      <CardContent className="pt-5">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Domínio */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Domínio da Loja
            </label>
            <Input
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="minha-loja.myshopify.com"
              className="h-10 rounded-xl bg-input text-sm font-mono text-foreground"
            />
          </div>

          {/* Access Token */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Admin API Access Token
            </label>
            <div className="relative">
              <Input
                type={showToken ? "text" : "password"}
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="shpat_..."
                className="h-10 rounded-xl bg-input pr-10 text-sm font-mono text-foreground"
              />
              <button
                onClick={() => setShowToken(!showToken)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        <p className="mt-2 text-[10px] text-muted-foreground/70">
          Configurações → Apps → Desenvolver apps → Criar app → Configurar escopos (read_orders) → Instalar → Copiar Access Token
        </p>

        {/* Botões */}
        <div className="mt-4 flex gap-2">
          <Button
            onClick={handleSave}
            disabled={saving}
            variant="outline"
            className="h-10 gap-2 rounded-xl text-sm font-medium"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar
          </Button>
          <Button
            onClick={handleSync}
            disabled={syncing || !isComplete}
            className="h-10 gap-2 rounded-xl text-sm font-medium shadow-md transition-all bg-green-600 hover:bg-green-700 text-white"
          >
            {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Sincronizar
          </Button>
        </div>

        {/* Feedback */}
        {feedback && (
          <div className={`mt-4 flex items-start gap-2 rounded-xl border px-4 py-3 text-sm font-medium ${
            feedback.success
              ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
              : "border-red-500/20 bg-red-500/5 text-red-400"
          }`}>
            {feedback.success ? <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" /> : <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />}
            <span>{feedback.message}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Main Page ──
export default function ConexoesPage() {
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);
  const [logs, setLogs] = useState<ImportLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchData = useCallback(async () => {
    setLoadingLogs(true);
    try {
      const [connRes, logsRes] = await Promise.all([
        fetch("/api/connections").then(r => r.json()).catch(() => ({ connections: [] })),
        fetch("/api/webhooks/logs").then(r => r.json()).catch(() => ({ logs: [] })),
      ]);
      setIntegrations(connRes.connections || []);
      setLogs(logsRes.logs || []);
    } catch {
      console.error("Erro ao buscar dados");
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getIntegration = (name: string) =>
    integrations.find((i) => i.name === name) || null;

  const handleSave = async (name: string, config: Record<string, string>): Promise<boolean> => {
    try {
      const res = await fetch("/api/connections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, config }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchData();
      }
      return data.success;
    } catch {
      return false;
    }
  };

  const handleSync = async (source: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch("/api/connections/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchData();
      }
      return { success: data.success, message: data.message || "Erro desconhecido." };
    } catch {
      return { success: false, message: "Erro de rede. Verifique sua conexão." };
    }
  };

  const webhookEndpoint = typeof window !== "undefined"
    ? `${window.location.origin}/api/webhooks`
    : "https://seu-dominio.vercel.app/api/webhooks";

  const handleCopyEndpoint = () => {
    navigator.clipboard.writeText(webhookEndpoint);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Conexões</h1>
          <p className="text-sm text-muted-foreground">Configure a integração com Shopify para importar rastreamentos</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loadingLogs ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {/* Shopify Card */}
      <div className="grid gap-6">
        <ShopifyCard
          integration={getIntegration("Shopify")}
          onSave={handleSave}
          onSync={handleSync}
        />
      </div>

      {/* Endpoint de Recebimento */}
      <Card className="border-border bg-card">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium text-foreground">Endpoint para receber webhooks externos</p>
            </div>
            <div className="flex items-center gap-2">
              <code className="rounded-lg bg-muted px-3 py-1.5 text-xs font-mono text-muted-foreground">
                {webhookEndpoint}
              </code>
              <button
                onClick={handleCopyEndpoint}
                className="rounded-md p-1.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground/60">
            Use este endpoint se algum serviço externo precisar enviar dados diretamente para o TrackFlow.
          </p>
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
              <p className="text-xs text-muted-foreground/70 mt-1">Sincronize a Shopify ou importe um CSV para ver eventos aqui.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => {
                const isSuccess = log.error_count === 0;
                const sourceLabel =
                  log.source === "shopify" ? "Shopify" :
                  log.source === "csv" ? "CSV Import" :
                  log.source;

                return (
                  <div
                    key={log.id}
                    className="flex items-center justify-between rounded-lg border border-border px-4 py-2.5 hover:bg-muted/50 transition-colors"
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
