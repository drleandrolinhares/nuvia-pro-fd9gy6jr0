-- Fix RLS policies to ensure robust access control and allow non-admin users to fetch their own permissions and roles.

-- 1. permissoes
DROP POLICY IF EXISTS "permissoes_select" ON public.permissoes;
CREATE POLICY "permissoes_select" ON public.permissoes
  FOR SELECT TO authenticated 
  USING (
    tenant_id = public.get_my_tenant_id() OR 
    tenant_id IS NULL OR 
    public.is_super_admin()
  );

-- 2. cargo_permissoes
DROP POLICY IF EXISTS "cargo_permissoes_select" ON public.cargo_permissoes;
CREATE POLICY "cargo_permissoes_select" ON public.cargo_permissoes
  FOR SELECT TO authenticated 
  USING (
    tenant_id = public.get_my_tenant_id() OR 
    tenant_id IS NULL OR 
    public.is_super_admin()
  );

-- 3. usuario_permissoes
DROP POLICY IF EXISTS "usuario_permissoes_select" ON public.usuario_permissoes;
CREATE POLICY "usuario_permissoes_select" ON public.usuario_permissoes
  FOR SELECT TO authenticated 
  USING (
    tenant_id = public.get_my_tenant_id() OR 
    tenant_id IS NULL OR 
    public.is_super_admin()
  );

-- 4. cargos
DROP POLICY IF EXISTS "cargos_select" ON public.cargos;
CREATE POLICY "cargos_select" ON public.cargos
  FOR SELECT TO authenticated 
  USING (
    tenant_id = public.get_my_tenant_id() OR 
    tenant_id IS NULL OR 
    public.is_super_admin()
  );

-- 5. Ensure users can always read their own profile without blocking
DROP POLICY IF EXISTS "usuarios_read_own" ON public.usuarios;
CREATE POLICY "usuarios_read_own" ON public.usuarios
  FOR SELECT TO authenticated
  USING (
    id = auth.uid() OR
    tenant_id = public.get_my_tenant_id() OR 
    public.is_super_admin()
  );
