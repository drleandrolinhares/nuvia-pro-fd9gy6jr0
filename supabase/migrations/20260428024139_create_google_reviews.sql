CREATE TABLE IF NOT EXISTS public.performance_google_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  paciente_nome TEXT NOT NULL,
  data_contato DATE NOT NULL,
  data_comentario DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente',
  mes_referencia TEXT NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.performance_google_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "performance_google_reviews_all" ON public.performance_google_reviews;
CREATE POLICY "performance_google_reviews_all" ON public.performance_google_reviews
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.gerar_adiantamento_mes_google(p_mes text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $$
DECLARE
  v_user RECORD;
BEGIN
  FOR v_user IN SELECT * FROM public.usuarios WHERE possui_carteira = true AND status = 'ativo' LOOP
    IF NOT EXISTS (
      SELECT 1 FROM public.carteira_transacoes 
      WHERE usuario_id = v_user.id 
      AND mes_referencia = p_mes 
      AND descricao = 'Adiantamento Google Avaliações (Meta 5)'
    ) THEN
      INSERT INTO public.carteira_transacoes (usuario_id, tipo, valor, descricao, mes_referencia)
      VALUES (v_user.id, 'credito', 100, 'Adiantamento Google Avaliações (Meta 5)', p_mes);
    END IF;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.processar_fechamento_mes_google(p_mes text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $$
DECLARE
  v_user RECORD;
  v_count integer;
BEGIN
  FOR v_user IN SELECT * FROM public.usuarios WHERE possui_carteira = true AND status = 'ativo' LOOP
    IF EXISTS (
      SELECT 1 FROM public.carteira_transacoes 
      WHERE usuario_id = v_user.id 
      AND mes_referencia = p_mes 
      AND descricao = 'Adiantamento Google Avaliações (Meta 5)'
    ) THEN
      IF NOT EXISTS (
        SELECT 1 FROM public.carteira_transacoes 
        WHERE usuario_id = v_user.id 
        AND mes_referencia = p_mes 
        AND descricao = 'Ajuste de Meta Google (não atingiu 5)'
      ) THEN
        SELECT COUNT(*) INTO v_count 
        FROM public.performance_google_reviews 
        WHERE usuario_id = v_user.id 
          AND status = 'validado' 
          AND mes_referencia = p_mes;
          
        IF v_count < 5 THEN
          INSERT INTO public.carteira_transacoes (usuario_id, tipo, valor, descricao, mes_referencia)
          VALUES (v_user.id, 'debito', 100, 'Ajuste de Meta Google (não atingiu 5)', p_mes);
        END IF;
      END IF;
    END IF;
  END LOOP;
END;
$$;
