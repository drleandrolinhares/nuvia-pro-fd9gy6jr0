DO $$
BEGIN
  -- 1. Adiciona as colunas id e ordem em especialidade_campos para permitir ordenação dinâmica
  ALTER TABLE public.especialidade_campos ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid();
  ALTER TABLE public.especialidade_campos ADD COLUMN IF NOT EXISTS ordem integer DEFAULT 0;

  -- 2. Adiciona a coluna de opções no campos_personalizados para suportar o tipo dropdown
  ALTER TABLE public.campos_personalizados ADD COLUMN IF NOT EXISTS opcoes jsonb;

  -- 3. Atualiza os registros existentes para terem uma ordem sequencial
  WITH numbered AS (
    SELECT especialidade_id, campo_id, ROW_NUMBER() OVER(PARTITION BY especialidade_id ORDER BY campo_id) as rn
    FROM public.especialidade_campos
  )
  UPDATE public.especialidade_campos ec
  SET ordem = n.rn
  FROM numbered n
  WHERE ec.especialidade_id = n.especialidade_id AND ec.campo_id = n.campo_id;

  -- 4. Cria dados reais (seeds) com os novos tipos solicitados
  INSERT INTO public.campos_personalizados (nome, tipo, opcoes, descricao) 
  VALUES ('Material', 'dropdown', '["Titânio", "Zircônia", "Cerâmica", "Aço Cirúrgico", "Acrílico"]'::jsonb, 'Material de fabricação')
  ON CONFLICT (nome) DO UPDATE SET tipo = 'dropdown', opcoes = EXCLUDED.opcoes;

  INSERT INTO public.campos_personalizados (nome, tipo, opcoes, descricao) 
  VALUES ('Tamanho', 'dropdown', '["P", "M", "G", "Único"]'::jsonb, 'Tamanho da peça')
  ON CONFLICT (nome) DO UPDATE SET tipo = 'dropdown', opcoes = EXCLUDED.opcoes;
  
  INSERT INTO public.campos_personalizados (nome, tipo, opcoes, descricao) 
  VALUES ('Diâmetro', 'number', null, 'Diâmetro em milímetros')
  ON CONFLICT (nome) DO NOTHING;

  -- 5. Vincula os campos às especialidades de Implantodontia como exemplo real
  INSERT INTO public.especialidade_campos (especialidade_id, campo_id, ativo, ordem)
  SELECT e.id, c.id, true, 10
  FROM public.especialidades e
  CROSS JOIN public.campos_personalizados c
  WHERE (e.nome ILIKE '%implante%' OR e.nome ILIKE '%implantodontia%')
    AND c.nome IN ('Material', 'Diâmetro', 'Tamanho')
  ON CONFLICT (especialidade_id, campo_id) DO NOTHING;

END $$;
