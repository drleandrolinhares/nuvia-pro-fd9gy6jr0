-- Create config table for Sorriso dos Sonhos
CREATE TABLE IF NOT EXISTS public.sorriso_dos_sonhos_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  valor_bonus NUMERIC NOT NULL DEFAULT 100,
  meta_indicacoes INTEGER NOT NULL DEFAULT 2,
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure only one row exists
CREATE UNIQUE INDEX IF NOT EXISTS sorriso_dos_sonhos_config_single_row ON public.sorriso_dos_sonhos_config ((true));

-- Insert default config
INSERT INTO public.sorriso_dos_sonhos_config (valor_bonus, meta_indicacoes)
SELECT 100, 2
WHERE NOT EXISTS (SELECT 1 FROM public.sorriso_dos_sonhos_config);

-- RLS Policies
ALTER TABLE public.sorriso_dos_sonhos_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_read_config" ON public.sorriso_dos_sonhos_config;
CREATE POLICY "allow_read_config" ON public.sorriso_dos_sonhos_config
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "allow_update_config" ON public.sorriso_dos_sonhos_config;
CREATE POLICY "allow_update_config" ON public.sorriso_dos_sonhos_config
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "allow_insert_config" ON public.sorriso_dos_sonhos_config;
CREATE POLICY "allow_insert_config" ON public.sorriso_dos_sonhos_config
  FOR INSERT TO authenticated WITH CHECK (true);
