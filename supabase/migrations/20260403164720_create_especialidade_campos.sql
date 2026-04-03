CREATE TABLE IF NOT EXISTS public.campos_personalizados (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome text NOT NULL UNIQUE,
    descricao text,
    tipo text DEFAULT 'text',
    data_criacao timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.especialidade_campos (
    especialidade_id uuid REFERENCES public.especialidades(id) ON DELETE CASCADE,
    campo_id uuid REFERENCES public.campos_personalizados(id) ON DELETE CASCADE,
    ativo boolean DEFAULT true,
    PRIMARY KEY (especialidade_id, campo_id)
);

-- RLS
ALTER TABLE public.campos_personalizados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.especialidade_campos ENABLE ROW LEVEL SECURITY;

-- Policies campos_personalizados
DROP POLICY IF EXISTS "campos_personalizados_read" ON public.campos_personalizados;
CREATE POLICY "campos_personalizados_read" ON public.campos_personalizados FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "campos_personalizados_all" ON public.campos_personalizados;
CREATE POLICY "campos_personalizados_all" ON public.campos_personalizados FOR ALL TO authenticated USING (is_admin());

-- Policies especialidade_campos
DROP POLICY IF EXISTS "especialidade_campos_read" ON public.especialidade_campos;
CREATE POLICY "especialidade_campos_read" ON public.especialidade_campos FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "especialidade_campos_all" ON public.especialidade_campos;
CREATE POLICY "especialidade_campos_all" ON public.especialidade_campos FOR ALL TO authenticated USING (is_admin());

-- Seeds
INSERT INTO public.campos_personalizados (nome, tipo) VALUES
    ('Tamanho', 'text'),
    ('Cor', 'text'),
    ('Material', 'text'),
    ('Lote', 'text'),
    ('Validade', 'date'),
    ('Registro ANVISA', 'text'),
    ('Marca', 'text')
ON CONFLICT (nome) DO NOTHING;
