ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS possui_carteira BOOLEAN NOT NULL DEFAULT true;

-- Update trigger trg_sync_carteira_bonificacao to check possui_carteira
CREATE OR REPLACE FUNCTION public.trg_sync_carteira_bonificacao()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_possui_carteira boolean;
BEGIN
  -- Check if user has carteira
  SELECT possui_carteira INTO v_possui_carteira FROM public.usuarios WHERE id = NEW.usuario_id;
  
  IF COALESCE(v_possui_carteira, true) = false THEN
    RETURN NEW;
  END IF;

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
$function$;
