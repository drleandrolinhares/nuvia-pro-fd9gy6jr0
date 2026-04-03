CREATE TABLE IF NOT EXISTS public.campo_configuracao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    especialidade_id UUID REFERENCES public.especialidades(id) ON DELETE CASCADE,
    campo_id UUID REFERENCES public.campos_personalizados(id) ON DELETE CASCADE,
    label_customizado TEXT,
    ordem INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT true,
    UNIQUE(especialidade_id, campo_id)
);

ALTER TABLE public.campo_configuracao ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "campo_configuracao_all" ON public.campo_configuracao;
CREATE POLICY "campo_configuracao_all" ON public.campo_configuracao FOR ALL TO authenticated USING (true);

-- Insert data for IMPLANTODONTIA
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

  -- Insert into campo_configuracao
  INSERT INTO public.campo_configuracao (especialidade_id, campo_id, label_customizado, ordem, ativo)
  VALUES 
    (v_esp_id, v_campo_marca, 'Marca do Implante', 1, true),
    (v_esp_id, v_campo_diametro, 'Diâmetro do Implante', 2, true),
    (v_esp_id, v_campo_tamanho, 'Tamanho do Implante', 3, true)
  ON CONFLICT (especialidade_id, campo_id) DO UPDATE 
  SET ativo = true, 
      label_customizado = EXCLUDED.label_customizado,
      ordem = EXCLUDED.ordem;

END $do$;
