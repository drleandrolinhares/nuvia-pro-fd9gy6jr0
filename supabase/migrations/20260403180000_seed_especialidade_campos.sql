DO $do$
DECLARE
  v_esp_id UUID;
  v_campo_marca UUID;
  v_campo_diametro UUID;
  v_campo_tamanho UUID;
BEGIN
  -- Get or Create IMPLANTODONTIA
  SELECT id INTO v_esp_id FROM public.especialidades WHERE nome ILIKE 'IMPLANTODONTIA' LIMIT 1;
  IF v_esp_id IS NULL THEN
    v_esp_id := gen_random_uuid();
    INSERT INTO public.especialidades (id, nome) VALUES (v_esp_id, 'IMPLANTODONTIA');
  END IF;

  -- Create Campos if not exists
  SELECT id INTO v_campo_marca FROM public.campos_personalizados WHERE nome = 'Marca do Implante' LIMIT 1;
  IF v_campo_marca IS NULL THEN
    v_campo_marca := gen_random_uuid();
    INSERT INTO public.campos_personalizados (id, nome, tipo) VALUES (v_campo_marca, 'Marca do Implante', 'text');
  END IF;

  SELECT id INTO v_campo_diametro FROM public.campos_personalizados WHERE nome = 'Diâmetro do Implante' LIMIT 1;
  IF v_campo_diametro IS NULL THEN
    v_campo_diametro := gen_random_uuid();
    INSERT INTO public.campos_personalizados (id, nome, tipo) VALUES (v_campo_diametro, 'Diâmetro do Implante', 'number');
  END IF;

  SELECT id INTO v_campo_tamanho FROM public.campos_personalizados WHERE nome = 'Tamanho do Implante' LIMIT 1;
  IF v_campo_tamanho IS NULL THEN
    v_campo_tamanho := gen_random_uuid();
    INSERT INTO public.campos_personalizados (id, nome, tipo) VALUES (v_campo_tamanho, 'Tamanho do Implante', 'number');
  END IF;

  -- Insert into especialidade_campos
  INSERT INTO public.especialidade_campos (especialidade_id, campo_id, ordem, ativo)
  VALUES 
    (v_esp_id, v_campo_marca, 1, true),
    (v_esp_id, v_campo_diametro, 2, true),
    (v_esp_id, v_campo_tamanho, 3, true)
  ON CONFLICT (especialidade_id, campo_id) DO UPDATE 
  SET ativo = true, 
      ordem = EXCLUDED.ordem;

END $do$;
