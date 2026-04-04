CREATE TABLE IF NOT EXISTS public.compra_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  compra_id UUID REFERENCES public.compras(id) ON DELETE CASCADE NOT NULL,
  produto_id UUID REFERENCES public.produtos(id) ON DELETE RESTRICT NOT NULL,
  valor_total NUMERIC NOT NULL DEFAULT 0,
  qtd_comprada INTEGER NOT NULL DEFAULT 0,
  itens_embalagem INTEGER,
  referencia_consumo TEXT,
  valor_unitario NUMERIC NOT NULL DEFAULT 0,
  data_criacao TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.compra_itens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "compra_itens_all" ON public.compra_itens;
CREATE POLICY "compra_itens_all" ON public.compra_itens
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS compra_itens_compra_id_idx ON public.compra_itens USING btree (compra_id);
CREATE INDEX IF NOT EXISTS compra_itens_produto_id_idx ON public.compra_itens USING btree (produto_id);

CREATE OR REPLACE FUNCTION public.trg_atualiza_estoque_compra_item()
RETURNS trigger AS $function$
DECLARE
  v_qtd_adicionar integer;
BEGIN
  IF NEW.referencia_consumo = 'itens_embalagem' THEN
    v_qtd_adicionar := COALESCE(NEW.itens_embalagem, 0);
  ELSE
    v_qtd_adicionar := COALESCE(NEW.qtd_comprada, 0);
  END IF;

  UPDATE public.produtos
  SET quantidade_estoque = COALESCE(quantidade_estoque, 0) + v_qtd_adicionar
  WHERE id = NEW.produto_id;

  RETURN NEW;
END;
$function$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS after_compra_item_insert ON public.compra_itens;
CREATE TRIGGER after_compra_item_insert
  AFTER INSERT ON public.compra_itens
  FOR EACH ROW EXECUTE FUNCTION public.trg_atualiza_estoque_compra_item();
