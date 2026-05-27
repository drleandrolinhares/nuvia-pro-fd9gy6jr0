-- Ensure RLS is enabled on critical permission tables
ALTER TABLE public.permissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuario_permissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cargo_permissoes ENABLE ROW LEVEL SECURITY;

-- Create helper unaccent_string to safely normalize roles in DB comparisons
CREATE OR REPLACE FUNCTION public.unaccent_string(text)
  RETURNS text
  LANGUAGE sql
  IMMUTABLE
  STRICT
AS $function$
  SELECT translate(
    $1,
    'âãäåāăąÁÂÃÄÅĀĂĄèééêëēĕėęĚÉÊËĒĔĖĘìíîïìĩīĭÌÍÎÏÌĨĪĬóôõöōŏőÒÓÔÕÖŌŎŐùúûüũūŭůÙÚÛÜŨŪŬŮ',
    'aaaaaaaAAAAAAAAeeeeeeeeeEEEEEEEEEiiiiiiiiIIIIIIIIoooooooOOOOOOOOuuuuuuuuUUUUUUUU'
  );
$function$;

-- Update is_tenant_admin function to robustly handle role normalization matching UI checks
CREATE OR REPLACE FUNCTION public.is_tenant_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_role      text;
    v_tenant_id uuid;
BEGIN
    v_tenant_id := public.get_my_tenant_id();
    IF v_tenant_id IS NULL THEN RETURN false; END IF;
    SELECT role INTO v_role
    FROM public.usuarios
    WHERE id = auth.uid() AND tenant_id = v_tenant_id;
    
    RETURN LOWER(public.unaccent_string(v_role)) IN (
      'admin', 'administrador', 'administradora', 'ceo', 
      'socio', 'socia', 'gestor', 'gestora', 'diretor', 'diretora'
    );
EXCEPTION
  WHEN OTHERS THEN
    -- Fallback simple check if unaccent_string fails
    RETURN LOWER(v_role) IN ('admin', 'administrador', 'ceo', 'socio', 'gestor', 'diretor');
END;
$function$;

-- Strict SELECT policies (Deny by default unless tenant matches or is super admin)
DROP POLICY IF EXISTS "permissoes_select" ON public.permissoes;
CREATE POLICY "permissoes_select" ON public.permissoes
  FOR SELECT TO authenticated 
  USING (tenant_id = public.get_my_tenant_id() OR public.is_super_admin());

DROP POLICY IF EXISTS "usuario_permissoes_select" ON public.usuario_permissoes;
CREATE POLICY "usuario_permissoes_select" ON public.usuario_permissoes
  FOR SELECT TO authenticated 
  USING (tenant_id = public.get_my_tenant_id() OR public.is_super_admin());

DROP POLICY IF EXISTS "cargo_permissoes_select" ON public.cargo_permissoes;
CREATE POLICY "cargo_permissoes_select" ON public.cargo_permissoes
  FOR SELECT TO authenticated 
  USING (tenant_id = public.get_my_tenant_id() OR public.is_super_admin());

-- Ensure only admins can insert/update/delete permissions
DROP POLICY IF EXISTS "usuario_permissoes_insert" ON public.usuario_permissoes;
CREATE POLICY "usuario_permissoes_insert" ON public.usuario_permissoes
  FOR INSERT TO authenticated 
  WITH CHECK ((tenant_id = public.get_my_tenant_id() AND public.is_tenant_admin()) OR public.is_super_admin());

DROP POLICY IF EXISTS "usuario_permissoes_delete" ON public.usuario_permissoes;
CREATE POLICY "usuario_permissoes_delete" ON public.usuario_permissoes
  FOR DELETE TO authenticated 
  USING ((tenant_id = public.get_my_tenant_id() AND public.is_tenant_admin()) OR public.is_super_admin());

DROP POLICY IF EXISTS "cargo_permissoes_insert" ON public.cargo_permissoes;
CREATE POLICY "cargo_permissoes_insert" ON public.cargo_permissoes
  FOR INSERT TO authenticated 
  WITH CHECK ((tenant_id = public.get_my_tenant_id() AND public.is_tenant_admin()) OR public.is_super_admin());

DROP POLICY IF EXISTS "cargo_permissoes_delete" ON public.cargo_permissoes;
CREATE POLICY "cargo_permissoes_delete" ON public.cargo_permissoes
  FOR DELETE TO authenticated 
  USING ((tenant_id = public.get_my_tenant_id() AND public.is_tenant_admin()) OR public.is_super_admin());
