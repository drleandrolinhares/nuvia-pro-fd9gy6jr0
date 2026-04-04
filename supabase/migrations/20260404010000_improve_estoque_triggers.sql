-- Migration to make inventory triggers robust for UPDATE and DELETE operations

CREATE OR REPLACE FUNCTION public.trg_atualiza_estoque_compra_item()
 RETURNS trigger
 LANGUAGE plpgsql
AS $$
DECLARE
  v_qtd_adicionar_new integer := 0;
  v_qtd_adicionar_old integer := 0;
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.referencia_consumo = 'itens_embalagem' THEN
      v_qtd_adicionar_new := COALESCE(NEW.itens_embalagem, 0);
    ELSE
      v_qtd_adicionar_new := COALESCE(NEW.qtd_comprada, 0);
    END IF;
  END IF;

  IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
    IF OLD.referencia_consumo = 'itens_embalagem' THEN
      v_qtd_adicionar_old := COALESCE(OLD.itens_embalagem, 0);
    ELSE
      v_qtd_adicionar_old := COALESCE(OLD.qtd_comprada, 0);
    END IF;
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
    SET quantidade_estoque = COALESCE(quantidade_estoque, 0) - v_qtd_adicionar_old
    WHERE id = OLD.produto_id;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS after_compra_item_insert ON public.compra_itens;
DROP TRIGGER IF EXISTS after_compra_item_change ON public.compra_itens;

CREATE TRIGGER after_compra_item_change
  AFTER INSERT OR UPDATE OR DELETE ON public.compra_itens
  FOR EACH ROW EXECUTE FUNCTION public.trg_atualiza_estoque_compra_item();

-- Triggers for saida_produtos

CREATE OR REPLACE FUNCTION public.trg_atualiza_estoque_saida()
 RETURNS trigger
 LANGUAGE plpgsql
AS $$
DECLARE
  v_qtd_new integer := 0;
  v_qtd_old integer := 0;
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    v_qtd_new := COALESCE(NEW.quantidade, 0);
  END IF;

  IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
    v_qtd_old := COALESCE(OLD.quantidade, 0);
  END IF;

  IF TG_OP = 'INSERT' THEN
    UPDATE public.produtos
    SET quantidade_estoque = COALESCE(quantidade_estoque, 0) - v_qtd_new
    WHERE id = NEW.produto_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.produto_id = OLD.produto_id THEN
      UPDATE public.produtos
      SET quantidade_estoque = COALESCE(quantidade_estoque, 0) + v_qtd_old - v_qtd_new
      WHERE id = NEW.produto_id;
    ELSE
      UPDATE public.produtos
      SET quantidade_estoque = COALESCE(quantidade_estoque, 0) + v_qtd_old
      WHERE id = OLD.produto_id;
      
      UPDATE public.produtos
      SET quantidade_estoque = COALESCE(quantidade_estoque, 0) - v_qtd_new
      WHERE id = NEW.produto_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.produtos
    SET quantidade_estoque = COALESCE(quantidade_estoque, 0) + v_qtd_old
    WHERE id = OLD.produto_id;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS after_saida_produto ON public.saida_produtos;
DROP TRIGGER IF EXISTS after_saida_produto_change ON public.saida_produtos;

CREATE TRIGGER after_saida_produto_change
  AFTER INSERT OR UPDATE OR DELETE ON public.saida_produtos
  FOR EACH ROW EXECUTE FUNCTION public.trg_atualiza_estoque_saida();
