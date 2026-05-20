-- Drop the unique indexes that prevent independent sales
DROP INDEX IF EXISTS public.idx_vendas_confirmadas_unique_venda;
DROP INDEX IF EXISTS public.idx_vendas_diarias_unique_venda;

-- Update trigger function to stop aggressive lookup of existing evaluations
CREATE OR REPLACE FUNCTION public.trg_garantir_avaliacao_para_venda()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  v_paciente_id uuid;
BEGIN
  IF NEW.oportunidade_id IS NULL THEN
    -- Try to find patient by name
    SELECT id INTO v_paciente_id FROM public.pacientes WHERE lower(trim(nome)) = lower(trim(NEW.paciente_nome)) LIMIT 1;
    
    -- If not found, create one
    IF v_paciente_id IS NULL THEN
      v_paciente_id := gen_random_uuid();
      INSERT INTO public.pacientes (id, nome, telefone) VALUES (v_paciente_id, trim(NEW.paciente_nome), NEW.telefone);
    END IF;
    
    -- Always create a new evaluation for this new independent sale
    NEW.oportunidade_id := gen_random_uuid();
    INSERT INTO public.avaliacoes (
      id, paciente_id, dentista_avaliador_id, crc_comercial_id, 
      data_avaliacao, data_fechamento, valor_orcamento, valor_entrada, 
      status, temperatura_lead, origem_id, destino_fiscal
    ) VALUES (
      NEW.oportunidade_id, v_paciente_id, NEW.dentista_avaliador, NEW.crc,
      COALESCE(NEW.data_original, NEW.data_fechamento), NEW.data_fechamento, NEW.valor_tratamento, NEW.valor_entrada,
      'venda_concretizada', 'quente', NEW.origem_id, NEW.destino_fiscal
    );
  END IF;
  
  NEW.paciente_nome := trim(NEW.paciente_nome);
  
  RETURN NEW;
END;
$function$;

-- Seed the initial user
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'drleandrolinhares@gmail.com') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'drleandrolinhares@gmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Leandro Linhares"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.usuarios (id, email, nome, role, status)
    VALUES (new_user_id, 'drleandrolinhares@gmail.com', 'Leandro Linhares', 'admin', 'ativo')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;
