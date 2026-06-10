-- Create the consolidated permissions RPC returning UUID-based data
CREATE OR REPLACE FUNCTION public.get_user_consolidated_permissions(p_user_id uuid)
RETURNS TABLE (
  id uuid,
  nome text,
  modulo text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT p.id, p.nome, p.modulo
  FROM public.permissoes p
  WHERE p.id IN (
    -- Direct user permissions
    SELECT up.permissao_id
    FROM public.usuario_permissoes up
    WHERE up.usuario_id = p_user_id
    
    UNION
    
    -- Cargo permissions
    SELECT cp.permissao_id
    FROM public.cargo_permissoes cp
    JOIN public.usuarios u ON (cp.cargo_id = u.cargo_id OR cp.cargo_id = u.cargo_secundario_id)
    WHERE u.id = p_user_id
  );
END;
$$;

-- Update RLS policies to allow SELECT for tenant admins (which includes users with "Acessar Parâmetros Gerais")

-- 1. avaliacoes
DROP POLICY IF EXISTS "avaliacoes_select" ON public.avaliacoes;
CREATE POLICY "avaliacoes_select" ON public.avaliacoes
  FOR SELECT TO authenticated
  USING (tenant_id = public.get_my_tenant_id() OR public.is_tenant_admin());

-- 2. vendas_confirmadas
DROP POLICY IF EXISTS "vendas_confirmadas_select" ON public.vendas_confirmadas;
CREATE POLICY "vendas_confirmadas_select" ON public.vendas_confirmadas
  FOR SELECT TO authenticated
  USING (tenant_id = public.get_my_tenant_id() OR public.is_tenant_admin());

-- 3. funil_leads
DROP POLICY IF EXISTS "funil_leads_select" ON public.funil_leads;
CREATE POLICY "funil_leads_select" ON public.funil_leads
  FOR SELECT TO authenticated
  USING (tenant_id = public.get_my_tenant_id() OR public.is_tenant_admin());

-- 4. performance_bonificacao
DROP POLICY IF EXISTS "performance_bonificacao_select" ON public.performance_bonificacao;
CREATE POLICY "performance_bonificacao_select" ON public.performance_bonificacao
  FOR SELECT TO authenticated
  USING (tenant_id = public.get_my_tenant_id() OR public.is_tenant_admin());

-- 5. sac_demandas
DROP POLICY IF EXISTS "sac_demandas_select" ON public.sac_demandas;
CREATE POLICY "sac_demandas_select" ON public.sac_demandas
  FOR SELECT TO authenticated
  USING (tenant_id = public.get_my_tenant_id() OR public.is_tenant_admin());

-- 6. gestao_fiscal_config
DROP POLICY IF EXISTS "gestao_fiscal_config_select" ON public.gestao_fiscal_config;
CREATE POLICY "gestao_fiscal_config_select" ON public.gestao_fiscal_config
  FOR SELECT TO authenticated
  USING (tenant_id = public.get_my_tenant_id() OR public.is_tenant_admin());
