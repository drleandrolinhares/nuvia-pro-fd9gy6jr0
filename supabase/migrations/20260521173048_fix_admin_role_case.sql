CREATE OR REPLACE FUNCTION public.is_tenant_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_role      text;
    v_tenant_id uuid;
BEGIN
    v_tenant_id := public.get_my_tenant_id();
    IF v_tenant_id IS NULL THEN RETURN false; END IF;
    SELECT role INTO v_role
    FROM public.usuarios
    WHERE id = auth.uid() AND tenant_id = v_tenant_id;
    RETURN LOWER(v_role) = 'admin';
END;
$function$;
