ALTER TABLE public.sac_demandas
ADD COLUMN IF NOT EXISTS descricao TEXT,
ADD COLUMN IF NOT EXISTS setor TEXT,
ADD COLUMN IF NOT EXISTS data_prevista DATE;

CREATE TABLE IF NOT EXISTS public.sac_configuracoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    orientacao_status TEXT NOT NULL DEFAULT 'STATUS: este campo deve ser alterado pela pessoa responsável pela solução da demanda. Ao tomar ciência e mudar para SENDO TRATADO, mostra para todos os gestores e colaboradores que você já tem ciência da situação e que resolverá.',
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default row idempotently
INSERT INTO public.sac_configuracoes (id)
SELECT '00000000-0000-0000-0000-000000000001'::uuid
WHERE NOT EXISTS (SELECT 1 FROM public.sac_configuracoes);

ALTER TABLE public.sac_configuracoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sac_configuracoes_all" ON public.sac_configuracoes;
CREATE POLICY "sac_configuracoes_all" ON public.sac_configuracoes
FOR ALL TO authenticated USING (true) WITH CHECK (true);
