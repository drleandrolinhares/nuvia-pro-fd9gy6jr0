CREATE TABLE IF NOT EXISTS public.precificacao_ocupacao_cadeiras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultorio TEXT NOT NULL,
  turno TEXT NOT NULL,
  dia_semana TEXT NOT NULL,
  especialidade TEXT,
  dentista TEXT,
  horas_trabalhadas NUMERIC DEFAULT 0,
  cor TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(consultorio, turno, dia_semana)
);

DROP POLICY IF EXISTS "precificacao_ocupacao_cadeiras_all" ON public.precificacao_ocupacao_cadeiras;
CREATE POLICY "precificacao_ocupacao_cadeiras_all" ON public.precificacao_ocupacao_cadeiras
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.precificacao_ocupacao_cadeiras ENABLE ROW LEVEL SECURITY;
