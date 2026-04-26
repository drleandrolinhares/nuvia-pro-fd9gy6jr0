ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS dias_trabalho jsonb DEFAULT '[1, 2, 3, 4, 5]'::jsonb;

CREATE TABLE IF NOT EXISTS public.ausencias (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    data date NOT NULL,
    descricao text NOT NULL,
    tipo text NOT NULL DEFAULT 'feriado',
    usuario_id uuid REFERENCES public.usuarios(id) ON DELETE CASCADE,
    criado_em timestamptz NOT NULL DEFAULT now()
);

DROP POLICY IF EXISTS "ausencias_all" ON public.ausencias;
CREATE POLICY "ausencias_all" ON public.ausencias FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.ausencias ENABLE ROW LEVEL SECURITY;
