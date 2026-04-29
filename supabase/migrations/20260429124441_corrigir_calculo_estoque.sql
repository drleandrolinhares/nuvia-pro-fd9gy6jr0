CREATE OR REPLACE FUNCTION public.trg_atualiza_estoque_entrada()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_ref text;
BEGIN
  SELECT referencia_consumo::text INTO v_ref FROM public.produtos WHERE id = NEW.produto_id;
  
  IF v_ref = 'itens_embalagem' THEN
    UPDATE public.produtos
    SET quantidade_estoque = COALESCE(quantidade_estoque, 0) + (COALESCE(NEW.quantidade_comprada, 0) * COALESCE(NEW.quantidade_embalagem, 1))
    WHERE id = NEW.produto_id;
  ELSE
    UPDATE public.produtos
    SET quantidade_estoque = COALESCE(quantidade_estoque, 0) + COALESCE(NEW.quantidade_comprada, 0)
    WHERE id = NEW.produto_id;
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.trg_atualiza_estoque_ao_finalizar_compra()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_item RECORD;
  v_qtd INT;
BEGIN
  -- From anything to Finalizada -> Add stock
  IF OLD.status IS DISTINCT FROM 'Finalizada' AND NEW.status = 'Finalizada' THEN
    FOR v_item IN SELECT * FROM public.compra_itens WHERE compra_id = NEW.id LOOP
      IF v_item.referencia_consumo = 'itens_embalagem' THEN
        v_qtd := COALESCE(v_item.qtd_comprada, 0) * COALESCE(v_item.itens_embalagem, 1);
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
        v_qtd := COALESCE(v_item.qtd_comprada, 0) * COALESCE(v_item.itens_embalagem, 1);
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
$function$;

CREATE OR REPLACE FUNCTION public.trg_atualiza_estoque_compra_item()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_status text;
  v_qtd_adicionar_new integer := 0;
  v_qtd_adicionar_old integer := 0;
BEGIN
  -- Identify parent status
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    SELECT status INTO v_status FROM public.compras WHERE id = NEW.compra_id;
    IF NEW.referencia_consumo = 'itens_embalagem' THEN
      v_qtd_adicionar_new := COALESCE(NEW.qtd_comprada, 0) * COALESCE(NEW.itens_embalagem, 1);
    ELSE
      v_qtd_adicionar_new := COALESCE(NEW.qtd_comprada, 0);
    END IF;
  END IF;

  IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
    SELECT status INTO v_status FROM public.compras WHERE id = OLD.compra_id;
    IF OLD.referencia_consumo = 'itens_embalagem' THEN
      v_qtd_adicionar_old := COALESCE(OLD.qtd_comprada, 0) * COALESCE(OLD.itens_embalagem, 1);
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
$function$;
