-- Ensure RLS policies exist for configuracoes_acesso table
-- This table controls system access hours and must be readable/writable by authenticated admins

-- Enable RLS if not already enabled
ALTER TABLE public.configuracoes_acesso ENABLE ROW LEVEL SECURITY;

-- SELECT: allow authenticated users in the same tenant to read
DROP POLICY IF EXISTS "configuracoes_acesso_select" ON public.configuracoes_acesso;
CREATE POLICY "configuracoes_acesso_select" ON public.configuracoes_acesso
  FOR SELECT TO authenticated
  USING (tenant_id = public.get_my_tenant_id() OR public.is_tenant_admin());

-- INSERT: allow tenant admins to insert
DROP POLICY IF EXISTS "configuracoes_acesso_insert" ON public.configuracoes_acesso;
CREATE POLICY "configuracoes_acesso_insert" ON public.configuracoes_acesso
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = public.get_my_tenant_id() OR public.is_tenant_admin());

-- UPDATE: allow tenant admins to update
DROP POLICY IF EXISTS "configuracoes_acesso_update" ON public.configuracoes_acesso;
CREATE POLICY "configuracoes_acesso_update" ON public.configuracoes_acesso
  FOR UPDATE TO authenticated
  USING (tenant_id = public.get_my_tenant_id() OR public.is_tenant_admin())
  WITH CHECK (tenant_id = public.get_my_tenant_id() OR public.is_tenant_admin());

-- DELETE: allow tenant admins to delete
DROP POLICY IF EXISTS "configuracoes_acesso_delete" ON public.configuracoes_acesso;
CREATE POLICY "configuracoes_acesso_delete" ON public.configuracoes_acesso
  FOR DELETE TO authenticated
  USING (tenant_id = public.get_my_tenant_id() OR public.is_tenant_admin());

-- Ensure RLS policies for configuracoes_negociacao table
ALTER TABLE public.configuracoes_negociacao ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "configuracoes_negociacao_select" ON public.configuracoes_negociacao;
CREATE POLICY "configuracoes_negociacao_select" ON public.configuracoes_negociacao
  FOR SELECT TO authenticated
  USING (tenant_id = public.get_my_tenant_id() OR public.is_tenant_admin());

DROP POLICY IF EXISTS "configuracoes_negociacao_insert" ON public.configuracoes_negociacao;
CREATE POLICY "configuracoes_negociacao_insert" ON public.configuracoes_negociacao
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = public.get_my_tenant_id() OR public.is_tenant_admin());

DROP POLICY IF EXISTS "configuracoes_negociacao_update" ON public.configuracoes_negociacao;
CREATE POLICY "configuracoes_negociacao_update" ON public.configuracoes_negociacao
  FOR UPDATE TO authenticated
  USING (tenant_id = public.get_my_tenant_id() OR public.is_tenant_admin())
  WITH CHECK (tenant_id = public.get_my_tenant_id() OR public.is_tenant_admin());

-- Ensure RLS policies for descontos_por_prazo table
ALTER TABLE public.descontos_por_prazo ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "descontos_por_prazo_select" ON public.descontos_por_prazo;
CREATE POLICY "descontos_por_prazo_select" ON public.descontos_por_prazo
  FOR SELECT TO authenticated
  USING (tenant_id = public.get_my_tenant_id() OR public.is_tenant_admin());

DROP POLICY IF EXISTS "descontos_por_prazo_insert" ON public.descontos_por_prazo;
CREATE POLICY "descontos_por_prazo_insert" ON public.descontos_por_prazo
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = public.get_my_tenant_id() OR public.is_tenant_admin());

DROP POLICY IF EXISTS "descontos_por_prazo_update" ON public.descontos_por_prazo;
CREATE POLICY "descontos_por_prazo_update" ON public.descontos_por_prazo
  FOR UPDATE TO authenticated
  USING (tenant_id = public.get_my_tenant_id() OR public.is_tenant_admin())
  WITH CHECK (tenant_id = public.get_my_tenant_id() OR public.is_tenant_admin());

DROP POLICY IF EXISTS "descontos_por_prazo_delete" ON public.descontos_por_prazo;
CREATE POLICY "descontos_por_prazo_delete" ON public.descontos_por_prazo
  FOR DELETE TO authenticated
  USING (tenant_id = public.get_my_tenant_id() OR public.is_tenant_admin());

-- Ensure RLS policies for faixas_valores_parcelas table
ALTER TABLE public.faixas_valores_parcelas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "faixas_valores_parcelas_select" ON public.faixas_valores_parcelas;
CREATE POLICY "faixas_valores_parcelas_select" ON public.faixas_valores_parcelas
  FOR SELECT TO authenticated
  USING (tenant_id = public.get_my_tenant_id() OR public.is_tenant_admin());

DROP POLICY IF EXISTS "faixas_valores_parcelas_insert" ON public.faixas_valores_parcelas;
CREATE POLICY "faixas_valores_parcelas_insert" ON public.faixas_valores_parcelas
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = public.get_my_tenant_id() OR public.is_tenant_admin());

DROP POLICY IF EXISTS "faixas_valores_parcelas_update" ON public.faixas_valores_parcelas;
CREATE POLICY "faixas_valores_parcelas_update" ON public.faixas_valores_parcelas
  FOR UPDATE TO authenticated
  USING (tenant_id = public.get_my_tenant_id() OR public.is_tenant_admin())
  WITH CHECK (tenant_id = public.get_my_tenant_id() OR public.is_tenant_admin());

DROP POLICY IF EXISTS "faixas_valores_parcelas_delete" ON public.faixas_valores_parcelas;
CREATE POLICY "faixas_valores_parcelas_delete" ON public.faixas_valores_parcelas
  FOR DELETE TO authenticated
  USING (tenant_id = public.get_my_tenant_id() OR public.is_tenant_admin());

-- Ensure RLS policies for precificacao_globais table
ALTER TABLE public.precificacao_globais ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "precificacao_globais_select" ON public.precificacao_globais;
CREATE POLICY "precificacao_globais_select" ON public.precificacao_globais
  FOR SELECT TO authenticated
  USING (tenant_id = public.get_my_tenant_id() OR public.is_tenant_admin());

DROP POLICY IF EXISTS "precificacao_globais_insert" ON public.precificacao_globais;
CREATE POLICY "precificacao_globais_insert" ON public.precificacao_globais
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = public.get_my_tenant_id() OR public.is_tenant_admin());

DROP POLICY IF EXISTS "precificacao_globais_update" ON public.precificacao_globais;
CREATE POLICY "precificacao_globais_update" ON public.precificacao_globais
  FOR UPDATE TO authenticated
  USING (tenant_id = public.get_my_tenant_id() OR public.is_tenant_admin())
  WITH CHECK (tenant_id = public.get_my_tenant_id() OR public.is_tenant_admin());
