CREATE TABLE IF NOT EXISTS public.configuracoes_acesso (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seg_inicio text DEFAULT '07:00',
  seg_fim text DEFAULT '19:00',
  ter_inicio text DEFAULT '07:00',
  ter_fim text DEFAULT '19:00',
  qua_inicio text DEFAULT '07:00',
  qua_fim text DEFAULT '19:00',
  qui_inicio text DEFAULT '07:00',
  qui_fim text DEFAULT '19:00',
  sex_inicio text DEFAULT '07:00',
  sex_fim text DEFAULT '19:00',
  sab_inicio text DEFAULT '07:00',
  sab_fim text DEFAULT '12:00',
  atualizado_em timestamptz DEFAULT now()
);

ALTER TABLE public.configuracoes_acesso ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "configuracoes_acesso_all" ON public.configuracoes_acesso;
CREATE POLICY "configuracoes_acesso_all" ON public.configuracoes_acesso 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.configuracoes_acesso) THEN
    INSERT INTO public.configuracoes_acesso (id) VALUES (gen_random_uuid());
  END IF;
END $$;
