DO $$
BEGIN
  -- Create historico table
  CREATE TABLE IF NOT EXISTS public.funil_leads_historico (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      lead_id UUID REFERENCES public.funil_leads(id) ON DELETE CASCADE NOT NULL,
      usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      acao TEXT NOT NULL,
      detalhes TEXT,
      criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- Create notas table
  CREATE TABLE IF NOT EXISTS public.funil_leads_notas (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      lead_id UUID REFERENCES public.funil_leads(id) ON DELETE CASCADE NOT NULL,
      usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      nota TEXT NOT NULL,
      criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- Add follow-up field
  ALTER TABLE public.funil_leads ADD COLUMN IF NOT EXISTS data_proximo_contato TIMESTAMPTZ;
END $$;

-- RLS
ALTER TABLE public.funil_leads_historico ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "funil_leads_historico_all" ON public.funil_leads_historico;
CREATE POLICY "funil_leads_historico_all" ON public.funil_leads_historico FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.funil_leads_notas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "funil_leads_notas_all" ON public.funil_leads_notas;
CREATE POLICY "funil_leads_notas_all" ON public.funil_leads_notas FOR ALL TO authenticated USING (true) WITH CHECK (true);
