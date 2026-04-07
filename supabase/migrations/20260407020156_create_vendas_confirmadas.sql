CREATE TABLE IF NOT EXISTS public.vendas_confirmadas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    oportunidade_id UUID REFERENCES public.avaliacoes(id) ON DELETE CASCADE NOT NULL,
    paciente_nome TEXT NOT NULL,
    telefone TEXT,
    data_original DATE,
    dentista_avaliador UUID REFERENCES public.dentistas_avaliadores(id) ON DELETE SET NULL,
    crc UUID REFERENCES public.crc_comercial(id) ON DELETE SET NULL,
    valor_tratamento NUMERIC NOT NULL,
    tratamento TEXT,
    observacoes TEXT,
    data_fechamento DATE NOT NULL,
    valor_entrada NUMERIC NOT NULL,
    percentual_entrada NUMERIC NOT NULL,
    observacoes_fechamento TEXT,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.vendas_confirmadas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vendas_confirmadas_all" ON public.vendas_confirmadas;
CREATE POLICY "vendas_confirmadas_all" ON public.vendas_confirmadas
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Index
CREATE INDEX IF NOT EXISTS vendas_confirmadas_oportunidade_id_idx ON public.vendas_confirmadas USING btree (oportunidade_id);
