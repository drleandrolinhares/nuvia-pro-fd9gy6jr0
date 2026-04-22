DO $$
BEGIN
  -- Re-add with ON UPDATE CASCADE to allow slug renaming without constraint violation
  ALTER TABLE public.terceiros_tarefas DROP CONSTRAINT IF EXISTS terceiros_tarefas_categoria_slug_fkey;
  ALTER TABLE public.terceiros_tarefas 
    ADD CONSTRAINT terceiros_tarefas_categoria_slug_fkey 
    FOREIGN KEY (categoria_slug) REFERENCES public.terceiros_categorias(slug) 
    ON UPDATE CASCADE ON DELETE CASCADE;

  -- Update names and slugs according to the new requirements
  UPDATE public.terceiros_categorias SET nome = 'Laboratórios', slug = 'laboratorios' WHERE slug = 'proteses';
  UPDATE public.terceiros_categorias SET nome = 'Radiologia', slug = 'radiologia' WHERE slug = 'exames';
  
  -- Delete "Risco Cirúrgico" completely as requested
  DELETE FROM public.terceiros_categorias WHERE slug = 'risco-cirurgico';
  
  -- Ensure "Outros" exists with proper order
  INSERT INTO public.terceiros_categorias (nome, slug, ordem) 
  VALUES ('Outros', 'outros', 3) 
  ON CONFLICT (slug) DO NOTHING;
END $$;
