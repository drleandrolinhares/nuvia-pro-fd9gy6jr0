CREATE TABLE IF NOT EXISTS public.configuracoes_negociacao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    percentual_entrada_padrao NUMERIC NOT NULL DEFAULT 0,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.faixas_valores_parcelas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    valor_minimo NUMERIC NOT NULL DEFAULT 0,
    valor_maximo NUMERIC NOT NULL,
    max_parcelas INTEGER NOT NULL DEFAULT 1,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.descontos_por_prazo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faixa_numero INTEGER NOT NULL CHECK (faixa_numero BETWEEN 1 AND 4),
    percentual_desconto NUMERIC NOT NULL DEFAULT 0,
    descricao TEXT,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.configuracoes_negociacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faixas_valores_parcelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.descontos_por_prazo ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
DROP POLICY IF EXISTS "configuracoes_negociacao_all" ON public.configuracoes_negociacao;
CREATE POLICY "configuracoes_negociacao_all" ON public.configuracoes_negociacao
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "faixas_valores_parcelas_all" ON public.faixas_valores_parcelas;
CREATE POLICY "faixas_valores_parcelas_all" ON public.faixas_valores_parcelas
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "descontos_por_prazo_all" ON public.descontos_por_prazo;
CREATE POLICY "descontos_por_prazo_all" ON public.descontos_por_prazo
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Dados iniciais (Seed)
DO $$
BEGIN
    INSERT INTO public.configuracoes_negociacao (percentual_entrada_padrao)
    SELECT 30
    WHERE NOT EXISTS (SELECT 1 FROM public.configuracoes_negociacao);

    IF NOT EXISTS (SELECT 1 FROM public.faixas_valores_parcelas) THEN
        INSERT INTO public.faixas_valores_parcelas (valor_minimo, valor_maximo, max_parcelas) VALUES
        (0, 1000, 3),
        (1000.01, 5000, 6),
        (5000.01, 15000, 12),
        (15000.01, 999999, 24);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.descontos_por_prazo) THEN
        INSERT INTO public.descontos_por_prazo (faixa_numero, percentual_desconto, descricao) VALUES
        (1, 10, 'À vista (PIX ou Dinheiro)'),
        (2, 5, 'Parcelado em até 3x'),
        (3, 0, 'Parcelado em até 6x'),
        (4, 0, 'Parcelado acima de 6x');
    END IF;
END $$;
