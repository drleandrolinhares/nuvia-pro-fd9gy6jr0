-- Migration: 20261030140000_create_comissao_ajustes.sql
-- Controle de remocao/agendamento de comissoes e auditoria imutavel (NUVIA PRO)
-- Idempotente: seguro para execução no SQL Editor do Supabase

-- 1. Tabela comissao_ajustes
-- Armazena os ajustes realizados nas comissões (canceladas definitivamente ou programadas para data futura)
CREATE TABLE IF NOT EXISTS public.comissao_ajustes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID DEFAULT public.get_my_tenant_id() REFERENCES public.tenants(id) ON DELETE CASCADE,
  comissao_id UUID NOT NULL REFERENCES public.vendas_confirmadas(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('cancelada', 'programada')),
  justificativa TEXT NOT NULL,
  data_programada DATE,
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'pago', 'cancelado', 'revertido')),
  usuario_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  usuario_nome TEXT NOT NULL,
  pago_em TIMESTAMPTZ,
  pago_por UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  cancelado_em TIMESTAMPTZ,
  cancelado_por UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexação para consultas performáticas
CREATE INDEX IF NOT EXISTS idx_comissao_ajustes_tenant ON public.comissao_ajustes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_comissao_ajustes_comissao ON public.comissao_ajustes(comissao_id);
CREATE INDEX IF NOT EXISTS idx_comissao_ajustes_tipo ON public.comissao_ajustes(tipo);
CREATE INDEX IF NOT EXISTS idx_comissao_ajustes_status ON public.comissao_ajustes(status);
CREATE INDEX IF NOT EXISTS idx_comissao_ajustes_data_prog ON public.comissao_ajustes(data_programada);
CREATE INDEX IF NOT EXISTS idx_comissao_ajustes_criado_em ON public.comissao_ajustes(criado_em DESC);

-- Habilitar RLS
ALTER TABLE public.comissao_ajustes ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para comissao_ajustes
DROP POLICY IF EXISTS "universal_select_comissao_ajustes" ON public.comissao_ajustes;
CREATE POLICY "universal_select_comissao_ajustes" ON public.comissao_ajustes
  FOR SELECT TO authenticated
  USING (tenant_id = public.get_my_tenant_id() OR public.is_admin() OR tenant_id IS NULL);

DROP POLICY IF EXISTS "universal_insert_comissao_ajustes" ON public.comissao_ajustes;
CREATE POLICY "universal_insert_comissao_ajustes" ON public.comissao_ajustes
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = public.get_my_tenant_id() OR public.is_admin() OR tenant_id IS NULL);

DROP POLICY IF EXISTS "universal_update_comissao_ajustes" ON public.comissao_ajustes;
CREATE POLICY "universal_update_comissao_ajustes" ON public.comissao_ajustes
  FOR UPDATE TO authenticated
  USING (tenant_id = public.get_my_tenant_id() OR public.is_admin() OR tenant_id IS NULL)
  WITH CHECK (tenant_id = public.get_my_tenant_id() OR public.is_admin() OR tenant_id IS NULL);

DROP POLICY IF EXISTS "universal_delete_comissao_ajustes" ON public.comissao_ajustes;
CREATE POLICY "universal_delete_comissao_ajustes" ON public.comissao_ajustes
  FOR DELETE TO authenticated
  USING (tenant_id = public.get_my_tenant_id() OR public.is_admin() OR tenant_id IS NULL);

-- Gatilho para assegurar que criado_em nunca mude
CREATE OR REPLACE FUNCTION public.trg_preserve_comissao_ajustes_criado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.criado_em = OLD.criado_em;
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_lock_comissao_ajustes_criado_em ON public.comissao_ajustes;
CREATE TRIGGER trg_lock_comissao_ajustes_criado_em
  BEFORE UPDATE ON public.comissao_ajustes
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_preserve_comissao_ajustes_criado_em();

