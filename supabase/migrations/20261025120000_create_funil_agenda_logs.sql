-- Migration: 20261025120000_create_funil_agenda_logs.sql
-- Auditoria e carimbo imutavel de agendamentos do funil comercial

-- 1. Colunas adicionais em compromissos para controle de cancelamento e reagendamento
ALTER TABLE public.compromissos 
ADD COLUMN IF NOT EXISTS cancelado_em TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cancelado_por UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS motivo_cancelamento TEXT,
ADD COLUMN IF NOT EXISTS reagendado BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS data_original DATE;

-- 2. Criar tabela de auditoria funil_agenda_logs
CREATE TABLE IF NOT EXISTS public.funil_agenda_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID DEFAULT public.get_my_tenant_id() REFERENCES public.tenants(id) ON DELETE CASCADE,
  compromisso_id UUID REFERENCES public.compromissos(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.funil_leads(id) ON DELETE SET NULL,
  paciente_id UUID REFERENCES public.pacientes(id) ON DELETE SET NULL,
  tipo TEXT NOT NULL DEFAULT 'acao_comercial', -- 'acao_comercial' | 'lead'
  acao TEXT NOT NULL, -- 'CRIADO' | 'REAGENDADO' | 'EDITADO' | 'CONCLUIDO' | 'CANCELADO' | 'REATIVADO'
  detalhes TEXT,
  data_anterior TEXT,
  data_nova TEXT,
  dados_anteriores JSONB,
  dados_novos JSONB,
  usuario_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  usuario_nome TEXT NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexação para consultas performáticas
CREATE INDEX IF NOT EXISTS idx_funil_agenda_logs_tenant ON public.funil_agenda_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_funil_agenda_logs_compromisso ON public.funil_agenda_logs(compromisso_id);
CREATE INDEX IF NOT EXISTS idx_funil_agenda_logs_lead ON public.funil_agenda_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_funil_agenda_logs_paciente ON public.funil_agenda_logs(paciente_id);
CREATE INDEX IF NOT EXISTS idx_funil_agenda_logs_acao ON public.funil_agenda_logs(acao);
CREATE INDEX IF NOT EXISTS idx_funil_agenda_logs_criado_em ON public.funil_agenda_logs(criado_em DESC);

-- Habilitar RLS
ALTER TABLE public.funil_agenda_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS padrão
DROP POLICY IF EXISTS "universal_select_funil_agenda_logs" ON public.funil_agenda_logs;
CREATE POLICY "universal_select_funil_agenda_logs" ON public.funil_agenda_logs
  FOR SELECT TO authenticated
  USING (tenant_id = public.get_my_tenant_id() OR public.is_admin() OR tenant_id IS NULL);

DROP POLICY IF EXISTS "universal_insert_funil_agenda_logs" ON public.funil_agenda_logs;
CREATE POLICY "universal_insert_funil_agenda_logs" ON public.funil_agenda_logs
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = public.get_my_tenant_id() OR public.is_admin() OR tenant_id IS NULL);

-- Bloquear UPDATE e DELETE para garantir imutabilidade dos registros de log
DROP POLICY IF EXISTS "universal_update_funil_agenda_logs" ON public.funil_agenda_logs;
DROP POLICY IF EXISTS "universal_delete_funil_agenda_logs" ON public.funil_agenda_logs;

-- Gatilho de banco para assegurar imutabilidade física de funil_agenda_logs
CREATE OR REPLACE FUNCTION public.trg_prevent_funil_agenda_logs_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Registros de log da agenda são imutáveis e não podem ser alterados ou deletados.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_immutable_funil_agenda_logs_update ON public.funil_agenda_logs;
CREATE TRIGGER trg_immutable_funil_agenda_logs_update
  BEFORE UPDATE ON public.funil_agenda_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_prevent_funil_agenda_logs_mutation();

-- Gatilho para assegurar que criado_em em compromissos nunca mude (carimbo de criação imutável)
CREATE OR REPLACE FUNCTION public.trg_preserve_compromissos_criado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.criado_em = OLD.criado_em;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_lock_compromissos_criado_em ON public.compromissos;
CREATE TRIGGER trg_lock_compromissos_criado_em
  BEFORE UPDATE ON public.compromissos
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_preserve_compromissos_criado_em();

-- Recarregar cache de esquema do PostgREST para refletir colunas e tabela imediatamente
NOTIFY pgrst, 'reload schema';
