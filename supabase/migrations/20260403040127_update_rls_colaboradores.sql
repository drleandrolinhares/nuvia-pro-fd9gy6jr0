-- Create a helper function to check permission
CREATE OR REPLACE FUNCTION public.has_permission(permission_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $function$
DECLARE
  v_is_admin boolean;
  v_has_user_perm boolean;
  v_has_cargo_perm boolean;
  v_user_id uuid;
BEGIN
  v_is_admin := public.is_admin();
  if v_is_admin then return true; end if;

  v_user_id := auth.uid();
  if v_user_id is null then return false; end if;

  -- check user perms
  SELECT EXISTS (
    SELECT 1 FROM public.usuario_permissoes up
    JOIN public.permissoes p ON p.id = up.permissao_id
    WHERE up.usuario_id = v_user_id AND p.nome = permission_name
  ) INTO v_has_user_perm;

  if v_has_user_perm then return true; end if;

  -- check cargo perms
  SELECT EXISTS (
    SELECT 1 FROM public.usuarios u
    JOIN public.cargo_permissoes cp ON cp.cargo_id = u.cargo_id
    JOIN public.permissoes p ON p.id = cp.permissao_id
    WHERE u.id = v_user_id AND p.nome = permission_name
  ) INTO v_has_cargo_perm;

  return v_has_cargo_perm;
END;
$function$;

-- Drop old policies
DROP POLICY IF EXISTS "usuarios_insert" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_update" ON public.usuarios;
DROP POLICY IF EXISTS "colaboradores_detalhes_all" ON public.colaboradores_detalhes;
DROP POLICY IF EXISTS "colaboradores_detalhes_read" ON public.colaboradores_detalhes;

-- Create new policies
CREATE POLICY "usuarios_insert" ON public.usuarios
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin() OR public.has_permission('Gerenciar Colaboradores'));

CREATE POLICY "usuarios_update" ON public.usuarios
  FOR UPDATE TO authenticated
  USING ((id = auth.uid()) OR public.is_admin() OR public.has_permission('Gerenciar Colaboradores'));

CREATE POLICY "colaboradores_detalhes_all" ON public.colaboradores_detalhes
  FOR ALL TO authenticated
  USING (public.is_admin() OR public.has_permission('Gerenciar Colaboradores'));

CREATE POLICY "colaboradores_detalhes_read" ON public.colaboradores_detalhes
  FOR SELECT TO authenticated
  USING ((usuario_id = auth.uid()) OR public.is_admin() OR public.has_permission('Gerenciar Colaboradores'));
