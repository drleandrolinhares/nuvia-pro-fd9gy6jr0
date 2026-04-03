-- Add criado_em column to the tables if they don't exist
ALTER TABLE public.especialidades ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.embalagens ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.salas ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ DEFAULT NOW();

-- Fix missing RLS policies for especialidades to allow admin management
DROP POLICY IF EXISTS "especialidades_all" ON public.especialidades;
CREATE POLICY "especialidades_all" ON public.especialidades
  FOR ALL TO authenticated USING (is_admin() OR has_permission('Gerenciar Estoque'::text));
