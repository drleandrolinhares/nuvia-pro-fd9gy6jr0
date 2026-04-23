ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS obrigatorio_bonificacao boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.performance_bonificacao_itens (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    descricao text NOT NULL,
    ordem integer NOT NULL DEFAULT 0,
    ativo boolean NOT NULL DEFAULT true,
    criado_em timestamptz NOT NULL DEFAULT now()
);

DROP POLICY IF EXISTS "performance_bonificacao_itens_all" ON public.performance_bonificacao_itens;
CREATE POLICY "performance_bonificacao_itens_all" ON public.performance_bonificacao_itens
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.performance_bonificacao_itens) THEN
    INSERT INTO public.performance_bonificacao_itens (id, descricao, ordem) VALUES 
      ('00000000-0000-0000-0000-000000000001'::uuid, '1. Pontualidade e Assiduidade', 1),
      ('00000000-0000-0000-0000-000000000002'::uuid, '2. Organização do ambiente de trabalho', 2),
      ('00000000-0000-0000-0000-000000000003'::uuid, '3. Uso correto dos EPIs e Uniforme', 3),
      ('00000000-0000-0000-0000-000000000004'::uuid, '4. Cumprimento das rotinas diárias', 4),
      ('00000000-0000-0000-0000-000000000005'::uuid, '5. Preenchimento correto do sistema', 5),
      ('00000000-0000-0000-0000-000000000006'::uuid, '6. Atendimento cordial e proativo', 6),
      ('00000000-0000-0000-0000-000000000007'::uuid, '7. Trabalho em equipe e cooperação', 7),
      ('00000000-0000-0000-0000-000000000008'::uuid, '8. Zelo por materiais e equipamentos', 8),
      ('00000000-0000-0000-0000-000000000009'::uuid, '9. Participação em reuniões e treinamentos', 9);
  END IF;
END $$;
