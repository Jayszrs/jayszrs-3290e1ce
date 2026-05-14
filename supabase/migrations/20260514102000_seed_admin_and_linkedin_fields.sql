CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.certifications
  ADD COLUMN IF NOT EXISTS credential_id TEXT;

ALTER TABLE public.experiences
  ADD COLUMN IF NOT EXISTS employment_type TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS location_type TEXT,
  ADD COLUMN IF NOT EXISTS start_date DATE,
  ADD COLUMN IF NOT EXISTS end_date DATE,
  ADD COLUMN IF NOT EXISTS is_current BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS duration_months INT,
  ADD COLUMN IF NOT EXISTS skills TEXT[] NOT NULL DEFAULT '{}';

ALTER TABLE public.education
  ADD COLUMN IF NOT EXISTS degree TEXT,
  ADD COLUMN IF NOT EXISTS field_of_study TEXT,
  ADD COLUMN IF NOT EXISTS start_date DATE,
  ADD COLUMN IF NOT EXISTS end_date DATE,
  ADD COLUMN IF NOT EXISTS grade TEXT,
  ADD COLUMN IF NOT EXISTS activities TEXT;

ALTER TABLE public.volunteers
  ADD COLUMN IF NOT EXISTS organization TEXT,
  ADD COLUMN IF NOT EXISTS cause TEXT,
  ADD COLUMN IF NOT EXISTS start_date DATE,
  ADD COLUMN IF NOT EXISTS end_date DATE,
  ADD COLUMN IF NOT EXISTS is_current BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS duration_months INT;

DO $$
DECLARE
  admin_id UUID := '86f4fd57-2f31-4c0d-b899-86d6c91d0001';
  admin_email TEXT := 'jayszrs@admin.local';
BEGIN
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  VALUES (
    admin_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    admin_email,
    crypt('SZRS86', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"username":"jayszrs","full_name":"JAY SZRS"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      encrypted_password = EXCLUDED.encrypted_password,
      email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
      raw_app_meta_data = EXCLUDED.raw_app_meta_data,
      raw_user_meta_data = EXCLUDED.raw_user_meta_data,
      updated_at = now();

  INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  )
  VALUES (
    admin_id::text,
    admin_id,
    admin_email,
    jsonb_build_object('sub', admin_id::text, 'email', admin_email, 'email_verified', true),
    'email',
    now(),
    now(),
    now()
  )
  ON CONFLICT (provider, provider_id) DO UPDATE
  SET user_id = EXCLUDED.user_id,
      identity_data = EXCLUDED.identity_data,
      updated_at = now();

  DELETE FROM public.user_roles WHERE user_id = admin_id;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (admin_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END $$;

CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  role public.app_role,
  created_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'admin access required';
  END IF;

  RETURN QUERY
  SELECT
    u.id,
    u.email::text,
    COALESCE(ur.role, 'user'::public.app_role),
    u.created_at,
    u.last_sign_in_at
  FROM auth.users u
  LEFT JOIN public.user_roles ur ON ur.user_id = u.id
  ORDER BY u.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_user_role(_user_id UUID, _role public.app_role)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'admin access required';
  END IF;

  DELETE FROM public.user_roles WHERE user_id = _user_id;
  INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, _role);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_remove_user_role(_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'admin access required';
  END IF;

  DELETE FROM public.user_roles WHERE user_id = _user_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_list_users() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_set_user_role(UUID, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_remove_user_role(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_user_role(UUID, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_remove_user_role(UUID) TO authenticated;
