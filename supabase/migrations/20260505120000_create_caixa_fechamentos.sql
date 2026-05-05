-- create_caixa_fechamentos
CREATE TABLE IF NOT EXISTS public.caixa_diario_fechamentos (
    data_referencia DATE PRIMARY KEY,
    conferido BOOLEAN NOT NULL DEFAULT false,
    conferido_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    conferido_em TIMESTAMPTZ,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.caixa_diario_fechamentos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "caixa_diario_fechamentos_all" ON public.caixa_diario_fechamentos;
CREATE POLICY "caixa_diario_fechamentos_all" ON public.caixa_diario_fechamentos
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
