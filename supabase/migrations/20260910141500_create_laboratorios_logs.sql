-- Migration: Criar tabela laboratorios_logs para auditoria/log de interação do módulo de laboratórios
-- Data: 2026-09-10
-- RLS por tenant consistente com laboratorios_trabalhos

CREATE TABLE IF NOT EXISTS public.laboratorios_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID DEFAULT public.get_my_tenant_id() REFERENCES public.tenants(id) ON DELETE CASCADE,
  trabalho_id UUID REFERENCES public.laboratorios_trabalhos(id) ON DELETE SET NULL,
  paciente TEXT,
  trabalho TEXT,
  laboratorio TEXT,
  acao TEXT NOT NULL, -- 'ADICIONADO' | 'EDITADO' | 'REMOVIDO' | 'ENTREGUE' | 'CONFIRMADO_LAB' | 'REABERTO'
  detalhes TEXT,
  dados_anteriores JSONB,
  dados_novos JSONB,
  usuario_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  usuario_nome TEXT NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexação para consultas performáticas
CREATE INDEX IF NOT EXISTS idx_laboratorios_logs_tenant ON public.laboratorios_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_laboratorios_logs_trabalho ON public.laboratorios_logs(trabalho_id);
CREATE INDEX IF NOT EXISTS idx_laboratorios_logs_acao ON public.laboratorios_logs(acao);
CREATE INDEX IF NOT EXISTS idx_laboratorios_logs_criado_em ON public.laboratorios_logs(criado_em DESC);

-- Habilitar RLS
ALTER TABLE public.laboratorios_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS padrão do sistema
DROP POLICY IF EXISTS "universal_select_laboratorios_logs" ON public.laboratorios_logs;
CREATE POLICY "universal_select_laboratorios_logs" ON public.laboratorios_logs
  FOR SELECT TO authenticated
  USING (tenant_id = public.get_my_tenant_id() OR public.is_admin());

DROP POLICY IF EXISTS "universal_insert_laboratorios_logs" ON public.laboratorios_logs;
CREATE POLICY "universal_insert_laboratorios_logs" ON public.laboratorios_logs
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = public.get_my_tenant_id() OR public.is_admin());

DROP POLICY IF EXISTS "universal_update_laboratorios_logs" ON public.laboratorios_logs;
CREATE POLICY "universal_update_laboratorios_logs" ON public.laboratorios_logs
  FOR UPDATE TO authenticated
  USING (tenant_id = public.get_my_tenant_id() OR public.is_admin())
  WITH CHECK (tenant_id = public.get_my_tenant_id() OR public.is_admin());

DROP POLICY IF EXISTS "universal_delete_laboratorios_logs" ON public.laboratorios_logs;
CREATE POLICY "universal_delete_laboratorios_logs" ON public.laboratorios_logs
  FOR DELETE TO authenticated
  USING (tenant_id = public.get_my_tenant_id() OR public.is_admin());
