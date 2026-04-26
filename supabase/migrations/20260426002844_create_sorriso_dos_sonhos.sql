CREATE TABLE IF NOT EXISTS public.sorriso_dos_sonhos_indicacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_indicador_id UUID REFERENCES public.pacientes(id) ON DELETE CASCADE,
    nome_indicado TEXT NOT NULL,
    telefone_indicado TEXT,
    colaborador_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pendente',
    valor_premio_paciente NUMERIC DEFAULT 0,
    data_fechamento DATE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP POLICY IF EXISTS "sorriso_dos_sonhos_all" ON public.sorriso_dos_sonhos_indicacoes;
CREATE POLICY "sorriso_dos_sonhos_all" ON public.sorriso_dos_sonhos_indicacoes
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.sorriso_dos_sonhos_indicacoes ENABLE ROW LEVEL SECURITY;
