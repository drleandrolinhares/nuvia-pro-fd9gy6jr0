ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS elegivel_ferias BOOLEAN DEFAULT false;

CREATE TABLE IF NOT EXISTS public.rh_ferias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE NOT NULL,
    periodo_inicio DATE NOT NULL,
    periodo_fim DATE NOT NULL,
    prazo_limite DATE NOT NULL,
    dias_direito INTEGER NOT NULL DEFAULT 30,
    dias_gozados INTEGER NOT NULL DEFAULT 0,
    historico JSONB DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'pendente',
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.rh_ferias ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rh_ferias_all" ON public.rh_ferias;
CREATE POLICY "rh_ferias_all" ON public.rh_ferias FOR ALL TO authenticated USING (true) WITH CHECK (true);
