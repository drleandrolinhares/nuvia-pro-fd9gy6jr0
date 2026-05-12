CREATE TABLE IF NOT EXISTS public.roteiros_setores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    ordem INTEGER NOT NULL DEFAULT 0,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.roteiros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setor_id UUID NOT NULL REFERENCES public.roteiros_setores(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    objetivo TEXT,
    tipo_comunicacao TEXT NOT NULL,
    conteudo TEXT,
    ordem INTEGER NOT NULL DEFAULT 0,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.roteiros_setores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roteiros ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "roteiros_setores_all" ON public.roteiros_setores;
CREATE POLICY "roteiros_setores_all" ON public.roteiros_setores
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "roteiros_all" ON public.roteiros;
CREATE POLICY "roteiros_all" ON public.roteiros
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.roteiros_setores WHERE nome = 'RECEPÇÃO') THEN
    INSERT INTO public.roteiros_setores (nome, ordem) VALUES ('RECEPÇÃO', 1);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.roteiros_setores WHERE nome = 'COMERCIAL') THEN
    INSERT INTO public.roteiros_setores (nome, ordem) VALUES ('COMERCIAL', 2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.roteiros_setores WHERE nome = 'LEAD/AGENDAMENTO') THEN
    INSERT INTO public.roteiros_setores (nome, ordem) VALUES ('LEAD/AGENDAMENTO', 3);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.roteiros_setores WHERE nome = 'FINANCEIRO') THEN
    INSERT INTO public.roteiros_setores (nome, ordem) VALUES ('FINANCEIRO', 4);
  END IF;
END $$;
