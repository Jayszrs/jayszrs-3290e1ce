CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated;

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role) CASCADE;

DO $$
BEGIN
  EXECUTE 'DROP FUNCTION IF EXISTS public.' || 'is_seed' || '_admin_email()';
END $$;

DROP POLICY IF EXISTS "anyone can read profile" ON public.profile_settings;
DROP POLICY IF EXISTS "admins update profile" ON public.profile_settings;
DROP POLICY IF EXISTS "admins manage profile settings" ON public.profile_settings;
DROP POLICY IF EXISTS "admins read profile" ON public.profile_settings;
DROP POLICY IF EXISTS "admins read profile settings" ON public.profile_settings;
DROP POLICY IF EXISTS "admins insert profile settings" ON public.profile_settings;
DROP POLICY IF EXISTS "admins update profile settings" ON public.profile_settings;
DROP POLICY IF EXISTS "admins delete profile settings" ON public.profile_settings;
DROP POLICY IF EXISTS "authenticated admins read profile settings" ON public.profile_settings;
DROP POLICY IF EXISTS "authenticated admins insert profile settings" ON public.profile_settings;
DROP POLICY IF EXISTS "authenticated admins update profile settings" ON public.profile_settings;
DROP POLICY IF EXISTS "authenticated admins delete profile settings" ON public.profile_settings;

CREATE POLICY "authenticated admins read profile settings"
  ON public.profile_settings
  FOR SELECT
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "authenticated admins insert profile settings"
  ON public.profile_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "authenticated admins update profile settings"
  ON public.profile_settings
  FOR UPDATE
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "authenticated admins delete profile settings"
  ON public.profile_settings
  FOR DELETE
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "admins manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "admins read all roles" ON public.user_roles;
DROP POLICY IF EXISTS "admins insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "admins update roles" ON public.user_roles;
DROP POLICY IF EXISTS "admins delete roles" ON public.user_roles;
DROP POLICY IF EXISTS "authenticated admins read roles" ON public.user_roles;
DROP POLICY IF EXISTS "authenticated admins insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "authenticated admins update roles" ON public.user_roles;
DROP POLICY IF EXISTS "authenticated admins delete roles" ON public.user_roles;

CREATE POLICY "authenticated admins read roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "authenticated admins insert roles"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "authenticated admins update roles"
  ON public.user_roles
  FOR UPDATE
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "authenticated admins delete roles"
  ON public.user_roles
  FOR DELETE
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "admins read messages" ON public.contact_messages;
DROP POLICY IF EXISTS "admins update messages" ON public.contact_messages;
DROP POLICY IF EXISTS "admins delete messages" ON public.contact_messages;
DROP POLICY IF EXISTS "authenticated admins read messages" ON public.contact_messages;
DROP POLICY IF EXISTS "authenticated admins update messages" ON public.contact_messages;
DROP POLICY IF EXISTS "authenticated admins delete messages" ON public.contact_messages;

CREATE POLICY "authenticated admins read messages"
  ON public.contact_messages
  FOR SELECT
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "authenticated admins update messages"
  ON public.contact_messages
  FOR UPDATE
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "authenticated admins delete messages"
  ON public.contact_messages
  FOR DELETE
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "admins insert public profile" ON public.profile_public;
DROP POLICY IF EXISTS "admins update public profile" ON public.profile_public;
DROP POLICY IF EXISTS "admins delete public profile" ON public.profile_public;
DROP POLICY IF EXISTS "authenticated admins insert public profile" ON public.profile_public;
DROP POLICY IF EXISTS "authenticated admins update public profile" ON public.profile_public;
DROP POLICY IF EXISTS "authenticated admins delete public profile" ON public.profile_public;

CREATE POLICY "authenticated admins insert public profile"
  ON public.profile_public
  FOR INSERT
  TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "authenticated admins update public profile"
  ON public.profile_public
  FOR UPDATE
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "authenticated admins delete public profile"
  ON public.profile_public
  FOR DELETE
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "admins manage certs" ON public.certifications;
DROP POLICY IF EXISTS "admins manage experiences" ON public.experiences;
DROP POLICY IF EXISTS "admins manage edu" ON public.education;
DROP POLICY IF EXISTS "admins manage vol" ON public.volunteers;
DROP POLICY IF EXISTS "admins manage projects" ON public.projects;
DROP POLICY IF EXISTS "admins manage skills" ON public.skills;
DROP POLICY IF EXISTS "admins manage gallery" ON public.gallery;
DROP POLICY IF EXISTS "authenticated admins manage certs" ON public.certifications;
DROP POLICY IF EXISTS "authenticated admins manage experiences" ON public.experiences;
DROP POLICY IF EXISTS "authenticated admins manage edu" ON public.education;
DROP POLICY IF EXISTS "authenticated admins manage vol" ON public.volunteers;
DROP POLICY IF EXISTS "authenticated admins manage projects" ON public.projects;
DROP POLICY IF EXISTS "authenticated admins manage skills" ON public.skills;
DROP POLICY IF EXISTS "authenticated admins manage gallery" ON public.gallery;

CREATE POLICY "authenticated admins manage certs"
  ON public.certifications
  FOR ALL
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "authenticated admins manage experiences"
  ON public.experiences
  FOR ALL
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "authenticated admins manage edu"
  ON public.education
  FOR ALL
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "authenticated admins manage vol"
  ON public.volunteers
  FOR ALL
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "authenticated admins manage projects"
  ON public.projects
  FOR ALL
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "authenticated admins manage skills"
  ON public.skills
  FOR ALL
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "authenticated admins manage gallery"
  ON public.gallery
  FOR ALL
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "admins upload" ON storage.objects;
DROP POLICY IF EXISTS "admins update files" ON storage.objects;
DROP POLICY IF EXISTS "admins delete files" ON storage.objects;
DROP POLICY IF EXISTS "authenticated admins upload" ON storage.objects;
DROP POLICY IF EXISTS "authenticated admins update files" ON storage.objects;
DROP POLICY IF EXISTS "authenticated admins delete files" ON storage.objects;

CREATE POLICY "authenticated admins upload"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id IN ('cv','certificates','badges','gallery','documents','avatars')
    AND private.has_role(auth.uid(), 'admin'::public.app_role)
  );

CREATE POLICY "authenticated admins update files"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id IN ('cv','certificates','badges','gallery','documents','avatars')
    AND private.has_role(auth.uid(), 'admin'::public.app_role)
  )
  WITH CHECK (
    bucket_id IN ('cv','certificates','badges','gallery','documents','avatars')
    AND private.has_role(auth.uid(), 'admin'::public.app_role)
  );

CREATE POLICY "authenticated admins delete files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id IN ('cv','certificates','badges','gallery','documents','avatars')
    AND private.has_role(auth.uid(), 'admin'::public.app_role)
  );

REVOKE EXECUTE ON FUNCTION public.admin_list_users() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_set_user_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_remove_user_role(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_user_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_remove_user_role(uuid) TO authenticated;

NOTIFY pgrst, 'reload schema';
