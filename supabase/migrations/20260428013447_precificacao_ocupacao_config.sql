CREATE TABLE IF NOT EXISTS public.precificacao_ocupacao_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL CHECK (tipo IN ('especialidade', 'dentista')),
  nome TEXT NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS precificacao_ocupacao_config_tipo_nome_idx 
ON public.precificacao_ocupacao_config (tipo, nome);

ALTER TABLE public.precificacao_ocupacao_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "precificacao_ocupacao_config_all" ON public.precificacao_ocupacao_config;
CREATE POLICY "precificacao_ocupacao_config_all" ON public.precificacao_ocupacao_config
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DO $DO_BLOCK$
BEGIN
  INSERT INTO public.precificacao_ocupacao_config (id, tipo, nome)
  SELECT gen_random_uuid(), 'especialidade', especialidade
  FROM public.precificacao_ocupacao_cadeiras
  WHERE especialidade IS NOT NULL AND especialidade != ''
  GROUP BY especialidade
  ON CONFLICT (tipo, nome) DO NOTHING;

  INSERT INTO public.precificacao_ocupacao_config (id, tipo, nome)
  SELECT gen_random_uuid(), 'dentista', dentista
  FROM public.precificacao_ocupacao_cadeiras
  WHERE dentista IS NOT NULL AND dentista != ''
  GROUP BY dentista
  ON CONFLICT (tipo, nome) DO NOTHING;
END $DO_BLOCK$;
