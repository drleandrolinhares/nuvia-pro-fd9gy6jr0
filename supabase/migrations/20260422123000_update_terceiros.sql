-- Migrate Gestao de Terceiros architecture
CREATE TABLE IF NOT EXISTS public.terceiros_colunas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    categoria_slug TEXT NOT NULL REFERENCES public.terceiros_categorias(slug) ON DELETE CASCADE ON UPDATE CASCADE,
    titulo TEXT NOT NULL,
    cor TEXT NOT NULL DEFAULT 'border-slate-700 bg-slate-800/50',
    ordem INTEGER NOT NULL DEFAULT 0,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.terceiros_colunas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "terceiros_colunas_all" ON public.terceiros_colunas;
CREATE POLICY "terceiros_colunas_all" ON public.terceiros_colunas FOR ALL TO authenticated USING (true) WITH CHECK (true);

DO $DO$
DECLARE
    cat RECORD;
    col_pendente UUID;
    col_exec UUID;
    col_concluido UUID;
BEGIN
    -- Insert/Update categories with new names and slugs
    INSERT INTO public.terceiros_categorias (slug, nome, ordem) VALUES 
    ('laboratorios', 'Laboratórios', 1),
    ('radiologia', 'Radiologia', 2),
    ('outros', 'Outros', 3)
    ON CONFLICT (slug) DO UPDATE SET nome = EXCLUDED.nome, ordem = EXCLUDED.ordem;

    -- Migrate tasks to new category slugs safely
    UPDATE public.terceiros_tarefas SET categoria_slug = 'laboratorios' WHERE categoria_slug = 'proteses';
    UPDATE public.terceiros_tarefas SET categoria_slug = 'radiologia' WHERE categoria_slug = 'exames';

    -- Delete old unused categories
    DELETE FROM public.terceiros_categorias WHERE slug IN ('proteses', 'exames', 'risco-cirurgico');

    -- Seed default columns for each valid category and link existing tasks
    FOR cat IN SELECT slug FROM public.terceiros_categorias LOOP
        IF NOT EXISTS (SELECT 1 FROM public.terceiros_colunas WHERE categoria_slug = cat.slug) THEN
            col_pendente := gen_random_uuid();
            col_exec := gen_random_uuid();
            col_concluido := gen_random_uuid();

            INSERT INTO public.terceiros_colunas (id, categoria_slug, titulo, cor, ordem) VALUES
            (col_pendente, cat.slug, 'Pendente', 'border-slate-700 bg-slate-800/50', 1),
            (col_exec, cat.slug, 'Em Execução', 'border-blue-900 bg-blue-950/30', 2),
            (col_concluido, cat.slug, 'Concluído', 'border-emerald-900 bg-emerald-950/30', 3);

            -- Update existing tasks status string to point to the new UUID column IDs
            UPDATE public.terceiros_tarefas SET status = col_pendente::text WHERE categoria_slug = cat.slug AND status = 'pendente';
            UPDATE public.terceiros_tarefas SET status = col_exec::text WHERE categoria_slug = cat.slug AND status = 'em_execucao';
            UPDATE public.terceiros_tarefas SET status = col_concluido::text WHERE categoria_slug = cat.slug AND status = 'concluido';
        END IF;
    END LOOP;
END $DO$;
