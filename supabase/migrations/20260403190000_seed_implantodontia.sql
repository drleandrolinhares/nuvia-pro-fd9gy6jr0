DO $$
DECLARE
  v_especialidade_id uuid;
  v_campo_marca uuid;
  v_campo_diametro uuid;
  v_campo_tamanho uuid;
BEGIN
  -- Ensure column exists (idempotent)
  ALTER TABLE public.especialidade_campos ADD COLUMN IF NOT EXISTS label_customizado TEXT DEFAULT NULL;

  -- 1. Create or get Especialidade: IMPLANTODONTIA
  INSERT INTO public.especialidades (nome) 
  VALUES ('IMPLANTODONTIA')
  ON CONFLICT (nome) DO UPDATE SET nome = EXCLUDED.nome
  RETURNING id INTO v_especialidade_id;

  IF v_especialidade_id IS NULL THEN
    SELECT id INTO v_especialidade_id FROM public.especialidades WHERE nome = 'IMPLANTODONTIA';
  END IF;

  -- 2. Create or get Campos Personalizados
  INSERT INTO public.campos_personalizados (nome, tipo)
  VALUES ('Marca do Implante', 'dropdown')
  ON CONFLICT (nome) DO UPDATE SET nome = EXCLUDED.nome
  RETURNING id INTO v_campo_marca;

  IF v_campo_marca IS NULL THEN
    SELECT id INTO v_campo_marca FROM public.campos_personalizados WHERE nome = 'Marca do Implante';
  END IF;

  INSERT INTO public.campos_personalizados (nome, tipo)
  VALUES ('Diâmetro do Implante', 'dropdown')
  ON CONFLICT (nome) DO UPDATE SET nome = EXCLUDED.nome
  RETURNING id INTO v_campo_diametro;

  IF v_campo_diametro IS NULL THEN
    SELECT id INTO v_campo_diametro FROM public.campos_personalizados WHERE nome = 'Diâmetro do Implante';
  END IF;

  INSERT INTO public.campos_personalizados (nome, tipo)
  VALUES ('Tamanho do Implante', 'dropdown')
  ON CONFLICT (nome) DO UPDATE SET nome = EXCLUDED.nome
  RETURNING id INTO v_campo_tamanho;

  IF v_campo_tamanho IS NULL THEN
    SELECT id INTO v_campo_tamanho FROM public.campos_personalizados WHERE nome = 'Tamanho do Implante';
  END IF;

  -- 3. Link Especialidade to Campos
  INSERT INTO public.especialidade_campos (especialidade_id, campo_id, ativo, ordem, label_customizado)
  VALUES 
    (v_especialidade_id, v_campo_marca, true, 1, NULL),
    (v_especialidade_id, v_campo_diametro, true, 2, NULL),
    (v_especialidade_id, v_campo_tamanho, true, 3, NULL)
  ON CONFLICT (especialidade_id, campo_id) DO NOTHING;

END $$;
