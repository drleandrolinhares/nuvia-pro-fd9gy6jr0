DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.cargos WHERE nome = 'CEO') THEN
    INSERT INTO public.cargos (nome, setor) VALUES ('CEO', 'Diretoria');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.cargos WHERE nome = 'Dentista') THEN
    INSERT INTO public.cargos (nome, setor) VALUES ('Dentista', 'Clínico');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.cargos WHERE nome = 'Dentista Avaliador') THEN
    INSERT INTO public.cargos (nome, setor) VALUES ('Dentista Avaliador', 'Comercial');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.cargos WHERE nome = 'CRC Comercial') THEN
    INSERT INTO public.cargos (nome, setor) VALUES ('CRC Comercial', 'Comercial');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.cargos WHERE nome = 'Auxiliar de Serviços Gerais') THEN
    INSERT INTO public.cargos (nome, setor) VALUES ('Auxiliar de Serviços Gerais', 'Operacional');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.cargos WHERE nome = 'Recepcionista') THEN
    INSERT INTO public.cargos (nome, setor) VALUES ('Recepcionista', 'Atendimento');
  END IF;
END $$;

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
    
    -- Se o cargo for 'Dentista', sincroniza com a tabela dentistas
    IF v_cargo_nome = 'Dentista' THEN
      IF NOT EXISTS (SELECT 1 FROM public.dentistas WHERE usuario_id = NEW.id) THEN
        INSERT INTO public.dentistas (usuario_id, nome, email, status)
        VALUES (NEW.id, NEW.nome, NEW.email, COALESCE(NEW.status, 'ativo'));
      ELSE
        UPDATE public.dentistas 
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
