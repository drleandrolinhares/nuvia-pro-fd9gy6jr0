-- Add status to fet_pacientes
ALTER TABLE public.fet_pacientes ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ativo';

-- Add tracking columns to fet_procedimentos
ALTER TABLE public.fet_procedimentos ADD COLUMN IF NOT EXISTS concluido_em TIMESTAMPTZ;
ALTER TABLE public.fet_procedimentos ADD COLUMN IF NOT EXISTS concluido_por UUID REFERENCES public.usuarios(id) ON DELETE SET NULL;

-- Create fet_historico table
CREATE TABLE IF NOT EXISTS public.fet_historico (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID REFERENCES public.fet_pacientes(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    acao TEXT NOT NULL,
    detalhes TEXT,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE DEFAULT public.get_my_tenant_id()
);

-- RLS policies for fet_historico
ALTER TABLE public.fet_historico ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "fet_historico_select" ON public.fet_historico;
CREATE POLICY "fet_historico_select" ON public.fet_historico 
  FOR SELECT TO authenticated USING (tenant_id = public.get_my_tenant_id());

DROP POLICY IF EXISTS "fet_historico_insert" ON public.fet_historico;
CREATE POLICY "fet_historico_insert" ON public.fet_historico 
  FOR INSERT TO authenticated WITH CHECK (tenant_id = public.get_my_tenant_id());
