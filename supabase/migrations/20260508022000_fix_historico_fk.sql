DO $$
BEGIN
  -- Cleanup orphaned usuario_id in funil_leads_historico before adding the new constraint
  UPDATE public.funil_leads_historico 
  SET usuario_id = NULL 
  WHERE usuario_id IS NOT NULL 
    AND NOT EXISTS (SELECT 1 FROM public.usuarios WHERE id = funil_leads_historico.usuario_id);

  ALTER TABLE public.funil_leads_historico DROP CONSTRAINT IF EXISTS funil_leads_historico_usuario_id_fkey;
  ALTER TABLE public.funil_leads_historico 
    ADD CONSTRAINT funil_leads_historico_usuario_id_fkey 
    FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE SET NULL;

  -- Same for funil_leads_notas
  UPDATE public.funil_leads_notas 
  SET usuario_id = NULL 
  WHERE usuario_id IS NOT NULL 
    AND NOT EXISTS (SELECT 1 FROM public.usuarios WHERE id = funil_leads_notas.usuario_id);

  ALTER TABLE public.funil_leads_notas DROP CONSTRAINT IF EXISTS funil_leads_notas_usuario_id_fkey;
  ALTER TABLE public.funil_leads_notas 
    ADD CONSTRAINT funil_leads_notas_usuario_id_fkey 
    FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE SET NULL;
END $$;
