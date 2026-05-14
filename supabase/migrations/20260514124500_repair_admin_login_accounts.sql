CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.ensure_admin_login(
  _user_id UUID,
  _email TEXT,
  _password TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE lower(email) = lower(_email)
  LIMIT 1;

  target_user_id := COALESCE(target_user_id, _user_id);

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
    target_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    _email,
    crypt(_password, gen_salt('bf')),
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
    target_user_id::text,
    target_user_id,
    _email,
    jsonb_build_object('sub', target_user_id::text, 'email', _email, 'email_verified', true),
    'email',
    now(),
    now(),
    now()
  )
  ON CONFLICT (provider, provider_id) DO UPDATE
  SET user_id = EXCLUDED.user_id,
      identity_data = EXCLUDED.identity_data,
      updated_at = now();

  DELETE FROM public.user_roles WHERE user_id = target_user_id;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

SELECT public.ensure_admin_login(
  '86f4fd57-2f31-4c0d-b899-86d6c91d0001',
  'jayszrs@admin.local',
  'SZRS86'
);

SELECT public.ensure_admin_login(
  '86f4fd57-2f31-4c0d-b899-86d6c91d0002',
  'jaelanisuryasaputra@gmail.com',
  'SZRS86'
);

SELECT public.ensure_admin_login(
  '86f4fd57-2f31-4c0d-b899-86d6c91d0003',
  'jaelanisurya.akademicrypto@gmail.com',
  'SZRS86'
);

REVOKE EXECUTE ON FUNCTION public.ensure_admin_login(UUID, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
