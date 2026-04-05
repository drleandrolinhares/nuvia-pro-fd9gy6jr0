ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS cargo_secundario_id uuid REFERENCES public.cargos(id) ON DELETE SET NULL;

CREATE OR REPLACE FUNCTION public.has_permission(permission_name text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_is_admin boolean;
  v_has_user_perm boolean;
  v_has_cargo_perm boolean;
  v_user_id uuid;
BEGIN
  v_is_admin := public.is_admin();
  if v_is_admin then return true; end if;

  v_user_id := auth.uid();
  if v_user_id is null then return false; end if;

  -- check user perms
  SELECT EXISTS (
    SELECT 1 FROM public.usuario_permissoes up
    JOIN public.permissoes p ON p.id = up.permissao_id
    WHERE up.usuario_id = v_user_id AND p.nome = permission_name
  ) INTO v_has_user_perm;

  if v_has_user_perm then return true; end if;

  -- check cargo perms (primary or secondary)
  SELECT EXISTS (
    SELECT 1 FROM public.usuarios u
    JOIN public.cargo_permissoes cp ON (cp.cargo_id = u.cargo_id OR cp.cargo_id = u.cargo_secundario_id)
    JOIN public.permissoes p ON p.id = cp.permissao_id
    WHERE u.id = v_user_id AND p.nome = permission_name
  ) INTO v_has_cargo_perm;

  return v_has_cargo_perm;
END;
$function$;

CREATE OR REPLACE FUNCTION public.ativar_cascata_dentista_avaliador()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_cargo_nome text;
  v_cargo_secundario_nome text;
BEGIN
  IF NEW.cargo_id IS NOT NULL THEN
    SELECT nome INTO v_cargo_nome FROM public.cargos WHERE id = NEW.cargo_id;
  END IF;

  IF NEW.cargo_secundario_id IS NOT NULL THEN
    SELECT nome INTO v_cargo_secundario_nome FROM public.cargos WHERE id = NEW.cargo_secundario_id;
  END IF;
  
  IF v_cargo_nome = 'Dentista Avaliador' OR v_cargo_secundario_nome = 'Dentista Avaliador' THEN
    IF NOT EXISTS (SELECT 1 FROM public.dentistas_avaliadores WHERE usuario_id = NEW.id) THEN
      INSERT INTO public.dentistas_avaliadores (usuario_id, nome, email, status)
      VALUES (NEW.id, NEW.nome, NEW.email, COALESCE(NEW.status, 'ativo'));
    ELSE
      UPDATE public.dentistas_avaliadores 
      SET nome = NEW.nome, email = NEW.email, status = COALESCE(NEW.status, 'ativo')
      WHERE usuario_id = NEW.id;
    END IF;
  END IF;
  
  IF v_cargo_nome = 'Dentista' OR v_cargo_secundario_nome = 'Dentista' THEN
    IF NOT EXISTS (SELECT 1 FROM public.dentistas WHERE usuario_id = NEW.id) THEN
      INSERT INTO public.dentistas (usuario_id, nome, email, status)
      VALUES (NEW.id, NEW.nome, NEW.email, COALESCE(NEW.status, 'ativo'));
    ELSE
      UPDATE public.dentistas 
      SET nome = NEW.nome, email = NEW.email, status = COALESCE(NEW.status, 'ativo')
      WHERE usuario_id = NEW.id;
    END IF;
  END IF;
  
  IF v_cargo_nome IN ('CRC', 'CRC Comercial') OR v_cargo_secundario_nome IN ('CRC', 'CRC Comercial') THEN
    IF NOT EXISTS (SELECT 1 FROM public.crc_comercial WHERE usuario_id = NEW.id) THEN
      INSERT INTO public.crc_comercial (usuario_id, nome, email, status)
      VALUES (NEW.id, NEW.nome, NEW.email, COALESCE(NEW.status, 'ativo'));
    ELSE
      UPDATE public.crc_comercial 
      SET nome = NEW.nome, email = NEW.email, status = COALESCE(NEW.status, 'ativo')
      WHERE usuario_id = NEW.id;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_ativar_cascata_dentista_avaliador_update ON public.usuarios;
CREATE TRIGGER trg_ativar_cascata_dentista_avaliador_update 
  AFTER UPDATE OF cargo_id, cargo_secundario_id, nome, email, status ON public.usuarios 
  FOR EACH ROW EXECUTE FUNCTION ativar_cascata_dentista_avaliador();

DROP TRIGGER IF EXISTS trg_ativar_cascata_dentista_avaliador_insert ON public.usuarios;
CREATE TRIGGER trg_ativar_cascata_dentista_avaliador_insert 
  AFTER INSERT ON public.usuarios 
  FOR EACH ROW EXECUTE FUNCTION ativar_cascata_dentista_avaliador();
