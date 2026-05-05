DO $$
DECLARE
  v_especialidade_id uuid;
BEGIN
  -- Higienização: Remover os vínculos de campos com a Clínica Geral,
  -- pois foram adicionados por engano e causam exibição indevida.
  FOR v_especialidade_id IN 
    SELECT id FROM public.especialidades 
    WHERE nome ILIKE '%clínic%' 
       OR nome ILIKE '%clinic%' 
       OR nome ILIKE '%geral%'
  LOOP
    DELETE FROM public.especialidade_campos 
    WHERE especialidade_id = v_especialidade_id;
  END LOOP;
END $$;
