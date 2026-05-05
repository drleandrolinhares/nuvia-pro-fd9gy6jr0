CREATE TABLE IF NOT EXISTS public.funil_etapas (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    nome text NOT NULL,
    slug text NOT NULL UNIQUE,
    cor text DEFAULT '#3b82f6',
    ordem integer DEFAULT 0,
    ativo boolean DEFAULT true,
    criado_em timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.funil_temperaturas (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    nome text NOT NULL,
    slug text NOT NULL UNIQUE,
    cor text DEFAULT 'bg-slate-500/10 text-slate-500 border-slate-500/20',
    ordem integer DEFAULT 0,
    ativo boolean DEFAULT true,
    criado_em timestamptz DEFAULT now()
);

ALTER TABLE public.funil_etapas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funil_temperaturas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "funil_etapas_all" ON public.funil_etapas;
CREATE POLICY "funil_etapas_all" ON public.funil_etapas FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "funil_temperaturas_all" ON public.funil_temperaturas;
CREATE POLICY "funil_temperaturas_all" ON public.funil_temperaturas FOR ALL TO authenticated USING (true) WITH CHECK (true);

INSERT INTO public.funil_etapas (nome, slug, cor, ordem) VALUES
('Novos', 'novo', '#3b82f6', 1),
('Não Responde', 'nao_responde', '#64748b', 2),
('Agendado', 'agendado', '#f59e0b', 3),
('Faltou', 'faltou', '#ef4444', 4),
('Atendido', 'atendido', '#10b981', 5),
('Demitido', 'demitido', '#0f172a', 6)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.funil_temperaturas (nome, slug, cor, ordem) VALUES
('Quente', 'quente', 'bg-red-500/10 text-red-500 border-red-500/20', 1),
('Morno', 'morno', 'bg-amber-500/10 text-amber-500 border-amber-500/20', 2),
('Frio', 'frio', 'bg-blue-500/10 text-blue-500 border-blue-500/20', 3)
ON CONFLICT (slug) DO NOTHING;
