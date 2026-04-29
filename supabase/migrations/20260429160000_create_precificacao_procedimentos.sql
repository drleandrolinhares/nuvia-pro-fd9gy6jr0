CREATE TABLE IF NOT EXISTS public.precificacao_procedimentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  especialidade_id UUID NOT NULL REFERENCES public.especialidades(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  valor_cobrado NUMERIC NOT NULL DEFAULT 0,
  tempo_execucao INTEGER NOT NULL DEFAULT 30,
  custo_laboratorio NUMERIC NOT NULL DEFAULT 0,
  custo_material NUMERIC NOT NULL DEFAULT 0,
  honorarios_dentista NUMERIC NOT NULL DEFAULT 0,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.precificacao_globais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  taxa_cartao NUMERIC NOT NULL DEFAULT 3,
  comissao NUMERIC NOT NULL DEFAULT 5,
  inadimplencia NUMERIC NOT NULL DEFAULT 2,
  imposto NUMERIC NOT NULL DEFAULT 6,
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.precificacao_procedimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.precificacao_globais ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "precificacao_procedimentos_all" ON public.precificacao_procedimentos;
CREATE POLICY "precificacao_procedimentos_all" ON public.precificacao_procedimentos FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "precificacao_globais_all" ON public.precificacao_globais;
CREATE POLICY "precificacao_globais_all" ON public.precificacao_globais FOR ALL TO authenticated USING (true) WITH CHECK (true);

INSERT INTO public.precificacao_globais (id, taxa_cartao, comissao, inadimplencia, imposto)
SELECT '00000000-0000-0000-0000-000000000000'::uuid, 3, 5, 2, 6
WHERE NOT EXISTS (SELECT 1 FROM public.precificacao_globais);

DO $$
DECLARE
  v_esp_id uuid;
BEGIN
  -- Clínico Geral
  INSERT INTO public.especialidades (nome) VALUES ('Clínico Geral') ON CONFLICT (nome) DO NOTHING;
  SELECT id INTO v_esp_id FROM public.especialidades WHERE nome = 'Clínico Geral' LIMIT 1;
  IF v_esp_id IS NOT NULL THEN
    INSERT INTO public.precificacao_procedimentos (especialidade_id, nome, valor_cobrado, tempo_execucao, custo_laboratorio, custo_material, honorarios_dentista)
    SELECT v_esp_id, 'Restauração 1 Face', 150, 30, 0, 15, 45 WHERE NOT EXISTS (SELECT 1 FROM public.precificacao_procedimentos WHERE especialidade_id = v_esp_id AND nome = 'Restauração 1 Face');
    
    INSERT INTO public.precificacao_procedimentos (especialidade_id, nome)
    SELECT v_esp_id, 'Restauração 2 Faces' WHERE NOT EXISTS (SELECT 1 FROM public.precificacao_procedimentos WHERE especialidade_id = v_esp_id AND nome = 'Restauração 2 Faces');
    
    INSERT INTO public.precificacao_procedimentos (especialidade_id, nome)
    SELECT v_esp_id, 'Profilaxia' WHERE NOT EXISTS (SELECT 1 FROM public.precificacao_procedimentos WHERE especialidade_id = v_esp_id AND nome = 'Profilaxia');
    
    INSERT INTO public.precificacao_procedimentos (especialidade_id, nome)
    SELECT v_esp_id, 'Clareamento Dental' WHERE NOT EXISTS (SELECT 1 FROM public.precificacao_procedimentos WHERE especialidade_id = v_esp_id AND nome = 'Clareamento Dental');
  END IF;

  -- Endodontia
  INSERT INTO public.especialidades (nome) VALUES ('Endodontia') ON CONFLICT (nome) DO NOTHING;
  SELECT id INTO v_esp_id FROM public.especialidades WHERE nome = 'Endodontia' LIMIT 1;
  IF v_esp_id IS NOT NULL THEN
    INSERT INTO public.precificacao_procedimentos (especialidade_id, nome)
    SELECT v_esp_id, 'Tratamento Canal Anterior' WHERE NOT EXISTS (SELECT 1 FROM public.precificacao_procedimentos WHERE especialidade_id = v_esp_id AND nome = 'Tratamento Canal Anterior');
    
    INSERT INTO public.precificacao_procedimentos (especialidade_id, nome)
    SELECT v_esp_id, 'Tratamento Canal Posterior' WHERE NOT EXISTS (SELECT 1 FROM public.precificacao_procedimentos WHERE especialidade_id = v_esp_id AND nome = 'Tratamento Canal Posterior');
    
    INSERT INTO public.precificacao_procedimentos (especialidade_id, nome)
    SELECT v_esp_id, 'Retratamento' WHERE NOT EXISTS (SELECT 1 FROM public.precificacao_procedimentos WHERE especialidade_id = v_esp_id AND nome = 'Retratamento');
  END IF;

  -- Ortodontia
  INSERT INTO public.especialidades (nome) VALUES ('Ortodontia') ON CONFLICT (nome) DO NOTHING;
  SELECT id INTO v_esp_id FROM public.especialidades WHERE nome = 'Ortodontia' LIMIT 1;
  IF v_esp_id IS NOT NULL THEN
    INSERT INTO public.precificacao_procedimentos (especialidade_id, nome)
    SELECT v_esp_id, 'Manutenção Aparelho Fixo' WHERE NOT EXISTS (SELECT 1 FROM public.precificacao_procedimentos WHERE especialidade_id = v_esp_id AND nome = 'Manutenção Aparelho Fixo');
    
    INSERT INTO public.precificacao_procedimentos (especialidade_id, nome)
    SELECT v_esp_id, 'Aparelho Invisalign' WHERE NOT EXISTS (SELECT 1 FROM public.precificacao_procedimentos WHERE especialidade_id = v_esp_id AND nome = 'Aparelho Invisalign');
  END IF;

  -- Implantodontia
  INSERT INTO public.especialidades (nome) VALUES ('Implantodontia') ON CONFLICT (nome) DO NOTHING;
  SELECT id INTO v_esp_id FROM public.especialidades WHERE nome = 'Implantodontia' LIMIT 1;
  IF v_esp_id IS NOT NULL THEN
    INSERT INTO public.precificacao_procedimentos (especialidade_id, nome)
    SELECT v_esp_id, 'Implante Unitário' WHERE NOT EXISTS (SELECT 1 FROM public.precificacao_procedimentos WHERE especialidade_id = v_esp_id AND nome = 'Implante Unitário');
    
    INSERT INTO public.precificacao_procedimentos (especialidade_id, nome)
    SELECT v_esp_id, 'Protocolo Superior' WHERE NOT EXISTS (SELECT 1 FROM public.precificacao_procedimentos WHERE especialidade_id = v_esp_id AND nome = 'Protocolo Superior');
    
    INSERT INTO public.precificacao_procedimentos (especialidade_id, nome)
    SELECT v_esp_id, 'Enxerto Ósseo' WHERE NOT EXISTS (SELECT 1 FROM public.precificacao_procedimentos WHERE especialidade_id = v_esp_id AND nome = 'Enxerto Ósseo');
  END IF;
END $$;
