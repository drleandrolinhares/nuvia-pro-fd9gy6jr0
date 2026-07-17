-- Ensure the is_admin RPC function exists
-- This is called during the auth flow in fetchProfileData
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'is_super_admin')::boolean,
    false
  ) OR (auth.jwt() ->> 'email') = 'drleandrolinhares@gmail.com'
  OR EXISTS (
    SELECT 1 FROM public.usuarios u
    WHERE u.id = auth.uid()
    AND u.role ILIKE ANY(ARRAY['admin', 'administrador', 'MASTER', 'ceo', 'diretor', 'diretoria', 'gestor'])
  );
$$;
