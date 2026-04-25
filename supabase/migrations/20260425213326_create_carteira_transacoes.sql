CREATE TABLE IF NOT EXISTS public.carteira_transacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL CHECK (tipo IN ('credito', 'debito', 'saque')),
    valor NUMERIC NOT NULL,
    descricao TEXT NOT NULL,
    mes_referencia TEXT NOT NULL,
    origem_id UUID REFERENCES public.performance_bonificacao(id) ON DELETE CASCADE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.carteira_transacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "carteira_transacoes_read" ON public.carteira_transacoes;
CREATE POLICY "carteira_transacoes_read" ON public.carteira_transacoes
    FOR SELECT TO authenticated
    USING (usuario_id = auth.uid() OR is_admin() OR has_permission('operacional_performance'));

DROP POLICY IF EXISTS "carteira_transacoes_insert" ON public.carteira_transacoes;
CREATE POLICY "carteira_transacoes_insert" ON public.carteira_transacoes
    FOR INSERT TO authenticated
    WITH CHECK (usuario_id = auth.uid() OR is_admin() OR has_permission('operacional_performance'));

DROP POLICY IF EXISTS "carteira_transacoes_update" ON public.carteira_transacoes;
CREATE POLICY "carteira_transacoes_update" ON public.carteira_transacoes
    FOR UPDATE TO authenticated
    USING (is_admin() OR has_permission('operacional_performance'));

DROP POLICY IF EXISTS "carteira_transacoes_delete" ON public.carteira_transacoes;
CREATE POLICY "carteira_transacoes_delete" ON public.carteira_transacoes
    FOR DELETE TO authenticated
    USING (is_admin() OR has_permission('operacional_performance'));

-- Create the trigger function
CREATE OR REPLACE FUNCTION public.trg_sync_carteira_bonificacao()
RETURNS trigger AS $func$
BEGIN
  -- Delete old automatic transactions for this origin to recreate them
  DELETE FROM public.carteira_transacoes WHERE origem_id = NEW.id;

  -- Always insert the initial credit of 350 for the month
  INSERT INTO public.carteira_transacoes (usuario_id, tipo, valor, descricao, mes_referencia, origem_id)
  VALUES (NEW.usuario_id, 'credito', 350, 'Crédito: Bonificação Feijão com Arroz - ' || NEW.mes_referencia, NEW.mes_referencia, NEW.id);

  -- If not eligible, insert the debit
  IF NOT NEW.atingiu_meta THEN
    INSERT INTO public.carteira_transacoes (usuario_id, tipo, valor, descricao, mes_referencia, origem_id)
    VALUES (NEW.usuario_id, 'debito', 350, 'Débito: Desclassificação Bonificação Feijão com Arroz', NEW.mes_referencia, NEW.id);
  END IF;

  RETURN NEW;
END;
$func$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS sync_carteira_bonificacao_trigger ON public.performance_bonificacao;
CREATE TRIGGER sync_carteira_bonificacao_trigger
AFTER INSERT OR UPDATE ON public.performance_bonificacao
FOR EACH ROW EXECUTE FUNCTION public.trg_sync_carteira_bonificacao();
