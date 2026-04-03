CREATE TABLE IF NOT EXISTS public.campo_opcoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campo_id uuid NOT NULL REFERENCES public.campos_personalizados(id) ON DELETE CASCADE,
  nome text NOT NULL,
  data_criacao timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS campo_opcoes_campo_id_idx ON public.campo_opcoes(campo_id);

ALTER TABLE public.campo_opcoes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "campo_opcoes_all" ON public.campo_opcoes;
CREATE POLICY "campo_opcoes_all" ON public.campo_opcoes FOR ALL TO authenticated USING (true) WITH CHECK (true);

DO $$
DECLARE
  v_esp_id uuid;
  v_marca_id uuid;
  v_diametro_id uuid;
  v_tamanho_id uuid;
BEGIN
  -- Insert or get Especialidade IMPLANTODONTIA
  INSERT INTO public.especialidades (id, nome)
  VALUES (gen_random_uuid(), 'IMPLANTODONTIA')
  ON CONFLICT (nome) DO NOTHING;

  SELECT id INTO v_esp_id FROM public.especialidades WHERE nome = 'IMPLANTODONTIA' LIMIT 1;

  -- Ensure Campos exist
  INSERT INTO public.campos_personalizados (id, nome, tipo)
  VALUES 
    (gen_random_uuid(), 'Marca do Implante', 'select'),
    (gen_random_uuid(), 'Diâmetro do Implante', 'select'),
    (gen_random_uuid(), 'Tamanho do Implante', 'select')
  ON CONFLICT (nome) DO UPDATE SET tipo = 'select';

  SELECT id INTO v_marca_id FROM public.campos_personalizados WHERE nome = 'Marca do Implante' LIMIT 1;
  SELECT id INTO v_diametro_id FROM public.campos_personalizados WHERE nome = 'Diâmetro do Implante' LIMIT 1;
  SELECT id INTO v_tamanho_id FROM public.campos_personalizados WHERE nome = 'Tamanho do Implante' LIMIT 1;

  -- Link fields to specialty
  IF v_esp_id IS NOT NULL THEN
    INSERT INTO public.especialidade_campos (especialidade_id, campo_id, ativo, ordem)
    VALUES 
      (v_esp_id, v_marca_id, true, 1),
      (v_esp_id, v_diametro_id, true, 2),
      (v_esp_id, v_tamanho_id, true, 3)
    ON CONFLICT (especialidade_id, campo_id) DO NOTHING;
  END IF;

  -- Migrate existing data if available
  INSERT INTO public.campo_opcoes (campo_id, nome, data_criacao)
  SELECT v_marca_id, nome, data_criacao FROM public.marcas_implante
  ON CONFLICT DO NOTHING;

  INSERT INTO public.campo_opcoes (campo_id, nome, data_criacao)
  SELECT v_diametro_id, nome, data_criacao FROM public.diametros_implante
  ON CONFLICT DO NOTHING;

  INSERT INTO public.campo_opcoes (campo_id, nome, data_criacao)
  SELECT v_tamanho_id, nome, data_criacao FROM public.tamanhos_implante
  ON CONFLICT DO NOTHING;
END $$;
