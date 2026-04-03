-- Allow authenticated users to insert/update their own detalhes
DROP POLICY IF EXISTS "colaboradores_detalhes_update" ON public.colaboradores_detalhes;
CREATE POLICY "colaboradores_detalhes_update" ON public.colaboradores_detalhes
  FOR UPDATE TO authenticated 
  USING (usuario_id = auth.uid());

DROP POLICY IF EXISTS "colaboradores_detalhes_insert" ON public.colaboradores_detalhes;
CREATE POLICY "colaboradores_detalhes_insert" ON public.colaboradores_detalhes
  FOR INSERT TO authenticated 
  WITH CHECK (usuario_id = auth.uid());
