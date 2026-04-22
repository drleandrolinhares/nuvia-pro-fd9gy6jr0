CREATE TABLE IF NOT EXISTS public.normas_internas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  criado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.normas_aceites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  norma_id UUID NOT NULL REFERENCES public.normas_internas(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  aceito_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(norma_id, usuario_id)
);

ALTER TABLE public.normas_internas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.normas_aceites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "normas_internas_select" ON public.normas_internas;
CREATE POLICY "normas_internas_select" ON public.normas_internas FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "normas_internas_insert" ON public.normas_internas;
CREATE POLICY "normas_internas_insert" ON public.normas_internas FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "normas_internas_update" ON public.normas_internas;
CREATE POLICY "normas_internas_update" ON public.normas_internas FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "normas_internas_delete" ON public.normas_internas;
CREATE POLICY "normas_internas_delete" ON public.normas_internas FOR DELETE TO authenticated USING (public.is_admin());


DROP POLICY IF EXISTS "normas_aceites_select" ON public.normas_aceites;
CREATE POLICY "normas_aceites_select" ON public.normas_aceites FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "normas_aceites_insert" ON public.normas_aceites;
CREATE POLICY "normas_aceites_insert" ON public.normas_aceites FOR INSERT TO authenticated WITH CHECK (usuario_id = auth.uid());
