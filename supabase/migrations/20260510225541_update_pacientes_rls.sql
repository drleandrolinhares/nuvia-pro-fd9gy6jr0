-- Drop permissive ALL policy
DROP POLICY IF EXISTS "pacientes_all" ON public.pacientes;

-- Allow everyone to read patients
DROP POLICY IF EXISTS "pacientes_select" ON public.pacientes;
CREATE POLICY "pacientes_select" ON public.pacientes
  FOR SELECT TO authenticated USING (true);

-- Allow everyone to insert patients
DROP POLICY IF EXISTS "pacientes_insert" ON public.pacientes;
CREATE POLICY "pacientes_insert" ON public.pacientes
  FOR INSERT TO authenticated WITH CHECK (true);

-- Restrict updates to admins
DROP POLICY IF EXISTS "pacientes_update" ON public.pacientes;
CREATE POLICY "pacientes_update" ON public.pacientes
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Restrict deletes to admins
DROP POLICY IF EXISTS "pacientes_delete" ON public.pacientes;
CREATE POLICY "pacientes_delete" ON public.pacientes
  FOR DELETE TO authenticated USING (public.is_admin());
