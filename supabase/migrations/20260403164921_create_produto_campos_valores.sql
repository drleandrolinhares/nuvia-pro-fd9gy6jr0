DO $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.produto_campos_valores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
    campo_id UUID NOT NULL REFERENCES public.campos_personalizados(id) ON DELETE CASCADE,
    valor TEXT,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(produto_id, campo_id)
  );

  DROP POLICY IF EXISTS "produto_campos_valores_all" ON public.produto_campos_valores;
  CREATE POLICY "produto_campos_valores_all" ON public.produto_campos_valores
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

  ALTER TABLE public.produto_campos_valores ENABLE ROW LEVEL SECURITY;
END $$;
