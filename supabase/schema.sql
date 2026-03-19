-- ============================================================
-- TrackFlow — Schema Completo (Supabase)
-- Execute TUDO de uma vez no SQL Editor do Supabase
-- ============================================================

-- Extensões
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ──────────────────────────────────────────────────
-- 1. TABELA: status_categories (Categorias dinâmicas)
-- ──────────────────────────────────────────────────
CREATE TABLE public.status_categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  color text NOT NULL DEFAULT '#6366f1',
  sort_order int DEFAULT 99,
  created_at timestamptz DEFAULT now()
);

-- ──────────────────────────────────────────────────
-- 2. TABELA: packages (Pacotes / Encomendas)
-- ──────────────────────────────────────────────────
CREATE TABLE public.packages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tracking_code text NOT NULL UNIQUE,
  order_id text,
  current_status text NOT NULL DEFAULT 'Em Trânsito',
  last_update timestamptz DEFAULT now(),
  description text,
  source text DEFAULT 'csv',          -- 'csv', 'webhook_reportana', 'webhook_unicodrop', 'api'
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_packages_tracking ON public.packages(tracking_code);
CREATE INDEX idx_packages_status ON public.packages(current_status);
CREATE INDEX idx_packages_updated ON public.packages(updated_at DESC);
CREATE INDEX idx_packages_order ON public.packages(order_id);

-- ──────────────────────────────────────────────────
-- 3. TABELA: tracking_events (Histórico de cada pacote)
-- ──────────────────────────────────────────────────
CREATE TABLE public.tracking_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  package_id uuid REFERENCES public.packages(id) ON DELETE CASCADE,
  status text NOT NULL,
  description text,
  event_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(package_id, status, event_date)
);

CREATE INDEX idx_events_package ON public.tracking_events(package_id);
CREATE INDEX idx_events_date ON public.tracking_events(event_date DESC);
CREATE INDEX idx_events_status ON public.tracking_events(status);

-- ──────────────────────────────────────────────────
-- 4. TABELA: integrations (Conexões externas)
-- ──────────────────────────────────────────────────
CREATE TABLE public.integrations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  type text NOT NULL DEFAULT 'webhook',  -- 'webhook', 'api', 'polling'
  config jsonb DEFAULT '{}',
  is_active boolean DEFAULT false,
  last_sync timestamptz,
  error_count int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ──────────────────────────────────────────────────
-- 5. TABELA: import_logs (Log de importações CSV)
-- ──────────────────────────────────────────────────
CREATE TABLE public.import_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  source text NOT NULL DEFAULT 'csv',
  total_rows int DEFAULT 0,
  success_count int DEFAULT 0,
  error_count int DEFAULT 0,
  errors jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

-- ──────────────────────────────────────────────────
-- 6. TRIGGER: Atualizar updated_at automaticamente
-- ──────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER packages_updated_at
  BEFORE UPDATE ON public.packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER integrations_updated_at
  BEFORE UPDATE ON public.integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ──────────────────────────────────────────────────
-- 7. RLS — Row Level Security (MVP: acesso total)
-- ──────────────────────────────────────────────────
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_packages" ON public.packages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_events" ON public.tracking_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_categories" ON public.status_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_integrations" ON public.integrations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_import_logs" ON public.import_logs FOR ALL USING (true) WITH CHECK (true);

-- ──────────────────────────────────────────────────
-- 8. SEED: Categorias de status padrão (da planilha real)
-- ──────────────────────────────────────────────────
INSERT INTO public.status_categories (name, color, sort_order) VALUES
  ('Importação Autorizada',      '#38bdf8',  1),
  ('Fiscalização',               '#f43f5e',  2),
  ('Taxados',                    '#fbbf24',  3),
  ('Pagamento Confirmado',       '#22c55e',  4),
  ('Importação N Autorizada',    '#ef4444',  5),
  ('Necessidade de Doc',         '#f97316',  6),
  ('Transferências: BR e China', '#a78bfa',  7),
  ('Informações Enviadas',       '#818cf8',  8),
  ('Objeto Selecionado',         '#06b6d4',  9),
  ('Recebidos no Brasil',        '#34d399', 10),
  ('Postado',                    '#84cc16', 11),
  ('Retido',                     '#dc2626', 12),
  ('Carrier Update',             '#8b5cf6', 13),
  ('Devolução Determinada',      '#f87171', 14),
  ('Importação Suspensa',        '#fb923c', 15),
  ('Retirada',                   '#14b8a6', 16),
  ('Ainda Não Chegou a Unid',    '#eab308', 17),
  ('Correção de Rota',           '#ec4899', 18),
  ('Em Trânsito',                '#818cf8', 19),
  ('Liberado',                   '#34d399', 20),
  ('Perdido',                    '#f87171', 21),
  ('Devolvido',                  '#fb923c', 22),
  ('Entregue',                   '#4ade80', 23)
ON CONFLICT (name) DO NOTHING;

-- ──────────────────────────────────────────────────
-- 9. SEED: Integrações padrão
-- ──────────────────────────────────────────────────
INSERT INTO public.integrations (name, type, is_active) VALUES
  ('Webhook Reportana',  'webhook', false),
  ('Webhook Unicodrop',  'webhook', false),
  ('API de Rastreamento', 'api',    false)
ON CONFLICT (name) DO NOTHING;
