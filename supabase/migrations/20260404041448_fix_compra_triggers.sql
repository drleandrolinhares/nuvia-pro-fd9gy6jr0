-- 1. Correct existing stock that was prematurely added by Rascunho purchases
DO $$
DECLARE
  v_item RECORD;
  v_qtd INT;
BEGIN
  FOR v_item IN 
    SELECT ci.* FROM public.compra_itens ci
    JOIN public.compras c ON c.id = ci.compra_id
    WHERE c.status = 'Rascunho'
  LOOP
    IF v_item.referencia_consumo = 'itens_embalagem' THEN
      v_qtd := COALESCE(v_item.itens_embalagem, 0);
    ELSE
      v_qtd := COALESCE(v_item.qtd_comprada, 0);
    END IF;
    
    UPDATE public.produtos
    SET quantidade_estoque = GREATEST(0, COALESCE(quantidade_estoque, 0) - v_qtd)
    WHERE id = v_item.produto_id;
  END LOOP;
END $$;

-- 2. Drop existing triggers
DROP TRIGGER IF EXISTS after_compra_item_change ON public.compra_itens;
DROP TRIGGER IF EXISTS after_compra_status_change ON public.compras;

-- 3. Replace the item trigger function
CREATE OR REPLACE FUNCTION public.trg_atualiza_estoque_compra_item()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_qtd_adicionar_new integer := 0;
  v_qtd_adicionar_old integer := 0;
  v_status text;
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    SELECT status INTO v_status FROM public.compras WHERE id = NEW.compra_id;
    IF NEW.referencia_consumo = 'itens_embalagem' THEN
      v_qtd_adicionar_new := COALESCE(NEW.itens_embalagem, 0);
    ELSE
      v_qtd_adicionar_new := COALESCE(NEW.qtd_comprada, 0);
    END IF;
  END IF;

  IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
    SELECT status INTO v_status FROM public.compras WHERE id = OLD.compra_id;
    IF OLD.referencia_consumo = 'itens_embalagem' THEN
      v_qtd_adicionar_old := COALESCE(OLD.itens_embalagem, 0);
    ELSE
      v_qtd_adicionar_old := COALESCE(OLD.qtd_comprada, 0);
    END IF;
  END IF;

  -- Se não for Finalizada, não mexe no estoque agora
  IF v_status IS NULL OR v_status != 'Finalizada' THEN
    IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
  END IF;

  IF TG_OP = 'INSERT' THEN
    UPDATE public.produtos
    SET quantidade_estoque = COALESCE(quantidade_estoque, 0) + v_qtd_adicionar_new
    WHERE id = NEW.produto_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.produto_id = OLD.produto_id THEN
      UPDATE public.produtos
      SET quantidade_estoque = COALESCE(quantidade_estoque, 0) - v_qtd_adicionar_old + v_qtd_adicionar_new
      WHERE id = NEW.produto_id;
    ELSE
      UPDATE public.produtos
      SET quantidade_estoque = COALESCE(quantidade_estoque, 0) - v_qtd_adicionar_old
      WHERE id = OLD.produto_id;
      
      UPDATE public.produtos
      SET quantidade_estoque = COALESCE(quantidade_estoque, 0) + v_qtd_adicionar_new
      WHERE id = NEW.produto_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.produtos
    SET quantidade_estoque = GREATEST(0, COALESCE(quantidade_estoque, 0) - v_qtd_adicionar_old)
    WHERE id = OLD.produto_id;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$function$;

CREATE TRIGGER after_compra_item_change
AFTER INSERT OR DELETE OR UPDATE ON public.compra_itens
FOR EACH ROW EXECUTE FUNCTION public.trg_atualiza_estoque_compra_item();

-- 4. Create trigger for status change
CREATE OR REPLACE FUNCTION public.trg_atualiza_estoque_ao_finalizar_compra()
RETURNS trigger AS $function$
DECLARE
  v_item RECORD;
  v_qtd INT;
BEGIN
  IF OLD.status != 'Finalizada' AND NEW.status = 'Finalizada' THEN
    FOR v_item IN SELECT * FROM public.compra_itens WHERE compra_id = NEW.id LOOP
      IF v_item.referencia_consumo = 'itens_embalagem' THEN
        v_qtd := COALESCE(v_item.itens_embalagem, 0);
      ELSE
        v_qtd := COALESCE(v_item.qtd_comprada, 0);
      END IF;
      
      UPDATE public.produtos
      SET quantidade_estoque = COALESCE(quantidade_estoque, 0) + v_qtd
      WHERE id = v_item.produto_id;
    END LOOP;
  ELSIF OLD.status = 'Finalizada' AND NEW.status != 'Finalizada' THEN
    FOR v_item IN SELECT * FROM public.compra_itens WHERE compra_id = NEW.id LOOP
      IF v_item.referencia_consumo = 'itens_embalagem' THEN
        v_qtd := COALESCE(v_item.itens_embalagem, 0);
      ELSE
        v_qtd := COALESCE(v_item.qtd_comprada, 0);
      END IF;
      
      UPDATE public.produtos
      SET quantidade_estoque = GREATEST(0, COALESCE(quantidade_estoque, 0) - v_qtd)
      WHERE id = v_item.produto_id;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$function$ LANGUAGE plpgsql;

CREATE TRIGGER after_compra_status_change
AFTER UPDATE ON public.compras
FOR EACH ROW EXECUTE FUNCTION public.trg_atualiza_estoque_ao_finalizar_compra();
