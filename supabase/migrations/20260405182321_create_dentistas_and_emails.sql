-- Create dentistas table
CREATE TABLE IF NOT EXISTS public.dentistas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT,
  especialidade TEXT,
  status TEXT DEFAULT 'ativo',
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.dentistas ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policy for dentistas
DROP POLICY IF EXISTS "dentistas_all" ON public.dentistas;
CREATE POLICY "dentistas_all" ON public.dentistas
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Add email column to dentistas_avaliadores
ALTER TABLE public.dentistas_avaliadores ADD COLUMN IF NOT EXISTS email TEXT;

-- Add email column to crc_comercial
ALTER TABLE public.crc_comercial ADD COLUMN IF NOT EXISTS email TEXT;
