-- Ensure RLS policies on configuracoes_acesso allow authenticated users to read
-- This table is queried during the auth flow (fetchProfileData)

ALTER TABLE public.configuracoes_acesso ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "configuracoes_acesso_select" ON public.configuracoes_acesso;
CREATE POLICY "configuracoes_acesso_select" ON public.configuracoes_acesso
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "configuracoes_acesso_insert" ON public.configuracoes_acesso;
CREATE POLICY "configuracoes_acesso_insert" ON public.configuracoes_acesso
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "configuracoes_acesso_update" ON public.configuracoes_acesso;
CREATE POLICY "configuracoes_acesso_update" ON public.configuracoes_acesso
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
