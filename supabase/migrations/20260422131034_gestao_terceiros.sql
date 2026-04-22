CREATE TABLE IF NOT EXISTS public.terceiros_categorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    ordem INTEGER DEFAULT 0,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.terceiros_tarefas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    categoria_slug TEXT NOT NULL REFERENCES public.terceiros_categorias(slug) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    descricao TEXT,
    paciente_nome TEXT,
    terceiro_nome TEXT,
    status TEXT NOT NULL DEFAULT 'pendente',
    data_prevista DATE,
    ordem INTEGER DEFAULT 0,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW(),
    usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- RLS
ALTER TABLE public.terceiros_categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.terceiros_tarefas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "terceiros_categorias_all" ON public.terceiros_categorias;
CREATE POLICY "terceiros_categorias_all" ON public.terceiros_categorias
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "terceiros_tarefas_all" ON public.terceiros_tarefas;
CREATE POLICY "terceiros_tarefas_all" ON public.terceiros_tarefas
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seed de dados base
INSERT INTO public.terceiros_categorias (nome, slug, ordem) VALUES
  ('Próteses', 'proteses', 1),
  ('Exames Radiológicos', 'exames', 2),
  ('Risco Cirúrgico', 'risco-cirurgico', 3),
  ('Outros', 'outros', 4)
ON CONFLICT (slug) DO NOTHING;

-- Permissão necessária
INSERT INTO public.permissoes (nome, modulo, descricao) VALUES
  ('operacional_terceiros', 'Operacional', 'Acessar Gestão de Terceiros')
ON CONFLICT (nome) DO NOTHING;
