-- CREATE TABLES
CREATE TABLE IF NOT EXISTS public.marcas_implante (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE,
  data_criacao TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.diametros_implante (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE,
  data_criacao TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tamanhos_implante (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE,
  data_criacao TIMESTAMPTZ DEFAULT NOW()
);

-- ENABLE RLS
ALTER TABLE public.marcas_implante ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diametros_implante ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tamanhos_implante ENABLE ROW LEVEL SECURITY;

-- POLICIES FOR marcas_implante
DROP POLICY IF EXISTS "marcas_implante_all" ON public.marcas_implante;
CREATE POLICY "marcas_implante_all" ON public.marcas_implante
  FOR ALL TO authenticated USING (is_admin() OR has_permission('Gerenciar Estoque'::text));

DROP POLICY IF EXISTS "marcas_implante_read" ON public.marcas_implante;
CREATE POLICY "marcas_implante_read" ON public.marcas_implante
  FOR SELECT TO authenticated USING (true);

-- POLICIES FOR diametros_implante
DROP POLICY IF EXISTS "diametros_implante_all" ON public.diametros_implante;
CREATE POLICY "diametros_implante_all" ON public.diametros_implante
  FOR ALL TO authenticated USING (is_admin() OR has_permission('Gerenciar Estoque'::text));

DROP POLICY IF EXISTS "diametros_implante_read" ON public.diametros_implante;
CREATE POLICY "diametros_implante_read" ON public.diametros_implante
  FOR SELECT TO authenticated USING (true);

-- POLICIES FOR tamanhos_implante
DROP POLICY IF EXISTS "tamanhos_implante_all" ON public.tamanhos_implante;
CREATE POLICY "tamanhos_implante_all" ON public.tamanhos_implante
  FOR ALL TO authenticated USING (is_admin() OR has_permission('Gerenciar Estoque'::text));

DROP POLICY IF EXISTS "tamanhos_implante_read" ON public.tamanhos_implante;
CREATE POLICY "tamanhos_implante_read" ON public.tamanhos_implante
  FOR SELECT TO authenticated USING (true);

-- SEED DATA
DO $$
BEGIN
  -- Seed marcas
  INSERT INTO public.marcas_implante (nome) VALUES
    ('Neodent'), ('Straumann'), ('S.I.N.'), ('DSP Biomedical')
  ON CONFLICT (nome) DO NOTHING;

  -- Seed diametros
  INSERT INTO public.diametros_implante (nome) VALUES
    ('3.5 mm'), ('3.75 mm'), ('4.0 mm'), ('4.3 mm'), ('5.0 mm')
  ON CONFLICT (nome) DO NOTHING;

  -- Seed tamanhos
  INSERT INTO public.tamanhos_implante (nome) VALUES
    ('7.0 mm'), ('8.5 mm'), ('10.0 mm'), ('11.5 mm'), ('13.0 mm')
  ON CONFLICT (nome) DO NOTHING;
END $$;
