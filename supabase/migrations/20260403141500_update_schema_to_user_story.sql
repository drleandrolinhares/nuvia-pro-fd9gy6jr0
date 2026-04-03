-- Rename 'criado_em' to 'data_criacao' in the specific tables
ALTER TABLE public.especialidades RENAME COLUMN criado_em TO data_criacao;
ALTER TABLE public.embalagens RENAME COLUMN criado_em TO data_criacao;
ALTER TABLE public.salas RENAME COLUMN criado_em TO data_criacao;

-- Update `referencia_consumo`
DO $DO$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'referencia_consumo_enum') THEN
        CREATE TYPE public.referencia_consumo_enum AS ENUM ('qtd_comprada', 'itens_embalagem');
    END IF;
END
$DO$;

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

ALTER TABLE public.produtos ALTER COLUMN referencia_consumo DROP DEFAULT;

UPDATE public.produtos 
SET referencia_consumo = 'qtd_comprada' 
WHERE referencia_consumo = 'quantidade_comprada' OR referencia_consumo IS NULL;

ALTER TABLE public.produtos 
  ALTER COLUMN referencia_consumo TYPE public.referencia_consumo_enum 
  USING (
    CASE 
      WHEN referencia_consumo = 'quantidade_comprada' THEN 'qtd_comprada'::public.referencia_consumo_enum
      WHEN referencia_consumo = 'itens_embalagem' THEN 'itens_embalagem'::public.referencia_consumo_enum
      WHEN referencia_consumo = 'qtd_comprada' THEN 'qtd_comprada'::public.referencia_consumo_enum
      ELSE 'qtd_comprada'::public.referencia_consumo_enum
    END
  );

ALTER TABLE public.produtos ALTER COLUMN referencia_consumo SET DEFAULT 'qtd_comprada'::public.referencia_consumo_enum;
