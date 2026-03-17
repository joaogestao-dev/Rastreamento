-- Execute este script no painel SQL Server do Supabase (SQL Editor)

-- 1. Cria a extensão para UUID (se não existir)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Tabela packages
CREATE TABLE public.packages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tracking_code text UNIQUE NOT NULL,
  order_id text,
  current_status text NOT NULL DEFAULT 'Em Trânsito',
  last_update timestamp with time zone DEFAULT now(),
  description text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_packages_tracking_code ON public.packages(tracking_code);
CREATE INDEX idx_packages_status ON public.packages(current_status);

-- 3. Tabela tracking_events
CREATE TABLE public.tracking_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  package_id uuid REFERENCES public.packages(id) ON DELETE CASCADE,
  status text NOT NULL,
  description text NOT NULL,
  event_date timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  
  -- Garante que não criaremos eventos duplicados (mesmo pacote, mesmo status, mesma data)
  UNIQUE(package_id, status, event_date)
);

CREATE INDEX idx_events_package_id ON public.tracking_events(package_id);

-- 4. Tabela integrations
CREATE TABLE public.integrations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name text UNIQUE NOT NULL,
  endpoint_url text,
  api_key text,
  is_active boolean DEFAULT true,
  updated_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS (Row Level Security) para segurança
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público (para MVP/Demonstração)
-- Em produção, você limitaria isso apenas a usuários autenticados.
CREATE POLICY "Permitir leitura anonima pacotes" ON public.packages FOR SELECT USING (true);
CREATE POLICY "Permitir insercao anonima pacotes" ON public.packages FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualizacao anonima pacotes" ON public.packages FOR UPDATE USING (true);

CREATE POLICY "Permitir leitura anonima eventos" ON public.tracking_events FOR SELECT USING (true);
CREATE POLICY "Permitir insercao anonima eventos" ON public.tracking_events FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir acesso completo integracoes" ON public.integrations FOR ALL USING (true);
