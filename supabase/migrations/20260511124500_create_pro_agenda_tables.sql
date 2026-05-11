CREATE TABLE IF NOT EXISTS public.pro_agenda_procedimentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pro_agenda_tempos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  procedimento_id UUID NOT NULL REFERENCES public.pro_agenda_procedimentos(id) ON DELETE CASCADE,
  dentista_id UUID NOT NULL REFERENCES public.dentistas(id) ON DELETE CASCADE,
  tempo_minutos INTEGER NOT NULL DEFAULT 30,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(procedimento_id, dentista_id)
);

ALTER TABLE public.pro_agenda_procedimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pro_agenda_tempos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pro_agenda_procedimentos_all" ON public.pro_agenda_procedimentos;
CREATE POLICY "pro_agenda_procedimentos_all" ON public.pro_agenda_procedimentos 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "pro_agenda_tempos_all" ON public.pro_agenda_tempos;
CREATE POLICY "pro_agenda_tempos_all" ON public.pro_agenda_tempos 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.pro_agenda_procedimentos WHERE nome = 'Avaliação Inicial') THEN
    INSERT INTO public.pro_agenda_procedimentos (id, nome, descricao)
    VALUES (
      'f11894d7-4632-4d57-b088-3fc8e030e20e'::uuid, 
      'Avaliação Inicial', 
      'Primeira consulta do paciente para levantamento de necessidades clínicas, registro fotográfico e apresentação do orçamento e opções de tratamento.'
    )
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
