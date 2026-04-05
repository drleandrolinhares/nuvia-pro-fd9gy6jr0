-- Criação de uma função nativa de banco de dados para garantir a cascata do Dentista Avaliador.
-- Esta abordagem atua como um Trigger nativo para processamento em tempo real, garantindo
-- integridade referencial sem depender exclusivamente de requisições HTTP do Webhook.
-- A Edge Function correspondente também foi criada para arquiteturas que exijam integração externa.

CREATE OR REPLACE FUNCTION public.ativar_cascata_dentista_avaliador()
RETURNS trigger AS $$
DECLARE
  v_cargo_nome text;
BEGIN
  -- Executa a verificação apenas se o usuário possuir um cargo vinculado
  IF NEW.cargo_id IS NOT NULL THEN
    SELECT nome INTO v_cargo_nome FROM public.cargos WHERE id = NEW.cargo_id;
    
    -- Se o cargo for 'Dentista Avaliador', sincroniza com a tabela dentistas_avaliadores
    IF v_cargo_nome = 'Dentista Avaliador' THEN
      IF NOT EXISTS (SELECT 1 FROM public.dentistas_avaliadores WHERE usuario_id = NEW.id) THEN
        INSERT INTO public.dentistas_avaliadores (usuario_id, nome, email, status)
        VALUES (NEW.id, NEW.nome, NEW.email, COALESCE(NEW.status, 'ativo'));
      ELSE
        UPDATE public.dentistas_avaliadores 
        SET nome = NEW.nome, email = NEW.email, status = COALESCE(NEW.status, 'ativo')
        WHERE usuario_id = NEW.id;
      END IF;
    END IF;
    
    -- Sincroniza também CRC Comercial por segurança, caso seja esse o cargo
    IF v_cargo_nome IN ('CRC', 'CRC Comercial') THEN
      IF NOT EXISTS (SELECT 1 FROM public.crc_comercial WHERE usuario_id = NEW.id) THEN
        INSERT INTO public.crc_comercial (usuario_id, nome, email, status)
        VALUES (NEW.id, NEW.nome, NEW.email, COALESCE(NEW.status, 'ativo'));
      ELSE
        UPDATE public.crc_comercial 
        SET nome = NEW.nome, email = NEW.email, status = COALESCE(NEW.status, 'ativo')
        WHERE usuario_id = NEW.id;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remove triggers existentes para garantir a idempotência da migração
DROP TRIGGER IF EXISTS trg_ativar_cascata_dentista_avaliador_insert ON public.usuarios;
DROP TRIGGER IF EXISTS trg_ativar_cascata_dentista_avaliador_update ON public.usuarios;

-- Cria o trigger na tabela usuarios para operações de INSERT
CREATE TRIGGER trg_ativar_cascata_dentista_avaliador_insert
  AFTER INSERT ON public.usuarios
  FOR EACH ROW
  EXECUTE FUNCTION public.ativar_cascata_dentista_avaliador();

-- Cria o trigger na tabela usuarios para operações de UPDATE
CREATE TRIGGER trg_ativar_cascata_dentista_avaliador_update
  AFTER UPDATE OF cargo_id, nome, email, status ON public.usuarios
  FOR EACH ROW
  EXECUTE FUNCTION public.ativar_cascata_dentista_avaliador();
