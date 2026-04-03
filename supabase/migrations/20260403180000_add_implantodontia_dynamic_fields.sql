DO $do$
DECLARE
  v_esp_id uuid;
  v_campo_marca uuid;
  v_campo_diametro uuid;
  v_campo_tamanho uuid;
BEGIN
  -- Insert Especialidade
  INSERT INTO public.especialidades (nome) VALUES ('Implantodontia') ON CONFLICT (nome) DO NOTHING;
  SELECT id INTO v_esp_id FROM public.especialidades WHERE nome = 'Implantodontia' LIMIT 1;

  -- Create Campos
  INSERT INTO public.campos_personalizados (nome, tipo, descricao) VALUES ('Marca do Implante', 'select', 'Marca do implante') ON CONFLICT (nome) DO NOTHING;
  SELECT id INTO v_campo_marca FROM public.campos_personalizados WHERE nome = 'Marca do Implante' LIMIT 1;

  INSERT INTO public.campos_personalizados (nome, tipo, descricao) VALUES ('Diâmetro do Implante', 'select', 'Diâmetro do implante') ON CONFLICT (nome) DO NOTHING;
  SELECT id INTO v_campo_diametro FROM public.campos_personalizados WHERE nome = 'Diâmetro do Implante' LIMIT 1;

  INSERT INTO public.campos_personalizados (nome, tipo, descricao) VALUES ('Tamanho do Implante', 'select', 'Tamanho do implante') ON CONFLICT (nome) DO NOTHING;
  SELECT id INTO v_campo_tamanho FROM public.campos_personalizados WHERE nome = 'Tamanho do Implante' LIMIT 1;

  -- Link Campos to Especialidade
  IF v_esp_id IS NOT NULL THEN
    INSERT INTO public.especialidade_campos (especialidade_id, campo_id, ativo, ordem) VALUES (v_esp_id, v_campo_marca, true, 1) ON CONFLICT (especialidade_id, campo_id) DO NOTHING;
    INSERT INTO public.especialidade_campos (especialidade_id, campo_id, ativo, ordem) VALUES (v_esp_id, v_campo_diametro, true, 2) ON CONFLICT (especialidade_id, campo_id) DO NOTHING;
    INSERT INTO public.especialidade_campos (especialidade_id, campo_id, ativo, ordem) VALUES (v_esp_id, v_campo_tamanho, true, 3) ON CONFLICT (especialidade_id, campo_id) DO NOTHING;
  END IF;

  -- Seed data for dropdowns
  INSERT INTO public.marcas_implante (nome) VALUES ('Neodent'), ('Straumann'), ('S.I.N'), ('S.I.N Implant System'), ('Conexão') ON CONFLICT (nome) DO NOTHING;
  INSERT INTO public.diametros_implante (nome) VALUES ('3.5mm'), ('3.75mm'), ('4.0mm'), ('4.3mm'), ('5.0mm') ON CONFLICT (nome) DO NOTHING;
  INSERT INTO public.tamanhos_implante (nome) VALUES ('7mm'), ('8.5mm'), ('10mm'), ('11.5mm'), ('13mm'), ('15mm') ON CONFLICT (nome) DO NOTHING;

END $do$;
