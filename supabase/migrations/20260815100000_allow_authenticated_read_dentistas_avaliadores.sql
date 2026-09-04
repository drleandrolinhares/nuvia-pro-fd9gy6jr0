-- Migration: Permissão de leitura irrestrita para usuários autenticados em dentistas_avaliadores
-- Mantém mutações (INSERT, UPDATE, DELETE) restritas a administradores ou super administradores.

-- Habilita RLS caso ainda não esteja habilitado
ALTER TABLE public.dentistas_avaliadores ENABLE ROW LEVEL SECURITY;

-- 1. Leitura: Qualquer usuário autenticado pode ler todos os dentistas avaliadores
DROP POLICY IF EXISTS "dentistas_avaliadores_select" ON public.dentistas_avaliadores;
DROP POLICY IF EXISTS "dentistas_avaliadores_select_all" ON public.dentistas_avaliadores;
DROP POLICY IF EXISTS "universal_select" ON public.dentistas_avaliadores;
DROP POLICY IF EXISTS "dentistas_avaliadores_all" ON public.dentistas_avaliadores;

CREATE POLICY "dentistas_avaliadores_select" ON public.dentistas_avaliadores
  FOR SELECT TO authenticated
  USING (true);

-- 2. Escrita: INSERT restrito a administradores
DROP POLICY IF EXISTS "dentistas_avaliadores_insert" ON public.dentistas_avaliadores;
DROP POLICY IF EXISTS "universal_insert" ON public.dentistas_avaliadores;

CREATE POLICY "dentistas_avaliadores_insert" ON public.dentistas_avaliadores
  FOR INSERT TO authenticated
  WITH CHECK (
    COALESCE(public.is_admin(), false) OR 
    COALESCE(public.is_tenant_admin(), false) OR 
    COALESCE(public.is_super_admin(), false)
  );

-- 3. Escrita: UPDATE restrito a administradores
DROP POLICY IF EXISTS "dentistas_avaliadores_update" ON public.dentistas_avaliadores;
DROP POLICY IF EXISTS "universal_update" ON public.dentistas_avaliadores;

CREATE POLICY "dentistas_avaliadores_update" ON public.dentistas_avaliadores
  FOR UPDATE TO authenticated
  USING (
    COALESCE(public.is_admin(), false) OR 
    COALESCE(public.is_tenant_admin(), false) OR 
    COALESCE(public.is_super_admin(), false)
  )
  WITH CHECK (
    COALESCE(public.is_admin(), false) OR 
    COALESCE(public.is_tenant_admin(), false) OR 
    COALESCE(public.is_super_admin(), false)
  );

-- 4. Escrita: DELETE restrito a administradores
DROP POLICY IF EXISTS "dentistas_avaliadores_delete" ON public.dentistas_avaliadores;
DROP POLICY IF EXISTS "universal_delete" ON public.dentistas_avaliadores;

CREATE POLICY "dentistas_avaliadores_delete" ON public.dentistas_avaliadores
  FOR DELETE TO authenticated
  USING (
    COALESCE(public.is_admin(), false) OR 
    COALESCE(public.is_tenant_admin(), false) OR 
    COALESCE(public.is_super_admin(), false)
  );