-- 2. Tabela de auditoria imutável comissao_ajuste_logs
CREATE TABLE IF NOT EXISTS public.comissao_ajuste_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID DEFAULT public.get_my_tenant_id() REFERENCES public.tenants(id) ON DELETE CASCADE,
  ajuste_id UUID REFERENCES public.comissao_ajustes(id) ON DELETE SET NULL,
  comissao_id UUID NOT NULL REFERENCES public.vendas_confirmadas(id) ON DELETE CASCADE,
  acao TEXT NOT NULL, -- 'REMOVIDO_CANCELADO' | 'REMOVIDO_PROGRAMADO' | 'DATA_ALTERADA' | 'MARCADO_PAGO' | 'CANCELADO_DEFINITIVO' | 'REVERTIDO'
  justificativa TEXT NOT NULL,
  data_programada_anterior DATE,
  data_programada_nova DATE,
  dados_anteriores JSONB,
  dados_novos JSONB,
  usuario_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  usuario_nome TEXT NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexação para consultas performáticas de auditoria
CREATE INDEX IF NOT EXISTS idx_comissao_ajuste_logs_tenant ON public.comissao_ajuste_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_comissao_ajuste_logs_ajuste ON public.comissao_ajuste_logs(ajuste_id);
CREATE INDEX IF NOT EXISTS idx_comissao_ajuste_logs_comissao ON public.comissao_ajuste_logs(comissao_id);
CREATE INDEX IF NOT EXISTS idx_comissao_ajuste_logs_acao ON public.comissao_ajuste_logs(acao);
CREATE INDEX IF NOT EXISTS idx_comissao_ajuste_logs_criado_em ON public.comissao_ajuste_logs(criado_em DESC);

-- Habilitar RLS em comissao_ajuste_logs
ALTER TABLE public.comissao_ajuste_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para comissao_ajuste_logs
DROP POLICY IF EXISTS "universal_select_comissao_ajuste_logs" ON public.comissao_ajuste_logs;
CREATE POLICY "universal_select_comissao_ajuste_logs" ON public.comissao_ajuste_logs
  FOR SELECT TO authenticated
  USING (tenant_id = public.get_my_tenant_id() OR public.is_admin() OR tenant_id IS NULL);

DROP POLICY IF EXISTS "universal_insert_comissao_ajuste_logs" ON public.comissao_ajuste_logs;
CREATE POLICY "universal_insert_comissao_ajuste_logs" ON public.comissao_ajuste_logs
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = public.get_my_tenant_id() OR public.is_admin() OR tenant_id IS NULL);

-- Bloquear UPDATE e DELETE para garantir imutabilidade dos logs de auditoria
DROP POLICY IF EXISTS "universal_update_comissao_ajuste_logs" ON public.comissao_ajuste_logs;
DROP POLICY IF EXISTS "universal_delete_comissao_ajuste_logs" ON public.comissao_ajuste_logs;

-- Gatilho de banco para assegurar imutabilidade física de comissao_ajuste_logs
CREATE OR REPLACE FUNCTION public.trg_prevent_comissao_ajuste_logs_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Registros de log de auditoria de comissões são imutáveis e não podem ser alterados ou deletados.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_immutable_comissao_ajuste_logs_update ON public.comissao_ajuste_logs;
CREATE TRIGGER trg_immutable_comissao_ajuste_logs_update
  BEFORE UPDATE ON public.comissao_ajuste_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_prevent_comissao_ajuste_logs_mutation();

DROP TRIGGER IF EXISTS trg_immutable_comissao_ajuste_logs_delete ON public.comissao_ajuste_logs;
CREATE TRIGGER trg_immutable_comissao_ajuste_logs_delete
  BEFORE DELETE ON public.comissao_ajuste_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_prevent_comissao_ajuste_logs_mutation();

-- Recarregar cache de esquema do PostgREST para refletir colunas e tabela imediatamente
NOTIFY pgrst, 'reload schema';
