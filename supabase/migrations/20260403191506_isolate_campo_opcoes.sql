DO $$
DECLARE
  r RECORD;
  s RECORD;
BEGIN
  -- Migra opções globais (especialidade_id IS NULL) para opções específicas por especialidade
  -- Isso garante que as opções antigas sejam preservadas, mas totalmente isoladas
  FOR r IN SELECT * FROM public.campo_opcoes WHERE especialidade_id IS NULL LOOP
    FOR s IN SELECT especialidade_id FROM public.especialidade_campos WHERE campo_id = r.campo_id AND ativo = true LOOP
      -- Insere uma cópia para esta especialidade se não existir
      IF NOT EXISTS (
        SELECT 1 FROM public.campo_opcoes 
        WHERE campo_id = r.campo_id AND especialidade_id = s.especialidade_id AND nome = r.nome
      ) THEN
        INSERT INTO public.campo_opcoes (campo_id, especialidade_id, nome, data_criacao)
        VALUES (r.campo_id, s.especialidade_id, r.nome, r.data_criacao);
      END IF;
    END LOOP;
    
    -- Exclui a opção global original para evitar dados misturados
    DELETE FROM public.campo_opcoes WHERE id = r.id;
  END LOOP;
END $$;
