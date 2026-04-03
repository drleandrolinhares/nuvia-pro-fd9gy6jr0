ALTER TABLE public.produtos ADD COLUMN IF NOT EXISTS referencia_consumo TEXT DEFAULT 'quantidade_comprada';

CREATE OR REPLACE FUNCTION public.trg_atualiza_estoque_entrada()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  v_ref text;
BEGIN
  SELECT referencia_consumo INTO v_ref FROM public.produtos WHERE id = NEW.produto_id;
  
  IF v_ref = 'itens_embalagem' THEN
    UPDATE public.produtos
    SET quantidade_estoque = COALESCE(quantidade_estoque, 0) + COALESCE(NEW.quantidade_embalagem, 0)
    WHERE id = NEW.produto_id;
  ELSE
    UPDATE public.produtos
    SET quantidade_estoque = COALESCE(quantidade_estoque, 0) + COALESCE(NEW.quantidade_comprada, 0)
    WHERE id = NEW.produto_id;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Drop potential existing triggers for entry to avoid double counting
DROP TRIGGER IF EXISTS after_entrada_produto ON public.entrada_produtos;
DROP TRIGGER IF EXISTS trg_atualiza_estoque_entrada ON public.entrada_produtos;
DROP TRIGGER IF EXISTS atualiza_estoque_entrada ON public.entrada_produtos;

CREATE TRIGGER after_entrada_produto 
  AFTER INSERT ON public.entrada_produtos 
  FOR EACH ROW 
  EXECUTE FUNCTION public.trg_atualiza_estoque_entrada();
