DO $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.embalagens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS public.salas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL UNIQUE
  );
END $$;

ALTER TABLE public.embalagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "embalagens_read" ON public.embalagens;
CREATE POLICY "embalagens_read" ON public.embalagens FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "embalagens_all" ON public.embalagens;
CREATE POLICY "embalagens_all" ON public.embalagens FOR ALL TO authenticated USING (is_admin() OR has_permission('Gerenciar Estoque'::text));

DROP POLICY IF EXISTS "salas_read" ON public.salas;
CREATE POLICY "salas_read" ON public.salas FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "salas_all" ON public.salas;
CREATE POLICY "salas_all" ON public.salas FOR ALL TO authenticated USING (is_admin() OR has_permission('Gerenciar Estoque'::text));

INSERT INTO public.embalagens (nome) VALUES
  ('Caixa'),
  ('Unidade'),
  ('Frasco'),
  ('Pote'),
  ('Rolo'),
  ('Pacote')
ON CONFLICT (nome) DO NOTHING;

ALTER TABLE public.produtos ADD COLUMN IF NOT EXISTS embalagem_id UUID REFERENCES public.embalagens(id) ON DELETE SET NULL;
ALTER TABLE public.produtos ADD COLUMN IF NOT EXISTS sala_id UUID REFERENCES public.salas(id) ON DELETE SET NULL;

ALTER TABLE public.entrada_produtos ADD COLUMN IF NOT EXISTS data_validade DATE;
ALTER TABLE public.entrada_produtos ADD COLUMN IF NOT EXISTS numero_nfe TEXT;
ALTER TABLE public.entrada_produtos ADD COLUMN IF NOT EXISTS observacoes_criticas TEXT;

DO $$
DECLARE
  v_rec RECORD;
  v_emb_id UUID;
  v_sala_id UUID;
BEGIN
  -- Backfill embalagens para manter a integridade dos dados existentes
  FOR v_rec IN SELECT DISTINCT embalagem FROM public.produtos WHERE embalagem IS NOT NULL AND embalagem <> '' LOOP
    INSERT INTO public.embalagens (nome) VALUES (v_rec.embalagem)
    ON CONFLICT (nome) DO NOTHING;
    
    SELECT id INTO v_emb_id FROM public.embalagens WHERE nome = v_rec.embalagem;
    UPDATE public.produtos SET embalagem_id = v_emb_id WHERE embalagem = v_rec.embalagem;
  END LOOP;

  -- Backfill salas para manter a integridade dos dados existentes
  FOR v_rec IN SELECT DISTINCT sala FROM public.produtos WHERE sala IS NOT NULL AND sala <> '' LOOP
    INSERT INTO public.salas (nome) VALUES (v_rec.sala)
    ON CONFLICT (nome) DO NOTHING;
    
    SELECT id INTO v_sala_id FROM public.salas WHERE nome = v_rec.sala;
    UPDATE public.produtos SET sala_id = v_sala_id WHERE sala = v_rec.sala;
  END LOOP;
END $$;
