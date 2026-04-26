CREATE TABLE IF NOT EXISTS public.sac_demandas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo TEXT NOT NULL CHECK (tipo IN ('reclamacao', 'sugestao')),
    data_recebimento DATE NOT NULL DEFAULT CURRENT_DATE,
    limite_primeiro_contato DATE NOT NULL,
    paciente_nome TEXT NOT NULL,
    quem_recebeu_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    quem_resolve_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'recebido' CHECK (status IN ('recebido', 'sendo_tratado', 'resolvido')),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.sac_demandas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sac_demandas_all" ON public.sac_demandas;
CREATE POLICY "sac_demandas_all" ON public.sac_demandas
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);
