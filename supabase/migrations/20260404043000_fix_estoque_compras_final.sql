-- 1. Drop existing triggers to avoid conflicts
DROP TRIGGER IF EXISTS after_compra_item_change ON public.compra_itens;
DROP TRIGGER IF EXISTS before_compra_item_delete ON public.compra_itens;
DROP TRIGGER IF EXISTS after_compra_status_change ON public.compras;

-- 2. Trigger function for compra_itens
CREATE OR REPLACE FUNCTION public.trg_atualiza_estoque_compra_item()
RETURNS trigger AS $$
DECLARE
  v_status text;
  v_qtd_adicionar_new integer := 0;
  v_qtd_adicionar_old integer := 0;
BEGIN
  -- Identify parent status
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

  -- If status is not Finalizada, we don't touch the stock
  IF v_status IS DISTINCT FROM 'Finalizada' THEN
    IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
  END IF;

  -- If Finalizada, apply changes
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
      SET quantidade_estoque = GREATEST(0, COALESCE(quantidade_estoque, 0) - v_qtd_adicionar_old)
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
$$ LANGUAGE plpgsql;

-- 3. Create triggers for compra_itens
-- We use BEFORE DELETE to ensure the compras row is fully visible before cascade deletion removes it
CREATE TRIGGER after_compra_item_change
AFTER INSERT OR UPDATE ON public.compra_itens
FOR EACH ROW EXECUTE FUNCTION public.trg_atualiza_estoque_compra_item();

CREATE TRIGGER before_compra_item_delete
BEFORE DELETE ON public.compra_itens
FOR EACH ROW EXECUTE FUNCTION public.trg_atualiza_estoque_compra_item();

-- 4. Trigger function for compras status change
CREATE OR REPLACE FUNCTION public.trg_atualiza_estoque_ao_finalizar_compra()
RETURNS trigger AS $$
DECLARE
  v_item RECORD;
  v_qtd INT;
BEGIN
  -- From anything to Finalizada -> Add stock
  IF OLD.status IS DISTINCT FROM 'Finalizada' AND NEW.status = 'Finalizada' THEN
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
    
  -- From Finalizada to anything -> Revert stock
  ELSIF OLD.status = 'Finalizada' AND NEW.status IS DISTINCT FROM 'Finalizada' THEN
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
$$ LANGUAGE plpgsql;

-- 5. Create trigger for compras
CREATE TRIGGER after_compra_status_change
AFTER UPDATE OF status ON public.compras
FOR EACH ROW EXECUTE FUNCTION public.trg_atualiza_estoque_ao_finalizar_compra();
